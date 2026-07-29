import { describe, expect, it } from 'vitest';
import {
  accountXpForLevel,
  applyAccountXp,
  resolveLevelFromTotalXp,
  statXpForLevel,
  totalXpAtLevel,
} from '@/game/xp';

describe('XP curves', () => {
  it('increase smoothly at every level', () => {
    for (let level = 1; level < 150; level += 1) {
      expect(accountXpForLevel(level + 1)).toBeGreaterThan(accountXpForLevel(level));
      expect(statXpForLevel(level + 1)).toBeGreaterThan(statXpForLevel(level));
    }
  });

  it('reaches early levels quickly while preserving long progression', () => {
    expect(resolveLevelFromTotalXp(265 * 5).level).toBeGreaterThanOrEqual(5);
    expect(resolveLevelFromTotalXp(265 * 18).level).toBeGreaterThanOrEqual(10);
    expect(resolveLevelFromTotalXp(225 * 365 * 5).level).toBeGreaterThanOrEqual(95);
    expect(totalXpAtLevel(100, accountXpForLevel)).toBeGreaterThan(400_000);
  });

  it('handles multiple level gains in one reward', () => {
    const result = applyAccountXp(0, 5000);
    expect(result.levelsGained).toBeGreaterThan(8);
    expect(result.currentLevelXp).toBeLessThan(result.xpToNextLevel);
  });
});
