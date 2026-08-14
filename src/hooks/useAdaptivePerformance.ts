import { useEffect, useState } from 'react';
import {
  resolveAdaptivePerformanceProfile,
  type AdaptivePerformanceProfile,
} from '@/utils/adaptivePerformance';

interface NavigatorPerformanceHints extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: 'change', listener: () => void) => void;
    removeEventListener?: (type: 'change', listener: () => void) => void;
  };
}

function detectProfile(reducedMotion: boolean): AdaptivePerformanceProfile {
  const performanceNavigator = navigator as NavigatorPerformanceHints;
  return resolveAdaptivePerformanceProfile({
    reducedMotion,
    coarsePointer: window.matchMedia('(hover: none), (pointer: coarse)').matches,
    viewportWidth: window.innerWidth,
    hardwareConcurrency: performanceNavigator.hardwareConcurrency,
    deviceMemory: performanceNavigator.deviceMemory,
    saveData: performanceNavigator.connection?.saveData,
  });
}

export function useAdaptivePerformance(reducedMotion: boolean) {
  const [profile, setProfile] = useState<AdaptivePerformanceProfile>(() =>
    detectProfile(reducedMotion),
  );

  useEffect(() => {
    const pointer = window.matchMedia('(hover: none), (pointer: coarse)');
    const performanceNavigator = navigator as NavigatorPerformanceHints;
    const connection = performanceNavigator.connection;
    let resizeTimer: number | undefined;

    const updateProfile = () => setProfile(detectProfile(reducedMotion));
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateProfile, 140);
    };

    updateProfile();
    pointer.addEventListener('change', updateProfile);
    connection?.addEventListener?.('change', updateProfile);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.clearTimeout(resizeTimer);
      pointer.removeEventListener('change', updateProfile);
      connection?.removeEventListener?.('change', updateProfile);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const root = document.documentElement;
    const updateActivity = () => {
      root.dataset.appActivity = document.visibilityState === 'visible' ? 'active' : 'suspended';
    };

    root.dataset.performance = profile;
    updateActivity();
    document.addEventListener('visibilitychange', updateActivity);
    return () => {
      document.removeEventListener('visibilitychange', updateActivity);
      delete root.dataset.performance;
      delete root.dataset.appActivity;
    };
  }, [profile]);

  return profile;
}
