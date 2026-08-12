export interface ScrollViewport {
  scrollHeight: number;
  scrollTop: number;
  scrollTo?: (options: ScrollToOptions) => void;
}

export function scrollChatViewportToBottom(viewport: ScrollViewport, reducedMotion = false) {
  const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';

  if (typeof viewport.scrollTo === 'function') {
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    return;
  }

  viewport.scrollTop = viewport.scrollHeight;
}
