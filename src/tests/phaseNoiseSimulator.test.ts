import { describe, expect, it } from 'vitest';
import { DEFAULT_PHASE_NOISE_SETTINGS, simulatePhaseNoiseBench } from '@/game/phaseNoiseSimulator';

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
});
