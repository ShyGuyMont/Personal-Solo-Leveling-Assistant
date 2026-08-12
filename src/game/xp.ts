import { BALANCE } from '@/config/balance';

export function accountXpForLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(
    BALANCE.account.baseXp +
      BALANCE.account.linear * safeLevel +
      BALANCE.account.growth * safeLevel * safeLevel,
  );
}

export function statXpForLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(
    BALANCE.stats.baseXp +
      BALANCE.stats.linear * safeLevel +
      BALANCE.stats.growth * safeLevel * safeLevel,
  );
}

export function totalXpAtLevel(level: number, curve: (level: number) => number) {
  let total = 0;
  for (let current = 1; current < level; current += 1) total += curve(current);
  return total;
}

export function resolveLevelFromTotalXp(totalXp: number, curve = accountXpForLevel) {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  let required = curve(level);
  while (remaining >= required && level < 999) {
    remaining -= required;
    level += 1;
    required = curve(level);
  }
  return {
    level,
    currentLevelXp: remaining,
    xpToNextLevel: required,
  };
}

export function applyAccountXp(totalXp: number, amount: number) {
  const previous = resolveLevelFromTotalXp(totalXp);
  const nextTotal = Math.max(totalXp, totalXp + Math.round(amount));
  const next = resolveLevelFromTotalXp(nextTotal);
  return {
    ...next,
    totalXp: nextTotal,
    levelsGained: Math.max(0, next.level - previous.level),
  };
}

export function reverseAccountXpWithinLevel(totalXp: number, amount: number) {
  const current = resolveLevelFromTotalXp(totalXp);
  const levelFloor = totalXpAtLevel(current.level, accountXpForLevel);
  const nextTotal = Math.max(levelFloor, totalXp - Math.abs(Math.round(amount)));
  return { ...resolveLevelFromTotalXp(nextTotal), totalXp: nextTotal };
}

export function applyStatXp(totalXp: number, amount: number, protectedFloorXp = 0) {
  const nextTotal = Math.max(protectedFloorXp, totalXp + Math.round(amount), 0);
  return { ...resolveLevelFromTotalXp(nextTotal, statXpForLevel), totalXp: nextTotal };
}
