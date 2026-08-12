import { db } from '@/db/database';
import type {
  DailyCapacity,
  DailyCommandBriefing,
  DailyCommandOutcome,
  DailyMissionRecord,
  LocalDateKey,
  MissionDefinition,
} from '@/types/game';

export const DAILY_COMMAND_RULES = {
  low: {
    targetCompletionRate: 0,
    standardMultiplier: 1,
    fullClearMultiplier: 1,
    priorityCount: 1,
  },
  steady: {
    targetCompletionRate: 0.65,
    standardMultiplier: 1.5,
    fullClearMultiplier: 1.75,
    priorityCount: 2,
  },
  high: {
    targetCompletionRate: 0.8,
    standardMultiplier: 2,
    fullClearMultiplier: 2.5,
    priorityCount: 3,
  },
} as const satisfies Record<
  DailyCapacity,
  {
    targetCompletionRate: number;
    standardMultiplier: number;
    fullClearMultiplier: number;
    priorityCount: number;
  }
>;

export interface DailyCommandProgress {
  eligibleMissionCount: number;
  completedMissionCount: number;
  protectedMissionCount: number;
  clearedMissionCount: number;
  completionRate: number;
  targetMissionCount: number;
  prioritiesComplete: boolean;
  requiredPriorityCount: number;
  completedPriorityCount: number;
  outcome: DailyCommandOutcome;
  multiplier: number;
  remainingMissionCount: number;
}

const SNOW_BRIEFINGS: Record<DailyCapacity, string[]> = {
  low: [
    'Low capacity acknowledged. We are protecting continuity with one meaningful priority. Every completed mission keeps its normal reward, and honesty is never penalized.',
    'Today does not need maximum output. Let us secure one honest win, keep the rest flexible, and treat recovery as strategy.',
    'Low-power command accepted. The mission is continuity, not punishment: one main target and permission to stop when the day requires it.',
  ],
  steady: [
    'Steady capacity confirmed. Clear the Main and Support objectives plus at least 65% of today’s scheduled missions to activate the command multiplier.',
    'We have enough room for focused progress without turning the day into a siege. Reach 65% for 1.5× mission XP, or clear the full list for 1.75×.',
    'Balanced operating conditions. The priority pair leads the plan, but the command is secured by meaningful progress across the whole day.',
  ],
  high: [
    'High capacity confirmed. Main, Support, and Bonus lead the attack; at least 80% of the full daily list is required for the 2× command clear.',
    'The signal is strong today. Reach 80% for 2× mission XP, or complete every scheduled objective for a 2.5× Full Clear.',
    'Surplus energy detected. The command rewards broad execution, not three isolated wins—and no bonus is worth spending tomorrow’s strength.',
  ],
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function chooseSnowMessage(capacity: DailyCapacity, date: LocalDateKey) {
  const pool = SNOW_BRIEFINGS[capacity];
  return pool[hash(`${date}:${capacity}`) % pool.length];
}

function rankMissions(missions: MissionDefinition[], capacity: DailyCapacity) {
  return missions.slice().sort((a, b) => {
    if (capacity === 'low') {
      const recovery = Number(b.recoveryEligible) - Number(a.recoveryEligible);
      if (recovery) return recovery;
      return a.accountXp - b.accountXp;
    }
    if (capacity === 'high') return b.accountXp - a.accountXp;
    const core = Number(b.isCore) - Number(a.isCore);
    return core || b.accountXp - a.accountXp;
  });
}

function isProtectedClear(record?: DailyMissionRecord) {
  return record?.status === 'excused' && record.protectedException;
}

function priorityMissionIds(briefing: DailyCommandBriefing) {
  return [
    briefing.mainMissionId,
    briefing.capacity === 'low' ? undefined : briefing.supportMissionId,
    briefing.capacity === 'high' ? briefing.bonusMissionId : undefined,
  ].filter((id): id is string => Boolean(id));
}

export function getDailyCommandProgress(
  briefing: DailyCommandBriefing,
  records: DailyMissionRecord[],
): DailyCommandProgress {
  const rule = DAILY_COMMAND_RULES[briefing.capacity];
  const eligibleIds = briefing.rulesVersion === 1 ? (briefing.scheduledMissionIds ?? []) : [];
  const recordMap = new Map(records.map((record) => [record.missionId, record]));
  const completedMissionCount = eligibleIds.filter(
    (missionId) => recordMap.get(missionId)?.status === 'completed',
  ).length;
  const protectedMissionCount = eligibleIds.filter((missionId) =>
    isProtectedClear(recordMap.get(missionId)),
  ).length;
  const clearedMissionCount = completedMissionCount + protectedMissionCount;
  const completionRate = eligibleIds.length ? clearedMissionCount / eligibleIds.length : 0;
  const targets = priorityMissionIds(briefing);
  const requiredPriorityCount = Math.min(rule.priorityCount, eligibleIds.length);
  const completedPriorityCount = targets.filter((missionId) => {
    const record = recordMap.get(missionId);
    return record?.status === 'completed' || isProtectedClear(record);
  }).length;
  const prioritiesComplete =
    targets.length >= requiredPriorityCount && completedPriorityCount >= requiredPriorityCount;
  const targetMissionCount =
    briefing.targetMissionCount ?? Math.ceil(eligibleIds.length * rule.targetCompletionRate);
  const fullClear = eligibleIds.length > 0 && clearedMissionCount === eligibleIds.length;
  const standardClear =
    briefing.capacity !== 'low' &&
    eligibleIds.length > 0 &&
    clearedMissionCount >= targetMissionCount &&
    prioritiesComplete;
  const legacyOrLow = briefing.rulesVersion !== 1 || briefing.capacity === 'low';
  const outcome: DailyCommandOutcome = legacyOrLow
    ? 'not-applicable'
    : fullClear && prioritiesComplete
      ? 'full-clear'
      : standardClear
        ? 'standard-clear'
        : 'pending';
  const multiplier =
    outcome === 'full-clear'
      ? (briefing.fullClearMultiplier ?? rule.fullClearMultiplier)
      : outcome === 'standard-clear'
        ? (briefing.standardMultiplier ?? rule.standardMultiplier)
        : 1;

  return {
    eligibleMissionCount: eligibleIds.length,
    completedMissionCount,
    protectedMissionCount,
    clearedMissionCount,
    completionRate,
    targetMissionCount,
    prioritiesComplete,
    requiredPriorityCount,
    completedPriorityCount,
    outcome,
    multiplier,
    remainingMissionCount: Math.max(0, targetMissionCount - clearedMissionCount),
  };
}

export async function suggestDailyBriefing(date: LocalDateKey, capacity: DailyCapacity) {
  const [missions, records, settings] = await Promise.all([
    db.missions.filter((mission) => mission.enabled && !mission.archived).toArray(),
    db.dailyMissions.where('date').equals(date).toArray(),
    db.settings.get('primary'),
  ]);
  const unavailable = new Set(
    records
      .filter((record) => ['completed', 'excused', 'skipped'].includes(record.status))
      .map((record) => record.missionId),
  );
  const candidates = rankMissions(
    missions.filter(
      (mission) =>
        !mission.optional &&
        !unavailable.has(mission.id) &&
        !(
          settings?.recoveryMode.active &&
          settings.recoveryMode.disabledMissionIds.includes(mission.id)
        ),
    ),
    capacity,
  );
  const main = candidates[0];
  const support =
    candidates.find((mission) => mission.category !== main?.category) ?? candidates[1];
  const bonus = candidates.find((mission) => mission.id !== main?.id && mission.id !== support?.id);
  return {
    mainMissionId: main?.id,
    supportMissionId: capacity === 'low' ? undefined : support?.id,
    bonusMissionId: capacity === 'high' ? bonus?.id : undefined,
  };
}

export async function saveDailyBriefing(input: {
  date: LocalDateKey;
  capacity: DailyCapacity;
  mainMissionId?: string;
  supportMissionId?: string;
  bonusMissionId?: string;
}) {
  const now = new Date().toISOString();
  const previous = await db.dailyBriefings.get(input.date);
  if (previous?.status === 'planned' && previous.rulesVersion === 1) {
    throw new Error('Today’s confirmed Daily Command is already locked.');
  }
  const [missions, records] = await Promise.all([
    db.missions.toArray(),
    db.dailyMissions.where('date').equals(input.date).toArray(),
  ]);
  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));
  const scheduledMissionIds = records
    .filter((record) => {
      const mission = missionMap.get(record.missionId);
      return mission && !mission.optional;
    })
    .map((record) => record.missionId);
  if (!scheduledMissionIds.length) throw new Error('No scheduled daily missions are available.');
  const rule = DAILY_COMMAND_RULES[input.capacity];
  const selectedPriorityIds = [
    input.mainMissionId,
    input.capacity === 'low' ? undefined : input.supportMissionId,
    input.capacity === 'high' ? input.bonusMissionId : undefined,
  ].filter((id): id is string => Boolean(id));
  const requiredPriorityCount = Math.min(rule.priorityCount, scheduledMissionIds.length);
  if (
    selectedPriorityIds.length < requiredPriorityCount ||
    new Set(selectedPriorityIds).size !== selectedPriorityIds.length ||
    selectedPriorityIds.some((missionId) => !scheduledMissionIds.includes(missionId))
  ) {
    throw new Error('Choose each required priority from today’s scheduled missions.');
  }
  const briefing: DailyCommandBriefing = {
    id: input.date,
    date: input.date,
    capacity: input.capacity,
    status: 'planned',
    mainMissionId: input.mainMissionId,
    supportMissionId: input.capacity === 'low' ? undefined : input.supportMissionId,
    bonusMissionId: input.capacity === 'high' ? input.bonusMissionId : undefined,
    rulesVersion: 1,
    scheduledMissionIds,
    targetCompletionRate: rule.targetCompletionRate,
    targetMissionCount: Math.ceil(scheduledMissionIds.length * rule.targetCompletionRate),
    standardMultiplier: rule.standardMultiplier,
    fullClearMultiplier: rule.fullClearMultiplier,
    outcome: input.capacity === 'low' ? 'not-applicable' : 'pending',
    snowMessage: chooseSnowMessage(input.capacity, input.date),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  await db.dailyBriefings.put(briefing);
  return briefing;
}

export async function createSuggestedDailyBriefing(date: LocalDateKey, capacity: DailyCapacity) {
  return saveDailyBriefing({ date, capacity, ...(await suggestDailyBriefing(date, capacity)) });
}

export async function skipDailyBriefing(date: LocalDateKey) {
  const now = new Date().toISOString();
  const previous = await db.dailyBriefings.get(date);
  const briefing: DailyCommandBriefing = {
    id: date,
    date,
    capacity: previous?.capacity ?? 'steady',
    status: 'skipped',
    outcome: 'not-applicable',
    snowMessage:
      'Briefing skipped. No penalty, no hidden score change. The channel stays open if you want to plan later.',
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  await db.dailyBriefings.put(briefing);
  return briefing;
}

export async function reopenDailyBriefing(date: LocalDateKey) {
  const briefing = await db.dailyBriefings.get(date);
  if (briefing?.rulesVersion === 1 && briefing.status === 'planned') {
    throw new Error('A confirmed Daily Command stays locked until the next System day.');
  }
  await db.dailyBriefings.delete(date);
}
