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

export interface PhaseNoiseSpecPoint {
  offsetHz: number;
  limitDbcHz: number;
}

export interface PhaseNoiseSpecEvaluation extends PhaseNoiseSpecPoint {
  measuredDbcHz: number;
  analyzerFloorDbcHz: number;
  marginDb: number;
  passed: boolean;
  setupLimited: boolean;
}

export interface PhaseNoiseDiagnosis {
  id: 'pass' | 'close-in' | 'broadband' | 'spur' | 'setup' | 'mixed';
  title: string;
  summary: string;
  checks: string[];
}

export interface PhaseNoiseQualificationResult {
  passed: boolean;
  evaluations: PhaseNoiseSpecEvaluation[];
  worstMarginDb: number;
  diagnosis: PhaseNoiseDiagnosis;
}

export type PhaseNoiseDutScenarioId = 'control' | 'dut-a' | 'dut-b' | 'dut-c' | 'dut-d' | 'dut-e';

export interface PhaseNoiseDutScenario {
  id: PhaseNoiseDutScenarioId;
  label: string;
  description: string;
  settings: PhaseNoiseBenchSettings;
}

export type PhaseNoiseSpecPresetId = 'training' | 'reference' | 'synthesizer';

export interface PhaseNoiseSpecPreset {
  id: PhaseNoiseSpecPresetId;
  label: string;
  description: string;
  points: PhaseNoiseSpecPoint[];
}

export const DEFAULT_PHASE_NOISE_SETTINGS: PhaseNoiseBenchSettings = {
  carrierGHz: 1,
  inputPowerDbm: 5,
  closeInNoiseDbcHz: -121,
  flickerSlopeDbPerDecade: 23,
  whiteFloorDbcHz: -162,
  rbwHz: 100,
  correlations: 40,
  spurOffsetHz: 300_000,
  spurLevelDbcHz: -170,
  markerOffsetHz: 10_000,
};

function scenarioSettings(overrides: Partial<PhaseNoiseBenchSettings>): PhaseNoiseBenchSettings {
  return { ...DEFAULT_PHASE_NOISE_SETTINGS, ...overrides };
}

export const PHASE_NOISE_DUT_SCENARIOS: PhaseNoiseDutScenario[] = [
  {
    id: 'control',
    label: 'Control source',
    description: 'A healthy low-noise source used to prove the qualification flow.',
    settings: scenarioSettings({}),
  },
  {
    id: 'dut-a',
    label: 'Unknown DUT A',
    description: 'A source with a hidden close-in impairment. Run it and read the signature.',
    settings: scenarioSettings({ closeInNoiseDbcHz: -104, flickerSlopeDbPerDecade: 27 }),
  },
  {
    id: 'dut-b',
    label: 'Unknown DUT B',
    description: 'A source that looks normal near carrier but develops a hidden far-out problem.',
    settings: scenarioSettings({ whiteFloorDbcHz: -138 }),
  },
  {
    id: 'dut-c',
    label: 'Unknown DUT C',
    description: 'A mostly clean source with one narrow, suspicious feature in the sweep.',
    settings: scenarioSettings({ spurOffsetHz: 100_000, spurLevelDbcHz: -112 }),
  },
  {
    id: 'dut-d',
    label: 'Unknown DUT D',
    description: 'An ultra-clean source measured with a setup that may not be clean enough.',
    settings: scenarioSettings({
      inputPowerDbm: -18,
      closeInNoiseDbcHz: -145,
      whiteFloorDbcHz: -178,
      correlations: 2,
    }),
  },
  {
    id: 'dut-e',
    label: 'Unknown DUT E',
    description: 'A normal source arriving at an unexpectedly low analyzer input level.',
    settings: scenarioSettings({ inputPowerDbm: -22, correlations: 10 }),
  },
];

export const PHASE_NOISE_SPEC_PRESETS: PhaseNoiseSpecPreset[] = [
  {
    id: 'training',
    label: 'Training qualification',
    description: 'Balanced limits that reveal close-in, broadband, spur, and setup failures.',
    points: [
      { offsetHz: 100, limitDbcHz: -88 },
      { offsetHz: 1_000, limitDbcHz: -112 },
      { offsetHz: 10_000, limitDbcHz: -136 },
      { offsetHz: 100_000, limitDbcHz: -148 },
      { offsetHz: 1_000_000, limitDbcHz: -153 },
    ],
  },
  {
    id: 'reference',
    label: 'Tight reference source',
    description: 'A demanding source specification with little measurement headroom.',
    points: [
      { offsetHz: 100, limitDbcHz: -98 },
      { offsetHz: 1_000, limitDbcHz: -120 },
      { offsetHz: 10_000, limitDbcHz: -143 },
      { offsetHz: 100_000, limitDbcHz: -156 },
      { offsetHz: 1_000_000, limitDbcHz: -160 },
    ],
  },
  {
    id: 'synthesizer',
    label: 'General synthesizer',
    description: 'A more forgiving production-style limit mask for noisier sources.',
    points: [
      { offsetHz: 100, limitDbcHz: -80 },
      { offsetHz: 1_000, limitDbcHz: -104 },
      { offsetHz: 10_000, limitDbcHz: -127 },
      { offsetHz: 100_000, limitDbcHz: -140 },
      { offsetHz: 1_000_000, limitDbcHz: -146 },
    ],
  },
];

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

export function phaseNoiseSpecLimitAt(specPoints: PhaseNoiseSpecPoint[], offsetHz: number) {
  const sorted = [...specPoints].sort((left, right) => left.offsetHz - right.offsetHz);
  if (!sorted.length) return Number.NaN;
  return logInterpolate(
    offsetHz,
    sorted.map((point) => point.offsetHz),
    sorted.map((point) => point.limitDbcHz),
  );
}

function phaseNoisePointAt(points: PhaseNoisePoint[], offsetHz: number): PhaseNoisePoint {
  const offsets = points.map((point) => point.offsetHz);
  return {
    offsetHz,
    dutDbcHz: logInterpolate(
      offsetHz,
      offsets,
      points.map((point) => point.dutDbcHz),
    ),
    analyzerFloorDbcHz: logInterpolate(
      offsetHz,
      offsets,
      points.map((point) => point.analyzerFloorDbcHz),
    ),
    measuredDbcHz: logInterpolate(
      offsetHz,
      offsets,
      points.map((point) => point.measuredDbcHz),
    ),
  };
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

function diagnoseQualification(evaluations: PhaseNoiseSpecEvaluation[]): PhaseNoiseDiagnosis {
  const failures = evaluations.filter((evaluation) => !evaluation.passed);
  const setupLimitedFailures = failures.filter((evaluation) => evaluation.setupLimited);
  const closeInFailures = failures.filter((evaluation) => evaluation.offsetHz <= 10_000);
  const farOutFailures = failures.filter((evaluation) => evaluation.offsetHz >= 100_000);

  if (!failures.length) {
    return {
      id: 'pass',
      title: 'DUT qualifies against this mask',
      summary:
        'Every modeled spot measurement is below its limit. The smallest positive margin is the first place to watch in a real acceptance run.',
      checks: [
        'Repeat the run and confirm the weakest margin is stable.',
        'Verify carrier power, offset span, correlations, and instrument configuration before recording evidence.',
      ],
    };
  }
  if (setupLimitedFailures.length >= Math.ceil(failures.length / 2)) {
    return {
      id: 'setup',
      title: 'Measurement setup is probably setting the result',
      summary:
        'Most failed points sit within about 4 dB of the modeled analyzer floor. That is not clean evidence that the DUT itself failed.',
      checks: [
        'Confirm the analyzer input level and add correlation or averaging.',
        'Measure a known source or use a residual/additive method when appropriate.',
        'Check the real instrument noise floor and option limits at this carrier frequency.',
      ],
    };
  }
  if (failures.length === 1 && failures[0].offsetHz >= 10_000) {
    return {
      id: 'spur',
      title: 'An isolated spur-like failure is crossing the mask',
      summary:
        'One narrow offset fails while the surrounding regions qualify. That signature suggests a discrete interferer, reference product, supply tone, or coupling path rather than a broad noise-floor problem.',
      checks: [
        'Move the span and confirm the feature stays at the same carrier offset.',
        'Change reference, supply, and nearby digital clock conditions one at a time.',
        'Verify the feature is not an analyzer artifact or environmental pickup.',
      ],
    };
  }
  if (closeInFailures.length && !farOutFailures.length) {
    return {
      id: 'close-in',
      title: 'Close-in phase noise is failing',
      summary:
        'The misses are concentrated near the carrier and recover farther out. That pattern points toward flicker behavior, reference multiplication, or a control-loop region.',
      checks: [
        'Inspect the reference and PLL loop-bandwidth region.',
        'Check device bias, flicker contributors, and vibration or microphonics.',
        'Repeat with a stable reference and confirm the carrier is not drifting during capture.',
      ],
    };
  }
  if (farOutFailures.length >= 2 && closeInFailures.length < failures.length) {
    return {
      id: 'broadband',
      title: 'The far-out noise floor is too high',
      summary:
        'Multiple high-offset points miss together, which looks like a broadband white-noise or residual floor limitation rather than one discrete tone.',
      checks: [
        'Inspect device noise, output power, gain distribution, and supply noise.',
        'Confirm the analyzer floor is sufficiently below the measured trace.',
        'Compare with a known source and repeat at a different input level.',
      ],
    };
  }
  return {
    id: 'mixed',
    title: 'The DUT has a mixed failure signature',
    summary:
      'The mask is crossed in more than one region without a single dominant pattern. Treat this as a fault-isolation problem, not one automatic diagnosis.',
    checks: [
      'Start with the worst-margin offset and reproduce it.',
      'Separate close-in, discrete-spur, and far-out checks instead of changing several settings together.',
      'Verify the analyzer floor before assigning any failure to the DUT.',
    ],
  };
}

export function qualifyPhaseNoiseBench(
  result: PhaseNoiseBenchResult,
  specPoints: PhaseNoiseSpecPoint[],
): PhaseNoiseQualificationResult {
  const evaluations = [...specPoints]
    .sort((left, right) => left.offsetHz - right.offsetHz)
    .map((specPoint) => {
      const measurement = phaseNoisePointAt(result.points, specPoint.offsetHz);
      const marginDb = specPoint.limitDbcHz - measurement.measuredDbcHz;
      return {
        ...specPoint,
        measuredDbcHz: measurement.measuredDbcHz,
        analyzerFloorDbcHz: measurement.analyzerFloorDbcHz,
        marginDb,
        passed: marginDb >= 0,
        setupLimited: measurement.measuredDbcHz - measurement.analyzerFloorDbcHz <= 4,
      };
    });
  const worstMarginDb = evaluations.length
    ? Math.min(...evaluations.map((evaluation) => evaluation.marginDb))
    : Number.NaN;
  return {
    passed: evaluations.every((evaluation) => evaluation.passed),
    evaluations,
    worstMarginDb,
    diagnosis: diagnoseQualification(evaluations),
  };
}

export function formatEngineeringDuration(seconds: number) {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
  if (seconds < 3_600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3_600).toFixed(1)} hr`;
}
