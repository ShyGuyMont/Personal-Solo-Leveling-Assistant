import { BALANCE, PERFECT_DAY_STAT_REWARDS, RANK_REQUIREMENTS } from '@/config/balance';
import { DEFAULT_MISSIONS } from '@/config/missions';
import { resolveLevelFromTotalXp, statXpForLevel } from '@/game/xp';
import type { Rank, StatName } from '@/types/game';

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
}

export function simulateProgression(days: number, completionRate: number): SimulationResult {
  const safeDays = Math.max(0, Math.floor(days));
  const safeRate = Math.max(0, Math.min(1, completionRate));
  const dailyMissionXp = DEFAULT_MISSIONS.reduce(
    (sum, mission) => sum + (mission.customAccountXp ?? mission.accountXp),
    0,
  );
  const perfectRate = Math.max(0, (safeRate - 0.82) / 0.18);
  const perfectDays = Math.round(safeDays * perfectRate);
  const challengeXp =
    safeDays *
    safeRate *
    (BALANCE.weeklyChallengeAccountXp[1] / 7 + BALANCE.monthlyChallengeAccountXp[1] / 30);
  const accountXp =
    safeDays * dailyMissionXp * safeRate +
    perfectDays * BALANCE.account.perfectDayBonus +
    challengeXp;
  const accountLevel = resolveLevelFromTotalXp(accountXp).level;
  const missionsCompleted = Math.round(safeDays * DEFAULT_MISSIONS.length * safeRate);

  const statTotals = Object.fromEntries(
    [
      'faith',
      'strength',
      'endurance',
      'discipline',
      'willpower',
      'wisdom',
      'creativity',
      'focus',
      'vitality',
      'character',
      'empathy',
    ].map((stat) => [stat, 0]),
  ) as Record<StatName, number>;
  for (const mission of DEFAULT_MISSIONS) {
    for (const reward of mission.statRewards) {
      statTotals[reward.stat] += safeDays * safeRate * reward.xp;
    }
  }
  for (const [stat, reward] of Object.entries(PERFECT_DAY_STAT_REWARDS) as [StatName, number][]) {
    statTotals[stat] += perfectDays * reward;
  }
  const statLevels = Object.fromEntries(
    Object.entries(statTotals).map(([stat, xp]) => [
      stat,
      resolveLevelFromTotalXp(xp, statXpForLevel).level,
    ]),
  ) as Record<StatName, number>;
  const challengeCompletions = Math.floor((safeDays / 7 + safeDays / 30) * safeRate);
  const completedDays = Math.round(safeDays * Math.min(1, safeRate * 1.08));
  let estimatedRank: Rank = 'F';
  for (const requirement of RANK_REQUIREMENTS) {
    const balancedCount = Object.values(statLevels).filter(
      (level) => level >= requirement.balancedStatLevel,
    ).length;
    if (
      accountLevel >= requirement.minimumLevel &&
      missionsCompleted >= requirement.lifetimeCompletions &&
      completedDays >= requirement.completedDays &&
      statLevels.discipline >= requirement.disciplineLevel &&
      balancedCount >= requirement.balancedStatsRequired &&
      challengeCompletions >= requirement.challengesCompleted
    ) {
      estimatedRank = requirement.rank;
    }
  }
  const levels = Object.values(statLevels);
  return {
    days: safeDays,
    completionRate: safeRate,
    accountLevel,
    estimatedRank,
    missionsCompleted,
    perfectDays,
    disciplineLevel: statLevels.discipline,
    balancedStatsAtLevel: levels.filter((level) => level >= 10).length,
    averageStatLevel: Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length),
  };
}

export function progressionSimulationMatrix() {
  return [7, 30, 90, 365, 1825].flatMap((days) =>
    [0.5, 0.75, 0.9, 1].map((rate) => simulateProgression(days, rate)),
  );
}
