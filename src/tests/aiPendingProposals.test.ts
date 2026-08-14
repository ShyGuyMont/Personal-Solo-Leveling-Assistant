import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import {
  clearPendingAiProposal,
  extractAiPendingProposal,
  getPendingAiProposal,
  savePendingAiProposal,
} from '@/game/aiPendingProposals';
import type { QuickLinkAction } from '@/game/aiQuickLink';
import type { AiHeadquartersReply } from '@/services/aiHeadquarters';

const action: QuickLinkAction = {
  actionId: 'mission:walk:complete',
  kind: 'complete_mission',
  missionId: 'walk',
  missionName: 'Daily Walk',
  label: 'Complete Daily Walk',
  description: 'Mark the mission complete.',
  impact: 'Awards the configured mission rewards once.',
  confirmation: 'Complete this mission?',
};

function reply(overrides: Partial<AiHeadquartersReply>): AiHeadquartersReply {
  return {
    model: 'test-model',
    title: 'Prepared action',
    replies: [{ companionId: 'snow', message: 'The preview is waiting.' }],
    memoryCandidates: [],
    ...overrides,
  };
}

describe('persistent AI action previews', () => {
  beforeEach(async () => {
    await db.appMetadata.where('id').startsWith('ai-pending-proposal:').delete();
  });

  it('extracts every supported companion mutation into one confirmation format', () => {
    const cases: Array<[AiHeadquartersReply, string]> = [
      [
        reply({
          commandProposal: {
            actionId: action.actionId,
            companionId: 'rook',
            summary: 'Walk verified and ready.',
            confirmation: 'Apply it?',
          },
        }),
        'command',
      ],
      [
        reply({
          operationProposal: {
            kind: 'prepare-training',
            companionId: 'ember',
            includeTraining: true,
            trainingLocation: 'home',
            includeKitchen: false,
            includeSanctuary: false,
            summary: 'Home circuit ready to roll.',
            confirmation: 'Prepare it?',
          },
        }),
        'operation',
      ],
      [
        reply({
          recipeProposal: {
            name: 'Test Bowl',
            codename: 'Clean Flame',
            servings: 2,
            prepMinutes: 10,
            cookMinutes: 20,
            costTier: '$',
            equipment: 'Pan',
            plate: 'Bowl',
            ingredients: ['1 cup rice', '1 lb salmon'],
            steps: ['Cook rice', 'Cook salmon'],
            swaps: [],
            storage: 'Chill promptly.',
            safety: 'Cook fish safely.',
            confirmation: 'Save it?',
          },
        }),
        'recipe',
      ],
      [
        reply({
          contentProposal: {
            title: 'Tokon First Look',
            platform: 'youtube',
            contentType: 'long-form',
            pillar: 'Beginner chaos',
            hook: 'A real first week.',
            audiencePromise: 'Honest improvement.',
            nextAction: 'Record one session.',
            notes: 'No fake expertise.',
            confirmation: 'Add it?',
          },
        }),
        'content',
      ],
      [
        reply({
          campaignProposal: {
            name: 'Tokon Reawakening',
            strategy: 'Two anchors and honest Shorts.',
            weeks: 4,
            operations: [
              {
                title: 'Anchor One',
                platform: 'youtube',
                contentType: 'long-form',
                pillar: 'Beginner chaos',
                hook: 'Week one honestly.',
                audiencePromise: 'A real starting point.',
                nextAction: 'Record session one.',
                notes: 'Week one.',
              },
              {
                title: 'First Short',
                platform: 'youtube-shorts',
                contentType: 'short-form',
                pillar: 'Beginner chaos',
                hook: 'The cleanest mistake.',
                audiencePromise: 'One funny lesson.',
                nextAction: 'Mark one clip.',
                notes: 'After anchor one.',
              },
            ],
            confirmation: 'Confirm the campaign?',
          },
        }),
        'campaign',
      ],
      [
        reply({
          calendarProposal: {
            action: 'create',
            eventId: '',
            title: 'Cook with Saffron',
            description: 'Reserve cooking time; recipe remains in Kitchen.',
            category: 'personal',
            startAt: '2026-08-16T21:00:00.000Z',
            endAt: '2026-08-16T22:00:00.000Z',
            allDay: false,
            recurrence: 'none',
            recurrenceInterval: 1,
            recurrenceEndsOn: '',
            location: 'Kitchen',
            linkedCompanionId: 'saffron',
            linkedRealm: 'kitchen',
            confirmation: 'Reserve Sunday?',
          },
        }),
        'calendar',
      ],
      [
        reply({
          creatorUpdateProposal: {
            projectId: 'project-tokon',
            projectTitle: 'Marvel Tokon Reawakening',
            status: 'record',
            nextAction: 'Film session one.',
            notesAppend: 'Reawakening council approved the recording direction.',
            confirmation: 'Move this exact project to recording?',
          },
        }),
        'creator-update',
      ],
      [
        reply({
          arcNoteProposal: {
            title: 'Akoura Incident Consequences',
            kind: 'plot',
            text: 'A proposed canon note grounded in the current Story Room discussion.',
            tags: ['Akoura Incident', 'consequences'],
            characterNames: ['Yoshanai'],
            confirmation: 'Save this preview to the Canon Vault?',
          },
        }),
        'arc-note',
      ],
    ];

    expect(
      cases.map(([candidate]) => extractAiPendingProposal(candidate, [action], 'party')?.kind),
    ).toEqual(cases.map(([, kind]) => kind));
  });

  it('survives navigation or reload until applied or dismissed', async () => {
    const proposal = extractAiPendingProposal(
      reply({
        campaignProposal: {
          name: 'Two-step return',
          strategy: 'Small and real.',
          weeks: 1,
          operations: [
            {
              title: 'One',
              platform: 'youtube',
              contentType: 'long-form',
              pillar: 'Return',
              hook: 'Start.',
              audiencePromise: 'Honesty.',
              nextAction: 'Record.',
              notes: 'First.',
            },
            {
              title: 'Two',
              platform: 'youtube-shorts',
              contentType: 'short-form',
              pillar: 'Return',
              hook: 'Moment.',
              audiencePromise: 'Payoff.',
              nextAction: 'Clip.',
              notes: 'Second.',
            },
          ],
          confirmation: 'Save both?',
        },
      }),
      [action],
      'haven',
    );
    expect(proposal?.kind).toBe('campaign');
    await savePendingAiProposal('conversation:test', proposal!);
    expect((await getPendingAiProposal('conversation:test'))?.kind).toBe('campaign');
    await clearPendingAiProposal('conversation:test');
    expect(await getPendingAiProposal('conversation:test')).toBeUndefined();
  });
});
