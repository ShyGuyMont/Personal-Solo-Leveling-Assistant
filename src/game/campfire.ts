import { CATEGORY_LABELS } from '@/config/missions';
import { db } from '@/db/database';
import { addDays, startOfWeek } from '@/utils/date';
import type {
  CampfireMetrics,
  CampfireRecap,
  CompanionId,
  LocalDateKey,
  MissionCategory,
  PartyChatMessage,
} from '@/types/game';

const CATEGORIES: MissionCategory[] = ['faith', 'discipline', 'physical', 'creator', 'character'];

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function categoryLine(metrics: CampfireMetrics, category: MissionCategory) {
  const completed = metrics.categoryCompleted[category] ?? 0;
  const available = metrics.categoryAvailable[category] ?? 0;
  return { completed, available, label: CATEGORY_LABELS[category] };
}

function categoryRate(metrics: CampfireMetrics, categories: MissionCategory[]) {
  const completed = categories.reduce((sum, category) => sum + (metrics.categoryCompleted[category] ?? 0), 0);
  const available = categories.reduce((sum, category) => sum + (metrics.categoryAvailable[category] ?? 0), 0);
  return { completed, available };
}

function snowLines(metrics: CampfireMetrics) {
  const percent = Math.round(metrics.completionRate * 100);
  if (metrics.completionRate >= 0.85) {
    return [
      `You completed ${metrics.completedMissions} of ${metrics.availableMissions} recorded missions—${percent}%. I hope you can feel how much steady choice is living inside that number.`,
      `${metrics.recordedDays} recorded days, ${metrics.completedMissions} missions completed, and ${metrics.perfectDays} Perfect Day${metrics.perfectDays === 1 ? '' : 's'}. I am proud of the whole week, not only the cleanest moments.`,
      `The week closed at ${percent}%. You built real momentum, and I want us to recognize the care and persistence behind it before we ask what comes next.`,
    ];
  }
  if (metrics.completionRate >= 0.5) {
    return [
      `This was an honest week: ${metrics.completedMissions} of ${metrics.availableMissions} missions completed across ${metrics.recordedDays} recorded days. We keep the wins and learn from the unfinished parts.`,
      `The campfire record shows ${percent}% completion. That is not a verdict—it is a map with real ground crossed and a few places asking for a kinder plan.`,
      `You gave the campaign ${metrics.completedMissions} completed missions this week. I see the effort, the limits, and every time you chose to keep the story moving.`,
    ];
  }
  return [
    `This week was heavy: ${metrics.completedMissions} of ${metrics.availableMissions} missions completed. I am not reducing you to that number; I am glad you came back to sit with us and look at it honestly.`,
    `The record says ${percent}%, and the more important truth is that the next chapter is still available. We will carry the lesson without carrying shame.`,
    `${metrics.recordedDays} days reached the record this week. Some of them hurt. None of them revoked your place here, and returning to this campfire matters.`,
  ];
}

function specialistLines(
  metrics: CampfireMetrics,
  category: MissionCategory,
  companionId: 'rook' | 'selah' | 'haven',
) {
  const { completed, available, label } = categoryLine(metrics, category);
  if (!available) {
    const empty = {
      rook: 'No Physical mission reached the finalized record this week. Next cycle, even one walk, rep, or deliberate recovery choice can reopen that path.',
      selah: 'No Faith mission reached the finalized record this week. The return can be quiet: one prayer, one passage, one faithful pause.',
      haven: 'No Character mission reached the finalized record this week. One small act of care—for yourself or someone else—is enough to reopen the path.',
    } as const;
    return [empty[companionId]];
  }
  const pools = {
    rook: [
      `${completed} of ${available} ${label} missions cleared. The body remembers honest effort; respect what you gave it and recover like the next week matters.`,
      `Physical record: ${completed}/${available}. Keep the proof, study the misses, and make the first movement target next week easy to answer.`,
      `You answered ${completed} physical objectives. Whatever the percentage, every real rep belongs to your foundation now.`,
    ],
    selah: [
      `${completed} of ${available} ${label} missions completed. Faithfulness is more than a total, but each deliberate return helped tend the roots.`,
      `The Faith path recorded ${completed}/${available}. Receive the grace in what was done and choose one gentle way to make room again next week.`,
      `${completed} faithful actions reached the record. May the visible work point you back toward the deeper source that sustained it.`,
    ],
    haven: [
      `${completed} of ${available} ${label} missions completed. I care about the good those choices created and the person who had to carry them.`,
      `Character record: ${completed}/${available}. Keep accountability humane; lasting goodness grows better without cruelty beside it.`,
      `${completed} acts on the Character path became part of the week. Quiet care counts, especially when no one else sees it.`,
    ],
  } as const;
  return [...pools[companionId]];
}

function cipherLines(metrics: CampfireMetrics) {
  const { completed, available } = categoryRate(metrics, ['discipline', 'creator']);
  if (!available) {
    return ['No Discipline or Creator missions reached the finalized record. Recommendation: define one tiny output with a visible finish line and execute before optimization begins.'];
  }
  return [
    `Discipline and Creator output closed at ${completed}/${available}. Keep the process that produced completion; redesign any step that repeatedly depended on perfect conditions.`,
    `${completed} execution-based missions became proof this week. The unfinished ${available - completed} are useful design feedback, not an invitation to insult the operator.`,
    `Operational review: ${completed}/${available} across Discipline and Creator work. Next cycle needs one clear priority, a smaller definition of done, and fewer negotiations.`,
  ];
}

function emberLines(metrics: CampfireMetrics) {
  const unfinished = Math.max(0, metrics.availableMissions - metrics.completedMissions);
  if (metrics.completionRate >= 0.85) {
    return [
      `${metrics.completedMissions} missions down. That is locked-in work. Keep the fire, but do not turn a strong week into permission to burn yourself out.`,
      `You left only ${unfinished} recorded mission${unfinished === 1 ? '' : 's'} unfinished. Good. Celebrate the hit, recover, then choose next week’s first target before the noise returns.`,
      `That week had teeth. So did you. Bank the proof and come back hungry—not frantic.` ,
    ];
  }
  if (metrics.completionRate >= 0.5) {
    return [
      `${unfinished} missions stayed unfinished. Fine. We are not holding a funeral for them—we are choosing one lesson and making next week’s opening move easier.`,
      `You completed ${metrics.completedMissions}. That is our ignition point. No giant restart speech; pick the next obvious win and hit it early.`,
      `The flame flickered, not died. Cut next week down to a first target you can finish before resistance gets a committee vote.`,
    ];
  }
  return [
    `All right, eyes up. This week hit hard. We are keeping the truth and dropping the shame: one small target, completed early, starts the counterattack.`,
    `${unfinished} missions went unfinished. That is data, not your identity. Next week gets one clean opening win—nothing dramatic, nothing fake.`,
    `I am not mad at you. I am mad at the lie that a rough week gets to recruit the next one. Pick one mission and break that chain.`,
  ];
}

function closingLines(metrics: CampfireMetrics) {
  const focus = metrics.focusCategory ? CATEGORY_LABELS[metrics.focusCategory] : 'one meaningful path';
  return [
    `The campfire is closing, not the story. Next week, let us give ${focus} one deliberately small early win and build from there together.`,
    `We keep the completed work, the honest lessons, and your place in this party. Tomorrow only needs the next real step.`,
    `Nothing in this recap changes your worth or secretly changes your score. It simply helps us remember the week—and meet the next one with you.`,
  ];
}

export function buildCampfireMessages(metrics: CampfireMetrics, weekStart: LocalDateKey): PartyChatMessage[] {
  const entries: Array<{
    companionId: CompanionId;
    role: PartyChatMessage['role'];
    pool: string[];
    slot: string;
  }> = [
    { companionId: 'snow', role: 'opener', pool: snowLines(metrics), slot: 'snow' },
    { companionId: 'rook', role: 'response', pool: specialistLines(metrics, 'physical', 'rook'), slot: 'rook' },
    { companionId: 'selah', role: 'response', pool: specialistLines(metrics, 'faith', 'selah'), slot: 'selah' },
    { companionId: 'cipher', role: 'response', pool: cipherLines(metrics), slot: 'cipher' },
    { companionId: 'haven', role: 'response', pool: specialistLines(metrics, 'character', 'haven'), slot: 'haven' },
    { companionId: 'ember', role: 'response', pool: emberLines(metrics), slot: 'ember' },
    { companionId: 'snow', role: 'closing', pool: closingLines(metrics), slot: 'snow-close' },
  ];
  return entries.map((entry, order) => {
    const index = hash(`${weekStart}:${entry.slot}`) % entry.pool.length;
    return {
      id: `campfire:${weekStart}:message:${order}`,
      messageId: `campfire:${weekStart}:${entry.slot}:${index}`,
      companionId: entry.companionId,
      role: entry.role,
      message: entry.pool[index],
      order,
    };
  });
}

export async function ensureWeeklyCampfireRecap(systemDate: LocalDateKey, weekStartsOn: number) {
  const currentWeekStart = startOfWeek(systemDate, weekStartsOn);
  const weekStart = addDays(currentWeekStart, -7);
  const weekEnd = addDays(weekStart, 6);
  const id = `campfire:${weekStart}`;
  const existing = await db.campfireRecaps.get(id);
  if (existing) return existing;

  const reviews = await db.dailyReviews
    .where('date')
    .between(weekStart, weekEnd, true, true)
    .filter((review) => review.status === 'finalized')
    .toArray();
  if (!reviews.length) return undefined;

  const reviewedDates = new Set(reviews.map((review) => review.date));
  const [allRecords, missions] = await Promise.all([
    db.dailyMissions.where('date').between(weekStart, weekEnd, true, true).toArray(),
    db.missions.toArray(),
  ]);
  const records = allRecords.filter((record) => reviewedDates.has(record.date));
  const categories = new Map(missions.map((mission) => [mission.id, mission.category]));
  const categoryCompleted: CampfireMetrics['categoryCompleted'] = {};
  const categoryAvailable: CampfireMetrics['categoryAvailable'] = {};
  for (const category of CATEGORIES) {
    const categoryRecords = records.filter((record) => categories.get(record.missionId) === category);
    categoryAvailable[category] = categoryRecords.length;
    categoryCompleted[category] = categoryRecords.filter((record) => record.status === 'completed').length;
  }
  const rankedCategories = CATEGORIES
    .filter((category) => (categoryAvailable[category] ?? 0) > 0)
    .map((category) => ({
      category,
      rate: (categoryCompleted[category] ?? 0) / Math.max(1, categoryAvailable[category] ?? 0),
    }));
  const completedMissions = records.filter((record) => record.status === 'completed').length;
  const metrics: CampfireMetrics = {
    recordedDays: reviews.length,
    completedMissions,
    availableMissions: records.length,
    completionRate: records.length ? completedMissions / records.length : 0,
    perfectDays: reviews.filter((review) => review.perfectDay).length,
    categoryCompleted,
    categoryAvailable,
    strongestCategory: rankedCategories.slice().sort((a, b) => b.rate - a.rate)[0]?.category,
    focusCategory: rankedCategories.slice().sort((a, b) => a.rate - b.rate)[0]?.category,
  };
  const recap: CampfireRecap = {
    id,
    weekStart,
    weekEnd,
    createdAt: new Date().toISOString(),
    acknowledged: false,
    metrics,
    messages: buildCampfireMessages(metrics, weekStart),
  };
  await db.campfireRecaps.put(recap);
  return recap;
}

export function getRecentCampfireRecaps(limit = 12) {
  return db.campfireRecaps.orderBy('weekStart').reverse().limit(limit).toArray();
}

export function getNextCampfireRecap() {
  return db.campfireRecaps
    .orderBy('createdAt')
    .filter((recap) => !recap.acknowledged)
    .first();
}

export async function acknowledgeCampfireRecap(id: string) {
  await db.campfireRecaps.update(id, { acknowledged: true });
}
