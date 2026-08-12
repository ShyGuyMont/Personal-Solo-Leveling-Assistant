import { useSyncExternalStore } from 'react';

function getPath() {
  const path = window.location.hash.replace(/^#/, '').split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function useRoutePath() {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}
