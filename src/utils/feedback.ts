import { playTone } from '@/utils/audio';

export function playSystemTone(
  kind: 'complete' | 'level' | 'warning',
  enabled: boolean,
  volume = 0.55,
) {
  if (!enabled || typeof window === 'undefined') return;
  playTone(kind, volume);
}

export function vibrate(pattern: number | number[], enabled: boolean) {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
