import type { Rank, StatName } from '@/types/game';

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function titleCase(value: string) {
  return value
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatClassName(rank: Rank | string) {
  return rank === 'WORLD CLASS' ? 'World Class' : `${rank}-Class`;
}

export const STAT_LABELS: Record<StatName, string> = {
  faith: 'Faith',
  strength: 'Strength',
  endurance: 'Endurance',
  discipline: 'Discipline',
  willpower: 'Willpower',
  wisdom: 'Wisdom',
  creativity: 'Creativity',
  focus: 'Focus',
  vitality: 'Vitality',
  character: 'Character',
  empathy: 'Empathy',
  stewardship: 'Stewardship',
};
