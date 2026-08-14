import { BALANCE } from '@/config/balance';
import type { MissionDefinition } from '@/types/game';

export function missionAccountXp(mission: MissionDefinition) {
  const configuredXp = mission.customAccountXp ?? mission.accountXp;
  return Math.round(configuredXp * BALANCE.account.missionBaselineMultiplier);
}

export function missionStatXp(configuredXp: number) {
  return Math.round(configuredXp * BALANCE.stats.missionBaselineMultiplier);
}
