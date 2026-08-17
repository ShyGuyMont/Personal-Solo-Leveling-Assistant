import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PHASE_NOISE_SETTINGS,
  PHASE_NOISE_DUT_SCENARIOS,
  PHASE_NOISE_SPEC_PRESETS,
  phaseNoiseSpecLimitAt,
  qualifyPhaseNoiseBench,
  simulatePhaseNoiseBench,
} from '@/game/phaseNoiseSimulator';

describe('Cipher phase-noise bench', () => {
  it('lowers the analyzer floor with additional cross-correlation', () => {
    const low = simulatePhaseNoiseBench({ ...DEFAULT_PHASE_NOISE_SETTINGS, correlations: 2 });
    const high = simulatePhaseNoiseBench({ ...DEFAULT_PHASE_NOISE_SETTINGS, correlations: 200 });

    expect(high.marker.analyzerFloorDbcHz).toBeLessThan(low.marker.analyzerFloorDbcHz);
  });

  it('makes underdrive visibly degrade the analyzer floor', () => {
    const driven = simulatePhaseNoiseBench({ ...DEFAULT_PHASE_NOISE_SETTINGS, inputPowerDbm: 5 });
    const underdriven = simulatePhaseNoiseBench({
      ...DEFAULT_PHASE_NOISE_SETTINGS,
      inputPowerDbm: -20,
    });

    expect(underdriven.marker.analyzerFloorDbcHz).toBeGreaterThan(driven.marker.analyzerFloorDbcHz);
    expect(underdriven.warnings.join(' ')).toMatch(/underdriving/i);
  });

  it('trades narrower RBW for longer modeled sweep time', () => {
    const narrow = simulatePhaseNoiseBench({ ...DEFAULT_PHASE_NOISE_SETTINGS, rbwHz: 1 });
    const wide = simulatePhaseNoiseBench({ ...DEFAULT_PHASE_NOISE_SETTINGS, rbwHz: 10_000 });

    expect(narrow.sweepSeconds).toBeGreaterThan(wide.sweepSeconds);
    expect(narrow.integratedMarkerNoiseDbc).toBeLessThan(wide.integratedMarkerNoiseDbc);
  });

  it('interpolates an editable specification on logarithmic offset frequency', () => {
    expect(
      phaseNoiseSpecLimitAt(
        [
          { offsetHz: 100, limitDbcHz: -100 },
          { offsetHz: 10_000, limitDbcHz: -140 },
        ],
        1_000,
      ),
    ).toBeCloseTo(-120, 5);
  });

  it('qualifies the control source against the training mask', () => {
    const control = PHASE_NOISE_DUT_SCENARIOS.find((scenario) => scenario.id === 'control')!;
    const trainingSpec = PHASE_NOISE_SPEC_PRESETS.find((preset) => preset.id === 'training')!;
    const qualification = qualifyPhaseNoiseBench(
      simulatePhaseNoiseBench(control.settings),
      trainingSpec.points,
    );

    expect(qualification.passed).toBe(true);
    expect(qualification.diagnosis.id).toBe('pass');
    expect(qualification.evaluations).toHaveLength(5);
  });

  it('recognizes a close-in DUT failure signature', () => {
    const dut = PHASE_NOISE_DUT_SCENARIOS.find((scenario) => scenario.id === 'dut-a')!;
    const spec = PHASE_NOISE_SPEC_PRESETS.find((preset) => preset.id === 'training')!;
    const qualification = qualifyPhaseNoiseBench(
      simulatePhaseNoiseBench(dut.settings),
      spec.points,
    );

    expect(qualification.passed).toBe(false);
    expect(qualification.diagnosis.id).toBe('close-in');
    expect(qualification.evaluations.find((point) => point.offsetHz === 100)?.passed).toBe(false);
  });

  it.each([
    ['dut-b', 'broadband'],
    ['dut-c', 'spur'],
  ] as const)('recognizes the %s fault signature as %s', (scenarioId, diagnosisId) => {
    const dut = PHASE_NOISE_DUT_SCENARIOS.find((scenario) => scenario.id === scenarioId)!;
    const spec = PHASE_NOISE_SPEC_PRESETS.find((preset) => preset.id === 'training')!;
    const qualification = qualifyPhaseNoiseBench(
      simulatePhaseNoiseBench(dut.settings),
      spec.points,
    );

    expect(qualification.passed).toBe(false);
    expect(qualification.diagnosis.id).toBe(diagnosisId);
  });

  it('separates an analyzer-limited result from a proven DUT failure', () => {
    const dut = PHASE_NOISE_DUT_SCENARIOS.find((scenario) => scenario.id === 'dut-d')!;
    const spec = PHASE_NOISE_SPEC_PRESETS.find((preset) => preset.id === 'training')!;
    const qualification = qualifyPhaseNoiseBench(
      simulatePhaseNoiseBench(dut.settings),
      spec.points,
    );

    expect(qualification.passed).toBe(false);
    expect(qualification.diagnosis.id).toBe('setup');
    expect(qualification.evaluations.some((point) => point.setupLimited)).toBe(true);
  });
});
