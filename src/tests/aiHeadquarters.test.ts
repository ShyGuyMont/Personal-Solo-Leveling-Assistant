import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CANON_VOICE_PROFILES } from '@/config/aiVoices';
import { db } from '@/db/database';
import {
  createAiConversation,
  createCompanionMessage,
  createHunterMessage,
  approveAiRelationshipMemory,
  forgetAiRelationshipMemory,
  getAiRelationshipMemories,
  getRelevantApprovedMemories,
  getRecentAiConversations,
  saveAiMemoryCandidates,
  saveAiConversation,
} from '@/game/aiHeadquarters';
import { requestAiSpeech } from '@/services/aiHeadquarters';

describe('AI Headquarters local history', () => {
  beforeEach(async () => {
    await db.aiConversations.clear();
    await db.aiMemories.clear();
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
    });
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
});
