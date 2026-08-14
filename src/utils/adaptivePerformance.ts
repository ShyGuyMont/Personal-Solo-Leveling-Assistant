export type AdaptivePerformanceProfile = 'full' | 'balanced' | 'efficient';

export interface AdaptivePerformanceSignals {
  reducedMotion: boolean;
  coarsePointer: boolean;
  viewportWidth: number;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  saveData?: boolean;
}

export interface ParticleRenderBudget {
  maxFps: number;
  maxPixelRatio: number;
  particleCount: number;
  shadowBlur: number;
}

export function resolveAdaptivePerformanceProfile(
  signals: AdaptivePerformanceSignals,
): AdaptivePerformanceProfile {
  if (signals.reducedMotion || signals.saveData) return 'efficient';

  const phone = signals.coarsePointer && signals.viewportWidth <= 900;
  const constrainedProcessor =
    signals.hardwareConcurrency !== undefined && signals.hardwareConcurrency <= 4;
  const constrainedMemory = signals.deviceMemory !== undefined && signals.deviceMemory <= 4;

  if (phone && (constrainedProcessor || constrainedMemory)) return 'efficient';
  if (phone || constrainedProcessor || constrainedMemory) return 'balanced';
  return 'full';
}

export function getParticleRenderBudget(input: {
  profile: AdaptivePerformanceProfile;
  intensity: 'subtle' | 'standard' | 'intense';
  mobile: boolean;
}): ParticleRenderBudget {
  if (input.profile === 'efficient') {
    return {
      maxFps: 20,
      maxPixelRatio: 1,
      particleCount: input.mobile
        ? input.intensity === 'intense'
          ? 12
          : 8
        : input.intensity === 'intense'
          ? 24
          : 16,
      shadowBlur: input.intensity === 'intense' ? 3 : 1,
    };
  }

  if (input.profile === 'balanced') {
    return {
      maxFps: 30,
      maxPixelRatio: 1,
      particleCount: input.mobile
        ? input.intensity === 'intense'
          ? 18
          : 12
        : input.intensity === 'intense'
          ? 40
          : 26,
      shadowBlur: input.intensity === 'intense' ? 5 : 3,
    };
  }

  return {
    maxFps: 60,
    maxPixelRatio: 1.5,
    particleCount: input.mobile
      ? input.intensity === 'intense'
        ? 34
        : 20
      : input.intensity === 'intense'
        ? 66
        : 40,
    shadowBlur: input.intensity === 'intense' ? 9 : 5,
  };
}
