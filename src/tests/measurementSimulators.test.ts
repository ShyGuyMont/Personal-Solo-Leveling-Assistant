import { describe, expect, it } from 'vitest';
import {
  simulateNoiseFigureYFactor,
  simulateScopeSampling,
  simulateSpectrumMeasurement,
  simulateVnaMeasurement,
} from '@/game/measurementSimulators';

describe('Cipher measurement simulators', () => {
  it('models a matched VNA load at the center of the Smith chart', () => {
    const result = simulateVnaMeasurement({
      frequencyGHz: 2.4,
      resistanceOhm: 50,
      reactanceOhm: 0,
      thruLossDb: 0,
      electricalDelayNs: 0,
      calibrationQuality: 100,
    });

    expect(result.gammaMagnitude).toBeCloseTo(0, 5);
    expect(result.vswr).toBeCloseTo(1, 4);
    expect(result.returnLossDb).toBeGreaterThan(90);
  });

  it('shows calibration quality degrading a VNA return-loss result', () => {
    const clean = simulateVnaMeasurement({
      frequencyGHz: 5,
      resistanceOhm: 60,
      reactanceOhm: 15,
      thruLossDb: 1,
      electricalDelayNs: 1,
      calibrationQuality: 100,
    });
    const poor = simulateVnaMeasurement({
      frequencyGHz: 5,
      resistanceOhm: 60,
      reactanceOhm: 15,
      thruLossDb: 1,
      electricalDelayNs: 1,
      calibrationQuality: 30,
    });

    expect(poor.returnLossDb).toBeLessThan(clean.returnLossDb);
    expect(poor.warnings.join(' ')).toMatch(/calibration error/i);
  });

  it('shows RBW and front-end settings changing a spectrum result', () => {
    const narrow = simulateSpectrumMeasurement({
      centerMHz: 1_000,
      toneSpacingKHz: 100,
      tonePowerDbm: -15,
      iip3Dbm: 18,
      rbwHz: 100,
      attenuationDb: 10,
      preampEnabled: false,
    });
    const wide = simulateSpectrumMeasurement({
      centerMHz: 1_000,
      toneSpacingKHz: 100,
      tonePowerDbm: -15,
      iip3Dbm: 18,
      rbwHz: 100_000,
      attenuationDb: 10,
      preampEnabled: false,
    });

    expect(narrow.displayedFloorDbm).toBeLessThan(wide.displayedFloorDbm);
    expect(wide.warnings.join(' ')).toMatch(/RBW is too wide/i);
  });

  it('detects a believable aliased oscilloscope waveform', () => {
    const result = simulateScopeSampling({
      signalMHz: 180,
      sampleRateMSps: 250,
      bandwidthMHz: 500,
      recordLength: 10_000,
    });

    expect(result.aliasMHz).toBeCloseTo(70, 4);
    expect(result.pointsPerCycle).toBeLessThan(2);
    expect(result.warnings.join(' ')).toMatch(/Nyquist is violated/i);
  });

  it('shows a small Y-factor producing a fragile noise-figure measurement', () => {
    const fragile = simulateNoiseFigureYFactor({
      enrDb: 15,
      hotPowerDbm: -77.5,
      coldPowerDbm: -78,
      preDutLossDb: 0.5,
    });
    const healthy = simulateNoiseFigureYFactor({
      enrDb: 15,
      hotPowerDbm: -72,
      coldPowerDbm: -78,
      preDutLossDb: 0.5,
    });

    expect(fragile.correctedDutNoiseFigureDb).toBeGreaterThan(healthy.correctedDutNoiseFigureDb);
    expect(fragile.warnings.join(' ')).toMatch(/uncertainty/i);
  });
});
