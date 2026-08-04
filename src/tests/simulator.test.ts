import { describe, expect, it } from 'vitest';
import { progressionSimulationMatrix, simulateProgression } from '@/dev/progressionSimulator';

describe('development progression simulator', () => {
  it('estimates 7, 30, 90, one-year, and five-year horizons', () => {
    const matrix = progressionSimulationMatrix();
    expect(new Set(matrix.map((row) => row.days))).toEqual(new Set([7, 30, 90, 365, 1825]));
    expect(matrix).toHaveLength(20);
  });

  it('is deterministic and rewards higher consistency without runaway values', () => {
    const steady = simulateProgression(365, 0.75);
    const exact = simulateProgression(365, 1);
    expect(exact.accountLevel).toBeGreaterThan(steady.accountLevel);
    expect(exact.averageStatLevel).toBeGreaterThanOrEqual(steady.averageStatLevel);
    expect(simulateProgression(365, 0.75)).toEqual(steady);
    expect(simulateProgression(1825, 1).accountLevel).toBeLessThan(200);
  });

  it('models Daily Command XP separately and targets World Class in roughly 18–24 months', () => {
    const low = simulateProgression(365, 0.9, 'low');
    const steady = simulateProgression(365, 0.9, 'steady');
    const high = simulateProgression(365, 0.9, 'high');
    expect(steady.accountXpBreakdown.dailyCommand).toBeGreaterThan(0);
    expect(high.accountLevel).toBeGreaterThan(steady.accountLevel);
    expect(steady.accountLevel).toBeGreaterThan(low.accountLevel);
    expect(simulateProgression(720, 0.75).estimatedRank).not.toBe('WORLD CLASS');
    expect(simulateProgression(725, 0.75).estimatedRank).toBe('WORLD CLASS');
    expect(simulateProgression(610, 0.9).estimatedRank).not.toBe('WORLD CLASS');
    expect(simulateProgression(620, 0.9).estimatedRank).toBe('WORLD CLASS');
    expect(simulateProgression(560, 1).estimatedRank).not.toBe('WORLD CLASS');
    expect(simulateProgression(570, 1).estimatedRank).toBe('WORLD CLASS');
  });
});
