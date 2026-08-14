import type { MissionDefinition } from '@/types/game';

export function sanitizeSensitiveDisplayText(text: string) {
  return text
    .replace(/\bpornography\b/gi, 'explicit sexual content')
    .replace(/\bpornographic\b/gi, 'sexually explicit')
    .replace(/\bporn\b/gi, 'explicit content');
}

export function getMissionDisplayName(mission: MissionDefinition, sensitiveAlias?: string) {
  if (mission.id !== 'no-porn') return sanitizeSensitiveDisplayText(mission.name);
  return sensitiveAlias?.trim() || 'Integrity Protocol';
}
