import { BALANCE } from '@/config/balance';
import { DAILY_EVENT_ODDS, EMERGENCY_QUESTS } from '@/config/dailyEvents';
import { db } from '@/db/database';
import { putLevelHistory, unlockAchievement } from '@/game/engine';
import { applyStatChange } from '@/game/stats';
import { applyAccountXp } from '@/game/xp';
import { compareDateKeys } from '@/utils/date';
import { stableId } from '@/utils/id';
import type {
  DailyEventKind,
  DailyEventRecord,
  LocalDateKey,
} from '@/types/game';

function secureRandom() {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] / 0x1_0000_0000;
  }
  return Math.random();
}

export function rollDailyEventKind(value: number): DailyEventKind {
  if (value < DAILY_EVENT_ODDS.emergencyQuest) return 'emergency-quest';
  const passThreshold = Number(
    (DAILY_EVENT_ODDS.emergencyQuest + DAILY_EVENT_ODDS.missionPass).toFixed(6),
  );
  if (value < passThreshold) {
    return 'mission-pass';
  }
  return 'none';
}

export async function ensureDailyEvent(
  date: LocalDateKey,
  random: () => number = secureRandom,
) {
  const settings = await db.settings.get('primary');
  if (!settings?.dailyEventsEnabled) return undefined;
  const existing = await db.dailyEvents.get(date);
  if (existing) return existing;

  const now = new Date().toISOString();
  const kind = rollDailyEventKind(random());
  let event: DailyEventRecord;
  if (kind === 'emergency-quest') {
    const template = EMERGENCY_QUESTS[Math.floor(random() * EMERGENCY_QUESTS.length)];
    event = {
      id: date,
      date,
      kind,
      status: 'unrevealed',
      templateId: template.id,
      title: template.title,
      description: template.description,
      category: template.category,
      accountXp: template.accountXp,
      statRewards: template.statRewards,
      rolledAt: now,
      transactionIds: [],
    };
  } else if (kind === 'mission-pass') {
    event = {
      id: date,
      date,
      kind,
      status: 'unrevealed',
      title: 'Mission Pass Acquired',
      description:
        'A rare Grace Protocol is available. Claim one pass that can protect a mission without spending a monthly exception.',
      accountXp: 0,
      statRewards: [],
      rolledAt: now,
      transactionIds: [],
    };
  } else {
    event = {
      id: date,
      date,
      kind,
      status: 'none',
      title: 'Standard Cycle',
      description: 'No rare System event was generated for this cycle.',
      accountXp: 0,
      statRewards: [],
      rolledAt: now,
      transactionIds: [],
    };
  }
  await db.dailyEvents.put(event);

  const stale = await db.dailyEvents
    .filter(
      (candidate) =>
        compareDateKeys(candidate.date, date) < 0 &&
        ['unrevealed', 'active'].includes(candidate.status),
    )
    .toArray();
  if (stale.length) {
    await db.dailyEvents.bulkPut(stale.map((candidate) => ({ ...candidate, status: 'expired' })));
  }
  return event;
}

export async function activateDailyEvent(date: LocalDateKey) {
  const event = await db.dailyEvents.get(date);
  if (!event || event.kind !== 'emergency-quest' || event.status !== 'unrevealed') {
    throw new Error('This emergency quest is no longer available.');
  }
  await db.dailyEvents.update(date, {
    status: 'active',
    revealedAt: new Date().toISOString(),
  });
}

export async function declineDailyEvent(date: LocalDateKey) {
  const event = await db.dailyEvents.get(date);
  if (!event || event.kind !== 'emergency-quest' || event.status !== 'unrevealed') return;
  const now = new Date().toISOString();
  await db.dailyEvents.update(date, { status: 'declined', revealedAt: now, declinedAt: now });
}

export async function claimMissionPass(date: LocalDateKey) {
  const now = new Date().toISOString();
  await db.transaction('rw', db.dailyEvents, db.inventory, db.auditEntries, async () => {
    const event = await db.dailyEvents.get(date);
    if (!event || event.kind !== 'mission-pass' || event.status !== 'unrevealed') {
      throw new Error('This Mission Pass has already been claimed or is unavailable.');
    }
    const pass = await db.inventory.get('mission-pass');
    await db.inventory.put({
      id: 'mission-pass',
      name: 'Mission Pass',
      description: 'Excuse one mission while protecting the day streak. No mission XP is awarded.',
      quantity: (pass?.quantity ?? 0) + 1,
      updatedAt: now,
    });
    await db.dailyEvents.put({
      ...event,
      status: 'claimed',
      revealedAt: now,
      claimedAt: now,
    });
    await db.auditEntries.put({
      id: stableId('audit', 'mission-pass-claimed', date),
      timestamp: now,
      action: 'mission-pass-claimed',
      targetId: date,
      note: 'A rare daily Mission Pass was added to inventory.',
    });
  });
  await unlockAchievement('grace-token', `daily-event:${date}`, now);
}

export async function consumeMissionPass(date: LocalDateKey, missionId: string) {
  const now = new Date().toISOString();
  await db.transaction('rw', db.dailyMissions, db.inventory, db.auditEntries, async () => {
    const pass = await db.inventory.get('mission-pass');
    if (!pass?.quantity) throw new Error('No Mission Pass is available.');
    const recordId = stableId(date, missionId);
    const record = await db.dailyMissions.get(recordId);
    if (!record || record.status !== 'pending') {
      throw new Error('Only a pending mission can use a Mission Pass.');
    }
    await db.dailyMissions.put({
      ...record,
      status: 'excused',
      protectedException: true,
      protectionSource: 'mission-pass',
      updatedAt: now,
    });
    await db.inventory.put({ ...pass, quantity: pass.quantity - 1, updatedAt: now });
    await db.auditEntries.put({
      id: stableId('audit', 'mission-pass-used', date, missionId),
      timestamp: now,
      action: 'mission-pass-used',
      targetId: missionId,
      note: `Mission Pass used for ${date}.`,
    });
  });
  await unlockAchievement('pass-wisely-used', `mission-pass:${date}:${missionId}`, now);
}

export async function completeEmergencyQuest(date: LocalDateKey) {
  const now = new Date().toISOString();
  let levelsGained = 0;
  let awardedXp = 0;
  await db.transaction(
    'rw',
    [
      db.dailyEvents,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.levelHistory,
      db.progressionEvents,
      db.auditEntries,
      db.achievements,
    ],
    async () => {
      const event = await db.dailyEvents.get(date);
      if (!event || event.kind !== 'emergency-quest' || event.status !== 'active') {
        throw new Error('This emergency quest is not active.');
      }
      const rewardId = stableId('daily-event', date, event.templateId ?? 'rare');
      if (await db.xpTransactions.get(rewardId)) return;
      const progression = await db.progression.get('primary');
      if (!progression) throw new Error('Account progression is not initialized.');
      awardedXp = Math.round(event.accountXp * progression.xpMultiplier);
      const next = applyAccountXp(progression.totalXp, awardedXp);
      levelsGained = next.levelsGained;
      await db.progression.put({
        ...progression,
        ...next,
        lastLevelUpAt: levelsGained ? now : progression.lastLevelUpAt,
        recentLevelUp: levelsGained > 0,
      });
      await db.xpTransactions.put({
        id: rewardId,
        kind: 'daily-event',
        amount: awardedXp,
        date,
        timestamp: now,
        sourceId: event.templateId ?? date,
        note: `${event.title} completed`,
      });
      await putLevelHistory(
        { ...progression, ...next },
        progression.level,
        date,
        rewardId,
        now,
      );
      const transactionIds = [rewardId];
      for (const reward of event.statRewards) {
        const transactionId = stableId(rewardId, reward.stat);
        const stat = await db.stats.get(reward.stat);
        if (!stat || (await db.statTransactions.get(transactionId))) continue;
        await db.stats.put(
          applyStatChange(stat, reward.xp, BALANCE.stats.missionMomentumGain, now),
        );
        await db.statTransactions.put({
          id: transactionId,
          stat: reward.stat,
          kind: 'daily-event',
          amount: reward.xp,
          momentumDelta: BALANCE.stats.missionMomentumGain,
          date,
          timestamp: now,
          sourceId: event.templateId ?? date,
          note: `${event.title} reward`,
        });
        transactionIds.push(transactionId);
      }
      await db.dailyEvents.put({
        ...event,
        status: 'completed',
        completedAt: now,
        transactionIds,
      });
      await db.auditEntries.put({
        id: stableId('audit', 'daily-event-completed', date),
        timestamp: now,
        action: 'daily-event-completed',
        targetId: event.templateId ?? date,
        note: `${event.title} completed for ${awardedXp} XP.`,
      });
    },
  );
  await unlockAchievement('rare-signal', `daily-event:${date}`, now);
  return { awardedXp, levelsGained };
}
