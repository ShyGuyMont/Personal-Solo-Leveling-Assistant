function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export interface VnaSimulationInput {
  frequencyGHz: number;
  resistanceOhm: number;
  reactanceOhm: number;
  thruLossDb: number;
  electricalDelayNs: number;
  calibrationQuality: number;
}

export function simulateVnaMeasurement(input: VnaSimulationInput) {
  const frequencyGHz = clamp(input.frequencyGHz, 0.01, 26);
  const resistance = clamp(input.resistanceOhm, 0.1, 500);
  const reactance = clamp(input.reactanceOhm, -500, 500);
  const denominatorReal = resistance + 50;
  const denominatorImag = reactance;
  const numeratorReal = resistance - 50;
  const numeratorImag = reactance;
  const denominatorMagnitude = denominatorReal ** 2 + denominatorImag ** 2;
  const gammaReal =
    (numeratorReal * denominatorReal + numeratorImag * denominatorImag) / denominatorMagnitude;
  const gammaImag =
    (numeratorImag * denominatorReal - numeratorReal * denominatorImag) / denominatorMagnitude;
  const gammaMagnitude = clamp(Math.hypot(gammaReal, gammaImag), 0, 0.9999);
  const calibrationErrorDb = ((100 - clamp(input.calibrationQuality, 0, 100)) / 100) * 5;
  const returnLossDb = Math.max(
    0,
    -20 * Math.log10(Math.max(gammaMagnitude, 0.00001)) - calibrationErrorDb,
  );
  const mismatchLossDb = -10 * Math.log10(Math.max(0.0001, 1 - gammaMagnitude ** 2));
  const s21Db = -clamp(input.thruLossDb, 0, 40) - mismatchLossDb + calibrationErrorDb * 0.18;
  const phaseDegrees =
    (((-360 * frequencyGHz * clamp(input.electricalDelayNs, 0, 100)) % 360) + 360) % 360;
  const warnings: string[] = [];
  if (input.calibrationQuality < 70)
    warnings.push('Residual calibration error is large enough to distort the displayed match.');
  if (gammaMagnitude > 0.8)
    warnings.push('Severe mismatch: verify DUT power handling before applying a real source.');
  return {
    gammaReal,
    gammaImag,
    gammaMagnitude,
    returnLossDb,
    vswr: (1 + gammaMagnitude) / Math.max(0.0001, 1 - gammaMagnitude),
    mismatchLossDb,
    s21Db,
    phaseDegrees,
    warnings,
  };
}

export interface SpectrumSimulationInput {
  centerMHz: number;
  toneSpacingKHz: number;
  tonePowerDbm: number;
  iip3Dbm: number;
  rbwHz: number;
  attenuationDb: number;
  preampEnabled: boolean;
}

export function simulateSpectrumMeasurement(input: SpectrumSimulationInput) {
  const rbwHz = clamp(input.rbwHz, 1, 1_000_000);
  const tonePowerDbm = clamp(input.tonePowerDbm, -90, 20);
  const attenuationDb = clamp(input.attenuationDb, 0, 50);
  const preampGainDb = input.preampEnabled ? 18 : 0;
  const displayedFloorDbm = -162 + 10 * Math.log10(rbwHz) + attenuationDb - preampGainDb;
  const im3Dbm = 3 * tonePowerDbm - 2 * clamp(input.iip3Dbm, -20, 80);
  const displayedIm3Dbm = 10 * Math.log10(10 ** (im3Dbm / 10) + 10 ** (displayedFloorDbm / 10));
  const analyzerInputDbm = tonePowerDbm - attenuationDb + preampGainDb;
  const warnings: string[] = [];
  if (analyzerInputDbm > -5)
    warnings.push(
      'Front-end overload risk: analyzer-generated distortion may masquerade as DUT IM3.',
    );
  if (displayedIm3Dbm - displayedFloorDbm < 6)
    warnings.push('The IM3 product is not clearly separated from the modeled noise floor.');
  if (input.toneSpacingKHz * 1_000 < rbwHz * 2)
    warnings.push('RBW is too wide to cleanly resolve the two tones and nearby products.');
  return {
    toneFrequenciesMHz: [
      input.centerMHz - input.toneSpacingKHz / 2_000,
      input.centerMHz + input.toneSpacingKHz / 2_000,
    ],
    im3FrequenciesMHz: [
      input.centerMHz - (input.toneSpacingKHz * 3) / 2_000,
      input.centerMHz + (input.toneSpacingKHz * 3) / 2_000,
    ],
    displayedFloorDbm,
    im3Dbm,
    displayedIm3Dbm,
    analyzerInputDbm,
    warnings,
  };
}

export interface ScopeSimulationInput {
  signalMHz: number;
  sampleRateMSps: number;
  bandwidthMHz: number;
  recordLength: number;
}

export function simulateScopeSampling(input: ScopeSimulationInput) {
  const signalMHz = clamp(input.signalMHz, 0.01, 1_000);
  const sampleRateMSps = clamp(input.sampleRateMSps, 0.1, 5_000);
  const bandwidthMHz = clamp(input.bandwidthMHz, 0.1, 2_000);
  const recordLength = Math.round(clamp(input.recordLength, 100, 10_000_000));
  const aliasMHz = Math.abs(
    ((signalMHz + sampleRateMSps / 2) % sampleRateMSps) - sampleRateMSps / 2,
  );
  const amplitudeRatio = 1 / Math.sqrt(1 + (signalMHz / bandwidthMHz) ** 2);
  const samples = Array.from({ length: 64 }, (_, index) => {
    const timeUs = index / sampleRateMSps;
    return {
      timeUs,
      trueValue: Math.sin(2 * Math.PI * signalMHz * timeUs),
      sampledValue: amplitudeRatio * Math.sin(2 * Math.PI * signalMHz * timeUs),
    };
  });
  const warnings: string[] = [];
  if (sampleRateMSps < signalMHz * 2)
    warnings.push(
      `Nyquist is violated. The ${signalMHz.toFixed(1)} MHz source aliases near ${aliasMHz.toFixed(1)} MHz.`,
    );
  if (bandwidthMHz < signalMHz)
    warnings.push('Analog bandwidth is attenuating the source before sampling.');
  if (sampleRateMSps / signalMHz < 5)
    warnings.push(
      'Few samples per cycle make shape and timing judgments fragile even when aliasing is avoided.',
    );
  return {
    aliasMHz,
    amplitudeRatio,
    pointsPerCycle: sampleRateMSps / signalMHz,
    timeWindowUs: recordLength / sampleRateMSps,
    bandwidthRiseTimeNs: 350 / bandwidthMHz,
    samples,
    warnings,
  };
}

export interface NoiseFigureSimulationInput {
  enrDb: number;
  hotPowerDbm: number;
  coldPowerDbm: number;
  preDutLossDb: number;
}

export function simulateNoiseFigureYFactor(input: NoiseFigureSimulationInput) {
  const enrLinear = 10 ** (clamp(input.enrDb, 0.1, 40) / 10);
  const yFactorDb = clamp(input.hotPowerDbm - input.coldPowerDbm, 0.01, 40);
  const yFactor = 10 ** (yFactorDb / 10);
  const noiseFactor = enrLinear / Math.max(0.00001, yFactor - 1);
  const rawNoiseFigureDb = 10 * Math.log10(Math.max(1, noiseFactor));
  const correctedDutNoiseFigureDb = Math.max(
    0,
    rawNoiseFigureDb - clamp(input.preDutLossDb, 0, 20),
  );
  const effectiveTemperatureK = 290 * (10 ** (correctedDutNoiseFigureDb / 10) - 1);
  const warnings: string[] = [];
  if (yFactorDb < 1)
    warnings.push('Hot and cold readings are too close; uncertainty will explode.');
  if (yFactor >= 1 + enrLinear)
    warnings.push(
      'The readings imply a nonphysical noise factor for the entered ENR. Check units, loss, and power readings.',
    );
  if (input.preDutLossDb > 2)
    warnings.push(
      'Loss ahead of the DUT materially changes the system result and must be characterized accurately.',
    );
  return {
    yFactorDb,
    yFactor,
    rawNoiseFigureDb,
    correctedDutNoiseFigureDb,
    effectiveTemperatureK,
    warnings,
  };
}
