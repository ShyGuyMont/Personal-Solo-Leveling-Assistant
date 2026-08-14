import {
  BOSS_CHALLENGES,
  RECOVERY_CHALLENGES,
  RANK_TRIALS,
  getChallengeTemplate,
} from '@/config/challenges';
import { BALANCE, PERFECT_DAY_STAT_REWARDS, RANK_ORDER } from '@/config/balance';
import { db } from '@/db/database';
import { createLocalSnapshot } from '@/db/backup';
import { calculateChallengeCurrent, createChallengeProgress } from '@/game/challenges';
import { missionAccountXp, missionStatXp } from '@/game/rewards';
import { applyAccountXp, resolveLevelFromTotalXp } from '@/game/xp';
import { applyStatChange, getDecayForNeglect } from '@/game/stats';
import { deriveDailyStreakMetrics } from '@/game/streaks';
import { refreshPeriodicReports } from '@/game/reports';
import {
  addDays,
  compareDateKeys,
  dateRange,
  getSystemDateKey,
  monthKey,
  parseDateKey,
} from '@/utils/date';
import { createId, stableId } from '@/utils/id';
import { formatClassName } from '@/utils/format';
import type {
  AccountProgression,
  DailyMissionRecord,
  DailyReview,
  LocalDateKey,
  MissionDefinition,
  MissionDetails,
  MissionStatus,
  Settings,
  StatName,
  SystemState,
} from '@/types/game';

export function getActiveMissions(
  missions: MissionDefinition[],
  settings: Settings,
  date?: LocalDateKey,
): MissionDefinition[] {
  const weekday = date ? parseDateKey(date).getUTCDay() : undefined;
  const enabled = missions.filter(
    (mission) =>
      mission.enabled &&
      !mission.archived &&
      (weekday === undefined ||
        !mission.activeWeekdays?.length ||
        mission.activeWeekdays.includes(weekday)),
  );
  if (!settings.recoveryMode.active) return enabled;
  return enabled.filter(
    (mission) =>
      mission.recoveryEligible && !settings.recoveryMode.disabledMissionIds.includes(mission.id),
  );
}

export async function ensureDailyRecords(systemDate: LocalDateKey) {
  const [settings, missions, metadata] = await Promise.all([
    db.settings.get('primary'),
    db.missions.toArray(),
    db.appMetadata.get('last-system-day'),
  ]);
  if (!settings) return;
  const lastDate =
    typeof metadata?.value === 'string' ? (metadata.value as LocalDateKey) : systemDate;
  const startDate = compareDateKeys(lastDate, systemDate) > 0 ? systemDate : lastDate;
  const now = new Date().toISOString();
  const records: DailyMissionRecord[] = [];
  for (const date of dateRange(startDate, systemDate)) {
    for (const mission of getActiveMissions(missions, settings, date)) {
      records.push({
        id: stableId(date, mission.id),
        date,
        missionId: mission.id,
        status: 'pending',
        details: {},
        updatedAt: now,
        protectedException: false,
      });
    }
  }
  await db.transaction('rw', db.dailyMissions, db.appMetadata, async () => {
    for (const record of records) {
      if (!(await db.dailyMissions.get(record.id))) await db.dailyMissions.add(record);
    }
    await db.appMetadata.put({
      id: 'last-system-day',
      value: systemDate,
      updatedAt: now,
    });
  });
  for (const date of dateRange(startDate, addDays(systemDate, -1))) {
    const review = await db.dailyReviews.get(date);
    if (!review) {
      await db.dailyReviews.put({
        id: date,
        date,
        status: 'in-progress',
        startedAt: now,
        completionCount: 0,
        activeMissionCount: await db.dailyMissions.where('date').equals(date).count(),
        completionRate: 0,
        perfectDay: false,
        protectedPerfectDay: false,
        accountXpAwarded: 0,
        statChanges: {},
        verdict: 'Review pending.',
        systemState: 'stable',
        transactionIds: [],
      });
    }
  }
}

export async function initializeSystemCycle(now = new Date()) {
  const settings = await db.settings.get('primary');
  if (!settings) return undefined;
  const systemDate = getSystemDateKey(now, settings.resetTime, settings.timeZone);
  if (
    settings.recoveryMode.active &&
    settings.recoveryMode.endDate &&
    compareDateKeys(systemDate, settings.recoveryMode.endDate) > 0
  ) {
    await db.settings.update('primary', {
      recoveryMode: { active: false, disabledMissionIds: [] },
    });
  }
  await ensureDailyRecords(systemDate);
  await refreshActiveChallenges(systemDate);
  return systemDate;
}

export async function putLevelHistory(
  progression: AccountProgression,
  previousLevel: number,
  date: LocalDateKey,
  sourceId: string,
  timestamp: string,
) {
  for (let level = previousLevel + 1; level <= progression.level; level += 1) {
    await db.levelHistory.put({
      id: stableId('level', level, timestamp, sourceId),
      level,
      timestamp,
      date,
      sourceId,
    });
    await db.progressionEvents.put({
      id: stableId('progression-event', 'level', level, timestamp, sourceId),
      kind: level % 10 === 0 ? 'level-milestone' : 'level-up',
      createdAt: timestamp,
      headline: level % 10 === 0 ? `LEVEL ${level} MILESTONE` : `LEVEL ${level} REACHED`,
      detail:
        level % 10 === 0
          ? 'A major threshold has been crossed. Your campaign record has been updated.'
          : 'Account growth confirmed. New progress has been recorded.',
      acknowledged: false,
    });
  }
}

async function unlockTitle(
  titleId: string,
  sourceId: string,
  timestamp = new Date().toISOString(),
) {
  if (!(await db.titles.get(titleId))) {
    await db.titles.put({ id: titleId, titleId, unlockedAt: timestamp, sourceId });
  }
}

async function evaluateAutomaticTitles() {
  const [progression, stats, completedRecords, reviews, protectedRecord] = await Promise.all([
    db.progression.get('primary'),
    db.stats.toArray(),
    db.dailyMissions.where('status').equals('completed').toArray(),
    db.dailyReviews.where('status').equals('finalized').toArray(),
    db.dailyMissions.filter((record) => record.protectedException).first(),
  ]);
  if (!progression) return;
  const count = (missionId: string) =>
    completedRecords.filter((record) => record.missionId === missionId).length;
  const level = (stat: StatName) => stats.find((item) => item.id === stat)?.level ?? 1;
  const rankIndex = RANK_ORDER.indexOf(progression.rank);
  const rules: Array<[string, boolean]> = [
    ['steady-hand', progression.lifetimeMissionCompletions >= 25],
    ['creator-in-motion', count('creator-work') >= 10],
    ['iron-routine', count('workout') >= 100],
    ['forged-repetition', progression.lifetimeMissionCompletions >= 1000],
    ['sevenfold', progression.currentPerfectStreak >= 7],
    ['month-unbroken', progression.currentDayStreak >= 30],
    ['century-mark', progression.completedDays >= 100],
    ['long-campaign', progression.completedDays >= 365],
    ['gentle-strength', level('strength') >= 15 && level('empathy') >= 15],
    ['living-wisdom', level('wisdom') >= 25],
    ['vital-current', level('vitality') >= 20],
    ['enduring-one', level('endurance') >= 30],
    ['signal-bearer', count('kind-message') >= 100],
    ['deep-root', level('faith') >= 30],
    ['focus-engine', count('creator-work') >= 100],
    ['unbroken-focus', level('focus') >= 20],
    ['disciplined-soul', level('discipline') >= 30],
    ['record-keeper', reviews.length >= 50],
    ['exception-wisely-used', Boolean(protectedRecord)],
    ['e-ranked', rankIndex >= RANK_ORDER.indexOf('E')],
    ['c-ranked', rankIndex >= RANK_ORDER.indexOf('C')],
    ['s-ranked', rankIndex >= RANK_ORDER.indexOf('S')],
    ['beyond-measure', progression.rank === 'WORLD CLASS'],
    ['ten-levels', progression.level >= 10],
    ['fifty-levels', progression.level >= 50],
  ];
  const now = new Date().toISOString();
  for (const [titleId, unlocked] of rules) {
    if (unlocked) await unlockTitle(titleId, 'automatic-achievement', now);
  }
}

export async function unlockAchievement(id: string, sourceId: string, timestamp: string) {
  const achievement = await db.achievements.get(id);
  if (!achievement || achievement.unlockedAt) return;
  await db.achievements.put({ ...achievement, unlockedAt: timestamp });
  await db.progressionEvents.put({
    id: stableId('progression-event', 'achievement', id),
    kind: 'achievement',
    createdAt: timestamp,
    headline: achievement.name,
    detail: achievement.description,
    acknowledged: false,
  });
  await db.auditEntries.put({
    id: stableId('audit', 'achievement', id),
    timestamp,
    action: 'achievement-unlocked',
    targetId: id,
    note: sourceId,
  });
}

async function unlockCosmetic(id: string, sourceId: string, timestamp: string) {
  const cosmetic = await db.cosmetics.get(id);
  if (!cosmetic || (await db.cosmeticUnlocks.get(id))) return;
  await db.cosmeticUnlocks.put({
    id,
    cosmeticId: id,
    unlockedAt: timestamp,
    sourceId,
  });
  await db.progressionEvents.put({
    id: stableId('progression-event', 'cosmetic', id),
    kind: 'cosmetic',
    createdAt: timestamp,
    headline: cosmetic.name,
    detail: cosmetic.description,
    acknowledged: false,
  });
}

async function evaluateAutomaticAchievements() {
  const [progression, stats, completed, reviews, challenges, settings] = await Promise.all([
    db.progression.get('primary'),
    db.stats.toArray(),
    db.dailyMissions.where('status').equals('completed').toArray(),
    db.dailyReviews.where('status').equals('finalized').toArray(),
    db.challengeProgress.where('status').equals('completed').toArray(),
    db.settings.get('primary'),
  ]);
  if (!progression) return;
  const level = (id: StatName) => stats.find((stat) => stat.id === id)?.level ?? 1;
  const rankIndex = RANK_ORDER.indexOf(progression.rank);
  const categoryIds = new Set(
    (
      await db.missions
        .where('id')
        .anyOf([...new Set(completed.map((record) => record.missionId))])
        .toArray()
    ).map((mission) => mission.category),
  );
  const completedKind = (kind: string) => challenges.filter((item) => item.kind === kind).length;
  const rules: Array<[string, boolean]> = [
    ['first-directive', progression.lifetimeMissionCompletions >= 1],
    ['ten-directives', progression.lifetimeMissionCompletions >= 10],
    ['fifty-directives', progression.lifetimeMissionCompletions >= 50],
    ['hundred-directives', progression.lifetimeMissionCompletions >= 100],
    ['five-hundred-directives', progression.lifetimeMissionCompletions >= 500],
    ['first-day', reviews.length >= 1],
    ['seven-days', reviews.length >= 7],
    ['thirty-days', reviews.length >= 30],
    ['hundred-days', reviews.length >= 100],
    ['year-recorded', reviews.length >= 365],
    ['first-perfect', progression.perfectDays >= 1],
    ['five-perfect', progression.perfectDays >= 5],
    ['twenty-five-perfect', progression.perfectDays >= 25],
    ['hundred-perfect', progression.perfectDays >= 100],
    ['three-streak', progression.longestDayStreak >= 3],
    ['seven-streak', progression.longestDayStreak >= 7],
    ['thirty-streak', progression.longestDayStreak >= 30],
    ['ninety-streak', progression.longestDayStreak >= 90],
    ['level-5', progression.level >= 5],
    ['level-10', progression.level >= 10],
    ['level-25', progression.level >= 25],
    ['level-50', progression.level >= 50],
    ['level-100', progression.level >= 100],
    ['rank-e', rankIndex >= RANK_ORDER.indexOf('E')],
    ['rank-d', rankIndex >= RANK_ORDER.indexOf('D')],
    ['rank-c', rankIndex >= RANK_ORDER.indexOf('C')],
    ['rank-b', rankIndex >= RANK_ORDER.indexOf('B')],
    ['rank-a', rankIndex >= RANK_ORDER.indexOf('A')],
    ['rank-s', rankIndex >= RANK_ORDER.indexOf('S')],
    ['rank-world', progression.rank === 'WORLD CLASS'],
    ['faith-10', level('faith') >= 10],
    ['strength-10', level('strength') >= 10],
    ['discipline-10', level('discipline') >= 10],
    ['creativity-10', level('creativity') >= 10],
    ['character-10', level('character') >= 10],
    ['balanced-five', stats.filter((stat) => stat.level >= 5).length >= 5],
    ['balanced-ten', stats.length > 0 && stats.every((stat) => stat.level >= 10)],
    ['first-weekly', completedKind('weekly') >= 1],
    ['ten-weekly', completedKind('weekly') >= 10],
    ['first-monthly', completedKind('monthly') >= 1],
    ['first-boss', completedKind('boss') >= 1],
    ['five-bosses', completedKind('boss') >= 5],
    ['first-trial', completedKind('rank-trial') >= 1],
    ['recovery-started', settings?.recoveryMode.active ?? false],
    ['recovery-complete', completedKind('recovery') >= 1],
    ['protected-day', progression.protectedPerfectDays >= 1],
    [
      'customized',
      (await db.auditEntries.where('action').equals('mission-configuration-updated').count()) > 0,
    ],
    ['all-categories', categoryIds.size >= 5],
  ];
  const now = new Date().toISOString();
  for (const [id, met] of rules) {
    if (met) await unlockAchievement(id, 'automatic-evaluation', now);
  }
  const cosmeticRules: Array<[string, boolean]> = [
    ['frame-faith', level('faith') >= 10],
    ['frame-discipline', progression.longestDayStreak >= 30],
    ['frame-physical', level('strength') >= 15],
    ['frame-creator', level('creativity') >= 15],
    ['sigil-seven', progression.longestDayStreak >= 7],
    ['sigil-perfect', progression.perfectDays >= 25],
    ['theme-void', reviews.length >= 30],
    ['theme-ascendant', rankIndex >= RANK_ORDER.indexOf('A')],
  ];
  for (const [id, met] of cosmeticRules) {
    if (met) await unlockCosmetic(id, 'automatic-evaluation', now);
  }
}

async function applyMissionStreak(missionId: string, date: LocalDateKey) {
  const id = `mission:${missionId}`;
  const streak = (await db.streaks.get(id)) ?? {
    id,
    kind: 'mission' as const,
    current: 0,
    longest: 0,
  };
  if (streak.lastQualifiedDate === date) return;
  const current = streak.lastQualifiedDate === addDays(date, -1) ? streak.current + 1 : 1;
  await db.streaks.put({
    ...streak,
    current,
    longest: Math.max(streak.longest, current),
    lastQualifiedDate: date,
  });
}

async function breakMissionStreak(missionId: string, date: LocalDateKey) {
  const id = `mission:${missionId}`;
  const streak = await db.streaks.get(id);
  await db.streaks.put({
    id,
    kind: 'mission',
    current: 0,
    longest: streak?.longest ?? 0,
    lastQualifiedDate: streak?.lastQualifiedDate,
    lastBrokenDate: date,
  });
}

export async function completeMission(input: {
  date: LocalDateKey;
  missionId: string;
  details?: MissionDetails;
  systemDate: LocalDateKey;
}) {
  if (compareDateKeys(input.date, input.systemDate) > 0) {
    throw new Error('Future missions cannot be completed.');
  }
  const mission = await db.missions.get(input.missionId);
  if (!mission) throw new Error('Mission definition not found.');
  if (mission.method === 'day-boundary' && input.date === input.systemDate) {
    throw new Error('This mission can only be confirmed during the next Daily Review.');
  }
  const recordId = stableId(input.date, input.missionId);
  const rewardId = stableId('mission', input.date, input.missionId, 'reward');
  const now = new Date().toISOString();
  let levelsGained = 0;
  let awardedXp = 0;
  await db.transaction(
    'rw',
    [
      db.dailyMissions,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.levelHistory,
      db.streaks,
      db.titles,
      db.progressionEvents,
    ],
    async () => {
      const record = await db.dailyMissions.get(recordId);
      if (!record) throw new Error('Daily mission record not found.');
      if (record.status === 'completed') return;
      if (await db.xpTransactions.get(rewardId)) return;
      const progression = await db.progression.get('primary');
      if (!progression) throw new Error('Account progression not initialized.');
      awardedXp = Math.round(missionAccountXp(mission) * progression.xpMultiplier);
      const nextProgression = applyAccountXp(progression.totalXp, awardedXp);
      levelsGained = nextProgression.levelsGained;
      await db.xpTransactions.add({
        id: rewardId,
        kind: 'mission',
        amount: awardedXp,
        date: input.date,
        timestamp: now,
        sourceId: input.missionId,
        note: `${mission.name} completed`,
      });
      await db.progression.put({
        ...progression,
        ...nextProgression,
        lifetimeMissionCompletions: progression.lifetimeMissionCompletions + 1,
        lastLevelUpAt: levelsGained ? now : progression.lastLevelUpAt,
        recentLevelUp: levelsGained > 0,
      });
      await putLevelHistory(
        { ...progression, ...nextProgression },
        progression.level,
        input.date,
        rewardId,
        now,
      );
      for (const reward of mission.statRewards) {
        const transactionId = stableId(rewardId, reward.stat);
        if (await db.statTransactions.get(transactionId)) continue;
        const stat = await db.stats.get(reward.stat);
        if (!stat) continue;
        const statXp = missionStatXp(reward.xp);
        const next = applyStatChange(stat, statXp, BALANCE.stats.missionMomentumGain, now);
        await db.stats.put({ ...next, neglectedDays: 0 });
        await db.statTransactions.add({
          id: transactionId,
          stat: reward.stat,
          kind: 'mission',
          amount: statXp,
          momentumDelta: BALANCE.stats.missionMomentumGain,
          date: input.date,
          timestamp: now,
          sourceId: input.missionId,
          note: `${mission.name} reward`,
        });
      }
      await db.dailyMissions.put({
        ...record,
        status: 'completed',
        details: { ...record.details, ...input.details },
        completedAt: now,
        updatedAt: now,
        rewardTransactionId: rewardId,
        protectedException: false,
      });
      await applyMissionStreak(input.missionId, input.date);
      await unlockTitle('first-step', rewardId, now);
    },
  );
  await refreshActiveChallenges(input.systemDate);
  await evaluateAutomaticTitles();
  await evaluateAutomaticAchievements();
  return { awardedXp, levelsGained };
}

export async function updateMissionDetails(
  date: LocalDateKey,
  missionId: string,
  details: MissionDetails,
) {
  const id = stableId(date, missionId);
  const record = await db.dailyMissions.get(id);
  if (!record) throw new Error('Mission record not found.');
  await db.dailyMissions.update(id, {
    details: { ...record.details, ...details },
    updatedAt: new Date().toISOString(),
  });
}

export async function setMissionStatus(input: {
  date: LocalDateKey;
  missionId: string;
  status: Exclude<MissionStatus, 'completed'>;
  details?: MissionDetails;
  protectedException?: boolean;
}) {
  const id = stableId(input.date, input.missionId);
  const record = await db.dailyMissions.get(id);
  if (!record) throw new Error('Mission record not found.');
  if (record.status === 'completed') {
    throw new Error('Undo the completed mission before changing its status.');
  }
  await db.dailyMissions.put({
    ...record,
    status: input.status,
    details: { ...record.details, ...input.details },
    updatedAt: new Date().toISOString(),
    protectedException: input.protectedException ?? false,
  });
}

export async function excuseMission(
  date: LocalDateKey,
  missionId: string,
  protectedException: boolean,
) {
  if (!protectedException) {
    return setMissionStatus({ date, missionId, status: 'excused' });
  }
  await db.transaction('rw', db.settings, db.dailyMissions, async () => {
    const settings = await db.settings.get('primary');
    if (!settings) throw new Error('Settings not found.');
    const month = monthKey(date);
    const used = settings.protectedExceptionsUsed[month] ?? 0;
    if (used >= settings.protectedExceptionsPerMonth) {
      throw new Error('No protected exceptions remain for this month.');
    }
    const record = await db.dailyMissions.get(stableId(date, missionId));
    if (!record) throw new Error('Mission record not found.');
    await db.dailyMissions.put({
      ...record,
      status: 'excused',
      protectedException: true,
      updatedAt: new Date().toISOString(),
    });
    await db.settings.put({
      ...settings,
      protectedExceptionsUsed: {
        ...settings.protectedExceptionsUsed,
        [month]: used + 1,
      },
    });
  });
}

export async function undoMission(date: LocalDateKey, missionId: string) {
  const settings = await db.settings.get('primary');
  if (!settings) throw new Error('Settings not found.');
  const currentSystemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
  if (date !== currentSystemDate) {
    throw new Error(
      'Undo is available only during the active System day. Historical correction is recorded through Advanced Settings.',
    );
  }
  const recordId = stableId(date, missionId);
  const rewardId = stableId('mission', date, missionId, 'reward');
  const reversalId = stableId(rewardId, 'reversal');
  const now = new Date().toISOString();
  await db.transaction(
    'rw',
    [
      db.dailyMissions,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.streaks,
      db.missions,
    ],
    async () => {
      if (await db.xpTransactions.get(reversalId)) return;
      const [record, reward, progression, mission] = await Promise.all([
        db.dailyMissions.get(recordId),
        db.xpTransactions.get(rewardId),
        db.progression.get('primary'),
        db.missions.get(missionId),
      ]);
      if (!record || record.status !== 'completed' || !reward || !progression || !mission) {
        throw new Error('This mission has no applied reward to undo.');
      }
      const nextTotal = Math.max(0, progression.totalXp - reward.amount);
      const nextLevel = resolveLevelFromTotalXp(nextTotal);
      await db.progression.put({
        ...progression,
        ...nextLevel,
        totalXp: nextTotal,
        lifetimeMissionCompletions: Math.max(0, progression.lifetimeMissionCompletions - 1),
      });
      await db.xpTransactions.add({
        id: reversalId,
        kind: 'reversal',
        amount: -reward.amount,
        date,
        timestamp: now,
        sourceId: missionId,
        note: `${mission.name} completion undone`,
      });
      for (const statReward of mission.statRewards) {
        const original = await db.statTransactions.get(stableId(rewardId, statReward.stat));
        const stat = await db.stats.get(statReward.stat);
        if (!original || !stat) continue;
        const statReversalId = stableId(reversalId, statReward.stat);
        if (await db.statTransactions.get(statReversalId)) continue;
        await db.stats.put(
          applyStatChange(
            stat,
            -original.amount,
            -Math.min(original.momentumDelta, BALANCE.stats.missionMomentumGain),
            now,
          ),
        );
        await db.statTransactions.add({
          id: statReversalId,
          stat: statReward.stat,
          kind: 'reversal',
          amount: -original.amount,
          momentumDelta: -original.momentumDelta,
          date,
          timestamp: now,
          sourceId: missionId,
          note: `${mission.name} reward reversed`,
        });
      }
      await db.dailyMissions.put({
        ...record,
        status: 'pending',
        completedAt: undefined,
        updatedAt: now,
        reversedTransactionId: reversalId,
      });
      const remaining = await db.dailyMissions
        .where('missionId')
        .equals(missionId)
        .filter((item) => item.status === 'completed')
        .sortBy('date');
      let current = 0;
      let cursor = date;
      const dates = new Set(remaining.map((item) => item.date));
      while (dates.has(cursor)) {
        current += 1;
        cursor = addDays(cursor, -1);
      }
      const streak = await db.streaks.get(`mission:${missionId}`);
      await db.streaks.put({
        id: `mission:${missionId}`,
        kind: 'mission',
        current,
        longest: streak?.longest ?? current,
        lastQualifiedDate: current ? date : undefined,
        lastBrokenDate: date,
      });
    },
  );
}

function classifySystemState(recentMissCount: number, recoveryMode: boolean): SystemState {
  if (recoveryMode) return 'recovery';
  if (recentMissCount >= BALANCE.penalties.stagnantMisses) return 'stagnant';
  if (recentMissCount >= BALANCE.penalties.warningMisses) return 'warning';
  return 'stable';
}

function reviewVerdict(
  perfect: boolean,
  protectedPerfect: boolean,
  rate: number,
  state: SystemState,
) {
  if (perfect) return 'Full synchronization achieved. Every active objective was answered.';
  if (protectedPerfect) return 'Protected completion recorded. The campaign remains intact.';
  if (state === 'recovery') return 'Recovery conditions recognized. Stability takes priority.';
  if (rate >= 0.75) return 'The cycle was incomplete, but meaningful progress was secured.';
  if (rate > 0) return 'Partial progress recorded. Recovery remains available.';
  return 'No objectives were completed. Recovery protocol initiated.';
}

export async function finalizeDailyReview(date: LocalDateKey, systemDate: LocalDateKey) {
  if (compareDateKeys(date, systemDate) >= 0) {
    throw new Error('The current day cannot be finalized yet.');
  }
  const finalized = await db.dailyReviews.get(date);
  if (finalized?.status === 'finalized') return finalized;
  await createLocalSnapshot('daily-finalization');
  const now = new Date().toISOString();
  let result: DailyReview | undefined;
  await db.transaction(
    'rw',
    [
      db.dailyMissions,
      db.dailyReviews,
      db.progression,
      db.stats,
      db.statTransactions,
      db.xpTransactions,
      db.streaks,
      db.missions,
      db.settings,
      db.levelHistory,
      db.titles,
      db.challengeProgress,
      db.challenges,
      db.progressionEvents,
      db.dailyBriefings,
    ],
    async () => {
      const existing = await db.dailyReviews.get(date);
      if (existing?.status === 'finalized') {
        result = existing;
        return;
      }
      const [records, missions, settings, progression, briefing] = await Promise.all([
        db.dailyMissions.where('date').equals(date).toArray(),
        db.missions.toArray(),
        db.settings.get('primary'),
        db.progression.get('primary'),
        db.dailyBriefings.get(date),
      ]);
      if (!settings || !progression) throw new Error('System data is incomplete.');
      const coreIds = new Set(
        missions.filter((mission) => !mission.optional).map((mission) => mission.id),
      );
      const coreRecords = records.filter((record) => coreIds.has(record.missionId));
      if (coreRecords.some((record) => record.status === 'pending')) {
        throw new Error('Resolve every pending core mission before finalizing the review.');
      }
      const unresolvedOptional = records.filter(
        (record) => !coreIds.has(record.missionId) && record.status === 'pending',
      );
      if (unresolvedOptional.length) {
        await db.dailyMissions.bulkPut(
          unresolvedOptional.map((record) => ({
            ...record,
            status: 'skipped' as const,
            updatedAt: now,
          })),
        );
      }
      const completed = coreRecords.filter((record) => record.status === 'completed');
      const excused = coreRecords.filter((record) => record.status === 'excused');
      const missed = coreRecords.filter(
        (record) => record.status === 'failed' || record.status === 'skipped',
      );
      const activeCount = coreRecords.length;
      const completionRate = activeCount ? completed.length / activeCount : 0;
      const perfectDay = activeCount > 0 && completed.length === activeCount;
      const protectedPerfectDay =
        !perfectDay &&
        activeCount > 0 &&
        completed.length + excused.length === activeCount &&
        excused.every((record) => record.protectedException);
      const recentStart = addDays(date, -6);
      const recent = await db.dailyMissions
        .where('date')
        .between(recentStart, date, true, true)
        .toArray();
      const recentMissCount = recent.filter(
        (record) => record.status === 'failed' || record.status === 'skipped',
      ).length;
      const systemState = classifySystemState(recentMissCount, settings.recoveryMode.active);
      const transactionIds: string[] = [];
      const statChanges: Partial<Record<StatName, number>> = {};
      let accountXpAwarded = 0;
      let nextProgression = { ...progression };
      // Retired Daily Command plans are closed for save compatibility, but never add a reward.
      if (briefing) {
        await db.dailyBriefings.update(briefing.id, {
          awardedMultiplier: 1,
          awardedBonusXp: 0,
          finalizedAt: now,
          updatedAt: now,
        });
      }

      if (perfectDay || protectedPerfectDay) {
        const amount = perfectDay
          ? BALANCE.account.perfectDayBonus
          : BALANCE.account.protectedPerfectDayBonus;
        const transactionId = stableId('review', date, 'perfect');
        if (!(await db.xpTransactions.get(transactionId))) {
          const applied = applyAccountXp(nextProgression.totalXp, amount);
          const previousLevel = nextProgression.level;
          nextProgression = {
            ...nextProgression,
            ...applied,
            lastLevelUpAt: applied.levelsGained ? now : nextProgression.lastLevelUpAt,
            recentLevelUp: nextProgression.recentLevelUp || applied.levelsGained > 0,
          };
          await db.xpTransactions.add({
            id: transactionId,
            kind: 'perfect-day',
            amount,
            date,
            timestamp: now,
            sourceId: date,
            note: perfectDay ? 'Perfect Day bonus' : 'Protected Perfect Day bonus',
          });
          await putLevelHistory(nextProgression, previousLevel, date, transactionId, now);
          transactionIds.push(transactionId);
          accountXpAwarded += amount;
        }
        for (const [statName, baseAmount] of Object.entries(PERFECT_DAY_STAT_REWARDS) as [
          StatName,
          number,
        ][]) {
          const amount = perfectDay ? baseAmount : Math.ceil(baseAmount / 2);
          const transactionId = stableId('review', date, 'perfect', statName);
          if (await db.statTransactions.get(transactionId)) continue;
          const stat = await db.stats.get(statName);
          if (!stat) continue;
          await db.stats.put(
            applyStatChange(stat, amount, BALANCE.stats.perfectDayMomentumGain, now),
          );
          await db.statTransactions.add({
            id: transactionId,
            stat: statName,
            kind: 'perfect-day',
            amount,
            momentumDelta: BALANCE.stats.perfectDayMomentumGain,
            date,
            timestamp: now,
            sourceId: date,
            note: 'Perfect Day growth',
          });
          statChanges[statName] = (statChanges[statName] ?? 0) + amount;
          transactionIds.push(transactionId);
        }
      }

      const affectedStats = new Set<StatName>();
      for (const record of missed) {
        await breakMissionStreak(record.missionId, date);
        const mission = missions.find((item) => item.id === record.missionId);
        mission?.statRewards.forEach((reward) => affectedStats.add(reward.stat));
      }
      for (const statName of affectedStats) {
        const stat = await db.stats.get(statName);
        if (!stat) continue;
        const neglectedDays = stat.neglectedDays + 1;
        const momentumDelta =
          neglectedDays > 1
            ? -BALANCE.stats.repeatedMissMomentumLoss
            : -BALANCE.stats.firstMissMomentumLoss;
        const withMomentum = {
          ...applyStatChange(stat, 0, momentumDelta, now),
          neglectedDays,
        };
        const decay = getDecayForNeglect(withMomentum, neglectedDays, settings.recoveryMode.active);
        const nextStat = decay
          ? { ...applyStatChange(withMomentum, decay, 0, now), neglectedDays }
          : withMomentum;
        await db.stats.put(nextStat);
        const transactionId = stableId('review', date, 'penalty', statName);
        if (!(await db.statTransactions.get(transactionId))) {
          await db.statTransactions.add({
            id: transactionId,
            stat: statName,
            kind: 'decay',
            amount: decay,
            momentumDelta,
            date,
            timestamp: now,
            sourceId: date,
            note: decay
              ? `Repeated inactivity reduced ${statName} XP`
              : `${statName} momentum declined`,
          });
          statChanges[statName] = (statChanges[statName] ?? 0) + decay;
          transactionIds.push(transactionId);
        }
      }

      const priorFinalizedReviews = await db.dailyReviews
        .where('status')
        .equals('finalized')
        .toArray();
      const streakMetrics = deriveDailyStreakMetrics([
        ...priorFinalizedReviews,
        {
          date,
          status: 'finalized',
          perfectDay,
          protectedPerfectDay,
        },
      ]);
      const perfectStreak = streakMetrics.currentPerfectStreak;
      const dayStreak = streakMetrics.currentDayStreak;
      nextProgression = {
        ...nextProgression,
        completedDays: nextProgression.completedDays + (completed.length > 0 ? 1 : 0),
        perfectDays: nextProgression.perfectDays + (perfectDay ? 1 : 0),
        protectedPerfectDays: nextProgression.protectedPerfectDays + (protectedPerfectDay ? 1 : 0),
        currentPerfectStreak: perfectStreak,
        longestPerfectStreak: streakMetrics.longestPerfectStreak,
        currentDayStreak: dayStreak,
        longestDayStreak: streakMetrics.longestDayStreak,
        xpMultiplier:
          systemState === 'stable' || systemState === 'recovery'
            ? 1
            : systemState === 'warning'
              ? BALANCE.account.warningMultiplier
              : BALANCE.account.minimumMultiplier,
      };
      await db.progression.put(nextProgression);
      await db.streaks.bulkPut([
        {
          id: 'perfect',
          kind: 'perfect',
          current: perfectStreak,
          longest: nextProgression.longestPerfectStreak,
          lastQualifiedDate: perfectStreak ? date : undefined,
          lastBrokenDate: perfectStreak ? undefined : date,
        },
        {
          id: 'day',
          kind: 'day',
          current: dayStreak,
          longest: nextProgression.longestDayStreak,
          lastQualifiedDate: dayStreak ? date : undefined,
          lastBrokenDate: dayStreak ? undefined : date,
        },
      ]);
      if (perfectDay) await unlockTitle('first-light', `review:${date}`, now);

      result = {
        id: date,
        date,
        status: 'finalized',
        startedAt: existing?.startedAt ?? now,
        finalizedAt: now,
        completionCount: completed.length,
        activeMissionCount: activeCount,
        completionRate,
        perfectDay,
        protectedPerfectDay,
        accountXpAwarded,
        dailyCommandCapacity: undefined,
        dailyCommandOutcome: undefined,
        dailyCommandMultiplier: 1,
        dailyCommandBonusXp: 0,
        statChanges,
        verdict: reviewVerdict(perfectDay, protectedPerfectDay, completionRate, systemState),
        systemState,
        transactionIds,
      };
      await db.dailyReviews.put(result);
      if (
        (systemState === 'warning' || systemState === 'stagnant') &&
        !(await db.challengeProgress.where('[kind+status]').equals(['recovery', 'active']).first())
      ) {
        const template =
          RECOVERY_CHALLENGES[
            Math.abs(
              date
                .replaceAll('-', '')
                .split('')
                .reduce((a, b) => a + Number(b), 0),
            ) % RECOVERY_CHALLENGES.length
          ];
        await db.challengeProgress.put(
          createChallengeProgress(template, systemDate, settings.weekStartsOn),
        );
      }
    },
  );
  await refreshActiveChallenges(systemDate);
  await evaluateAutomaticTitles();
  await evaluateAutomaticAchievements();
  const latestSettings = await db.settings.get('primary');
  await refreshPeriodicReports(date, latestSettings?.weekStartsOn ?? 1);
  return result!;
}

export async function getPendingReview() {
  return db.dailyReviews
    .where('status')
    .equals('in-progress')
    .sortBy('date')
    .then((rows) => rows[0]);
}

export async function refreshActiveChallenges(systemDate: LocalDateKey) {
  const [active, missions] = await Promise.all([
    db.challengeProgress.where('status').equals('active').toArray(),
    db.missions.toArray(),
  ]);
  for (const progress of active) {
    const template = getChallengeTemplate(progress.templateId);
    if (!template) continue;
    const [records, reviews] = await Promise.all([
      db.dailyMissions
        .where('date')
        .between(progress.startedAt, progress.endsAt, true, true)
        .toArray(),
      db.dailyReviews
        .where('date')
        .between(progress.startedAt, progress.endsAt, true, true)
        .toArray(),
    ]);
    const current = calculateChallengeCurrent(template, records, reviews, missions);
    const nextMilestone = template.milestones.filter(
      (milestone) => current / Math.max(progress.target, 1) >= milestone,
    ).length;
    await db.challengeProgress.update(progress.id, {
      current,
      milestoneReached: Math.max(progress.milestoneReached, nextMilestone),
    });
    if (current >= progress.target) {
      await completeChallenge(progress.id, systemDate);
    } else if (compareDateKeys(systemDate, progress.endsAt) > 0) {
      const cooldown =
        template.kind === 'rank-trial'
          ? addDays(systemDate, Math.min(30, Math.max(7, template.durationDays / 3)))
          : undefined;
      await db.challengeProgress.update(progress.id, {
        status: cooldown ? 'cooldown' : 'failed',
        cooldownUntil: cooldown,
      });
    }
  }
}

export async function completeChallenge(progressId: string, systemDate: LocalDateKey) {
  const now = new Date().toISOString();
  await db.transaction(
    'rw',
    [
      db.challengeProgress,
      db.challenges,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.levelHistory,
      db.titles,
      db.rankHistory,
      db.profiles,
      db.cosmeticUnlocks,
      db.progressionEvents,
    ],
    async () => {
      const progress = await db.challengeProgress.get(progressId);
      if (!progress || progress.rewardApplied) return;
      const template = await db.challenges.get(progress.templateId);
      const progression = await db.progression.get('primary');
      if (!template || !progression) return;
      const rewardId = stableId('challenge', progress.id, 'reward');
      const applied = applyAccountXp(progression.totalXp, template.accountXp);
      const previousLevel = progression.level;
      const nextProgression: AccountProgression = {
        ...progression,
        ...applied,
        lastLevelUpAt: applied.levelsGained ? now : progression.lastLevelUpAt,
        recentLevelUp: applied.levelsGained > 0,
      };
      if (!(await db.xpTransactions.get(rewardId))) {
        await db.xpTransactions.add({
          id: rewardId,
          kind: template.kind === 'recovery' ? 'recovery' : 'challenge',
          amount: template.accountXp,
          date: systemDate,
          timestamp: now,
          sourceId: template.id,
          note: `${template.name} completed`,
        });
        await putLevelHistory(nextProgression, previousLevel, systemDate, rewardId, now);
      }
      for (const reward of template.statRewards) {
        const stat = await db.stats.get(reward.stat);
        const transactionId = stableId(rewardId, reward.stat);
        if (!stat || (await db.statTransactions.get(transactionId))) continue;
        await db.stats.put(
          applyStatChange(stat, reward.xp, BALANCE.stats.missionMomentumGain, now),
        );
        await db.statTransactions.add({
          id: transactionId,
          stat: reward.stat,
          kind: template.kind === 'recovery' ? 'recovery' : 'challenge',
          amount: reward.xp,
          momentumDelta: BALANCE.stats.missionMomentumGain,
          date: systemDate,
          timestamp: now,
          sourceId: template.id,
          note: `${template.name} reward`,
        });
      }
      if (template.titleRewardId) {
        await unlockTitle(template.titleRewardId, rewardId, now);
      }
      if (template.cosmeticReward) {
        const profile = await db.profiles.get('primary');
        if (profile) {
          await db.profiles.put({
            ...profile,
            cosmeticFrame: template.cosmeticReward.startsWith('frame-')
              ? template.cosmeticReward
              : profile.cosmeticFrame,
            backgroundSigil: template.cosmeticReward.startsWith('sigil-')
              ? template.cosmeticReward
              : profile.backgroundSigil,
          });
        }
        await db.cosmeticUnlocks.put({
          id: template.cosmeticReward,
          cosmeticId: template.cosmeticReward,
          unlockedAt: now,
          sourceId: rewardId,
        });
        await db.progressionEvents.put({
          id: stableId('progression-event', 'cosmetic', template.cosmeticReward),
          kind: 'cosmetic',
          createdAt: now,
          headline: 'COSMETIC UNLOCKED',
          detail: template.cosmeticReward.replaceAll('-', ' '),
          acknowledged: false,
        });
      }
      if (template.rankTarget) {
        const currentIndex = RANK_ORDER.indexOf(nextProgression.rank);
        const targetIndex = RANK_ORDER.indexOf(template.rankTarget);
        if (targetIndex === currentIndex + 1) {
          await db.rankHistory.add({
            id: createId('rank'),
            from: nextProgression.rank,
            to: template.rankTarget,
            timestamp: now,
            date: systemDate,
          });
          nextProgression.rank = template.rankTarget;
          nextProgression.lastRankUpAt = now;
          nextProgression.recentRankUp = true;
          await db.progressionEvents.put({
            id: stableId('progression-event', 'rank', template.rankTarget, now),
            kind: 'rank-up',
            createdAt: now,
            headline: `${formatClassName(template.rankTarget).toUpperCase()} ACHIEVED`,
            detail: 'Classification advanced. The permanent Class archive has been updated.',
            acknowledged: false,
          });
          await unlockTitle('rank-breaker', rewardId, now);
        }
      }
      await db.progression.put(nextProgression);
      await db.challengeProgress.put({
        ...progress,
        current: Math.max(progress.current, progress.target),
        status: 'completed',
        completedAt: now,
        rewardApplied: true,
      });
    },
  );
  await evaluateAutomaticTitles();
  await evaluateAutomaticAchievements();
}

export async function activateBossChallenge(templateId: string, systemDate: LocalDateKey) {
  const template = BOSS_CHALLENGES.find((item) => item.id === templateId);
  if (!template) throw new Error('Boss Challenge not found.');
  const settings = await db.settings.get('primary');
  if (!settings) throw new Error('Settings not found.');
  const active = await db.challengeProgress
    .where('[kind+status]')
    .equals(['boss', 'active'])
    .first();
  if (active) throw new Error('Only one Boss Challenge can be active at a time.');
  const progress = createChallengeProgress(template, systemDate, settings.weekStartsOn);
  await db.challengeProgress.put(progress);
  return progress;
}

export async function activateRankTrial(templateId: string, systemDate: LocalDateKey) {
  const template = RANK_TRIALS.find((item) => item.id === templateId);
  if (!template) throw new Error('Class Trial not found.');
  const settings = await db.settings.get('primary');
  if (!settings) throw new Error('Settings not found.');
  const existing = await db.challengeProgress
    .where('[kind+status]')
    .equals(['rank-trial', 'active'])
    .first();
  if (existing) throw new Error('A Class Trial is already active.');
  const previous = await db.challengeProgress.where('templateId').equals(templateId).last();
  if (previous?.cooldownUntil && compareDateKeys(previous.cooldownUntil, systemDate) > 0) {
    throw new Error(`This trial is in cooldown until ${previous.cooldownUntil}.`);
  }
  const progress = createChallengeProgress(template, systemDate, settings.weekStartsOn);
  await db.challengeProgress.put(progress);
  return progress;
}

export function getDefaultSystemDate(settings: Settings) {
  return getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
}
