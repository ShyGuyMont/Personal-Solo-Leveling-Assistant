import { BALANCE } from '@/config/balance';
import { applyStatXp, statXpForLevel, totalXpAtLevel } from '@/game/xp';
import type { StatName, StatProgress } from '@/types/game';

export const ALL_STATS: StatName[] = [
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
  'stewardship',
];

export function createInitialStat(name: StatName): StatProgress {
  return {
    id: name,
    name,
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    xpToNextLevel: statXpForLevel(1),
    lifetimeXpGained: 0,
    momentum: 50,
    trend: 'stable',
    neglectedDays: 0,
    protectedFloorXp: 0,
  };
}

export function calculateProtectedFloor(lifetimeXpGained: number) {
  const milestone =
    Math.floor(lifetimeXpGained / BALANCE.stats.lifetimeFloorStep) *
    BALANCE.stats.lifetimeFloorStep;
  return Math.round(milestone * BALANCE.stats.minimumFloorRatio);
}

export function applyStatChange(
  stat: StatProgress,
  xpDelta: number,
  momentumDelta: number,
  timestamp: string,
): StatProgress {
  const nextXp = applyStatXp(stat.totalXp, xpDelta, stat.protectedFloorXp);
  const nextLifetime = stat.lifetimeXpGained + Math.max(0, xpDelta);
  const nextFloor = Math.max(stat.protectedFloorXp, calculateProtectedFloor(nextLifetime));
  const momentum = Math.max(0, Math.min(100, stat.momentum + momentumDelta));
  return {
    ...stat,
    ...nextXp,
    totalXp: Math.max(nextXp.totalXp, nextFloor),
    lifetimeXpGained: nextLifetime,
    protectedFloorXp: nextFloor,
    momentum,
    trend: momentumDelta > 0 ? 'rising' : momentumDelta < 0 ? 'declining' : 'stable',
    lastIncreasedAt: xpDelta > 0 ? timestamp : stat.lastIncreasedAt,
    lastDecreasedAt: xpDelta < 0 ? timestamp : stat.lastDecreasedAt,
    neglectedDays: xpDelta > 0 ? 0 : stat.neglectedDays,
  };
}

export function getDecayForNeglect(
  stat: StatProgress,
  neglectedDays: number,
  recoveryMode: boolean,
) {
  const multiplier = recoveryMode ? BALANCE.stats.recoveryDecayMultiplier : 1;
  if (neglectedDays < BALANCE.stats.smallDecayAfterDays) return 0;
  if (stat.momentum >= BALANCE.stats.decayThreshold) return 0;
  if (neglectedDays >= BALANCE.stats.strongerDecayAfterDays) {
    return -Math.round(BALANCE.stats.strongerDecayXp * multiplier);
  }
  return -Math.round(BALANCE.stats.smallDecayXp * multiplier);
}

export function getStatProtectedLevel(stat: StatProgress) {
  if (stat.protectedFloorXp <= 0) return 1;
  let level = 1;
  while (totalXpAtLevel(level + 1, statXpForLevel) <= stat.protectedFloorXp) level += 1;
  return level;
}
