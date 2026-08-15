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
    const conserveEnergy = profile !== 'full';
    let idleTimer: number | undefined;

    const clearIdleTimer = () => {
      window.clearTimeout(idleTimer);
      idleTimer = undefined;
    };
    const enterIdle = () => {
      idleTimer = undefined;
      if (document.visibilityState === 'visible') root.dataset.renderActivity = 'idle';
    };
    const markRenderActive = () => {
      root.dataset.renderActivity = 'active';
      clearIdleTimer();
      if (conserveEnergy && document.visibilityState === 'visible') {
        idleTimer = window.setTimeout(enterIdle, 3_500);
      }
    };
    const updateActivity = () => {
      root.dataset.appActivity = document.visibilityState === 'visible' ? 'active' : 'suspended';
      if (document.visibilityState === 'visible') markRenderActive();
      else {
        clearIdleTimer();
        root.dataset.renderActivity = 'idle';
      }
    };

    root.dataset.performance = profile;
    updateActivity();
    document.addEventListener('visibilitychange', updateActivity);
    if (conserveEnergy) {
      window.addEventListener('pointerdown', markRenderActive, { passive: true });
      window.addEventListener('touchstart', markRenderActive, { passive: true });
      window.addEventListener('scroll', markRenderActive, { passive: true });
      window.addEventListener('keydown', markRenderActive);
    }
    return () => {
      clearIdleTimer();
      document.removeEventListener('visibilitychange', updateActivity);
      window.removeEventListener('pointerdown', markRenderActive);
      window.removeEventListener('touchstart', markRenderActive);
      window.removeEventListener('scroll', markRenderActive);
      window.removeEventListener('keydown', markRenderActive);
      delete root.dataset.performance;
      delete root.dataset.appActivity;
      delete root.dataset.renderActivity;
    };
  }, [profile]);

  return profile;
}
