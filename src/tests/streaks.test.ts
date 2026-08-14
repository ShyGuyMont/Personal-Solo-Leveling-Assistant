import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { createDefaultProgression } from '@/db/seed';
import {
  deriveDailyStreakMetrics,
  reconcileClearedDayStreaks,
} from '@/game/streaks';
import type { DailyReview, LocalDateKey } from '@/types/game';

function review(
  date: LocalDateKey,
  result: 'partial' | 'perfect' | 'protected',
): DailyReview {
  return {
    id: date,
    date,
    status: 'finalized',
    startedAt: `${date}T12:00:00.000Z`,
    finalizedAt: `${date}T13:00:00.000Z`,
    completionCount: result === 'partial' ? 1 : 6,
    activeMissionCount: 6,
    completionRate: result === 'partial' ? 1 / 6 : 1,
    perfectDay: result === 'perfect',
    protectedPerfectDay: result === 'protected',
    accountXpAwarded: 0,
    statChanges: {},
    verdict: 'Test review.',
    systemState: 'stable',
    transactionIds: [],
  };
}

describe('cleared-day streaks', () => {
  beforeEach(async () => {
    await Promise.all([
      db.dailyReviews.clear(),
      db.progression.clear(),
      db.streaks.clear(),
      db.appMetadata.clear(),
    ]);
  });

  it('rejects partial activity, preserves protected clears, and breaks across missing dates', () => {
    const metrics = deriveDailyStreakMetrics([
      review('2026-08-01', 'perfect'),
      review('2026-08-02', 'partial'),
      review('2026-08-03', 'protected'),
      review('2026-08-04', 'perfect'),
      review('2026-08-06', 'perfect'),
    ]);

    expect(metrics).toMatchObject({
      currentDayStreak: 1,
      longestDayStreak: 2,
      currentPerfectStreak: 1,
      longestPerfectStreak: 1,
      lastDayQualifiedDate: '2026-08-06',
      lastDayBrokenDate: '2026-08-02',
    });
  });

  it('repairs legacy any-mission streaks once without erasing activity-day progress', async () => {
    await db.progression.put({
      ...createDefaultProgression(),
      completedDays: 2,
      currentDayStreak: 5,
      longestDayStreak: 5,
      currentPerfectStreak: 5,
      longestPerfectStreak: 5,
    });
    await db.dailyReviews.bulkPut([
      review('2026-08-01', 'partial'),
      review('2026-08-02', 'perfect'),
    ]);

    await expect(reconcileClearedDayStreaks()).resolves.toBe(true);
    expect(await db.progression.get('primary')).toMatchObject({
      completedDays: 2,
      currentDayStreak: 1,
      longestDayStreak: 1,
      currentPerfectStreak: 1,
      longestPerfectStreak: 1,
    });
    expect(await db.streaks.get('day')).toMatchObject({
      current: 1,
      longest: 1,
      lastQualifiedDate: '2026-08-02',
      lastBrokenDate: '2026-08-01',
    });
    await expect(reconcileClearedDayStreaks()).resolves.toBe(false);
  });
});
