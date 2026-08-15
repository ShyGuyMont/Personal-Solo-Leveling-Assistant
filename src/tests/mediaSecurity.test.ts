import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installSystemMediaGuard, releaseSystemMedia } from '@/utils/mediaSecurity';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('system media security', () => {
  beforeEach(() => releaseSystemMedia(memoryStorage()));

  it('blocks every camera request before it reaches the browser', async () => {
    const nativeGetUserMedia = vi.fn();
    const mediaDevices = { getUserMedia: nativeGetUserMedia };
    const storage = memoryStorage();

    installSystemMediaGuard({ mediaDevices, storage });

    await expect(mediaDevices.getUserMedia({ video: true })).rejects.toMatchObject({
      name: 'NotAllowedError',
    });
    expect(nativeGetUserMedia).not.toHaveBeenCalled();
    expect(storage.getItem('system-media-audit-v1')).toContain('video-blocked');
  });
});
