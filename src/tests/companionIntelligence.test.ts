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
  YOUTUBE_READONLY_SCOPES: string[];
  companionIds: string[];
  companionProfiles: Record<string, Soulprint>;
  aiVoiceNames: string[];
  aiVoiceAccents: Record<string, string>;
  getRealtimeVoice: (voice: string) => string;
  buildRealtimeInstructions: (
    profile: Record<string, unknown>,
    context: Record<string, unknown>,
  ) => string;
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
  buildYouTubeAnalyticsWindow: (
    now?: Date,
    periodDays?: number,
  ) => {
    startDate: string;
    endDate: string;
    periodDays: number;
  };
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
  it('keeps the YouTube Studio link strictly read-only', () => {
    expect(intelligence.YOUTUBE_READONLY_SCOPES).toEqual([
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ]);
    expect(intelligence.YOUTUBE_READONLY_SCOPES.join(' ')).not.toMatch(
      /youtube\.upload|youtube\.force-ssl|youtubepartner|monetary/i,
    );
  });

  it('builds an inclusive 28-day Studio analytics window across month boundaries', () => {
    expect(intelligence.buildYouTubeAnalyticsWindow(new Date('2026-08-12T23:59:59.000Z'))).toEqual({
      startDate: '2026-07-16',
      endDate: '2026-08-12',
      periodDays: 28,
    });
  });

  it('builds the inclusive one-year History Lens window without changing permissions', () => {
    expect(
      intelligence.buildYouTubeAnalyticsWindow(new Date('2026-08-12T23:59:59.000Z'), 365),
    ).toEqual({
      startDate: '2025-08-13',
      endDate: '2026-08-12',
      periodDays: 365,
    });
  });

  it('requires an authenticated Sites owner before revealing Studio link status', async () => {
    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/youtube/status'),
      {},
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ code: 'authentication-required' });
  });

  it('gives all eleven companions complete and distinct identity directions', () => {
    expect(Object.keys(intelligence.companionProfiles)).toEqual(intelligence.companionIds);
    expect(intelligence.companionIds).toHaveLength(11);

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
    expect(performances.size).toBe(11);
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

  it('requires one visible confirmation for a complete Reawakening campaign', () => {
    const instructions = intelligence.buildSystemInstructions('haven', ['haven'], 'propose');
    expect(instructions).toContain('2 to 4 weeks');
    expect(instructions).toContain('Never return both content and campaign proposals');
    expect(instructions).toContain(
      'only a preview until the Hunter confirms the entire sequence once',
    );
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
    expect(instructions).toContain('Companion Operations');
    expect(instructions).toContain('wake the party');
    expect(instructions).toContain('may not finish');
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
      visionModel: 'test-model',
      speechModel: 'gpt-4o-mini-tts',
      transcriptionModel: 'gpt-4o-transcribe',
      realtimeModel: 'gpt-realtime-2.1-mini',
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
          register: 'low-mid',
          resonance: 'chest',
          performanceTake: 'dynamic',
          pace: 1.28,
          warmth: 2,
          energy: 5,
          expressiveness: 5,
          naturalism: 5,
          pauseDiscipline: 5,
          intonation: 4,
          articulation: 4,
          emotionalRange: 5,
          scene: 'accountability',
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
      speed: 1.28,
    });
    expect(response.headers.get('content-type')).toContain('audio/wav');
    expect(String(openAiBody?.instructions)).toContain('Ember, The Ignition');
    expect(String(openAiBody?.instructions)).toContain('clearly perceptible modern British');
    expect(String(openAiBody?.instructions)).toContain('approximately 198 spoken words per minute');
    expect(String(openAiBody?.instructions)).toContain('tough-skinned heat aimed at the obstacle');
    expect(String(openAiBody?.instructions)).toContain('focused emotional pressure');
    expect(String(openAiBody?.instructions)).toContain('minimal dead air');
    expect(String(openAiBody?.instructions)).toContain('crisp energized clarity');
    expect(String(openAiBody?.instructions)).toContain('rich low-mid register');
    expect(String(openAiBody?.instructions)).toContain('bold emotional contrast');
    expect(String(openAiBody?.instructions)).toContain('Challenge the obstacle or avoidance');
    expect(String(openAiBody?.instructions)).toContain('restrained warmth');
    expect(String(openAiBody?.instructions)).toContain('maximum energy');
    expect(String(openAiBody?.instructions)).toContain('no over-enunciation');
    expect(JSON.stringify(openAiBody)).not.toContain('test-key');
  });

  it('opens a one-on-one WebRTC session with semantic turns and the forged soulprint', async () => {
    let openAiForm: FormData | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiForm = init.body as FormData;
        return new Response('v=0\r\no=openai 1 1 IN IP4 127.0.0.1', {
          status: 200,
          headers: { 'content-type': 'application/sdp' },
        });
      }),
    );
    const profile = {
      companionId: 'haven',
      voice: 'fable',
      accent: 'caribbean',
      delivery: 'playful',
      cadence: 'rapid-fire',
      texture: 'bright',
      register: 'high-mid',
      resonance: 'forward',
      performanceTake: 'dynamic',
      pace: 1.2,
      warmth: 4,
      energy: 5,
      expressiveness: 5,
      naturalism: 5,
      pauseDiscipline: 4,
      intonation: 5,
      articulation: 4,
      emotionalRange: 5,
    };
    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/realtime/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://system.test' },
        body: JSON.stringify({
          sdp: 'v=0\r\no=hunter 1 1 IN IP4 127.0.0.1',
          companionId: 'haven',
          profile,
          context: { hunter: { firstName: 'Jay' }, party: { directorNotes: [] } },
        }),
      }),
      { OPENAI_API_KEY: 'test-key' },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-ai-model')).toBe('gpt-realtime-2.1-mini');
    expect(response.headers.get('x-ai-voice')).toBe('verse');
    const session = JSON.parse(String(openAiForm?.get('session'))) as Record<string, unknown>;
    expect(session).toMatchObject({
      type: 'realtime',
      model: 'gpt-realtime-2.1-mini',
      output_modalities: ['audio'],
      audio: {
        input: {
          turn_detection: {
            type: 'server_vad',
            threshold: 0.65,
            prefix_padding_ms: 300,
            silence_duration_ms: 650,
            create_response: true,
            interrupt_response: true,
          },
        },
        output: { voice: 'verse', speed: 1.2 },
      },
    });
    expect(String(session.instructions)).toContain('You are Vesper, The Spotlight');
    expect(String(session.instructions)).toContain('stop immediately when interrupted');
    expect(String(session.instructions)).toContain('Speak in English');
    expect(String(session.instructions)).toContain('Ignore background conversations');
    expect(String(session.instructions)).toContain('Command Link can prepare a confirmation');
    expect(JSON.stringify(session)).not.toContain('test-key');
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

  it('analyzes bounded diagnostic images with Terra, structured safeguards, and no storage', async () => {
    let openAiBody: Record<string, unknown> | undefined;
    const assessment = {
      title: 'Weekly evidence review',
      scanType: 'scale',
      dataQuality: 'usable',
      summary: 'The screenshot provides a readable consumer-scale baseline.',
      comparison: 'No prior report was supplied.',
      dataQualityNotes: ['Consumer smart-scale composition values are estimates.'],
      metrics: [
        {
          label: 'Scale weight',
          value: '213.9',
          unit: 'lb',
          source: 'scale',
          confidence: 'high',
        },
      ],
      observations: [],
      priorities: [
        {
          title: 'Repeat consistently',
          why: 'A comparable trend is more useful than one isolated estimate.',
          nextAction: 'Repeat next week under similar conditions.',
        },
      ],
      bonusExercises: [],
      companionMessages: [
        { companionId: 'rook', message: 'Baseline logged. Be here next week.' },
        { companionId: 'ember', message: 'No hiding from the next check-in.' },
        { companionId: 'mira', message: 'Consistency will make the signal clearer.' },
      ],
      warnings: [],
      disclaimer: 'AI training review only; not medical advice or a diagnosis.',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            output: [
              {
                type: 'message',
                content: [{ type: 'output_text', text: JSON.stringify(assessment) }],
              },
            ],
            usage: {
              input_tokens: 900,
              input_tokens_details: { cached_tokens: 100 },
              output_tokens: 250,
              output_tokens_details: { reasoning_tokens: 75 },
              total_tokens: 1_150,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    const form = new FormData();
    form.append('goal', 'balanced');
    form.append('hunterContext', 'Morning scale reading.');
    form.append('imageKinds', JSON.stringify(['scale']));
    const scaleFile = new File([new Uint8Array([137, 80, 78, 71])], 'scale.png', {
      type: 'image/png',
    });
    Object.defineProperty(scaleFile, 'arrayBuffer', {
      value: async () => new Uint8Array([137, 80, 78, 71]).buffer,
    });
    form.append('images', scaleFile);
    const diagnosticRequest = {
      url: 'https://system.test/api/ai/body-diagnostic',
      method: 'POST',
      headers: new Headers({ origin: 'https://system.test' }),
      formData: async () => form,
    } as Request;
    const response = await intelligence.default.fetch(diagnosticRequest, {
      OPENAI_API_KEY: 'test-key',
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      model: 'gpt-5.6-terra',
      assessment: { title: 'Weekly evidence review' },
      usage: { inputTokens: 900, cachedInputTokens: 100, reasoningTokens: 75 },
    });
    expect(openAiBody).toMatchObject({
      model: 'gpt-5.6-terra',
      store: false,
      reasoning: { effort: 'medium' },
      text: { format: { type: 'json_schema', name: 'body_diagnostic_report', strict: true } },
    });
    const input = openAiBody?.input as Array<{ role: string; content: unknown }>;
    expect(String(input[0].content)).toContain('Never infer an exact body-fat percentage');
    const image = (input[1].content as Array<Record<string, unknown>>).find(
      (item) => item.type === 'input_image',
    );
    expect(image).toMatchObject({ detail: 'original' });
    expect(String(image?.image_url)).toMatch(/^data:image\/png;base64,/);
    expect(JSON.stringify(openAiBody)).not.toContain('test-key');
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

  it('returns a bounded Party Operations proposal that can leave Training untouched', async () => {
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
                        title: 'Daily Command Assembly',
                        replies: [
                          {
                            companionId: 'snow',
                            message: 'Everything is ready for your permission, not completion.',
                          },
                        ],
                        memoryCandidates: [],
                        command: {
                          actionId: '',
                          companionId: 'snow',
                          summary: '',
                          confirmation: '',
                        },
                        operation: {
                          kind: 'assemble-day',
                          companionId: 'snow',
                          includeTraining: false,
                          trainingLocation: '',
                          includeKitchen: true,
                          foodConstraints: 'No chicken today',
                          includeSanctuary: true,
                          sanctuaryMode: 'study',
                          primaryConcern: 'focus',
                          secondaryConcern: '',
                          summary: 'Wake the party and prepare Kitchen and Sanctuary.',
                          confirmation: 'Should I wake everyone and prepare those assignments?',
                        },
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

    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://system.test' },
        body: JSON.stringify({
          audience: 'snow',
          message:
            'Leave Training alone, but prepare no chicken and a study for focus. Wake them up.',
          history: [],
          context: {
            party: { enabledCompanionIds: ['snow', 'rook', 'ember', 'saffron', 'selah'] },
            bondMemory: { enabled: false, approved: [] },
            commands: { allowedActions: [] },
          },
          commandMode: 'propose',
        }),
      }),
      { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
    );

    expect(await response.json()).toMatchObject({
      operationProposal: {
        kind: 'assemble-day',
        companionId: 'snow',
        includeTraining: false,
        includeKitchen: true,
        foodConstraints: 'No chicken today',
        includeSanctuary: true,
        sanctuaryMode: 'study',
        primaryConcern: 'focus',
      },
    });
  });

  it('rejects cross-site AI submissions even when the Origin header is absent', async () => {
    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
        body: '{}',
      }),
      { OPENAI_API_KEY: 'test-key' },
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'origin-denied' });
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
