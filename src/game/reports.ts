import { CATEGORY_LABELS } from '@/config/missions';
import { db } from '@/db/database';
import { addDays, endOfMonth, startOfMonth, startOfWeek } from '@/utils/date';
import type {
  DailyMissionRecord,
  DailyReview,
  LocalDateKey,
  MissionCategory,
  PeriodicReport,
} from '@/types/game';

function buildReport(
  kind: PeriodicReport['kind'],
  start: LocalDateKey,
  end: LocalDateKey,
  reviews: DailyReview[],
  records: DailyMissionRecord[],
  missionCategories: Map<string, MissionCategory>,
): PeriodicReport {
  const completed = records.filter((record) => record.status === 'completed');
  const categoryRates = (Object.keys(CATEGORY_LABELS) as MissionCategory[]).map((category) => {
    const categoryRecords = records.filter(
      (record) => missionCategories.get(record.missionId) === category,
    );
    return {
      category,
      rate: categoryRecords.length
        ? categoryRecords.filter((record) => record.status === 'completed').length /
          categoryRecords.length
        : 1,
    };
  });
  const weakest = categoryRates.sort((a, b) => a.rate - b.rate)[0];
  return {
    id: `${kind}:${start}`,
    kind,
    periodStart: start,
    periodEnd: end,
    createdAt: new Date().toISOString(),
    completionRate: records.length ? completed.length / records.length : 0,
    completedMissions: completed.length,
    perfectDays: reviews.filter((review) => review.perfectDay).length,
    strongestCategory: [...categoryRates].sort((a, b) => b.rate - a.rate)[0].category,
    focusSuggestion: `Give ${CATEGORY_LABELS[weakest.category]} one deliberately small, early action next cycle.`,
    ruleExplanation: `${CATEGORY_LABELS[weakest.category]} had the lowest completion rate in this period; ties use the fixed category order. No personal or health inference is made.`,
  };
}

export async function refreshPeriodicReports(date: LocalDateKey, weekStartsOn: number) {
  const periods = [
    {
      kind: 'weekly' as const,
      start: startOfWeek(date, weekStartsOn),
      end: addDays(startOfWeek(date, weekStartsOn), 6),
    },
    {
      kind: 'monthly' as const,
      start: startOfMonth(date),
      end: endOfMonth(date),
    },
  ];
  const missions = await db.missions.toArray();
  const missionCategories = new Map(missions.map((mission) => [mission.id, mission.category]));
  for (const period of periods) {
    const [reviews, records] = await Promise.all([
      db.dailyReviews.where('date').between(period.start, period.end, true, true).toArray(),
      db.dailyMissions.where('date').between(period.start, period.end, true, true).toArray(),
    ]);
    await db.reports.put(
      buildReport(period.kind, period.start, period.end, reviews, records, missionCategories),
    );
  }
}
