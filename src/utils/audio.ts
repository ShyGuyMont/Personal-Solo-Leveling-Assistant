type AudioContextWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedAudioContext: AudioContext | undefined;

function getAudioContext() {
  if (typeof window === 'undefined') return undefined;
  if (sharedAudioContext && sharedAudioContext.state !== 'closed') return sharedAudioContext;

  const AudioContextClass =
    window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
  if (!AudioContextClass) return undefined;

  try {
    sharedAudioContext = new AudioContextClass();
    return sharedAudioContext;
  } catch {
    return undefined;
  }
}

/**
 * Opens the page's single audio channel while a tap/click still counts as a
 * user gesture. Mobile browsers may reject sound that starts only after an
 * awaited network request, so interactive controls call this synchronously.
 */
export function primeAudioOutput() {
  const context = getAudioContext();
  if (!context) return false;

  if (context.state !== 'running') void context.resume().catch(() => undefined);

  try {
    const silentBuffer = context.createBuffer(1, 1, context.sampleRate || 22_050);
    const source = context.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(context.destination);
    source.start(0);
  } catch {
    // The resume attempt above is still useful on browsers that reject a
    // zero-length primer.
  }

  return true;
}

async function resumeAudioOutput() {
  const context = getAudioContext();
  if (!context) return undefined;
  if (context.state !== 'running') {
    try {
      await context.resume();
    } catch {
      return undefined;
    }
  }
  return context.state === 'running' ? context : undefined;
}

export async function decodeAudioBlob(blob: Blob) {
  const context = await resumeAudioOutput();
  if (!context) {
    throw new Error('Your browser has not opened its speaker channel yet. Tap Test speaker once.');
  }

  try {
    return await context.decodeAudioData(await blob.arrayBuffer());
  } catch {
    throw new Error('This browser could not decode the companion voice. Reload the update and try again.');
  }
}

export class AppAudioPlayer {
  private source?: AudioBufferSourceNode;
  private offset = 0;
  private startedAt = 0;
  private finished = false;
  private pausedState = true;

  constructor(
    private readonly buffer: AudioBuffer,
    private readonly onEnded: () => void,
  ) {}

  get paused() {
    return this.pausedState;
  }

  async play() {
    if (this.finished || this.source) return;
    const context = await resumeAudioOutput();
    if (!context) {
      throw new Error('Speaker playback is blocked. Tap Test speaker, then try the voice again.');
    }

    const source = context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(context.destination);
    source.addEventListener(
      'ended',
      () => {
        if (this.source !== source) return;
        this.source = undefined;
        this.offset = 0;
        this.finished = true;
        this.pausedState = true;
        this.onEnded();
      },
      { once: true },
    );
    this.source = source;
    this.startedAt = context.currentTime;
    this.pausedState = false;
    source.start(0, Math.min(this.offset, Math.max(0, this.buffer.duration - 0.001)));
  }

  pause() {
    const source = this.source;
    const context = getAudioContext();
    if (!source || !context) return;
    this.offset = Math.min(
      this.buffer.duration,
      this.offset + Math.max(0, context.currentTime - this.startedAt),
    );
    this.source = undefined;
    this.pausedState = true;
    try {
      source.stop();
    } catch {
      // It may have ended between the state check and stop request.
    }
  }

  stop() {
    const source = this.source;
    this.source = undefined;
    this.offset = 0;
    this.finished = true;
    this.pausedState = true;
    try {
      source?.stop();
    } catch {
      // Stopping an already-ended source is harmless.
    }
  }
}

function scheduleTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.005, Math.min(0.14, 0.14 * volume)),
    startAt + 0.015,
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.01);
}

export async function playSpeakerTest(volume = 0.7) {
  primeAudioOutput();
  const context = await resumeAudioOutput();
  if (!context) return false;
  const now = context.currentTime + 0.02;
  scheduleTone(context, 392, now, 0.16, volume);
  scheduleTone(context, 523.25, now + 0.18, 0.16, volume);
  scheduleTone(context, 659.25, now + 0.36, 0.22, volume);
  return true;
}

export function playTone(
  kind: 'complete' | 'level' | 'warning',
  volume = 0.55,
) {
  const context = getAudioContext();
  if (!context) return false;
  if (context.state !== 'running') void context.resume().catch(() => undefined);
  scheduleTone(
    context,
    kind === 'level' ? 620 : kind === 'warning' ? 180 : 420,
    context.currentTime + 0.01,
    0.18,
    volume,
  );
  return true;
}
