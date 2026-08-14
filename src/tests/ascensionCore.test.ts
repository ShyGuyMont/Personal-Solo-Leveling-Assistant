import { describe, expect, it } from 'vitest';
import { buildAscensionCoreProjection, buildAscensionCoreVitality } from '@/game/ascensionCore';

const baseline = {
  dailyCompleted: 2,
  dailyTotal: 6,
  currentLevelXp: 40,
  xpToNextLevel: 100,
  currentStreak: 5,
  nextClass: 'E' as const,
  qualifiedForNextClass: false,
  clearedClassGates: 2,
  totalClassGates: 6,
};

describe('Sovereign Ascension Core', () => {
  it('turns live progression into exact Core telemetry', () => {
    expect(buildAscensionCoreProjection(baseline)).toMatchObject({
      state: 'active',
      dailyCharge: 33,
      levelCharge: 40,
      gateDisplay: '2/6',
      href: '/missions',
      actionLabel: 'Continue directives',
    });
  });

  it('routes a fully synchronized day toward the long-range Class path', () => {
    expect(
      buildAscensionCoreProjection({ ...baseline, dailyCompleted: 6, currentStreak: 12 }),
    ).toMatchObject({
      state: 'synchronized',
      dailyCharge: 100,
      href: '/status',
      headline: 'Daily core fully synchronized',
    });
  });

  it('elevates a genuinely qualified next Class above ordinary daily work', () => {
    expect(
      buildAscensionCoreProjection({
        ...baseline,
        qualifiedForNextClass: true,
        clearedClassGates: 6,
      }),
    ).toMatchObject({
      state: 'advancement-ready',
      gateDisplay: '6/6',
      actionLabel: 'Enter advancement',
      href: '/status',
    });
  });

  it('stabilizes the artifact after final World Class classification', () => {
    expect(buildAscensionCoreProjection({ ...baseline, nextClass: undefined })).toMatchObject({
      state: 'world-class',
      gateDisplay: 'MAX',
      headline: 'World Class core stabilized',
    });
  });

  it('clamps malformed progress instead of projecting impossible charge', () => {
    expect(
      buildAscensionCoreProjection({
        ...baseline,
        dailyCompleted: 20,
        dailyTotal: 4,
        currentLevelXp: -20,
      }),
    ).toMatchObject({ dailyCharge: 100, levelCharge: 0 });
  });

  it('keeps the Core visibly alive before the first directive is complete', () => {
    expect(buildAscensionCoreVitality(0)).toEqual({
      particlesPerOrbit: 5,
      sparkParticles: 10,
      phase: 'dormant',
    });
  });

  it('intensifies the living field as daily synchronization rises', () => {
    expect(buildAscensionCoreVitality(100)).toEqual({
      particlesPerOrbit: 10,
      sparkParticles: 20,
      phase: 'synchronized',
    });
  });

  it('changes its living rhythm at safe synchronization thresholds', () => {
    expect(buildAscensionCoreVitality(25).phase).toBe('stirring');
    expect(buildAscensionCoreVitality(65).phase).toBe('surging');
    expect(buildAscensionCoreVitality(99).phase).toBe('surging');
  });

  it('clamps malformed vitality without creating runaway particle fields', () => {
    expect(buildAscensionCoreVitality(-50)).toEqual({
      particlesPerOrbit: 5,
      sparkParticles: 10,
      phase: 'dormant',
    });
    expect(buildAscensionCoreVitality(900)).toEqual({
      particlesPerOrbit: 10,
      sparkParticles: 20,
      phase: 'synchronized',
    });
    expect(buildAscensionCoreVitality(Number.NaN)).toEqual({
      particlesPerOrbit: 5,
      sparkParticles: 10,
      phase: 'dormant',
    });
  });
});
