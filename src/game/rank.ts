import { RANK_ORDER, RANK_REQUIREMENTS } from '@/config/balance';
import type {
  AccountProgression,
  ChallengeProgress,
  Rank,
  RankRequirement,
  StatProgress,
} from '@/types/game';

export interface RankQualificationItem {
  id: string;
  label: string;
  current: number;
  target: number;
  met: boolean;
  display?: string;
}

export interface RankQualification {
  currentRank: Rank;
  targetRank?: Rank;
  requirement?: RankRequirement;
  items: RankQualificationItem[];
  qualified: boolean;
  trialStatus: 'locked' | 'available' | 'active' | 'completed' | 'cooldown' | 'none';
}

export function nextRank(rank: Rank): Rank | undefined {
  return RANK_ORDER[RANK_ORDER.indexOf(rank) + 1];
}

export function calculateRankQualification(
  progression: AccountProgression,
  stats: StatProgress[],
  challenges: ChallengeProgress[],
): RankQualification {
  const targetRank = nextRank(progression.rank);
  if (!targetRank) {
    return {
      currentRank: progression.rank,
      items: [],
      qualified: true,
      trialStatus: 'none',
    };
  }
  const requirement = RANK_REQUIREMENTS.find((entry) => entry.rank === targetRank)!;
  const discipline = stats.find((stat) => stat.id === 'discipline')?.level ?? 1;
  const balancedCount = stats.filter((stat) => stat.level >= requirement.balancedStatLevel).length;
  const completedChallenges = challenges.filter(
    (challenge) => challenge.status === 'completed',
  ).length;
  const trial = challenges.find(
    (challenge) => challenge.templateId === requirement.trialTemplateId,
  );
  const items: RankQualificationItem[] = [
    {
      id: 'level',
      label: 'Account Level',
      current: progression.level,
      target: requirement.minimumLevel,
      met: progression.level >= requirement.minimumLevel,
    },
    {
      id: 'missions',
      label: 'Mission Completions',
      current: progression.lifetimeMissionCompletions,
      target: requirement.lifetimeCompletions,
      met: progression.lifetimeMissionCompletions >= requirement.lifetimeCompletions,
    },
    {
      id: 'days',
      label: 'Completed Days',
      current: progression.completedDays,
      target: requirement.completedDays,
      met: progression.completedDays >= requirement.completedDays,
    },
    {
      id: 'discipline',
      label: 'Discipline',
      current: discipline,
      target: requirement.disciplineLevel,
      met: discipline >= requirement.disciplineLevel,
    },
    {
      id: 'balance',
      label: 'Balanced Stats',
      current: balancedCount,
      target: requirement.balancedStatsRequired,
      met: balancedCount >= requirement.balancedStatsRequired,
      display: `${balancedCount} / ${requirement.balancedStatsRequired} at level ${requirement.balancedStatLevel}`,
    },
    {
      id: 'challenges',
      label: 'Challenges',
      current: completedChallenges,
      target: requirement.challengesCompleted,
      met: completedChallenges >= requirement.challengesCompleted,
    },
  ];
  const qualified = items.every((item) => item.met);
  return {
    currentRank: progression.rank,
    targetRank,
    requirement,
    items,
    qualified,
    trialStatus: trial
      ? trial.status === 'failed'
        ? 'cooldown'
        : trial.status
      : qualified
        ? 'available'
        : 'locked',
  };
}
