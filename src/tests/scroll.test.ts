import { describe, expect, it, vi } from 'vitest';
import { scrollChatViewportToBottom, type ScrollViewport } from '@/utils/scroll';

describe('AI Headquarters chat scrolling', () => {
  it('scrolls only the message viewport with smooth motion', () => {
    const scrollTo = vi.fn();
    const viewport: ScrollViewport = {
      scrollHeight: 840,
      scrollTop: 120,
      scrollTo,
    };

    scrollChatViewportToBottom(viewport);

    expect(scrollTo).toHaveBeenCalledWith({ top: 840, behavior: 'smooth' });
  });

  it('honors reduced motion and supports browsers without element scrollTo', () => {
    const reducedMotionScroll = vi.fn();
    scrollChatViewportToBottom(
      { scrollHeight: 410, scrollTop: 0, scrollTo: reducedMotionScroll },
      true,
    );
    expect(reducedMotionScroll).toHaveBeenCalledWith({ top: 410, behavior: 'auto' });

    const fallback: ScrollViewport = { scrollHeight: 560, scrollTop: 0 };
    scrollChatViewportToBottom(fallback);
    expect(fallback.scrollTop).toBe(560);
  });
});
