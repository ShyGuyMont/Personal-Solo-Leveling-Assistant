import { describe, expect, it } from 'vitest';
import {
  acquireQuickLinkTransmission,
  buildQuickLinkActionCatalog,
  canBeginQuickLinkTransmission,
  isCalendarCouncilRequest,
  navigationAcknowledgement,
  parsePartyMembershipCommand,
  parseQuickLinkAddress,
  parseQuickNavigationCommand,
  releaseQuickLinkTransmission,
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
    expect(parseQuickLinkAddress('something with chicken and rice', 'saffron')).toEqual({
      audience: 'saffron',
      message: 'something with chicken and rice',
      explicitlyAddressed: false,
    });
    expect(parseQuickLinkAddress('Vesper, help me plan a video')).toEqual({
      audience: 'haven',
      message: 'help me plan a video',
      explicitlyAddressed: true,
    });
  });

  it('opens Cipher Library and Evolution Council from natural navigation commands', () => {
    expect(parseQuickNavigationCommand('Cipher, open the engineering library')?.route).toBe(
      '/cipher-library',
    );
    expect(parseQuickNavigationCommand('Snow, take me to the Evolution Council')?.route).toBe(
      '/system-debrief',
    );
    expect(parseQuickNavigationCommand('Cipher, open the phase noise simulator')?.route).toBe(
      '/cipher-study-lab',
    );
    expect(parseQuickNavigationCommand('Cipher, take me to your studio tech vault')?.route).toBe(
      '/cipher-studio-tech',
    );
  });

  it('opens Party Council for everyone or multiple named companions', () => {
    expect(parseQuickLinkAddress('Everyone, how are you doing?').audience).toBe('party');
    expect(parseQuickLinkAddress('All I want is a simple answer').audience).toBe('snow');
    expect(parseQuickLinkAddress('Rook and Mira, build me a recovery plan').audience).toBe('party');
  });

  it('understands natural Party Commons membership commands without misreading normal requests', () => {
    expect(parsePartyMembershipCommand('Snow, add Saffron to the chat')).toEqual({
      action: 'add',
      companionIds: ['snow', 'saffron'],
    });
    expect(parsePartyMembershipCommand('Remove Cipher from this conversation')).toEqual({
      action: 'remove',
      companionIds: ['cipher'],
    });
    expect(parsePartyMembershipCommand('Everyone out except Snow and Quill')).toEqual({
      action: 'only',
      companionIds: ['snow', 'quill'],
    });
    expect(parsePartyMembershipCommand('Bring the whole party in')).toEqual({
      action: 'all',
      companionIds: [],
    });
    expect(parsePartyMembershipCommand('Snow, send me to Saffron for a recipe')).toBeUndefined();
  });

  it('routes every specialist name and legacy alias without losing the relay brief', () => {
    const specialists = [
      ['Snow', 'snow'],
      ['Rook', 'rook'],
      ['Selah', 'selah'],
      ['Cipher', 'cipher'],
      ['Haven', 'haven'],
      ['Vesper', 'haven'],
      ['Ember', 'ember'],
      ['Mira', 'mira'],
      ['Amara', 'amara'],
      ['Cassian', 'cassian'],
      ['Saffron', 'saffron'],
      ['Quill', 'quill'],
      ['Kairo', 'kairo'],
    ] as const;

    for (const [spokenName, audience] of specialists) {
      expect(parseQuickLinkAddress(`${spokenName}, keep this exact relay brief`, 'snow')).toEqual({
        audience,
        message: 'keep this exact relay brief',
        explicitlyAddressed: true,
      });
    }
  });

  it('allows the confirmed specialist handoff while protecting every other pending command', () => {
    expect(
      canBeginQuickLinkTransmission({ hasCommand: false, hasHandoff: true }, 'confirmed-handoff'),
    ).toBe(true);
    expect(canBeginQuickLinkTransmission({ hasCommand: false, hasHandoff: true }, 'message')).toBe(
      false,
    );
    expect(
      canBeginQuickLinkTransmission({ hasCommand: true, hasHandoff: true }, 'confirmed-handoff'),
    ).toBe(false);
    expect(canBeginQuickLinkTransmission({ hasCommand: true, hasHandoff: false })).toBe(false);
    expect(canBeginQuickLinkTransmission({ hasCommand: false, hasHandoff: false })).toBe(true);
  });

  it('rejects overlapping transmissions until the active request releases its lock', () => {
    const lock = { current: false };

    expect(acquireQuickLinkTransmission(lock)).toBe(true);
    expect(acquireQuickLinkTransmission(lock)).toBe(false);
    releaseQuickLinkTransmission(lock);
    expect(acquireQuickLinkTransmission(lock)).toBe(true);
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
    expect(parseQuickNavigationCommand('Take me to Creator Forge')).toEqual({
      route: '/creator-forge',
      label: 'Creator Forge',
    });
    expect(parseQuickNavigationCommand('Tell me about gym recovery')).toBeUndefined();
    expect(parseQuickNavigationCommand('How is my budget looking?')).toBeUndefined();
    expect(parseQuickNavigationCommand('I want to discuss my schedule')).toBeUndefined();
    expect(parseQuickNavigationCommand('Could a creator forge a stronger hook?')).toBeUndefined();
    expect(navigationAcknowledgement('snow', 'Training Hall')).toContain('Training Hall');
  });

  it('opens Calendar Council only for an explicit scheduling change', () => {
    expect(isCalendarCouncilRequest('Cassian, schedule a budget review Sunday at 7 PM')).toBe(true);
    expect(isCalendarCouncilRequest('Add a recurring Body Diagnostic check-in every Sunday')).toBe(
      true,
    );
    expect(isCalendarCouncilRequest('Cancel my appointment tomorrow')).toBe(true);
    expect(isCalendarCouncilRequest('What does my schedule look like tomorrow?')).toBe(false);
    expect(isCalendarCouncilRequest('I would like to cook on Sunday')).toBe(false);
    expect(isCalendarCouncilRequest('Saffron, add this recipe to the Grimoire')).toBe(false);
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
    expect(actions[0].impact).toContain('40 account XP');
    expect(actions[0].confirmation).toContain('honestly complete');
  });
});
