import { describe, expect, it } from 'vitest';
import { createDefaultProgression } from '@/db/seed';
import { calculateRankQualification, nextRank } from '@/game/rank';
import { ALL_STATS, createInitialStat } from '@/game/stats';

describe('rank qualification', () => {
  it('advances through the configured order', () => {
    expect(nextRank('F')).toBe('E');
    expect(nextRank('S')).toBe('WORLD CLASS');
    expect(nextRank('WORLD CLASS')).toBeUndefined();
  });

  it('requires more than account level', () => {
    const progression = { ...createDefaultProgression(), level: 50 };
    const qualification = calculateRankQualification(
      progression,
      ALL_STATS.map(createInitialStat),
      [],
    );
    expect(qualification.targetRank).toBe('E');
    expect(qualification.qualified).toBe(false);
    expect(qualification.items.find((item) => item.id === 'level')?.met).toBe(true);
    expect(qualification.items.find((item) => item.id === 'days')?.met).toBe(false);
  });
});
