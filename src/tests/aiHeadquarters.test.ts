import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CANON_VOICE_PROFILES } from '@/config/aiVoices';
import { db } from '@/db/database';
import {
  addAiConversationParticipants,
  createAiConversation,
  createCompanionMessage,
  createHunterMessage,
  approveAiRelationshipMemory,
  forgetAiRelationshipMemory,
  getAiRelationshipMemories,
  getContinuingAiConversation,
  getAiConversationParticipantIds,
  getRelevantApprovedMemories,
  getRecentAiConversations,
  saveAiMemoryCandidates,
  saveAiConversation,
  removeAiConversationParticipants,
} from '@/game/aiHeadquarters';
import {
  clearPendingAiTransmission,
  getPendingAiTransmission,
  savePendingAiTransmission,
} from '@/game/aiTransmissions';
import {
  requestAiHeadquartersReply,
  requestAiSpeech,
  resumeAiHeadquartersReply,
  type AiProgressContext,
} from '@/services/aiHeadquarters';

describe('AI Headquarters local history', () => {
  beforeEach(async () => {
    await db.aiConversations.clear();
    await db.aiMemories.clear();
    await db.appMetadata.delete('ai-pending-transmission:quick-link');
    await db.appMetadata.delete('ai-pending-transmission:headquarters');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores a party exchange locally and returns the newest conversation first', async () => {
    const first = createAiConversation('party', '2026-08-11T12:00:00.000Z');
    await saveAiConversation({
      ...first,
      title: 'First council',
      messages: [
        createHunterMessage('  Help me make a plan.  ', '2026-08-11T12:00:01.000Z'),
        createCompanionMessage(
          'cipher',
          '  We start with one executable step.  ',
          '2026-08-11T12:00:02.000Z',
          '  Start with one executable step.  ',
        ),
      ],
      updatedAt: '2026-08-11T12:00:02.000Z',
    });

    const newest = createAiConversation('mira', '2026-08-11T13:00:00.000Z');
    await saveAiConversation(newest);

    const conversations = await getRecentAiConversations();
    expect(conversations.map((conversation) => conversation.id)).toEqual([newest.id, first.id]);
    expect(conversations[1].messages[0].message).toBe('Help me make a plan.');
    expect(conversations[1].messages[1]).toMatchObject({
      role: 'companion',
      companionId: 'cipher',
      message: 'We start with one executable step.',
      voiceSummary: 'Start with one executable step.',
    });
  });

  it('expands a direct link into Party Commons without losing its history', () => {
    const direct = createAiConversation('snow', '2026-08-11T12:00:00.000Z');
    direct.messages.push(createHunterMessage('Keep this context.'));

    const commons = addAiConversationParticipants(direct, ['saffron']);
    expect(commons).toMatchObject({
      id: direct.id,
      audience: 'party',
      kind: 'commons',
      participantIds: ['snow', 'saffron'],
    });
    expect(commons.messages[0].message).toBe('Keep this context.');

    const privateAgain = removeAiConversationParticipants(commons, ['saffron']);
    expect(privateAgain).toMatchObject({ audience: 'snow', kind: 'direct' });
    expect(getAiConversationParticipantIds(privateAgain)).toEqual(['snow']);
  });

  it('continues only the exact shared room and preserves the spoiler-room identity', async () => {
    const spoilerRoom = createAiConversation('party', '2026-08-11T12:00:00.000Z', {
      kind: 'spoiler-room',
      participantIds: ['snow', 'quill'],
    });
    await saveAiConversation(spoilerRoom);

    await expect(
      getContinuingAiConversation('party', new Date('2026-08-11T13:00:00.000Z'), 24, {
        kind: 'spoiler-room',
        participantIds: ['quill', 'snow'],
      }),
    ).resolves.toMatchObject({ id: spoilerRoom.id, kind: 'spoiler-room' });

    await expect(
      getContinuingAiConversation('party', new Date('2026-08-11T13:00:00.000Z'), 24, {
        kind: 'commons',
        participantIds: ['snow', 'saffron'],
      }),
    ).resolves.toMatchObject({ kind: 'commons', participantIds: ['snow', 'saffron'] });
  });

  it('keeps candidate memories inactive until the Hunter approves them', async () => {
    const conversation = createAiConversation('rook', '2026-08-11T14:00:00.000Z');
    const [candidate] = await saveAiMemoryCandidates(
      [{ fact: 'The Hunter prefers morning workouts.', category: 'preference' }],
      'rook',
      conversation.id,
    );

    expect((await getAiRelationshipMemories())[0].status).toBe('pending');
    expect(await getRelevantApprovedMemories('rook')).toEqual([]);

    await approveAiRelationshipMemory(candidate.id);
    expect((await getRelevantApprovedMemories('rook'))[0].fact).toContain('morning workouts');
    expect(await getRelevantApprovedMemories('snow')).toEqual([]);
    expect(await getRelevantApprovedMemories('party')).toHaveLength(1);

    await forgetAiRelationshipMemory(candidate.id);
    expect(await getAiRelationshipMemories()).toEqual([]);
  });

  it('keeps one recoverable text transmission pointer per conversation surface', async () => {
    await savePendingAiTransmission({
      surface: 'quick-link',
      transmissionId: 'transmission_1234567890abcdef',
      conversationId: 'ai:test-conversation',
      hunterMessageId: 'ai:test-message',
      audience: 'snow',
      startedAt: new Date().toISOString(),
    });

    expect(await getPendingAiTransmission('quick-link')).toMatchObject({
      transmissionId: 'transmission_1234567890abcdef',
      conversationId: 'ai:test-conversation',
      audience: 'snow',
    });

    await clearPendingAiTransmission('quick-link', 'different-transmission-id');
    expect(await getPendingAiTransmission('quick-link')).toBeDefined();
    await clearPendingAiTransmission('quick-link', 'transmission_1234567890abcdef');
    expect(await getPendingAiTransmission('quick-link')).toBeUndefined();
  });

  it('recovers a completed owner-bound transmission without resending the Hunter request', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            model: 'gpt-5.6-terra',
            route: 'counsel',
            reasoningEffort: 'medium',
            title: 'Recovered counsel',
            replies: [{ companionId: 'snow', message: 'I finished while you were away.' }],
            memoryCandidates: [],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(resumeAiHeadquartersReply('transmission_1234567890abcdef')).resolves.toMatchObject(
      {
        title: 'Recovered counsel',
        route: 'counsel',
      },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai/transmissions/transmission_1234567890abcdef',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('sends every audible Voice Forge control through the secure speech request', async () => {
    let requestBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        requestBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: {
            'content-type': 'audio/wav',
            'x-ai-model': 'gpt-4o-mini-tts',
            'x-ai-characters': '24',
          },
        });
      }),
    );

    await requestAiSpeech({
      companionId: 'snow',
      text: 'We are testing the forge.',
      profile: {
        ...CANON_VOICE_PROFILES.snow,
        voice: 'verse',
        accent: 'british',
        delivery: 'playful',
        cadence: 'rapid-fire',
        texture: 'textured',
        register: 'high-mid',
        resonance: 'forward',
        performanceTake: 'dynamic',
        pace: 1.55,
        warmth: 2,
        energy: 4,
        expressiveness: 5,
        naturalism: 4,
        pauseDiscipline: 5,
        intonation: 5,
        articulation: 4,
        emotionalRange: 5,
      },
    });

    expect(requestBody).toMatchObject({
      companionId: 'snow',
      voice: 'verse',
      accent: 'british',
      delivery: 'playful',
      cadence: 'rapid-fire',
      texture: 'textured',
      register: 'high-mid',
      resonance: 'forward',
      performanceTake: 'dynamic',
      pace: 1.55,
      warmth: 2,
      energy: 4,
      expressiveness: 5,
      naturalism: 4,
      pauseDiscipline: 5,
      intonation: 5,
      articulation: 4,
      emotionalRange: 5,
      scene: 'neutral',
    });
  });

  it('keeps Cartesia speed separate from the tuned OpenAI fallback pace', async () => {
    let requestBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        requestBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: {
            'content-type': 'audio/wav',
            'x-ai-model': 'cartesia/sonic-3.5',
            'x-ai-provider': 'cartesia',
            'x-ai-characters': '24',
          },
        });
      }),
    );

    await requestAiSpeech({
      companionId: 'snow',
      text: 'We are testing Cartesia speed.',
      provider: 'cartesia',
      profile: {
        ...CANON_VOICE_PROFILES.snow,
        cartesiaVoiceId: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b',
        cartesiaSpeed: 0.9,
        pace: 1.55,
      },
    });

    expect(requestBody).toMatchObject({
      provider: 'cartesia',
      cartesiaVoiceId: '6ccbfb76-1fc6-48f7-b71d-91ac6298247b',
      pace: 0.9,
    });
    expect(CANON_VOICE_PROFILES.snow.pace).not.toBe(0.9);
  });

  it('sends exact room membership and handoff context through the secure link', async () => {
    let requestBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        requestBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            model: 'gpt-5.6-terra',
            route: 'counsel',
            reasoningEffort: 'medium',
            title: 'Party Commons',
            replies: [{ companionId: 'saffron', message: 'I am in. What are we cooking?' }],
            memoryCandidates: [],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    await requestAiHeadquartersReply({
      audience: 'party',
      participantIds: ['snow', 'saffron'],
      roomKind: 'commons',
      leadCompanionId: 'saffron',
      partyEvent: {
        kind: 'handoff',
        companionIds: ['saffron'],
        initiatedBy: 'snow',
        summary: 'Saffron owns the Kitchen request.',
      },
      message: 'Help me build dinner.',
      history: [],
      context: {} as AiProgressContext,
      commandMode: 'propose',
      transmissionId: 'transmission_party_commons_test',
    });

    expect(requestBody).toMatchObject({
      audience: 'party',
      participantIds: ['snow', 'saffron'],
      roomKind: 'commons',
      leadCompanionId: 'saffron',
      partyEvent: {
        kind: 'handoff',
        companionIds: ['saffron'],
        initiatedBy: 'snow',
      },
      commandMode: 'propose',
    });
  });
});
