import type { ColorTheme } from '@/types/game';

export type DocumentTheme = Exclude<ColorTheme, 'winter-crown'>;

export function getDocumentTheme(theme: ColorTheme): DocumentTheme {
  return theme === 'winter-crown' ? 'daybreak' : theme;
}
