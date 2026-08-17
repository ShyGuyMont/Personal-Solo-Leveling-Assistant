import { describe, expect, it } from 'vitest';
import { getLiveSystemState, getSystemCycle, getSystemRealm } from '@/game/systemExperience';

describe('living System experience', () => {
  it('maps destinations to their companion realms', () => {
    expect(getSystemRealm('/training-hall')).toBe('training');
    expect(getSystemRealm('/party-chat')).toBe('party');
    expect(getSystemRealm('/cipher-study-lab')).toBe('cipher');
    expect(getSystemRealm('/status')).toBe('progression');
    expect(getSystemRealm('/missions')).toBe('system');
  });

  it('maps the local hour to an atmosphere cycle', () => {
    expect(getSystemCycle(6)).toBe('dawn');
    expect(getSystemCycle(14)).toBe('day');
    expect(getSystemCycle(19)).toBe('dusk');
    expect(getSystemCycle(2)).toBe('night');
  });

  it('prioritizes protective and milestone states', () => {
    const baseline = {
      online: true,
      recoveryActive: false,
      trialActive: false,
      classQualified: false,
      recentAscension: false,
      xpMultiplier: 1,
    };
    expect(getLiveSystemState(baseline)).toBe('stable');
    expect(getLiveSystemState({ ...baseline, classQualified: true })).toBe('rank-qualified');
    expect(getLiveSystemState({ ...baseline, classQualified: true, recoveryActive: true })).toBe(
      'recovery',
    );
    expect(getLiveSystemState({ ...baseline, online: false, trialActive: true })).toBe('offline');
  });
});
