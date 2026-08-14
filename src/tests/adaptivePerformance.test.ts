import { describe, expect, it } from 'vitest';
import {
  getParticleRenderBudget,
  resolveAdaptivePerformanceProfile,
} from '@/utils/adaptivePerformance';

describe('adaptive performance engine', () => {
  it('preserves the full cinematic profile on capable pointer devices', () => {
    expect(
      resolveAdaptivePerformanceProfile({
        reducedMotion: false,
        coarsePointer: false,
        viewportWidth: 1440,
        hardwareConcurrency: 12,
        deviceMemory: 16,
      }),
    ).toBe('full');
  });

  it('automatically balances ordinary phones', () => {
    expect(
      resolveAdaptivePerformanceProfile({
        reducedMotion: false,
        coarsePointer: true,
        viewportWidth: 390,
        hardwareConcurrency: 6,
      }),
    ).toBe('balanced');
  });

  it('protects constrained phones and reduced-motion sessions', () => {
    expect(
      resolveAdaptivePerformanceProfile({
        reducedMotion: false,
        coarsePointer: true,
        viewportWidth: 390,
        hardwareConcurrency: 4,
      }),
    ).toBe('efficient');
    expect(
      resolveAdaptivePerformanceProfile({
        reducedMotion: true,
        coarsePointer: false,
        viewportWidth: 1440,
      }),
    ).toBe('efficient');
  });

  it('cuts mobile atmosphere work without removing it', () => {
    const full = getParticleRenderBudget({
      profile: 'full',
      intensity: 'intense',
      mobile: true,
    });
    const balanced = getParticleRenderBudget({
      profile: 'balanced',
      intensity: 'intense',
      mobile: true,
    });

    expect(balanced.maxFps).toBe(30);
    expect(balanced.particleCount).toBeLessThan(full.particleCount);
    expect(balanced.shadowBlur).toBeLessThan(full.shadowBlur);
    expect(balanced.particleCount).toBeGreaterThan(0);
  });
});
