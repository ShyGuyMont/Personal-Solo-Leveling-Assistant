import { lazy, Suspense, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { DailyReviewModal } from '@/components/DailyReviewModal';
import { FirstDayGuide } from '@/components/FirstDayGuide';
import { ProgressionOverlay } from '@/components/ProgressionOverlay';
import { ErrorToast, RewardToast } from '@/components/Toasts';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { useRoutePath } from '@/routeState';
import { useGameStore } from '@/store/useGameStore';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const MissionsPage = lazy(() =>
  import('@/pages/MissionsPage').then((module) => ({ default: module.MissionsPage })),
);
const StatusPage = lazy(() =>
  import('@/pages/StatusPage').then((module) => ({ default: module.StatusPage })),
);
const ChallengesPage = lazy(() =>
  import('@/pages/ChallengesPage').then((module) => ({ default: module.ChallengesPage })),
);
const ArchivePage = lazy(() =>
  import('@/pages/ArchivePage').then((module) => ({ default: module.ArchivePage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);

export function App() {
  const { loading, profile, load, refresh } = useGameStore();
  const path = useRoutePath();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const resume = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('focus', resume);
    return () => {
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('focus', resume);
    };
  }, [refresh]);

  if (loading) return <LoadingScreen />;
  if (!profile) return <OnboardingPage />;
  const RoutePage =
    {
      '/': DashboardPage,
      '/missions': MissionsPage,
      '/status': StatusPage,
      '/challenges': ChallengesPage,
      '/archive': ArchivePage,
      '/settings': SettingsPage,
    }[path] ?? DashboardPage;

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <AppShell>
          <RoutePage />
        </AppShell>
      </Suspense>
      <DailyReviewModal />
      <FirstDayGuide />
      <ProgressionOverlay />
      <UpdatePrompt />
      <RewardToast />
      <ErrorToast />
    </>
  );
}
