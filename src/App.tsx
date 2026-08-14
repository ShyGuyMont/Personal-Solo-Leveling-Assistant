import { Suspense, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { DailyReviewModal } from '@/components/DailyReviewModal';
import { DailyEventOverlay } from '@/components/DailyEventOverlay';
import { CompanionToast } from '@/components/CompanionToast';
import { PartyBanterToast } from '@/components/PartyBanterToast';
import { CampfireRecapOverlay } from '@/components/CampfireRecapOverlay';
import { MonthlyCouncilOverlay } from '@/components/MonthlyCouncilOverlay';
import { TreasuryChallengeOverlay } from '@/components/TreasuryChallengeOverlay';
import { FirstDayGuide } from '@/components/FirstDayGuide';
import { ProgressionOverlay } from '@/components/ProgressionOverlay';
import { ErrorToast, RewardToast } from '@/components/Toasts';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { LoadingScreen, RouteLoadingScreen } from '@/components/LoadingScreen';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { getRoutePage, preloadRoute, PRIMARY_ROUTE_PATHS } from '@/routeModules';
import { useRoutePath } from '@/routeState';
import { useGameStore } from '@/store/useGameStore';
import { createAppResumeController } from '@/utils/appLifecycle';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function App() {
  const loading = useGameStore((state) => state.loading);
  const profile = useGameStore((state) => state.profile);
  const load = useGameStore((state) => state.load);
  const resume = useGameStore((state) => state.resume);
  const path = useRoutePath();
  const profileReady = Boolean(profile);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const controller = createAppResumeController(() => void resume());
    const markInactive = () => controller.markInactive();
    const resumeIfReady = () => controller.resumeIfReady(document.visibilityState === 'visible');
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') markInactive();
      else resumeIfReady();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', markInactive);
    window.addEventListener('focus', resumeIfReady);
    return () => {
      controller.dispose();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', markInactive);
      window.removeEventListener('focus', resumeIfReady);
    };
  }, [resume]);

  useEffect(() => {
    if (!profileReady) return;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (connection?.saveData || connection?.effectiveType === '2g') return;
    const idleWindow = window as IdleWindow;
    if (!idleWindow.requestIdleCallback) return;
    let canceled = false;
    let idleHandle: number | undefined;
    let routeIndex = 0;
    const warmNextRoute = () => {
      if (canceled || routeIndex >= PRIMARY_ROUTE_PATHS.length) return;
      idleHandle = idleWindow.requestIdleCallback?.(
        () => {
          const nextRoute = PRIMARY_ROUTE_PATHS[routeIndex++];
          void preloadRoute(nextRoute).finally(warmNextRoute);
        },
        { timeout: 2_000 },
      );
    };
    const startTimer = window.setTimeout(warmNextRoute, 1_000);
    return () => {
      canceled = true;
      window.clearTimeout(startTimer);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }, [profileReady]);

  if (loading) return <LoadingScreen />;
  if (!profile) return <OnboardingPage />;
  const RoutePage = getRoutePage(path);

  return (
    <>
      <AppShell>
        <Suspense fallback={<RouteLoadingScreen />}>
          <RoutePage />
        </Suspense>
      </AppShell>
      <DailyReviewModal />
      <FirstDayGuide />
      <DailyEventOverlay />
      <TreasuryChallengeOverlay />
      <ProgressionOverlay />
      <CampfireRecapOverlay />
      <MonthlyCouncilOverlay />
      <UpdatePrompt />
      <RewardToast />
      <CompanionToast />
      <PartyBanterToast />
      <ErrorToast />
    </>
  );
}
