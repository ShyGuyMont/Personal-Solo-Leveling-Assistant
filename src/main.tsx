import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { configurePwaUpdate, markOfflineReady, markUpdateAvailable } from '@/services/pwaUpdate';
import '@/styles.css';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: markUpdateAvailable,
  onOfflineReady: markOfflineReady,
});
configurePwaUpdate(updateSW);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
