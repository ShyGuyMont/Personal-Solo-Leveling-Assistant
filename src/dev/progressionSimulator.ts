import { BALANCE, PERFECT_DAY_STAT_REWARDS, RANK_REQUIREMENTS } from '@/config/balance';
import { RANK_TRIALS } from '@/config/challenges';
import { DEFAULT_MISSIONS } from '@/config/missions';
import { resolveLevelFromTotalXp, statXpForLevel } from '@/game/xp';
import { ALL_STATS } from '@/game/stats';
import type { DailyCapacity, Rank, RankRequirement, StatName } from '@/types/game';

export interface SimulationResult {
  days: number;
  completionRate: number;
  accountLevel: number;
  estimatedRank: Rank;
  missionsCompleted: number;
  perfectDays: number;
  disciplineLevel: number;
  balancedStatsAtLevel: number;
  averageStatLevel: number;
  commandCapacity: DailyCapacity;
  accountXpBreakdown: {
    missions: number;
    dailyCommand: number;
    perfectDays: number;
    challenges: number;
    total: number;
  };
}

interface ProgressionProjection {
  accountLevel: number;
  missionsCompleted: number;
  completedDays: number;
  perfectDays: number;
  disciplineLevel: number;
  statLevels: Record<StatName, number>;
  challengeCompletions: number;
  accountXpBreakdown: SimulationResult['accountXpBreakdown'];
}

function commandMultiplierFor(rate: number, capacity: DailyCapacity) {
  if (capacity === 'low') return 1;
  if (capacity === 'steady') return rate >= 1 ? 1.75 : rate >= 0.65 ? 1.5 : 1;
  return rate >= 1 ? 2.5 : rate >= 0.8 ? 2 : 1;
}

function projectProgression(
  days: number,
  completionRate: number,
  commandCapacity: DailyCapacity,
  completedTrialIds: string[] = [],
): ProgressionProjection {
  const dailyMissionXp = DEFAULT_MISSIONS.reduce(
    (sum, mission) => sum + (mission.customAccountXp ?? mission.accountXp),
    0,
  );
  const commandMultiplier = commandMultiplierFor(completionRate, commandCapacity);
  const perfectRate = Math.max(0, (completionRate - 0.82) / 0.18);
  const perfectDays = Math.round(days * perfectRate);
  const challengeXp =
    days *
    completionRate *
    (BALANCE.weeklyChallengeAccountXp[1] / 7 + BALANCE.monthlyChallengeAccountXp[1] / 30);
  const missionXp = days * dailyMissionXp * completionRate;
  const dailyCommandXp = missionXp * (commandMultiplier - 1);
  const perfectDayXp = perfectDays * BALANCE.account.perfectDayBonus;
  const completedTrials = RANK_TRIALS.filter((trial) => completedTrialIds.includes(trial.id));
  const trialXp = completedTrials.reduce((sum, trial) => sum + trial.accountXp, 0);
  const accountXp = missionXp + dailyCommandXp + perfectDayXp + challengeXp + trialXp;

  const statTotals = Object.fromEntries([...ALL_STATS].map((stat) => [stat, 0])) as Record<
    StatName,
    number
  >;
  for (const mission of DEFAULT_MISSIONS) {
    for (const reward of mission.statRewards) {
      statTotals[reward.stat] += days * completionRate * commandMultiplier * reward.xp;
    }
  }
  for (const [stat, reward] of Object.entries(PERFECT_DAY_STAT_REWARDS) as [StatName, number][]) {
    statTotals[stat] += perfectDays * reward;
  }
  for (const trial of completedTrials) {
    for (const reward of trial.statRewards) statTotals[reward.stat] += reward.xp;
  }
  const statLevels = Object.fromEntries(
    Object.entries(statTotals).map(([stat, xp]) => [
      stat,
      resolveLevelFromTotalXp(xp, statXpForLevel).level,
    ]),
  ) as Record<StatName, number>;

  return {
    accountLevel: resolveLevelFromTotalXp(accountXp).level,
    missionsCompleted: Math.round(days * DEFAULT_MISSIONS.length * completionRate),
    completedDays: Math.round(days * Math.min(1, completionRate * 1.08)),
    perfectDays,
    disciplineLevel: statLevels.discipline,
    statLevels,
    challengeCompletions:
      Math.floor((days / 7 + days / 30) * completionRate) + completedTrials.length,
    accountXpBreakdown: {
      missions: Math.round(missionXp),
      dailyCommand: Math.round(dailyCommandXp),
      perfectDays: Math.round(perfectDayXp),
      challenges: Math.round(challengeXp + trialXp),
      total: Math.round(accountXp),
    },
  };
}

function meetsRankRequirement(projection: ProgressionProjection, requirement: RankRequirement) {
  const balancedCount = Object.values(projection.statLevels).filter(
    (level) => level >= requirement.balancedStatLevel,
  ).length;
  return (
    projection.accountLevel >= requirement.minimumLevel &&
    projection.missionsCompleted >= requirement.lifetimeCompletions &&
    projection.completedDays >= requirement.completedDays &&
    projection.disciplineLevel >= requirement.disciplineLevel &&
    balancedCount >= requirement.balancedStatsRequired &&
    projection.challengeCompletions >= requirement.challengesCompleted
  );
}

export function simulateProgression(
  days: number,
  completionRate: number,
  commandCapacity: DailyCapacity = 'steady',
): SimulationResult {
  const safeDays = Math.max(0, Math.floor(days));
  const safeRate = Math.max(0, Math.min(1, completionRate));
  let estimatedRank: Rank = 'F';
  const completedTrialIds: string[] = [];
  let previousTrialCompletedAt = 0;
  for (const requirement of RANK_REQUIREMENTS.filter((entry) => entry.rank !== 'F')) {
    const trial = RANK_TRIALS.find((entry) => entry.id === requirement.trialTemplateId);
    if (!trial) break;
    let low = previousTrialCompletedAt;
    let high = safeDays;
    let qualificationDay: number | undefined;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (
        meetsRankRequirement(
          projectProgression(middle, safeRate, commandCapacity, completedTrialIds),
          requirement,
        )
      ) {
        qualificationDay = middle;
        high = middle - 1;
      } else {
        low = middle + 1;
      }
    }
    if (qualificationDay === undefined) break;
    const trialCompletedAt = qualificationDay + trial.durationDays;
    if (trialCompletedAt > safeDays) break;
    completedTrialIds.push(trial.id);
    previousTrialCompletedAt = trialCompletedAt;
    estimatedRank = requirement.rank;
  }
  const projection = projectProgression(
    safeDays,
    safeRate,
    commandCapacity,
    completedTrialIds,
  );
  const levels = Object.values(projection.statLevels);
  return {
    days: safeDays,
    completionRate: safeRate,
    accountLevel: projection.accountLevel,
    estimatedRank,
    missionsCompleted: projection.missionsCompleted,
    perfectDays: projection.perfectDays,
    disciplineLevel: projection.disciplineLevel,
    balancedStatsAtLevel: levels.filter((level) => level >= 10).length,
    averageStatLevel: Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length),
    commandCapacity,
    accountXpBreakdown: projection.accountXpBreakdown,
  };
}

export function progressionSimulationMatrix() {
  return [7, 30, 90, 365, 1825].flatMap((days) =>
    [0.5, 0.75, 0.9, 1].map((rate) => simulateProgression(days, rate)),
  );
}
