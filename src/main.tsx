import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  configurePwaRegistration,
  configurePwaUpdate,
  markOfflineReady,
  markUpdateAvailable,
} from '@/services/pwaUpdate';
import { installSystemMediaGuard, releaseSystemMedia } from '@/utils/mediaSecurity';
import '@/styles.css';

installSystemMediaGuard();
window.addEventListener('pagehide', () => releaseSystemMedia());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') releaseSystemMedia();
});

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: markUpdateAvailable,
  onOfflineReady: markOfflineReady,
  onRegisteredSW: (_swUrl, registration) => configurePwaRegistration(registration),
});
configurePwaUpdate(updateSW);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
