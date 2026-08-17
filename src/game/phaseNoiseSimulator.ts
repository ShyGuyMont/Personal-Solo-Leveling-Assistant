export interface PhaseNoiseBenchSettings {
  carrierGHz: number;
  inputPowerDbm: number;
  closeInNoiseDbcHz: number;
  flickerSlopeDbPerDecade: number;
  whiteFloorDbcHz: number;
  rbwHz: number;
  correlations: number;
  spurOffsetHz: number;
  spurLevelDbcHz: number;
  markerOffsetHz: number;
}

export interface PhaseNoisePoint {
  offsetHz: number;
  dutDbcHz: number;
  analyzerFloorDbcHz: number;
  measuredDbcHz: number;
}

export interface PhaseNoiseBenchResult {
  points: PhaseNoisePoint[];
  marker: PhaseNoisePoint;
  integratedJitterFs: number;
  sweepSeconds: number;
  integratedMarkerNoiseDbc: number;
  warnings: string[];
  verdict: string;
}

export const DEFAULT_PHASE_NOISE_SETTINGS: PhaseNoiseBenchSettings = {
  carrierGHz: 1,
  inputPowerDbm: 5,
  closeInNoiseDbcHz: -118,
  flickerSlopeDbPerDecade: 24,
  whiteFloorDbcHz: -158,
  rbwHz: 100,
  correlations: 10,
  spurOffsetHz: 100_000,
  spurLevelDbcHz: -105,
  markerOffsetHz: 10_000,
};

const OFFSETS_HZ = Array.from({ length: 61 }, (_, index) => 10 ** (1 + index / 10));
const FLOOR_OFFSETS = [10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000];
const FLOOR_VALUES = [-115, -128, -140, -148, -155, -160, -160];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function dbAdd(...values: number[]) {
  const linear = values.reduce((sum, value) => sum + 10 ** (value / 10), 0);
  return 10 * Math.log10(Math.max(linear, Number.EPSILON));
}

function logInterpolate(offsetHz: number, offsets: number[], values: number[]) {
  const target = Math.log10(clamp(offsetHz, offsets[0], offsets[offsets.length - 1]));
  for (let index = 1; index < offsets.length; index += 1) {
    if (offsetHz > offsets[index]) continue;
    const left = Math.log10(offsets[index - 1]);
    const right = Math.log10(offsets[index]);
    const ratio = (target - left) / Math.max(0.0001, right - left);
    return values[index - 1] + (values[index] - values[index - 1]) * ratio;
  }
  return values[values.length - 1];
}

function dutNoiseAt(settings: PhaseNoiseBenchSettings, offsetHz: number) {
  const shaped =
    settings.closeInNoiseDbcHz - settings.flickerSlopeDbPerDecade * Math.log10(offsetHz / 1_000);
  let noise = dbAdd(shaped, settings.whiteFloorDbcHz);
  const spurDistanceDecades = Math.abs(Math.log10(offsetHz / settings.spurOffsetHz));
  if (spurDistanceDecades < 0.055) {
    noise = dbAdd(noise, settings.spurLevelDbcHz - spurDistanceDecades * 90);
  }
  return noise;
}

function analyzerFloorAt(settings: PhaseNoiseBenchSettings, offsetHz: number) {
  const nominal = logInterpolate(offsetHz, FLOOR_OFFSETS, FLOOR_VALUES);
  const correlationGain = -5 * Math.log10(Math.max(1, settings.correlations) / 10);
  const lowDrivePenalty = Math.max(0, -5 - settings.inputPowerDbm) * 0.65;
  const highBandPenalty = Math.max(0, settings.carrierGHz - 8) * 0.8;
  return nominal + correlationGain + lowDrivePenalty + highBandPenalty;
}

function measuredNoiseAt(settings: PhaseNoiseBenchSettings, offsetHz: number, sampleIndex: number) {
  const dutDbcHz = dutNoiseAt(settings, offsetHz);
  const analyzerFloorDbcHz = analyzerFloorAt(settings, offsetHz);
  const traceVariation =
    (Math.sin(sampleIndex * 2.17) + Math.cos(sampleIndex * 0.73)) *
    Math.min(2.8, Math.sqrt(settings.rbwHz / 100) / Math.sqrt(settings.correlations));
  return {
    offsetHz,
    dutDbcHz,
    analyzerFloorDbcHz,
    measuredDbcHz: dbAdd(dutDbcHz, analyzerFloorDbcHz) + traceVariation,
  };
}

function integrateJitter(points: PhaseNoisePoint[], carrierHz: number) {
  let phaseVariance = 0;
  for (let index = 1; index < points.length; index += 1) {
    const left = points[index - 1];
    const right = points[index];
    const density = (10 ** (left.measuredDbcHz / 10) + 10 ** (right.measuredDbcHz / 10)) / 2;
    phaseVariance += 2 * density * (right.offsetHz - left.offsetHz);
  }
  const rmsPhaseRadians = Math.sqrt(Math.max(0, phaseVariance));
  return (rmsPhaseRadians / (2 * Math.PI * carrierHz)) * 1e15;
}

export function simulatePhaseNoiseBench(
  input: PhaseNoiseBenchSettings = DEFAULT_PHASE_NOISE_SETTINGS,
): PhaseNoiseBenchResult {
  const settings: PhaseNoiseBenchSettings = {
    carrierGHz: clamp(input.carrierGHz, 0.01, 26),
    inputPowerDbm: clamp(input.inputPowerDbm, -40, 20),
    closeInNoiseDbcHz: clamp(input.closeInNoiseDbcHz, -165, -70),
    flickerSlopeDbPerDecade: clamp(input.flickerSlopeDbPerDecade, 0, 40),
    whiteFloorDbcHz: clamp(input.whiteFloorDbcHz, -180, -100),
    rbwHz: clamp(input.rbwHz, 0.1, 100_000),
    correlations: Math.round(clamp(input.correlations, 1, 1_000)),
    spurOffsetHz: clamp(input.spurOffsetHz, 10, 10_000_000),
    spurLevelDbcHz: clamp(input.spurLevelDbcHz, -180, -50),
    markerOffsetHz: clamp(input.markerOffsetHz, 10, 10_000_000),
  };
  const points = OFFSETS_HZ.map((offsetHz, index) => measuredNoiseAt(settings, offsetHz, index));
  const marker = measuredNoiseAt(settings, settings.markerOffsetHz, 0);
  const sweepSeconds = clamp(
    (points.length * Math.max(1, settings.correlations) * 1.4) / settings.rbwHz,
    0.2,
    7_200,
  );
  const warnings: string[] = [];
  if (settings.inputPowerDbm < -10) {
    warnings.push('The source is underdriving the analyzer. The displayed floor is degrading.');
  }
  if (settings.inputPowerDbm > 13) {
    warnings.push(
      'Input level is in the educational overload zone. Add attenuation and verify the real instrument limit.',
    );
  }
  if (settings.correlations < 4) {
    warnings.push('Low correlation leaves more analyzer noise in the trace.');
  }
  if (settings.rbwHz > 10_000) {
    warnings.push(
      'Wide RBW is fast but produces a rougher close-in trace and raises integrated marker noise.',
    );
  }
  const margin = marker.analyzerFloorDbcHz - marker.dutDbcHz;
  const verdict =
    margin <= -10
      ? 'DUT-dominant measurement: the modeled analyzer floor is safely below the source.'
      : margin <= -3
        ? 'Usable but floor-sensitive: correlation or input level may still change the result.'
        : 'Analyzer-limited region: this trace cannot cleanly reveal the modeled DUT noise.';
  return {
    points,
    marker,
    integratedJitterFs: integrateJitter(points, settings.carrierGHz * 1e9),
    sweepSeconds,
    integratedMarkerNoiseDbc: marker.measuredDbcHz + 10 * Math.log10(settings.rbwHz),
    warnings,
    verdict,
  };
}

export function formatEngineeringDuration(seconds: number) {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
  if (seconds < 3_600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3_600).toFixed(1)} hr`;
}
