export function playSystemTone(
  kind: 'complete' | 'level' | 'warning',
  enabled: boolean,
  volume = 0.55,
) {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = kind === 'level' ? 620 : kind === 'warning' ? 180 : 420;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.005, Math.min(0.12, 0.12 * volume)),
    context.currentTime + 0.015,
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
  oscillator.addEventListener('ended', () => void context.close());
}

export function vibrate(pattern: number | number[], enabled: boolean) {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
