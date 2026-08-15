import { describe, expect, it, vi } from 'vitest';
import { installMediaReleaseGuard } from '@/utils/mediaLifecycle';

function lifecycleHarness(initialVisibility: DocumentVisibilityState = 'visible') {
  let visibilityState = initialVisibility;
  const documentTarget = new EventTarget() as Document;
  Object.defineProperty(documentTarget, 'visibilityState', {
    configurable: true,
    get: () => visibilityState,
  });
  const windowTarget = new EventTarget() as Window;

  return {
    documentTarget,
    windowTarget,
    setVisibility(next: DocumentVisibilityState) {
      visibilityState = next;
    },
  };
}

describe('media lifecycle guard', () => {
  it('releases app-owned media as soon as the document becomes hidden', () => {
    const releaseMedia = vi.fn();
    const lifecycle = lifecycleHarness();
    const removeGuard = installMediaReleaseGuard(
      releaseMedia,
      lifecycle.documentTarget,
      lifecycle.windowTarget,
    );

    lifecycle.setVisibility('hidden');
    lifecycle.documentTarget.dispatchEvent(new Event('visibilitychange'));

    expect(releaseMedia).toHaveBeenCalledTimes(1);
    removeGuard();
  });

  it('releases media on page exit and removes both listeners during cleanup', () => {
    const releaseMedia = vi.fn();
    const lifecycle = lifecycleHarness();
    const removeGuard = installMediaReleaseGuard(
      releaseMedia,
      lifecycle.documentTarget,
      lifecycle.windowTarget,
    );

    lifecycle.windowTarget.dispatchEvent(new Event('pagehide'));
    expect(releaseMedia).toHaveBeenCalledTimes(1);

    removeGuard();
    lifecycle.setVisibility('hidden');
    lifecycle.documentTarget.dispatchEvent(new Event('visibilitychange'));
    lifecycle.windowTarget.dispatchEvent(new Event('pagehide'));
    expect(releaseMedia).toHaveBeenCalledTimes(1);
  });

  it('does not interrupt media for ordinary visible-page events', () => {
    const releaseMedia = vi.fn();
    const lifecycle = lifecycleHarness('visible');
    const removeGuard = installMediaReleaseGuard(
      releaseMedia,
      lifecycle.documentTarget,
      lifecycle.windowTarget,
    );

    lifecycle.documentTarget.dispatchEvent(new Event('visibilitychange'));
    expect(releaseMedia).not.toHaveBeenCalled();
    removeGuard();
  });
});
