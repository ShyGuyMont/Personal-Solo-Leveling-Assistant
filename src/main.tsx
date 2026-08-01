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
import '@/styles.css';

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
