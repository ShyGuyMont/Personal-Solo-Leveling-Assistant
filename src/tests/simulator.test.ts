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
});
