import { CATEGORY_LABELS } from '@/config/missions';
import { db } from '@/db/database';
import { addDays, endOfMonth, startOfMonth } from '@/utils/date';
import type {
  CompanionId,
  LocalDateKey,
  MissionCategory,
  MonthlyCouncil,
  MonthlyCouncilMetrics,
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

function categoryCount(metrics: MonthlyCouncilMetrics, category: MissionCategory) {
  return metrics.categoryCompleted[category] ?? 0;
}

function select(pool: string[], monthStart: LocalDateKey, slot: string) {
  return pool[hash(`${monthStart}:${slot}`) % pool.length];
}

function snowOpening(metrics: MonthlyCouncilMetrics) {
  const percent = Math.round(metrics.completionRate * 100);
  return [
    `Council assembled. This month holds ${metrics.recordedDays} recorded days, ${metrics.completedMissions} completed missions, and a ${percent}% completion rate. We are here for the meaning behind the numbers, not a verdict from them.`,
    `The monthly record is open: ${metrics.completedMissions} missions completed across ${metrics.recordedDays} finalized days. Before we plan forward, I want the whole party to honor what it took to keep returning.`,
    `We reached the end of a real chapter—strong days, unfinished days, and ${metrics.perfectDays} Perfect Day${metrics.perfectDays === 1 ? '' : 's'} among them. Let us read it with honesty and care.`,
  ];
}

function rookCouncil(metrics: MonthlyCouncilMetrics) {
  const physical = categoryCount(metrics, 'physical');
  return physical
    ? [
        `${physical} Physical missions entered the record. That is foundation work. Keep what your body can repeat, and recover like next month deserves a strong version of you too.`,
        `Physical total: ${physical}. I care less about a dramatic peak than the fact that the body answered again and again. Build from the pattern that held.`,
        `You gave the body ${physical} deliberate efforts. Let the next cycle strengthen the stance without treating exhaustion as proof of courage.`,
      ]
    : [
        'The Physical path stayed quiet in the finalized record. Next month does not need a transformation—one repeatable movement target can reopen the foundation.',
      ];
}

function selahCouncil(metrics: MonthlyCouncilMetrics) {
  const faith = categoryCount(metrics, 'faith');
  return faith
    ? [
        `${faith} Faith missions became part of this month. The total matters less than the repeated return beneath it; continue tending what keeps you rooted.`,
        `The Faith path recorded ${faith} practices. Receive what grew quietly, give thanks for the strength that met you, and carry one gentle rhythm forward.`,
        `${faith} faithful actions are visible here. Some of the deepest fruit may still be hidden; do not confuse unseen growth with absent growth.`,
      ]
    : [
        'The Faith path did not reach this month’s finalized record. Return without performance: one prayer, one passage, one quiet opening toward what is true.',
      ];
}

function cipherCouncil(metrics: MonthlyCouncilMetrics) {
  const execution = categoryCount(metrics, 'discipline');
  return execution
    ? [
        `${execution} Discipline missions converted intention into evidence. Preserve the process that held; redesign any step that repeatedly required ideal conditions.`,
        `Execution total: ${execution}. The next campaign should have one visible priority, a smaller definition of done, and fewer simultaneous fronts.`,
        `${execution} output-oriented objectives cleared. We now possess enough data to repeat what worked and stop romanticizing the bottlenecks.`,
      ]
    : [
        'No Discipline completion entered the monthly record. Recommendation: choose one tiny artifact with a visible finish line and permit an imperfect first version.',
      ];
}

function havenCouncil(metrics: MonthlyCouncilMetrics) {
  const creator = categoryCount(metrics, 'creator');
  return creator
    ? [
        `${creator} Creator missions hit the board this month. Now tell me which hook, format, or story earned the strongest response—and which draft is still hiding backstage.`,
        `Creator signal: ${creator}. Good. Preserve the voice people recognize, sharpen the audience promise, and give next month one release worth building toward.`,
        `${creator} pieces of creator proof became real. Cipher will study the system; I want the courage, personality, and audience connection to survive the optimization.`,
      ]
    : [
        'The creator signal was quiet this month. No apology campaign. Open the greenroom, choose one idea people would genuinely care about, and move it one visible stage.',
      ];
}

function emberCouncil(metrics: MonthlyCouncilMetrics) {
  if (metrics.completionRate >= 0.75) {
    return [
      `${metrics.completedMissions} missions down. That is real heat. Bank the proof, choose next month’s opening target now, and do not turn success into a burnout permit.`,
      `Strong month. Good. We celebrate, recover, and set one obvious first hit for the next cycle before hesitation gets organized.`,
      `You kept the flame aimed. Now leave enough fuel to come back hungry instead of scorched.`,
    ];
  }
  return [
    `The month left unfinished ground. Fine. We are not restarting your identity—just choosing one small first target and breaking the delay before it recruits another week.`,
    `${metrics.completedMissions} completed missions are our ignition point. Keep the lesson, drop the shame, and make the next opening win easy to reach.`,
    `No giant comeback speech. One target, one first minute, one clean piece of proof. The next cycle starts there.`,
  ];
}

function amaraCouncil(metrics: MonthlyCouncilMetrics) {
  if (metrics.relationshipActions) {
    return [
      `${metrics.relationshipActions} relationship-minded actions reached the record. Remember what cannot be counted too: listening, honest boundaries, repair, laughter, and the places you let yourself be known.`,
      `The heart path recorded ${metrics.relationshipActions} deliberate choices. Carry forward the bonds that feel reciprocal, and protect the parts of you healthy connection should never require you to erase.`,
      `${metrics.relationshipActions} acts of kindness or connection became visible this month. I hope the next council also hears about care you allowed yourself to receive.`,
    ];
  }
  return [
    'The relationship path was quiet in the logged record. Next month, choose one safe signal: appreciation, an honest request, an invitation, or a boundary that protects your peace.',
  ];
}

function miraCouncil(metrics: MonthlyCouncilMetrics) {
  const movement = categoryCount(metrics, 'physical');
  if (movement) {
    return [
      `${movement} physical missions reached the monthly record. Keep building strength, but let the next cycle include enough mobility and breath work to carry it without unnecessary tension.`,
      `The body answered ${movement} times this month. The next evolution is not only more output—it is more usable range, calmer control, and recovery you complete on purpose.`,
      `${movement} movement signals became proof. I recommend one Stillpoint Protocol each week so the frame remains as adaptable as it is determined.`,
    ];
  }
  return [
    'The physical path was quiet this month. Re-entry can be gentle: one guided mobility protocol, one controlled core sequence, and no attempt to punish the gap.',
  ];
}

function cassianCouncil(metrics: MonthlyCouncilMetrics) {
  const reviews = metrics.treasuryReviews ?? 0;
  const wins = metrics.noEatingOutWins ?? 0;
  const future = (metrics.savingsContributedCents ?? 0) + (metrics.debtPaidCents ?? 0);
  if (reviews || wins || future) {
    return [
      `Treasury council reports ${reviews} weekly review${reviews === 1 ? '' : 's'}, ${wins} No Eating Out win${wins === 1 ? '' : 's'}, and $${(future / 100).toFixed(2)} sent toward savings or debt. Repeat the structure that made those choices easier.`,
      `This month moved $${(future / 100).toFixed(2)} toward tomorrow and held the food-spending line ${wins} time${wins === 1 ? '' : 's'}. Progress is becoming margin, not merely restraint.`,
      `${reviews} review${reviews === 1 ? '' : 's'} kept the ledger visible. Preserve clarity, prepare before convenience becomes urgent, and let the next target remain realistic.`,
    ];
  }
  return [
    'The Treasury record was quiet this month. Next cycle needs no grand restriction—only one weekly review, honest entries, and a meal plan that can survive a tired evening.',
  ];
}

function saffronCouncil(metrics: MonthlyCouncilMetrics) {
  const orders = metrics.kitchenOrders;
  if (orders) {
    return [
      `Kitchen council reports ${orders} completed order${orders === 1 ? '' : 's'}. Those meals supported training, protected the Treasury, and made several difficult evenings easier before they arrived.`,
      `${orders} home-cooked meal${orders === 1 ? '' : 's'} became part of the campaign. Keep the recipes you would repeat and adjust the ones that created too much friction.`,
      `The fire answered ${orders} time${orders === 1 ? '' : 's'} this month. Next cycle, choose one favorite as a standard and one new recipe as an experiment.`,
    ];
  }
  return [
    'The Kitchen had no completed orders in the monthly record. We do not begin with restriction—we begin with one grocery list and one meal simple enough for a tired night.',
  ];
}

function snowClosing(metrics: MonthlyCouncilMetrics) {
  const focus = metrics.focusCategory
    ? CATEGORY_LABELS[metrics.focusCategory]
    : 'one meaningful path';
  const growth = [
    metrics.levelsGained
      ? `${metrics.levelsGained} level${metrics.levelsGained === 1 ? '' : 's'}`
      : '',
    metrics.rankChanges
      ? `${metrics.rankChanges} class advancement${metrics.rankChanges === 1 ? '' : 's'}`
      : '',
    metrics.titlesGained
      ? `${metrics.titlesGained} title${metrics.titlesGained === 1 ? '' : 's'}`
      : '',
    metrics.arcMilestones
      ? `${metrics.arcMilestones} campaign milestone${metrics.arcMilestones === 1 ? '' : 's'}`
      : '',
    metrics.questChapters
      ? `${metrics.questChapters} companion chapter${metrics.questChapters === 1 ? '' : 's'}`
      : '',
  ].filter(Boolean);
  const record = growth.length ? ` The record also confirms ${growth.join(', ')}.` : '';
  return [
    `Council conclusion: protect what worked, let ${focus} receive one smaller early win, and choose an intention kind enough to survive a difficult week.${record}`,
    `Nothing here secretly changes your score. We keep the proof, learn from the friction, and enter the next month together.${record}`,
    `The council is adjourned, but the party remains. Write one honest intention for ${focus}, then let the next chapter begin one day at a time.${record}`,
  ];
}

export function buildMonthlyCouncilMessages(
  metrics: MonthlyCouncilMetrics,
  monthStart: LocalDateKey,
): PartyChatMessage[] {
  const entries: Array<{
    companionId: CompanionId;
    role: PartyChatMessage['role'];
    slot: string;
    pool: string[];
  }> = [
    { companionId: 'snow', role: 'opener', slot: 'snow', pool: snowOpening(metrics) },
    { companionId: 'rook', role: 'response', slot: 'rook', pool: rookCouncil(metrics) },
    { companionId: 'selah', role: 'response', slot: 'selah', pool: selahCouncil(metrics) },
    { companionId: 'cipher', role: 'response', slot: 'cipher', pool: cipherCouncil(metrics) },
    { companionId: 'haven', role: 'response', slot: 'haven', pool: havenCouncil(metrics) },
    { companionId: 'ember', role: 'response', slot: 'ember', pool: emberCouncil(metrics) },
    { companionId: 'mira', role: 'response', slot: 'mira', pool: miraCouncil(metrics) },
    { companionId: 'amara', role: 'response', slot: 'amara', pool: amaraCouncil(metrics) },
    { companionId: 'cassian', role: 'response', slot: 'cassian', pool: cassianCouncil(metrics) },
    { companionId: 'saffron', role: 'response', slot: 'saffron', pool: saffronCouncil(metrics) },
    { companionId: 'snow', role: 'closing', slot: 'snow-close', pool: snowClosing(metrics) },
  ];
  return entries.map((entry, order) => ({
    id: `monthly-council:${monthStart}:message:${order}`,
    messageId: `monthly-council:${monthStart}:${entry.slot}`,
    companionId: entry.companionId,
    role: entry.role,
    message: select(entry.pool, monthStart, entry.slot),
    order,
  }));
}

export async function ensureMonthlyCouncil(systemDate: LocalDateKey) {
  const currentMonthStart = startOfMonth(systemDate);
  const monthEnd = addDays(currentMonthStart, -1);
  const monthStart = startOfMonth(monthEnd);
  const id = `monthly-council:${monthStart}`;
  const existing = await db.monthlyCouncils.get(id);
  if (existing) return existing;

  const reviews = await db.dailyReviews
    .where('date')
    .between(monthStart, monthEnd, true, true)
    .filter((review) => review.status === 'finalized')
    .toArray();
  if (!reviews.length) return undefined;
  const reviewedDates = new Set(reviews.map((review) => review.date));
  const [
    allRecords,
    missions,
    arcMilestones,
    questAudits,
    levels,
    ranks,
    titles,
    treasuryWeeks,
    treasuryChallenges,
    treasuryTransactions,
    kitchenSessions,
  ] = await Promise.all([
    db.dailyMissions.where('date').between(monthStart, monthEnd, true, true).toArray(),
    db.missions.toArray(),
    db.arcMilestones
      .filter((item) =>
        Boolean(
          item.completedAt &&
          item.completedAt.slice(0, 10) >= monthStart &&
          item.completedAt.slice(0, 10) <= monthEnd,
        ),
      )
      .toArray(),
    db.auditEntries
      .filter(
        (item) =>
          item.action === 'companion-quest-chapter-completed' &&
          item.timestamp.slice(0, 10) >= monthStart &&
          item.timestamp.slice(0, 10) <= monthEnd,
      )
      .toArray(),
    db.levelHistory.where('date').between(monthStart, monthEnd, true, true).toArray(),
    db.rankHistory.where('date').between(monthStart, monthEnd, true, true).toArray(),
    db.titles
      .filter(
        (item) =>
          item.unlockedAt.slice(0, 10) >= monthStart && item.unlockedAt.slice(0, 10) <= monthEnd,
      )
      .toArray(),
    db.treasuryWeeks.where('weekStart').between(monthStart, monthEnd, true, true).toArray(),
    db.treasuryChallenges.where('date').between(monthStart, monthEnd, true, true).toArray(),
    db.treasuryTransactions.where('date').between(monthStart, monthEnd, true, true).toArray(),
    db.kitchenSessions.where('date').between(monthStart, monthEnd, true, true).toArray(),
  ]);
  const records = allRecords.filter((record) => reviewedDates.has(record.date));
  const categories = new Map(missions.map((mission) => [mission.id, mission.category]));
  const categoryCompleted: MonthlyCouncilMetrics['categoryCompleted'] = {};
  for (const category of CATEGORIES) {
    categoryCompleted[category] = records.filter(
      (record) => record.status === 'completed' && categories.get(record.missionId) === category,
    ).length;
  }
  const categoryRanking = CATEGORIES.map((category) => ({
    category,
    total: categoryCompleted[category] ?? 0,
  })).filter((item) => item.total > 0);
  const completedMissions = records.filter((record) => record.status === 'completed').length;
  const metrics: MonthlyCouncilMetrics = {
    recordedDays: reviews.length,
    completedMissions,
    availableMissions: records.length,
    completionRate: records.length ? completedMissions / records.length : 0,
    perfectDays: reviews.filter((review) => review.perfectDay).length,
    categoryCompleted,
    strongestCategory: categoryRanking.slice().sort((a, b) => b.total - a.total)[0]?.category,
    focusCategory: categoryRanking.slice().sort((a, b) => a.total - b.total)[0]?.category,
    relationshipActions: records.filter(
      (record) => record.status === 'completed' && record.missionId === 'kind-message',
    ).length,
    arcMilestones: arcMilestones.length,
    questChapters: questAudits.length,
    levelsGained: levels.length,
    rankChanges: ranks.length,
    titlesGained: titles.length,
    treasuryReviews: treasuryWeeks.filter((week) => week.status === 'reviewed').length,
    noEatingOutWins: treasuryChallenges.filter((challenge) => challenge.status === 'passed').length,
    savingsContributedCents: treasuryTransactions
      .filter((transaction) => transaction.kind === 'savings')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0),
    debtPaidCents: treasuryTransactions
      .filter((transaction) => transaction.kind === 'debt-payment')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0),
    kitchenOrders: kitchenSessions.filter((session) => session.status === 'completed').length,
  };
  const council: MonthlyCouncil = {
    id,
    monthStart,
    monthEnd: endOfMonth(monthStart),
    createdAt: new Date().toISOString(),
    acknowledged: false,
    metrics,
    messages: buildMonthlyCouncilMessages(metrics, monthStart),
  };
  await db.monthlyCouncils.put(council);
  return council;
}

export function getRecentMonthlyCouncils(limit = 12) {
  return db.monthlyCouncils.orderBy('monthStart').reverse().limit(limit).toArray();
}

export function getNextMonthlyCouncil() {
  return db.monthlyCouncils
    .orderBy('createdAt')
    .filter((council) => !council.acknowledged)
    .first();
}

export async function acknowledgeMonthlyCouncil(id: string) {
  await db.monthlyCouncils.update(id, { acknowledged: true });
}

export async function saveMonthlyCouncilIntention(id: string, intention: string) {
  await db.monthlyCouncils.update(id, { intention: intention.trim() || undefined });
}
