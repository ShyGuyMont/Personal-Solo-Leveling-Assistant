import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

interface Soulprint {
  name: string;
  title: string;
  domain: string;
  identity: string;
  rhythm: string;
  method: string;
  bonds: string;
  boundary: string;
  performance: string;
}

interface CompanionIntelligenceModule {
  COMPANION_INTELLIGENCE_VERSION: string;
  companionIds: string[];
  companionProfiles: Record<string, Soulprint>;
  aiVoiceNames: string[];
  aiVoiceAccents: Record<string, string>;
  baseInstructions: string;
  formatCompanionProfiles: () => string;
  buildAudienceInstruction: (audience: string, enabledIds?: string[]) => string;
  buildSystemInstructions: (
    audience: string,
    enabledIds?: string[],
    commandMode?: 'none' | 'propose',
  ) => string;
  selectIntelligenceRoute: (
    payload: { audience: string; message: string },
    env?: Record<string, string>,
  ) => { route: string; model: string; reasoningEffort: string };
  default: {
    fetch: (request: Request, env: Record<string, unknown>) => Promise<Response>;
  };
}

let intelligence: CompanionIntelligenceModule;

beforeAll(async () => {
  const moduleUrl = pathToFileURL(resolve(process.cwd(), 'worker/index.js')).href;
  intelligence = (await import(/* @vite-ignore */ moduleUrl)) as CompanionIntelligenceModule;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Companion Soulprint intelligence', () => {
  it('gives all ten companions complete and distinct identity directions', () => {
    expect(Object.keys(intelligence.companionProfiles)).toEqual(intelligence.companionIds);
    expect(intelligence.companionIds).toHaveLength(10);

    const performances = new Set<string>();
    for (const id of intelligence.companionIds) {
      const profile = intelligence.companionProfiles[id];
      for (const field of [
        profile.domain,
        profile.identity,
        profile.rhythm,
        profile.method,
        profile.bonds,
        profile.boundary,
        profile.performance,
      ]) {
        expect(field.length).toBeGreaterThan(35);
      }
      performances.add(profile.performance);
    }
    expect(performances.size).toBe(10);
    expect(intelligence.aiVoiceNames).toHaveLength(13);
    expect(intelligence.aiVoiceAccents.natural).toMatch(/without imposing/i);
  });

  it('keeps factual answers direct while preserving continuity and casual personality', () => {
    expect(intelligence.baseInstructions).toContain("Answer the Hunter's actual question first");
    expect(intelligence.baseInstructions).toContain('simple facts, math, definitions');
    expect(intelligence.baseInstructions).toContain('recent conversation history');
    expect(intelligence.baseInstructions).toContain('casual conversation');
    expect(intelligence.formatCompanionProfiles()).toContain('Future voice direction:');
    expect(intelligence.formatCompanionProfiles()).toContain('Relational signature:');
    expect(intelligence.baseInstructions).toContain('Approved Bond Memory');
    expect(intelligence.baseInstructions).toContain('memoryCandidates');
    expect(intelligence.baseInstructions).toContain("Director's Notes");
    expect(intelligence.baseInstructions).toContain('classification roadmap');
    expect(intelligence.baseInstructions).toContain('Selah may recommend Bible passages');
    expect(intelligence.baseInstructions).toContain('Cassian may analyze only');
  });

  it('routes casual direct talk economically and deeper counsel to Terra', () => {
    expect(
      intelligence.selectIntelligenceRoute({ audience: 'snow', message: 'How are you today?' }),
    ).toEqual({ route: 'quick', model: 'gpt-5.6-luna', reasoningEffort: 'low' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'How long until I reach World Class at my current pace?',
      }),
    ).toEqual({ route: 'counsel', model: 'gpt-5.6-terra', reasoningEffort: 'medium' });
    expect(
      intelligence.selectIntelligenceRoute({ audience: 'party', message: 'What do you think?' }),
    ).toMatchObject({ route: 'counsel', model: 'gpt-5.6-terra' });
    expect(
      intelligence.selectIntelligenceRoute(
        { audience: 'party', message: 'Help me plan.' },
        { OPENAI_TEXT_MODEL: 'forced-model' },
      ).model,
    ).toBe('forced-model');
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'Give me sovereign counsel and a comprehensive 90 day strategy.',
      }),
    ).toEqual({ route: 'sovereign', model: 'gpt-5.6-sol', reasoningEffort: 'high' });
  });

  it('requires a visible confirmation for commands and Private Grimoire recipes', () => {
    const instructions = intelligence.buildSystemInstructions('saffron', ['saffron'], 'propose');
    expect(instructions).toContain('only actions you may prepare');
    expect(instructions).toContain('Hunter must confirm');
    expect(instructions).toContain('Private Grimoire');
    expect(instructions).toContain('walk through today');
  });

  it('builds focused solo channels and non-repetitive party councils', () => {
    expect(intelligence.buildAudienceInstruction('rook')).toContain(
      'Return exactly one reply, set companionId to rook',
    );

    const party = intelligence.buildAudienceInstruction('party', ['snow', 'rook', 'cipher']);
    expect(party).toContain('snow, rook, cipher');
    expect(party).toContain('distinct contribution');
    expect(party).toContain('rotate participation');
  });

  it('reports the active soulprint version through the secure status route', async () => {
    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/status'),
      { OPENAI_API_KEY: 'configured', OPENAI_TEXT_MODEL: 'test-model' },
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      configured: true,
      intelligenceVersion: intelligence.COMPANION_INTELLIGENCE_VERSION,
      fastModel: 'test-model',
      intelligenceModel: 'test-model',
      apexModel: 'test-model',
      speechModel: 'gpt-4o-mini-tts',
      transcriptionModel: 'gpt-4o-transcribe',
    });
  });

  it('forges speech from the selected soulprint without exposing the API key', async () => {
    let openAiBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { 'content-type': 'audio/wav' },
        });
      }),
    );

    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/speech', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://system.test' },
        body: JSON.stringify({
          companionId: 'ember',
          text: 'One move. Right now.',
          voice: 'nova',
          accent: 'british',
          delivery: 'intense',
          cadence: 'rapid-fire',
          texture: 'bright',
          pace: 1.28,
          warmth: 2,
          energy: 5,
          expressiveness: 5,
          naturalism: 5,
          pauseDiscipline: 5,
        }),
      }),
      { OPENAI_API_KEY: 'test-key' },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-ai-model')).toBe('gpt-4o-mini-tts');
    expect(openAiBody).toMatchObject({
      model: 'gpt-4o-mini-tts',
      voice: 'nova',
      input: 'One move. Right now.',
      response_format: 'wav',
    });
    expect(response.headers.get('content-type')).toContain('audio/wav');
    expect(String(openAiBody?.instructions)).toContain('Ember, The Ignition');
    expect(String(openAiBody?.instructions)).toContain('clearly perceptible modern British');
    expect(String(openAiBody?.instructions)).toContain('approximately 198 spoken words per minute');
    expect(String(openAiBody?.instructions)).toContain('tough-skinned heat aimed at the obstacle');
    expect(String(openAiBody?.instructions)).toContain('focused emotional pressure');
    expect(String(openAiBody?.instructions)).toContain('minimal dead air');
    expect(String(openAiBody?.instructions)).toContain('crisp energized clarity');
    expect(String(openAiBody?.instructions)).toContain('restrained warmth');
    expect(String(openAiBody?.instructions)).toContain('maximum energy');
    expect(String(openAiBody?.instructions)).toContain('no over-enunciation');
    expect(JSON.stringify(openAiBody)).not.toContain('test-key');
  });

  it('transcribes a bounded microphone recording with app-only usage metadata', async () => {
    let openAiForm: FormData | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiForm = init.body as FormData;
        return new Response(
          JSON.stringify({
            text: 'How is everyone doing?',
            usage: { input_tokens: 120, output_tokens: 8, total_tokens: 128 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );
    const form = new FormData();
    form.append(
      'audio',
      new File([new Uint8Array([1, 2, 3])], 'voice.webm', { type: 'audio/webm' }),
    );
    form.append('durationSeconds', '3.5');

    const transcriptionRequest = {
      url: 'https://system.test/api/ai/transcribe',
      method: 'POST',
      headers: new Headers({ origin: 'https://system.test' }),
      formData: async () => form,
    } as Request;
    const response = await intelligence.default.fetch(transcriptionRequest, {
      OPENAI_API_KEY: 'test-key',
    });
    const payload = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      text: 'How is everyone doing?',
      model: 'gpt-4o-transcribe',
      audioSeconds: 3.5,
    });
    expect(openAiForm?.get('model')).toBe('gpt-4o-transcribe');
    expect(payload.usage).toMatchObject({ totalTokens: 128, exact: true });
  });

  it('places the selected soulprint above the Hunter message in the OpenAI request', async () => {
    let openAiBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: JSON.stringify({
                      title: 'Quick calculation',
                      replies: [{ companionId: 'rook', message: 'Ten. Clean answer.' }],
                      memoryCandidates: [],
                    }),
                  },
                ],
              },
            ],
            usage: {
              input_tokens: 100,
              input_tokens_details: { cached_tokens: 60 },
              output_tokens: 10,
              output_tokens_details: { reasoning_tokens: 4 },
              total_tokens: 110,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://system.test' },
        body: JSON.stringify({
          audience: 'rook',
          message: 'What is 5 + 5?',
          history: [],
          context: {
            hunter: {
              firstName: 'Hunter',
              systemTitle: 'The Awakened',
              level: 8,
              class: 'E',
              startingFocus: 'balanced',
            },
            today: {
              date: '2026-08-11',
              completedMissions: 2,
              availableMissions: 4,
              pendingMissionNames: ['Workout'],
            },
            momentum: [],
            party: { enabledCompanionIds: ['rook'] },
            state: { recoveryActive: false },
            bondMemory: { enabled: false, approved: [] },
          },
        }),
      }),
      { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
    );

    expect(response.status).toBe(200);
    expect(openAiBody).toBeDefined();
    const input = openAiBody?.input as Array<{ role: string; content: string }>;
    expect(input[0].role).toBe('system');
    expect(input[0].content).toContain('Companion soulprints:');
    expect(input[0].content).toContain("follow only Rook's soulprint");
    expect(input[0].content).toContain('[rook] Rook — The Vanguard');
    expect(input[0].content).not.toContain('[snow] Snow — The Constant');
    expect(input[1].content).toContain('What is 5 + 5?');
    expect(await response.clone().json()).toMatchObject({
      route: 'quick',
      reasoningEffort: 'low',
      usage: { cachedInputTokens: 60, reasoningTokens: 4 },
    });
  });

  it('returns local memory suggestions only when Bond Memory is enabled', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              output: [
                {
                  type: 'message',
                  content: [
                    {
                      type: 'output_text',
                      text: JSON.stringify({
                        title: 'Training preference',
                        replies: [{ companionId: 'snow', message: 'That fits you.' }],
                        memoryCandidates: [
                          { fact: 'The Hunter prefers morning workouts.', category: 'preference' },
                        ],
                      }),
                    },
                  ],
                },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );

    const makeRequest = (enabled: boolean) =>
      intelligence.default.fetch(
        new Request('https://system.test/api/ai/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: 'https://system.test' },
          body: JSON.stringify({
            audience: 'snow',
            message: 'I prefer morning workouts.',
            history: [],
            context: {
              party: { enabledCompanionIds: ['snow'] },
              bondMemory: { enabled, approved: [] },
            },
          }),
        }),
        { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
      );

    expect((await (await makeRequest(false)).json()).memoryCandidates).toEqual([]);
    expect((await (await makeRequest(true)).json()).memoryCandidates).toEqual([
      { fact: 'The Hunter prefers morning workouts.', category: 'preference' },
    ]);
  });
});
