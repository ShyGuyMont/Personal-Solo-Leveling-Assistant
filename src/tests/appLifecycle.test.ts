import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAppResumeController } from '@/utils/appLifecycle';

describe('app resume refresh controller', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('collapses visibility and focus events into one refresh', () => {
    vi.useFakeTimers();
    let now = 0;
    const onResume = vi.fn();
    const controller = createAppResumeController(onResume, { now: () => now });

    controller.markInactive();
    now = 1_500;
    controller.resumeIfReady(true);
    controller.resumeIfReady(true);
    vi.advanceTimersByTime(120);

    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('ignores short focus interruptions', () => {
    vi.useFakeTimers();
    let now = 0;
    const onResume = vi.fn();
    const controller = createAppResumeController(onResume, { now: () => now });

    controller.markInactive();
    now = 500;
    controller.resumeIfReady(true);
    vi.runAllTimers();

    expect(onResume).not.toHaveBeenCalled();
  });

  it('waits until the document is visible before refreshing', () => {
    vi.useFakeTimers();
    let now = 0;
    const onResume = vi.fn();
    const controller = createAppResumeController(onResume, { now: () => now });

    controller.markInactive();
    now = 2_000;
    controller.resumeIfReady(false);
    controller.resumeIfReady(true);
    vi.advanceTimersByTime(120);

    expect(onResume).toHaveBeenCalledTimes(1);
  });
});
