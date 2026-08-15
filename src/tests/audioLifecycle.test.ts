import { afterEach, describe, expect, it, vi } from 'vitest';

class FakeAudioContext {
  static latest?: FakeAudioContext;

  state: AudioContextState = 'suspended';
  sampleRate = 44_100;
  currentTime = 0;
  destination = {} as AudioDestinationNode;
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });

  constructor() {
    FakeAudioContext.latest = this;
  }

  createBuffer() {
    return {} as AudioBuffer;
  }

  createBufferSource() {
    return {
      buffer: undefined,
      connect: vi.fn(),
      start: vi.fn(),
    } as unknown as AudioBufferSourceNode;
  }
}

describe('shared audio lifecycle', () => {
  const originalAudioContext = Object.getOwnPropertyDescriptor(window, 'AudioContext');

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalAudioContext) {
      Object.defineProperty(window, 'AudioContext', originalAudioContext);
    } else {
      Reflect.deleteProperty(window, 'AudioContext');
    }
    FakeAudioContext.latest = undefined;
  });

  it('suspends the iPhone audio engine shortly after a deliberate primer', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext,
    });
    vi.resetModules();

    const { primeAudioOutput } = await import('@/utils/audio');
    expect(primeAudioOutput()).toBe(true);
    await Promise.resolve();
    expect(FakeAudioContext.latest?.state).toBe('running');

    await vi.advanceTimersByTimeAsync(1_000);
    expect(FakeAudioContext.latest?.suspend).toHaveBeenCalledOnce();
    expect(FakeAudioContext.latest?.state).toBe('suspended');
  });
});
