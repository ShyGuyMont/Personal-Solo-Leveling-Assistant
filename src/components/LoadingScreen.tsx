import { SystemMark } from '@/components/SystemMark';

export function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="ambient-grid" />
      <SystemMark />
      <p className="eyebrow">SYSTEM LINK</p>
      <p className="loading-screen__status">Restoring local progression…</p>
    </main>
  );
}

export function RouteLoadingScreen() {
  return (
    <section className="route-loading" aria-live="polite" aria-busy="true">
      <SystemMark small />
      <div>
        <p className="eyebrow">REALM LINK</p>
        <strong>Opening command section…</strong>
      </div>
      <span className="route-loading__signal" aria-hidden="true" />
    </section>
  );
}
