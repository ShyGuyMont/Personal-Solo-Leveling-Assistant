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
  buildSystemInstructions: (audience: string, enabledIds?: string[]) => string;
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
          accent: 'natural',
          pace: 1.1,
          warmth: 2,
          energy: 5,
          expressiveness: 5,
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
    expect(String(openAiBody?.instructions)).toContain('without imposing a regional accent');
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
            usage: { input_tokens: 100, output_tokens: 10, total_tokens: 110 },
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
