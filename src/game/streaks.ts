import { db } from '@/db/database';
import type { DailyReview, LocalDateKey } from '@/types/game';
import { addDays } from '@/utils/date';

const CLEAR_STREAK_RECONCILIATION_ID = 'cleared-day-streak-v1';

export interface DailyStreakMetrics {
  currentDayStreak: number;
  longestDayStreak: number;
  currentPerfectStreak: number;
  longestPerfectStreak: number;
  lastDayQualifiedDate?: LocalDateKey;
  lastDayBrokenDate?: LocalDateKey;
  lastPerfectQualifiedDate?: LocalDateKey;
  lastPerfectBrokenDate?: LocalDateKey;
}

type DailyStreakReview = Pick<
  DailyReview,
  'date' | 'status' | 'perfectDay' | 'protectedPerfectDay'
>;

export function qualifiesForClearedDay(
  review: Pick<DailyReview, 'status' | 'perfectDay' | 'protectedPerfectDay'>,
) {
  return review.status === 'finalized' && (review.perfectDay || review.protectedPerfectDay);
}

export function qualifiesForPerfectStreak(
  review: Pick<DailyReview, 'status' | 'perfectDay'>,
) {
  return review.status === 'finalized' && review.perfectDay;
}

export function deriveDailyStreakMetrics(reviews: DailyStreakReview[]): DailyStreakMetrics {
  const finalized = reviews
    .filter((review) => review.status === 'finalized')
    .sort((a, b) => a.date.localeCompare(b.date));
  let currentDayStreak = 0;
  let longestDayStreak = 0;
  let currentPerfectStreak = 0;
  let longestPerfectStreak = 0;
  let previousDate: LocalDateKey | undefined;
  let lastDayQualifiedDate: LocalDateKey | undefined;
  let lastDayBrokenDate: LocalDateKey | undefined;
  let lastPerfectQualifiedDate: LocalDateKey | undefined;
  let lastPerfectBrokenDate: LocalDateKey | undefined;

  for (const review of finalized) {
    if (previousDate && review.date !== addDays(previousDate, 1)) {
      currentDayStreak = 0;
      currentPerfectStreak = 0;
    }

    if (qualifiesForClearedDay(review)) {
      currentDayStreak += 1;
      longestDayStreak = Math.max(longestDayStreak, currentDayStreak);
      lastDayQualifiedDate = review.date;
    } else {
      currentDayStreak = 0;
      lastDayBrokenDate = review.date;
    }

    if (qualifiesForPerfectStreak(review)) {
      currentPerfectStreak += 1;
      longestPerfectStreak = Math.max(longestPerfectStreak, currentPerfectStreak);
      lastPerfectQualifiedDate = review.date;
    } else {
      currentPerfectStreak = 0;
      lastPerfectBrokenDate = review.date;
    }
    previousDate = review.date;
  }

  return {
    currentDayStreak,
    longestDayStreak,
    currentPerfectStreak,
    longestPerfectStreak,
    lastDayQualifiedDate,
    lastDayBrokenDate,
    lastPerfectQualifiedDate,
    lastPerfectBrokenDate,
  };
}

export async function reconcileClearedDayStreaks() {
  if (await db.appMetadata.get(CLEAR_STREAK_RECONCILIATION_ID)) return false;

  await db.transaction(
    'rw',
    [db.dailyReviews, db.progression, db.streaks, db.appMetadata],
    async () => {
      if (await db.appMetadata.get(CLEAR_STREAK_RECONCILIATION_ID)) return;
      const [reviews, progression] = await Promise.all([
        db.dailyReviews.where('status').equals('finalized').toArray(),
        db.progression.get('primary'),
      ]);
      if (!progression) return;
      const metrics = deriveDailyStreakMetrics(reviews);
      const now = new Date().toISOString();

      await db.progression.put({
        ...progression,
        currentDayStreak: metrics.currentDayStreak,
        longestDayStreak: metrics.longestDayStreak,
        currentPerfectStreak: metrics.currentPerfectStreak,
        longestPerfectStreak: metrics.longestPerfectStreak,
      });
      await db.streaks.bulkPut([
        {
          id: 'day',
          kind: 'day',
          current: metrics.currentDayStreak,
          longest: metrics.longestDayStreak,
          lastQualifiedDate: metrics.currentDayStreak
            ? metrics.lastDayQualifiedDate
            : undefined,
          lastBrokenDate: metrics.lastDayBrokenDate,
        },
        {
          id: 'perfect',
          kind: 'perfect',
          current: metrics.currentPerfectStreak,
          longest: metrics.longestPerfectStreak,
          lastQualifiedDate: metrics.currentPerfectStreak
            ? metrics.lastPerfectQualifiedDate
            : undefined,
          lastBrokenDate: metrics.lastPerfectBrokenDate,
        },
      ]);
      await db.appMetadata.put({
        id: CLEAR_STREAK_RECONCILIATION_ID,
        value: true,
        updatedAt: now,
      });
    },
  );
  return true;
}
