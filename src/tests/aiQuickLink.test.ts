import { describe, expect, it } from 'vitest';
import {
  buildQuickLinkActionCatalog,
  navigationAcknowledgement,
  parseQuickLinkAddress,
  parseQuickNavigationCommand,
} from '@/game/aiQuickLink';
import type { DailyMissionRecord, MissionDefinition } from '@/types/game';

describe('Companion Quick Link', () => {
  it('addresses a named companion and defaults unaddressed talk to Snow', () => {
    expect(parseQuickLinkAddress('Snow, how close am I to World Class?')).toEqual({
      audience: 'snow',
      message: 'how close am I to World Class?',
      explicitlyAddressed: true,
    });
    expect(parseQuickLinkAddress('What should I focus on today?')).toEqual({
      audience: 'snow',
      message: 'What should I focus on today?',
      explicitlyAddressed: false,
    });
  });

  it('opens Party Council for everyone or multiple named companions', () => {
    expect(parseQuickLinkAddress('Everyone, how are you doing?').audience).toBe('party');
    expect(parseQuickLinkAddress('All I want is a simple answer').audience).toBe('snow');
    expect(parseQuickLinkAddress('Rook and Mira, build me a recovery plan').audience).toBe('party');
  });

  it('recognizes intentional navigation without hijacking ordinary conversation', () => {
    expect(parseQuickNavigationCommand('Take me to the Training Hall')).toEqual({
      route: '/training-hall',
      label: 'Training Hall',
    });
    expect(parseQuickNavigationCommand('Open the Kitchen')).toEqual({
      route: '/kitchen',
      label: 'Kitchen',
    });
    expect(parseQuickNavigationCommand('Tell me about gym recovery')).toBeUndefined();
    expect(navigationAcknowledgement('snow', 'Training Hall')).toContain('Training Hall');
  });

  it('builds only explicit confirmation-gated actions from today’s real mission state', () => {
    const mission = {
      id: 'prayer',
      name: 'Prayer',
      shortName: 'Prayer',
      description: 'Pray.',
      category: 'faith',
      method: 'toggle',
      accountXp: 20,
      statRewards: [],
      enabled: true,
      isCore: false,
      allowNotes: false,
      detailFields: [],
      recoveryEligible: true,
    } satisfies MissionDefinition;
    const record = {
      id: '2026-08-12:prayer',
      date: '2026-08-12',
      missionId: 'prayer',
      status: 'pending',
      details: {},
      updatedAt: '2026-08-12T12:00:00.000Z',
      protectedException: false,
    } satisfies DailyMissionRecord;

    const actions = buildQuickLinkActionCatalog([mission], [record]);
    expect(actions.map((action) => action.actionId)).toEqual([
      'mission:prayer:complete',
      'mission:prayer:skip',
      'mission:prayer:fail',
    ]);
    expect(actions[0].impact).toContain('20 base XP');
    expect(actions[0].confirmation).toContain('honestly complete');
  });
});
