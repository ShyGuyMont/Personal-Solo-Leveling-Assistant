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
