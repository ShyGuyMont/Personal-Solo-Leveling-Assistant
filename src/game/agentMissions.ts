import { db } from '@/db/database';
import { putLevelHistory } from '@/game/engine';
import { applyStatChange } from '@/game/stats';
import { applyAccountXp, resolveLevelFromTotalXp } from '@/game/xp';
import { addDays } from '@/utils/date';
import { stableId } from '@/utils/id';
import type {
  AgentMission,
  AgentMissionDifficulty,
  AgentMissionRecurrence,
  CompanionId,
  LocalDateKey,
  MissionCategory,
  StatName,
} from '@/types/game';

export const AGENT_MISSION_REWARDS: Record<
  AgentMissionDifficulty,
  { accountXp: number; statXp: number }
> = {
  minor: { accountXp: 20, statXp: 10 },
  standard: { accountXp: 40, statXp: 20 },
  major: { accountXp: 70, statXp: 35 },
  boss: { accountXp: 120, statXp: 60 },
};

export const AGENT_MISSION_DAILY_XP_CAP = 150;

const CATEGORY_STAT: Record<MissionCategory, StatName> = {
  faith: 'faith',
  discipline: 'discipline',
  physical: 'vitality',
  creator: 'creativity',
  character: 'character',
};

function requireText(value: string, label: string, max: number) {
  const clean = value.trim();
  if (!clean) throw new Error(`${label} is required.`);
  if (clean.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return clean;
}

function requireDate(value?: string): LocalDateKey | undefined {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(`${value}T12:00:00Z`))) {
    throw new Error('The mission due date is invalid.');
  }
  return value as LocalDateKey;
}

function addMonths(date: LocalDateKey, amount: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCMonth(value.getUTCMonth() + amount);
  return value.toISOString().slice(0, 10) as LocalDateKey;
}

export function nextAgentMissionDueDate(mission: AgentMission, from: LocalDateKey) {
  if (mission.recurrence === 'none') return undefined;
  if (mission.recurrence === 'daily') return addDays(from, mission.recurrenceInterval);
  if (mission.recurrence === 'weekly') return addDays(from, mission.recurrenceInterval * 7);
  return addMonths(from, mission.recurrenceInterval);
}

export function isAgentMissionAvailable(mission: AgentMission, date: LocalDateKey) {
  if (mission.status === 'retired') return false;
  if (mission.recurrence === 'none') return mission.status === 'active';
  if (mission.lastCompletedOn === date) return true;
  return !mission.dueDate || mission.dueDate <= date;
}

export async function listAgentMissions() {
  return db.agentMissions
    .toArray()
    .then((items) => items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
}

export async function createAgentMission(input: {
  title: string;
  description?: string;
  category: MissionCategory;
  companionId: CompanionId;
  createdBy: CompanionId | 'hunter';
  source: AgentMission['source'];
  difficulty: AgentMissionDifficulty;
  dueDate?: string;
  recurrence?: AgentMissionRecurrence;
  recurrenceInterval?: number;
  checklistItems?: string[];
}) {
  const reward = AGENT_MISSION_REWARDS[input.difficulty];
  const recurrence = input.recurrence ?? 'none';
  const recurrenceInterval = input.recurrenceInterval ?? 1;
  if (!Number.isInteger(recurrenceInterval) || recurrenceInterval < 1 || recurrenceInterval > 12) {
    throw new Error('Mission recurrence must be between 1 and 12 cycles.');
  }
  const checklistItems = Array.from(
    new Set(
      (input.checklistItems ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.slice(0, 160)),
    ),
  ).slice(0, 12);
  const now = new Date().toISOString();
  const mission: AgentMission = {
    id: crypto.randomUUID(),
    title: requireText(input.title, 'Mission title', 120),
    description: input.description?.trim().slice(0, 1_200) ?? '',
    category: input.category,
    companionId: input.companionId,
    createdBy: input.createdBy,
    source: input.source,
    difficulty: input.difficulty,
    accountXp: reward.accountXp,
    statRewards: [{ stat: CATEGORY_STAT[input.category], xp: reward.statXp }],
    status: 'active',
    dueDate: requireDate(input.dueDate),
    recurrence,
    recurrenceInterval,
    checklistItems,
    checklist: Object.fromEntries(checklistItems.map((item) => [item, false])),
    completionCount: 0,
    rewardTransactionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.transaction('rw', [db.agentMissions, db.auditEntries], async () => {
    await db.agentMissions.add(mission);
    await db.auditEntries.add({
      id: crypto.randomUUID(),
      timestamp: now,
      action: 'agent-mission-created',
      targetId: mission.id,
      after: mission,
      note: `${mission.title} assigned by ${mission.createdBy}.`,
    });
  });
  return mission;
}

export async function updateAgentMission(
  id: string,
  input: Partial<
    Pick<
      AgentMission,
      | 'title'
      | 'description'
      | 'category'
      | 'companionId'
      | 'difficulty'
      | 'dueDate'
      | 'recurrence'
      | 'recurrenceInterval'
      | 'checklistItems'
    >
  >,
) {
  const current = await db.agentMissions.get(id);
  if (!current) throw new Error('That companion mission could not be found.');
  const difficulty = input.difficulty ?? current.difficulty;
  const reward = AGENT_MISSION_REWARDS[difficulty];
  const category = input.category ?? current.category;
  const recurrenceInterval = input.recurrenceInterval ?? current.recurrenceInterval;
  if (!Number.isInteger(recurrenceInterval) || recurrenceInterval < 1 || recurrenceInterval > 12) {
    throw new Error('Mission recurrence must be between 1 and 12 cycles.');
  }
  const checklistItems =
    input.checklistItems === undefined
      ? current.checklistItems
      : Array.from(
          new Set(
            input.checklistItems
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item) => item.slice(0, 160)),
          ),
        ).slice(0, 12);
  const now = new Date().toISOString();
  const next: AgentMission = {
    ...current,
    ...input,
    title: input.title ? requireText(input.title, 'Mission title', 120) : current.title,
    description: input.description?.trim().slice(0, 1_200) ?? current.description,
    dueDate: input.dueDate === undefined ? current.dueDate : requireDate(input.dueDate),
    difficulty,
    accountXp: reward.accountXp,
    statRewards: [{ stat: CATEGORY_STAT[category], xp: reward.statXp }],
    recurrenceInterval,
    checklistItems,
    checklist: Object.fromEntries(
      checklistItems.map((item) => [item, current.checklist[item] ?? false]),
    ),
    updatedAt: now,
  };
  await db.transaction('rw', [db.agentMissions, db.auditEntries], async () => {
    await db.agentMissions.put(next);
    await db.auditEntries.add({
      id: crypto.randomUUID(),
      timestamp: now,
      action: 'agent-mission-updated',
      targetId: id,
      before: current,
      after: next,
      note: `${next.title} updated with Hunter confirmation.`,
    });
  });
  return next;
}

export async function setAgentMissionChecklist(id: string, item: string, checked: boolean) {
  const mission = await db.agentMissions.get(id);
  if (!mission || !mission.checklistItems.includes(item)) {
    throw new Error('That mission checklist item could not be found.');
  }
  const next = { ...mission.checklist, [item]: checked };
  await db.agentMissions.update(id, { checklist: next, updatedAt: new Date().toISOString() });
  return db.agentMissions.get(id);
}

export async function completeAgentMission(id: string, date: LocalDateKey) {
  const mission = await db.agentMissions.get(id);
  if (!mission || mission.status === 'retired') throw new Error('That mission is not active.');
  if (mission.recurrence === 'none' && mission.status === 'completed') {
    throw new Error('That mission is already complete.');
  }
  if (mission.lastCompletedOn === date)
    throw new Error('That recurring mission is already complete today.');
  if (mission.checklistItems.some((item) => !mission.checklist[item])) {
    throw new Error('Complete every mission step before claiming the reward.');
  }

  const rewardId = stableId('agent-mission', mission.id, date, 'reward');
  const now = new Date().toISOString();
  let awardedXp = 0;
  await db.transaction(
    'rw',
    [
      db.agentMissions,
      db.auditEntries,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.levelHistory,
      db.progressionEvents,
    ],
    async () => {
      const current = await db.agentMissions.get(id);
      const progression = await db.progression.get('primary');
      if (!current || !progression) throw new Error('Mission progression is unavailable.');
      if (
        current.status === 'retired' ||
        (current.recurrence === 'none' && current.status === 'completed') ||
        current.lastCompletedOn === date
      ) {
        throw new Error('That mission is already complete.');
      }
      const usedToday = (await db.xpTransactions.where('date').equals(date).toArray())
        .filter((item) => item.sourceId.startsWith('agent-mission:'))
        .reduce((sum, item) => sum + item.amount, 0);
      awardedXp = Math.max(0, Math.min(current.accountXp, AGENT_MISSION_DAILY_XP_CAP - usedToday));
      const reversalId = stableId(rewardId, 'reversal');
      const existingReward = await db.xpTransactions.get(rewardId);
      const existingReversal = await db.xpTransactions.get(reversalId);
      if (existingReward && existingReversal) {
        await db.xpTransactions.delete(reversalId);
        for (const statReward of current.statRewards) {
          await db.statTransactions.delete(stableId(reversalId, statReward.stat));
          if (!awardedXp) {
            await db.statTransactions.delete(stableId(rewardId, statReward.stat));
          }
        }
        if (!awardedXp) await db.xpTransactions.delete(rewardId);
      } else if (existingReward) {
        throw new Error('That mission reward has already been applied.');
      }
      const previousLevel = progression.level;
      const account = applyAccountXp(progression.totalXp, awardedXp);
      const nextProgression = {
        ...progression,
        ...account,
        lifetimeMissionCompletions: progression.lifetimeMissionCompletions + 1,
        lastLevelUpAt: account.levelsGained ? now : progression.lastLevelUpAt,
        recentLevelUp: account.levelsGained > 0,
      };
      await db.progression.put(nextProgression);
      if (awardedXp > 0) {
        await db.xpTransactions.put({
          id: rewardId,
          kind: 'mission',
          amount: awardedXp,
          date,
          timestamp: now,
          sourceId: `agent-mission:${current.id}`,
          note: `${current.title} · Companion mission`,
        });
        for (const statReward of current.statRewards) {
          const stat = await db.stats.get(statReward.stat);
          if (!stat) continue;
          const scaled = Math.max(1, Math.round(statReward.xp * (awardedXp / current.accountXp)));
          await db.stats.put(applyStatChange(stat, scaled, 6, now));
          await db.statTransactions.put({
            id: stableId(rewardId, statReward.stat),
            stat: statReward.stat,
            kind: 'mission',
            amount: scaled,
            momentumDelta: 6,
            date,
            timestamp: now,
            sourceId: `agent-mission:${current.id}`,
            note: `${current.title} · Companion mission`,
          });
        }
        await putLevelHistory(nextProgression, previousLevel, date, rewardId, now);
      }
      const recurring = current.recurrence !== 'none';
      const next: AgentMission = {
        ...current,
        status: recurring ? 'active' : 'completed',
        dueDate: recurring ? nextAgentMissionDueDate(current, date) : current.dueDate,
        checklist: Object.fromEntries(current.checklistItems.map((item) => [item, false])),
        completionCount: current.completionCount + 1,
        lastCompletedOn: date,
        completedAt: now,
        rewardTransactionIds:
          awardedXp > 0
            ? current.rewardTransactionIds.includes(rewardId)
              ? current.rewardTransactionIds
              : [...current.rewardTransactionIds, rewardId]
            : current.rewardTransactionIds.filter((transactionId) => transactionId !== rewardId),
        updatedAt: now,
      };
      await db.agentMissions.put(next);
      await db.auditEntries.add({
        id: crypto.randomUUID(),
        timestamp: now,
        action: 'agent-mission-completed',
        targetId: id,
        before: current,
        after: next,
        note: awardedXp
          ? `${next.title} completed for ${awardedXp} XP.`
          : `${next.title} completed after today's ${AGENT_MISSION_DAILY_XP_CAP} XP Agent Mission cap.`,
      });
    },
  );
  return { mission: await db.agentMissions.get(id), awardedXp };
}

export async function reopenAgentMission(id: string, date: LocalDateKey) {
  const mission = await db.agentMissions.get(id);
  if (!mission || mission.lastCompletedOn !== date) {
    throw new Error('Only a mission completed during the active System day can be reopened.');
  }
  const rewardId = stableId('agent-mission', mission.id, date, 'reward');
  const reversalId = stableId(rewardId, 'reversal');
  const reward = await db.xpTransactions.get(rewardId);
  const now = new Date().toISOString();
  await db.transaction(
    'rw',
    [
      db.agentMissions,
      db.auditEntries,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
    ],
    async () => {
      const progression = await db.progression.get('primary');
      if (!progression) throw new Error('Mission progression is unavailable.');
      let totalXp = progression.totalXp;
      if (reward && !(await db.xpTransactions.get(reversalId))) {
        totalXp = Math.max(0, progression.totalXp - reward.amount);
        await db.xpTransactions.add({
          id: reversalId,
          kind: 'reversal',
          amount: -reward.amount,
          date,
          timestamp: now,
          sourceId: `agent-mission:${mission.id}`,
          note: `${mission.title} completion reopened`,
        });
        for (const statReward of mission.statRewards) {
          const original = await db.statTransactions.get(stableId(rewardId, statReward.stat));
          const stat = await db.stats.get(statReward.stat);
          if (!original || !stat) continue;
          await db.stats.put(applyStatChange(stat, -original.amount, -6, now));
          await db.statTransactions.put({
            id: stableId(reversalId, statReward.stat),
            stat: statReward.stat,
            kind: 'reversal',
            amount: -original.amount,
            momentumDelta: -6,
            date,
            timestamp: now,
            sourceId: `agent-mission:${mission.id}`,
            note: `${mission.title} completion reopened`,
          });
        }
      }
      await db.progression.put({
        ...progression,
        ...resolveLevelFromTotalXp(totalXp),
        totalXp,
        lifetimeMissionCompletions: Math.max(0, progression.lifetimeMissionCompletions - 1),
      });
      const next: AgentMission = {
        ...mission,
        status: 'active',
        dueDate: mission.recurrence === 'none' ? mission.dueDate : date,
        lastCompletedOn: undefined,
        completedAt: undefined,
        completionCount: Math.max(0, mission.completionCount - 1),
        updatedAt: now,
      };
      await db.agentMissions.put(next);
      await db.auditEntries.add({
        id: crypto.randomUUID(),
        timestamp: now,
        action: 'agent-mission-reopened',
        targetId: id,
        before: mission,
        after: next,
        note: `${mission.title} reopened and today's reward reversed.`,
      });
    },
  );
  return db.agentMissions.get(id);
}

export async function retireAgentMission(id: string) {
  const mission = await db.agentMissions.get(id);
  if (!mission) throw new Error('That companion mission could not be found.');
  const now = new Date().toISOString();
  const next: AgentMission = { ...mission, status: 'retired', retiredAt: now, updatedAt: now };
  await db.transaction('rw', [db.agentMissions, db.auditEntries], async () => {
    await db.agentMissions.put(next);
    await db.auditEntries.add({
      id: crypto.randomUUID(),
      timestamp: now,
      action: 'agent-mission-retired',
      targetId: id,
      before: mission,
      after: next,
      note: `${mission.title} retired without deleting its history.`,
    });
  });
  return next;
}
