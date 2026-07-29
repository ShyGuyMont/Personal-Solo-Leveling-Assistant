import type { MissionDefinition } from '@/types/game';

export function getMissionDisplayName(mission: MissionDefinition, sensitiveAlias?: string) {
  if (mission.id !== 'no-porn') return mission.name;
  return sensitiveAlias?.trim() || 'Integrity Protocol';
}
