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
  familyBible: {
    schemaVersion: string;
    generationVoice: {
      ageBand: string;
      naturalShape: string[];
      antiPatterns: string[];
      contrastExamples: string[];
    };
    rules: Record<string, unknown>;
    companions: Record<string, Record<string, unknown>>;
    relationships: Array<{ ids: string[]; dynamic: string }>;
  };
  companionCapabilityMap: Record<string, string>;
  formatCapabilityMesh: () => string;
  aiVoiceNames: string[];
  aiVoiceAccents: Record<string, string>;
  getRealtimeVoice: (voice: string) => string;
  buildRealtimeInstructions: (
    profile: Record<string, unknown>,
    context: Record<string, unknown>,
  ) => string;
  baseInstructions: string;
  formatCompanionProfiles: () => string;
  formatFamilyBibleContext: (activeIds?: string[]) => string;
  selectFamilyContextIds: (
    audience: string,
    availableIds?: string[],
    room?: Record<string, unknown>,
  ) => string[];
  buildAudienceInstruction: (
    audience: string,
    enabledIds?: string[],
    room?: Record<string, unknown>,
  ) => string;
  buildCommandInstruction: (commandMode: 'none' | 'propose', workload?: string) => string;
  buildSystemInstructions: (
    audience: string,
    enabledIds?: string[],
    commandMode?: 'none' | 'propose',
    workload?: string,
    room?: Record<string, unknown>,
    legacyDirectorNotes?: Array<Record<string, unknown>>,
  ) => string;
  selectIntelligenceRoute: (
    payload: {
      audience: string;
      message: string;
      commandMode?: 'none' | 'propose';
      participantIds?: string[];
      history?: Array<{ role: 'hunter' | 'companion'; companionId?: string; message: string }>;
      context?: Record<string, unknown>;
    },
    env?: Record<string, string>,
  ) => {
    route: string;
    model: string;
    reasoningEffort: string;
    workload: string;
    maxOutputTokens: number;
  };
  sanitizeCompanionLanguage: (value: string, requestMessage?: string) => string;
  countEngineeringWebSearchCalls: (response: Record<string, unknown>) => number;
  buildYouTubeAnalyticsWindow: (
    now?: Date,
    periodDays?: number,
  ) => {
    startDate: string;
    endDate: string;
    periodDays: number;
  };
  default: {
    fetch: (
      request: Request,
      env: Record<string, unknown>,
      executionContext?: { waitUntil: (promise: Promise<unknown>) => void },
    ) => Promise<Response>;
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

  it('gives all twelve companions complete and distinct identity directions', () => {
    expect(Object.keys(intelligence.companionProfiles)).toEqual(intelligence.companionIds);
    expect(intelligence.companionIds).toHaveLength(12);

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
    expect(performances.size).toBe(12);
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
    expect(intelligence.baseInstructions).toContain('hard-coded Family Bible');
    expect(intelligence.baseInstructions).toContain('sole personality and relationship authority');
    expect(intelligence.baseInstructions).toContain('classification roadmap');
    expect(intelligence.baseInstructions).toContain('Selah may recommend Bible passages');
    expect(intelligence.baseInstructions).toContain('Cassian may analyze only');
    expect(intelligence.baseInstructions).toContain('one coordinated system');
    expect(intelligence.baseInstructions).toContain('handoff');
    expect(intelligence.baseInstructions).toContain('Use English throughout');
    expect(intelligence.baseInstructions).toContain("Snow is the System's command coordinator");
  });

  it('counts only web-search tool calls for transparent Cipher research usage', () => {
    expect(
      intelligence.countEngineeringWebSearchCalls({
        output: [
          { type: 'web_search_call', id: 'search_1' },
          { type: 'message', content: [] },
          { type: 'web_search_call', id: 'search_2' },
        ],
      }),
    ).toBe(2);
    expect(intelligence.countEngineeringWebSearchCalls({ output: [] })).toBe(0);
  });

  it('removes accidental foreign-script fragments without blocking requested translation', () => {
    expect(
      intelligence.sanitizeCompanionLanguage(
        'Everything is ready for confirmation. તેઓ',
        'Prepare my day.',
      ),
    ).toBe('Everything is ready for confirmation.');
    expect(
      intelligence.sanitizeCompanionLanguage('Hello. こんにちは', 'Say hello in Japanese.'),
    ).toBe('Hello. こんにちは');
  });

  it('requires one visible confirmation for a complete Reawakening campaign', () => {
    const instructions = intelligence.buildSystemInstructions(
      'haven',
      ['haven'],
      'propose',
      'campaign-forge',
    );
    expect(instructions).toContain('1 to 12 weeks');
    expect(instructions).toContain('2 to 12 distinct operations');
    expect(instructions).toContain('preview until the Hunter confirms the entire sequence once');
  });

  it('keeps mission synonyms inside the same protected confirmation contract', () => {
    const instructions = intelligence.buildSystemInstructions(
      'snow',
      ['snow', 'rook'],
      'propose',
      'system-command',
    );
    expect(instructions).toContain('assign, forge, add, create, make, or give');
    expect(instructions).toContain('archive, remove, delete, or cancel as retire');
    expect(instructions).toContain('first-person completion report');
    expect(instructions).toContain('instead of guessing or awarding credit');
  });

  it('turns Party Commons membership changes into a visible, participant-limited exchange', () => {
    const instructions = intelligence.buildAudienceInstruction('party', ['snow', 'saffron'], {
      kind: 'commons',
      leadCompanionId: 'saffron',
      partyEvent: {
        kind: 'join',
        companionIds: ['saffron'],
        initiatedBy: 'snow',
      },
    });

    expect(instructions).toContain('Party Commons');
    expect(instructions).toContain('snow, saffron');
    expect(instructions).toContain('Membership event: join saffron');
    expect(instructions).toContain('include the newcomer and at least one established participant');
    expect(instructions).toContain('let the newcomer react to that companion');
    expect(instructions).toContain('make at least one relationship visible');
    expect(instructions).toContain('close, complicated family');
    expect(instructions).toContain('Preserve specialist ownership during collaboration');
    expect(instructions).not.toContain('cipher, haven');
  });

  it('loads only active Family Bible relationships into a shared scene', () => {
    const instructions = intelligence.buildSystemInstructions(
      'party',
      ['snow', 'saffron', 'quill'],
      'none',
      'party-council',
      {
        kind: 'commons',
        enabledIds: ['snow', 'saffron', 'quill', 'rook'],
        leadCompanionId: 'snow',
        partyEvent: { kind: 'join', companionIds: ['saffron', 'quill'] },
        message: 'Snow, Quill and Saffron, talk this through together.',
      },
    );

    expect(instructions).toContain('THE SYSTEM FAMILY BIBLE');
    expect(instructions).toContain('Only relationships active in this scene');
    expect(instructions).toContain('[snow ↔ quill]');
    expect(instructions).toContain('unofficial administrator seniority');
    expect(instructions).toContain('[snow ↔ saffron]');
    expect(instructions).toContain('seniority as no protection');
    expect(instructions).not.toContain('[rook] Rook — The Vanguard');
    expect(instructions).not.toContain('[rook ↔');
  });

  it('keeps Quill as the sole archive authority while Snow plays the spoiler-hungry fan', () => {
    const instructions = intelligence.buildSystemInstructions(
      'party',
      ['snow', 'quill'],
      'none',
      'arc-forge',
      {
        kind: 'spoiler-room',
        enabledIds: ['snow', 'quill'],
        leadCompanionId: 'quill',
        message: 'Review this A.R.C. reveal while Snow tries to get spoilers.',
      },
    );

    expect(instructions).toContain('Quill is the only canon authority');
    expect(instructions).toContain('Snow begins with no private archive knowledge');
    expect(instructions).toContain('never displays independent knowledge of raw dossiers');
    expect(instructions).toContain("Quill's grounding reply first");
    expect(instructions).toContain('unofficial administrator seniority');
    expect(instructions).toContain('Quill protests theatrically');
  });

  it('keeps absent relationship entries out of one-on-one Family Bible context', () => {
    const instructions = intelligence.buildSystemInstructions(
      'quill',
      ['quill'],
      'none',
      'conversation',
      {},
    );

    expect(instructions).toContain('[quill] Quill — The Storyspark');
    expect(instructions).not.toContain('[snow] Snow — The Constant');
    expect(instructions).not.toContain('[snow ↔ quill]');
  });

  it('hard-codes one complete Family Bible entry for all twelve companions', () => {
    expect(intelligence.COMPANION_INTELLIGENCE_VERSION).toBe('cipher-nexus-14');
    expect(intelligence.familyBible.schemaVersion).toBe('2.0.0');
    expect(intelligence.companionIds).toHaveLength(12);
    expect(Object.keys(intelligence.familyBible.companions).sort()).toEqual(
      [...intelligence.companionIds].sort(),
    );
    for (const companionId of intelligence.companionIds) {
      const entry = intelligence.familyBible.companions[companionId];
      expect(String(entry.systemRole).length).toBeGreaterThan(10);
      expect(String(entry.archetype).length).toBeGreaterThan(35);
      const speech = entry.speech as Record<string, string>;
      expect(speech).toMatchObject({
        avoid: expect.any(String),
        default: expect.any(String),
        tells: expect.any(String),
        texture: expect.any(String),
      });
      for (const direction of [speech.avoid, speech.default, speech.tells, speech.texture]) {
        expect(direction.length).toBeGreaterThan(60);
      }
      expect(Array.isArray(entry.logic)).toBe(true);
      const behavior = entry.behavior as Record<string, string>;
      expect(Object.keys(behavior).sort()).toEqual([
        'care',
        'disagreement',
        'humor',
        'never',
        'offDuty',
        'push',
      ]);
      for (const direction of Object.values(behavior)) {
        expect(direction.length).toBeGreaterThan(60);
      }
      expect(String(entry.runtimeDirective).length).toBeGreaterThan(50);
    }
    expect(intelligence.familyBible.relationships.length).toBeGreaterThanOrEqual(24);
  });

  it('locks every active mind to a contemporary peer voice instead of polished assistant prose', () => {
    expect(intelligence.familyBible.generationVoice.ageBand).toContain('21 to 25');
    expect(intelligence.familyBible.generationVoice.naturalShape.join(' ')).toContain(
      'prepared speech',
    );
    expect(intelligence.familyBible.generationVoice.antiPatterns.join(' ')).toContain(
      'It would be wise',
    );
    expect(intelligence.familyBible.generationVoice.contrastExamples.join(' ')).toContain(
      "Yeah, that's annoying",
    );

    const snow = intelligence.formatFamilyBibleContext(['snow']);
    expect(snow).toContain('Contemporary peer-voice contract');
    expect(snow).toContain('Natural speech default:');
    expect(snow).toContain('Conversational tells:');
    expect(snow).toContain('Relaxed sister-on-the-couch energy');
    expect(snow).not.toContain('Young engineer-friend energy');

    const live = intelligence.buildRealtimeInstructions(
      {
        companionId: 'snow',
        voice: 'marin',
        accent: 'natural',
        delivery: 'conversational',
        cadence: 'natural',
        texture: 'clean',
        register: 'mid',
        resonance: 'balanced',
        performanceTake: 'balanced',
        pace: 1,
        warmth: 0.5,
        energy: 0.5,
        expressiveness: 0.5,
        intonation: 0.5,
        articulation: 0.5,
        emotionalRange: 0.5,
        naturalism: 0.5,
        pauseDiscipline: 0.5,
        scene: 'neutral',
      },
      {},
    );
    expect(live).toContain('21-to-25 range');
    expect(live).toContain('React like a person before explaining like an expert');

    const saffron = intelligence.formatFamilyBibleContext(['saffron']);
    expect(saffron).toContain('Cultural language: She is Hispanic');
    expect(saffron).toContain('mijo');
    const amara = intelligence.formatFamilyBibleContext(['amara']);
    expect(amara).toContain('por favor');
    const quill = intelligence.formatFamilyBibleContext(['quill']);
    expect(quill).toContain('brilliant fusion-warrior confidence');
  });

  it('gives the family one explicit capability mesh while keeping writes Hunter-owned', () => {
    expect(Object.keys(intelligence.companionCapabilityMap).sort()).toEqual(
      [...intelligence.companionIds].sort(),
    );
    const mesh = intelligence.formatCapabilityMesh();
    expect(mesh.match(/^-/gm)).toHaveLength(17);
    expect(mesh).toContain('[snow] Coordinates cross-System decisions');
    expect(mesh).toContain('[quill] Retrieves and distinguishes A.R.C. canon');
    expect(mesh).toContain('Do not hide behind "I can only advise"');
    expect(mesh).toContain('Only the Hunter can apply, dismiss, or confirm a local mutation');
  });

  it('keeps a full-party room deep without injecting all twelve expanded minds', () => {
    const selected = intelligence.selectFamilyContextIds('party', intelligence.companionIds, {
      kind: 'party-council',
      leadCompanionId: 'haven',
      message: 'Vesper and Cipher, help me plan my next YouTube video.',
      recentCompanionIds: ['quill'],
    });
    expect(selected).toEqual(['haven', 'cipher', 'quill']);

    const instructions = intelligence.buildSystemInstructions(
      'party',
      intelligence.companionIds,
      'none',
      'party-council',
      {
        kind: 'party-council',
        leadCompanionId: 'haven',
        message: 'Vesper and Cipher, help me plan my next YouTube video.',
        recentCompanionIds: ['quill'],
        enabledIds: intelligence.companionIds,
      },
    );
    expect(instructions.match(/System role:/g)).toHaveLength(3);
    expect(instructions).toContain('[haven ↔ cipher]');
    expect(instructions).not.toContain('[snow ↔ quill]');
    expect(instructions).toContain('Compact available roster');
  });

  it("loads every companion's expanded Family Bible mind inside their specialist route", () => {
    const workloads: Record<string, string> = {
      snow: 'system-plan',
      rook: 'system-command',
      selah: 'conversation',
      cipher: 'conversation',
      haven: 'content-forge',
      ember: 'conversation',
      mira: 'conversation',
      amara: 'conversation',
      cassian: 'ledger-review',
      saffron: 'kitchen-coach',
      quill: 'arc-forge',
      kairo: 'calendar-counsel',
    };
    for (const companionId of intelligence.companionIds) {
      const instructions = intelligence.buildSystemInstructions(
        companionId,
        [companionId],
        'propose',
        workloads[companionId],
        {},
      );
      expect(instructions).toContain(
        `[${companionId}] ${intelligence.companionProfiles[companionId].name}`,
      );
      expect(instructions).toContain(
        String(intelligence.familyBible.companions[companionId].runtimeDirective),
      );
      for (const otherId of intelligence.companionIds.filter((id) => id !== companionId)) {
        expect(instructions).not.toContain(
          `[${otherId}] ${intelligence.companionProfiles[otherId].name} —`,
        );
      }
    }
  });

  it('makes specialist, Kairo, Snow, and Hunter roles explicit inside Calendar Council', () => {
    const instructions = intelligence.buildAudienceInstruction(
      'party',
      ['cassian', 'kairo', 'snow'],
      {
        kind: 'commons',
        leadCompanionId: 'cassian',
        partyEvent: {
          kind: 'calendar-council',
          companionIds: ['kairo', 'snow'],
          initiatedBy: 'cassian',
        },
      },
    );

    expect(instructions).toContain('Calendar Council opened by cassian');
    expect(instructions).toContain('initiating specialist states the scheduling purpose');
    expect(instructions).toContain('Kairo verifies the calendar details');
    expect(instructions).toContain("Snow checks the Hunter's consent");
    expect(instructions).toContain('one precise Hunter confirmation gate');
  });

  it('keeps every specialist command lane operational inside shared rooms', () => {
    const route = (participantIds: string[], message: string, commandMode = 'propose' as const) =>
      intelligence.selectIntelligenceRoute({
        audience: 'party',
        participantIds,
        message,
        commandMode,
        history: [],
        context: { party: { enabledCompanionIds: intelligence.companionIds } },
      }).workload;

    expect(route(['snow', 'saffron'], 'Create a new chicken recipe for my grimoire')).toBe(
      'recipe-forge',
    );
    expect(route(['snow', 'saffron'], "Walk me through today's recipe")).toBe('kitchen-coach');
    expect(route(['snow', 'quill'], 'Review this A.R.C. character dossier')).toBe('arc-forge');
    expect(route(['snow', 'haven'], 'Plan a specific new YouTube video')).toBe('content-forge');
    expect(route(['snow', 'cassian'], 'How is my money and budget looking?')).toBe('ledger-review');
    expect(route(['snow', 'kairo'], 'Add a calendar event tomorrow at 3 PM')).toBe(
      'calendar-command',
    );
    expect(route(['snow', 'rook'], 'Assign me a new training mission')).toBe('system-command');
    expect(route(['snow', 'rook'], 'Get my tasks for today together')).toBe('system-plan');

    expect(route(['snow'], 'Review this A.R.C. character dossier')).not.toBe('arc-forge');
    expect(route(['snow'], 'Create a new chicken recipe for my grimoire')).not.toBe('recipe-forge');
  });

  it('routes casual direct talk economically and deeper counsel to Terra', () => {
    expect(
      intelligence.selectIntelligenceRoute({ audience: 'snow', message: 'How are you today?' }),
    ).toEqual({
      route: 'quick',
      model: 'gpt-5.6-luna',
      reasoningEffort: 'low',
      workload: 'conversation',
      maxOutputTokens: 1_600,
    });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'How long until I reach World Class at my current pace?',
      }),
    ).toEqual({
      route: 'counsel',
      model: 'gpt-5.6-terra',
      reasoningEffort: 'medium',
      workload: 'conversation',
      maxOutputTokens: 3_200,
    });
    expect(
      intelligence.selectIntelligenceRoute({ audience: 'party', message: 'What do you think?' }),
    ).toMatchObject({ route: 'counsel', model: 'gpt-5.6-terra' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'cipher',
        message: 'Explain the phase noise tradeoff when I narrow RBW on the spectrum analyzer.',
      }),
    ).toMatchObject({ route: 'counsel', model: 'gpt-5.6-terra' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'I feel conflicted. Give me your honest opinion.',
      }),
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
    ).toEqual({
      route: 'sovereign',
      model: 'gpt-5.6-sol',
      reasoningEffort: 'high',
      workload: 'conversation',
      maxOutputTokens: 6_000,
    });
  });

  it('keeps a short Vesper follow-up inside the active Reawakening workroom', () => {
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'haven',
        message: "There's a new fighting game called Marvel Tokon. I am rusty, but it is fun.",
        commandMode: 'propose',
        history: [
          {
            role: 'companion',
            companionId: 'haven',
            message:
              'What lane should this four-week Reawakening campaign use: Tekken, horror, Marvel Rivals, or another lane?',
          },
        ],
      }),
    ).toMatchObject({
      route: 'sovereign',
      model: 'gpt-5.6-sol',
      reasoningEffort: 'high',
      workload: 'campaign-forge',
      maxOutputTokens: 8_000,
    });
  });

  it('keeps a short Vesper answer inside the active Creator Forge workroom', () => {
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'haven',
        message: 'YouTube Shorts, definitely.',
        commandMode: 'propose',
        history: [
          {
            role: 'companion',
            companionId: 'haven',
            message:
              'For this video idea, are we building a YouTube upload, a Short, a livestream, or a community post?',
          },
        ],
      }),
    ).toMatchObject({
      route: 'counsel',
      workload: 'content-forge',
      maxOutputTokens: 4_800,
    });
  });

  it('routes an exact Creator Forge project update even when its title has no content keyword', () => {
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'haven',
        message:
          'Move Marvel Tokon Reawakening to record and set the next step to film session one.',
        commandMode: 'propose',
        context: {
          specialists: {
            creator: {
              targeting: { requestedProjectTitles: ['Marvel Tokon Reawakening'] },
            },
          },
        },
      }),
    ).toMatchObject({
      route: 'counsel',
      workload: 'creator-update',
      maxOutputTokens: 4_200,
    });
  });

  it('gives Quill, Saffron, Cassian, and Party Council distinct workroom budgets', () => {
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'quill',
        message: 'Create a character dossier and help me repair this lore.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'arc-forge', maxOutputTokens: 6_000 });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'saffron',
        message: 'Create me a new recipe with salmon and rice.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'recipe-forge', maxOutputTokens: 5_000 });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'saffron',
        message: "Walk me through today's recipe one step at a time.",
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'kitchen-coach', maxOutputTokens: 3_200 });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'cassian',
        message: 'Help me understand this budget.',
      }),
    ).toMatchObject({ workload: 'ledger-review', maxOutputTokens: 5_000 });
    expect(
      intelligence.selectIntelligenceRoute({ audience: 'party', message: 'What do you think?' }),
    ).toMatchObject({ workload: 'party-council', maxOutputTokens: 4_800 });
  });

  it('routes calendar counsel and scheduling commands through Kairo without bypassing confirmation', () => {
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'kairo',
        message: 'What does my schedule look like tomorrow?',
      }),
    ).toMatchObject({ workload: 'calendar-counsel' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'Schedule training tomorrow at 6 PM.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'calendar-command' });
    const instructions = intelligence.buildSystemInstructions(
      'kairo',
      ['kairo'],
      'propose',
      'calendar-command',
    );
    expect(instructions).toContain('Hunter must confirm');
    expect(instructions).toContain('Cooking and meal-prep blocks link to Saffron');
    expect(instructions).toContain('never rolls a meal or workout');
    expect(instructions).toContain('XP-backed Companion Order');
    expect(instructions).toContain('no-duplicate-reward rule');
    expect(instructions).toContain('15–29 minutes minor');
    expect(instructions).toContain('localLabel and local date/time fields are authoritative');
    expect(instructions).toContain(
      'raw ISO timestamps are exact storage instants, not local clock labels',
    );
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'saffron',
        message: 'Schedule cooking this Sunday at 5 PM for one hour.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'calendar-command' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'haven',
        message: 'Schedule a recording block this Sunday at 2 PM for two hours.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'calendar-command' });
    for (const audience of intelligence.companionIds) {
      expect(
        intelligence.selectIntelligenceRoute({
          audience,
          message: 'Schedule a personal appointment this Sunday at 3 PM for one hour.',
          commandMode: 'propose',
        }),
      ).toMatchObject({ workload: 'calendar-command' });
    }
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'party',
        participantIds: ['cassian', 'kairo', 'snow'],
        message: 'Sunday at 7 PM for thirty minutes, every week.',
        history: [
          { role: 'hunter', message: 'Add a recurring budget review.' },
          {
            role: 'companion',
            companionId: 'kairo',
            message: 'Which day and time should I schedule this calendar event for?',
          },
        ],
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'calendar-command' });
    expect(instructions).toContain('domain companion must briefly name what the time protects');
    expect(instructions).toContain('Snow must ask the single final consent question');
  });

  it('keeps specialist identity without trapping casual or off-domain conversation', () => {
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'kairo',
        message: 'Saffron gave me a recipe idea. What do you think?',
      }),
    ).toMatchObject({ workload: 'conversation' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'cassian',
        message: 'How has your day been?',
      }),
    ).toMatchObject({ workload: 'conversation' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'quill',
        message: 'Rook is acting smug again.',
      }),
    ).toMatchObject({ workload: 'conversation' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'kairo',
        message: 'Am I free tomorrow evening?',
      }),
    ).toMatchObject({ workload: 'calendar-counsel' });
  });

  it('gives every companion the same natural scheduling and mission command fluency', () => {
    for (const audience of intelligence.companionIds) {
      expect(
        intelligence.selectIntelligenceRoute({
          audience,
          message: 'Put a focused work session on my calendar tomorrow at 7 PM for one hour.',
          commandMode: 'propose',
        }),
      ).toMatchObject({ workload: 'calendar-command' });
      expect(
        intelligence.selectIntelligenceRoute({
          audience,
          message: 'Assign me a new discipline mission.',
          commandMode: 'propose',
        }),
      ).toMatchObject({ workload: 'system-command' });
    }
  });

  it('makes natural speech, silent timezone context, and proactive team relays explicit', () => {
    expect(intelligence.baseInstructions).toContain('not a status console');
    expect(intelligence.baseInstructions).toContain('timezone as silent operating context');
    expect(intelligence.baseInstructions).toContain('without saying "New York time,"');
    expect(intelligence.baseInstructions).toContain(
      'observations, shorthand, or follow-up answers',
    );
    expect(intelligence.baseInstructions).toContain('Use initiative without taking control away');
    expect(intelligence.baseInstructions).toContain('Kairo handoff with Mira in participantIds');
    expect(intelligence.baseInstructions).toContain('Do not wait for the Hunter to say');

    const conversation = intelligence.buildCommandInstruction('propose', 'conversation');
    expect(conversation).toContain('offer that next step in character');
    expect(conversation).toContain('handoff.participantIds');
    const calendar = intelligence.buildCommandInstruction('propose', 'calendar-counsel');
    expect(calendar).toContain('Apply the supplied timezone silently');
  });

  it('understands natural Companion Order verbs before calendar vocabulary', () => {
    for (const message of [
      'Assign me a one-time mobility mission.',
      'Forge me a new creator mission.',
      'Create me a mission to stretch tonight.',
      'Change my stretching mission to weekly.',
      'Retire my stretching mission.',
      'Delete my stretching mission.',
      'Update my stretching mission due date to Friday.',
    ]) {
      expect(
        intelligence.selectIntelligenceRoute({
          audience: 'snow',
          message,
          commandMode: 'propose',
        }),
      ).toMatchObject({ workload: 'system-command' });
    }

    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'Log my 4.5 mile walk.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'system-command' });
    expect(
      intelligence.selectIntelligenceRoute({
        audience: 'snow',
        message: 'I just went on a 4.5 mile walk.',
        commandMode: 'propose',
      }),
    ).toMatchObject({ workload: 'system-command' });
  });

  it('forbids every companion from claiming a write before the verified local confirmation', () => {
    expect(intelligence.baseInstructions).toContain('merely because the Hunter typed “I confirm.”');
    expect(intelligence.baseInstructions).toContain('locally generated success acknowledgement');
  });

  it('requires a visible confirmation for commands and Private Grimoire recipes', () => {
    const instructions = intelligence.buildSystemInstructions(
      'saffron',
      ['saffron'],
      'propose',
      'system-command',
    );
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

  it('loads every accessible English Cartesia voice page without duplicates', async () => {
    const requestedUrls: string[] = [];
    const emberVoice = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Ember AU',
      description: 'Fiery Australian energy',
      gender: 'feminine',
      language: 'en',
      country: 'AU',
    };
    const snowVoice = {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Snow Guide',
      description: 'Relaxed and wise',
      gender: 'feminine',
      language: 'en',
      country: 'US',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const requestedUrl = String(input);
        requestedUrls.push(requestedUrl);
        const cursor = new URL(requestedUrl).searchParams.get('starting_after');
        return Response.json(
          cursor
            ? { data: [snowVoice, emberVoice], has_more: false }
            : { data: [emberVoice], has_more: true },
        );
      }),
    );

    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/voices?provider=cartesia', {
        headers: { origin: 'https://system.test' },
      }),
      { CARTESIA_API_KEY: 'test-key' },
    );
    const payload = (await response.json()) as { voices: Array<{ id: string; name: string }> };

    expect(response.status).toBe(200);
    expect(requestedUrls).toHaveLength(2);
    expect(new URL(requestedUrls[0]).searchParams.get('language')).toBe('en');
    expect(new URL(requestedUrls[0]).searchParams.get('limit')).toBe('100');
    expect(new URL(requestedUrls[1]).searchParams.get('starting_after')).toBe(emberVoice.id);
    expect(payload.voices.map((voice) => voice.name)).toEqual(['Ember AU', 'Snow Guide']);
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
          context: {
            hunter: { firstName: 'Jay' },
            party: {
              directorNotes: [
                {
                  companionId: 'haven',
                  casual: 'Talk like a charismatic streamer friend, never a presenter.',
                  never: 'Never become stiff or corporate.',
                },
              ],
            },
          },
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
    expect(String(session.instructions)).toContain('not a voice interface reading a report');
    expect(String(session.instructions)).toContain('timezone as silent local context');
    expect(String(session.instructions)).toContain('naturally suggest the right specialist');
    expect(String(session.instructions)).toContain('THE SYSTEM FAMILY BIBLE');
    expect(String(session.instructions)).toContain('[haven] Vesper — The Spotlight');
    expect(String(session.instructions)).toContain("Act as JDreamz's passionate channel manager");
    expect(String(session.instructions)).not.toContain('Talk like a charismatic streamer friend');
    expect(String(session.instructions)).not.toContain('Never become stiff or corporate');
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
      weeklyAdjustment: {
        recommended: true,
        summary: 'Add one short consistency block this week.',
        reason: 'The Hunter asked for a steadier weekly baseline.',
        reportedSignals: ['Morning scale reading'],
        sessions: [
          {
            title: 'Consistency walk',
            companionId: 'rook',
            focus: 'Easy repeatable movement.',
            rationale: 'Supports consistency without replacing the normal assignment.',
            durationMinutes: 20,
            sessionsThisWeek: 1,
            intensity: 'light',
          },
        ],
      },
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
    expect(String(input[0].content)).toContain('Photo appearance alone never justifies extra work');
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
            party: {
              enabledCompanionIds: ['rook'],
              directorNotes: [
                {
                  companionId: 'rook',
                  casual: 'Use the Hunter-authored Rook cadence in ordinary conversation.',
                },
                {
                  companionId: 'snow',
                  casual: 'This Snow direction must remain outside Rook solo chat.',
                },
              ],
            },
            state: { recoveryActive: false },
            bondMemory: { enabled: false, approved: [] },
          },
        }),
      }),
      { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
    );

    expect(response.status).toBe(200);
    expect(openAiBody).toBeDefined();
    const responseFormat = openAiBody?.text as {
      verbosity: string;
      format: {
        schema: { properties: { replies: { items: { required: string[] } } } };
      };
    };
    expect(responseFormat.verbosity).toBe('low');
    expect(responseFormat.format.schema.properties.replies.items.required).toContain(
      'voiceSummary',
    );
    const input = openAiBody?.input as Array<{ role: string; content: string }>;
    expect(input[0].role).toBe('system');
    expect(input[0].content).toContain('THE SYSTEM FAMILY BIBLE');
    expect(input[0].content).toContain('SYSTEM CAPABILITY MESH');
    expect(input[0].content).toContain('contemporary young adults');
    expect(input[0].content).toContain("follow only Rook's soulprint");
    expect(input[0].content).toContain('[rook] Rook — The Vanguard');
    expect(input[0].content).not.toContain('[snow] Snow — The Constant');
    expect(input[0].content).not.toContain('Hunter-authored Rook cadence');
    expect(input[0].content).not.toContain(
      'This Snow direction must remain outside Rook solo chat',
    );
    expect(input[1].content).toContain('What is 5 + 5?');
    expect(input[1].content).not.toContain('Hunter-authored Rook cadence');
    expect(input[1].content).not.toContain('directorNotes');
    expect(await response.clone().json()).toMatchObject({
      route: 'quick',
      reasoningEffort: 'low',
      replies: [
        {
          companionId: 'rook',
          message: 'Ten. Clean answer.',
          voiceSummary: 'Ten. Clean answer.',
        },
      ],
      usage: { cachedInputTokens: 60, reasoningTokens: 4 },
    });
  });

  it('returns a coordinated training relay that can bring Kairo and Mira into one room', async () => {
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
                      title: 'Neck mobility check',
                      replies: [
                        {
                          companionId: 'rook',
                          message:
                            'Yeah, do not bulldoze through that. Want me to bring Mira and Kairo in so she can own the mobility work and he can find a clean slot?',
                          voiceSummary:
                            'Do not bulldoze through it. I can bring Mira and Kairo in for a mobility check and a clean time slot.',
                        },
                      ],
                      memoryCandidates: [],
                      handoff: {
                        companionId: 'kairo',
                        participantIds: ['mira'],
                        summary: 'Find protected time for a cautious Mira-led neck mobility check.',
                        prompt:
                          'The Hunter reported neck pain. Ask how it feels now, keep the work pain-free, let Mira own the mobility recommendation, and only prepare a calendar preview after timing is clear.',
                      },
                    }),
                  },
                ],
              },
            ],
            usage: { input_tokens: 100, output_tokens: 60, total_tokens: 160 },
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
          message: 'My neck has been hurting and feels tight.',
          history: [],
          context: {
            party: { enabledCompanionIds: ['rook', 'mira', 'kairo', 'snow'] },
            bondMemory: { enabled: false, approved: [] },
          },
          commandMode: 'propose',
        }),
      }),
      { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
    );

    expect(response.status).toBe(200);
    const responseFormat = openAiBody?.text as {
      format: {
        schema: {
          properties: { handoff: { required: string[] } };
        };
      };
    };
    expect(responseFormat.format.schema.properties.handoff.required).toContain('participantIds');
    expect(await response.json()).toMatchObject({
      handoffProposal: {
        companionId: 'kairo',
        participantIds: ['mira'],
        summary: 'Find protected time for a cautious Mira-led neck mobility check.',
      },
    });
  });

  it('automatically rebuilds an output-limited response and counts both attempts', async () => {
    const openAiBodies: Array<Record<string, unknown>> = [];
    let attempt = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiBodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        attempt += 1;
        if (attempt === 1) {
          return new Response(
            JSON.stringify({
              status: 'incomplete',
              incomplete_details: { reason: 'max_output_tokens' },
              output: [],
              usage: {
                input_tokens: 90,
                input_tokens_details: { cached_tokens: 25 },
                output_tokens: 1_600,
                output_tokens_details: { reasoning_tokens: 1_200 },
                total_tokens: 1_690,
              },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }
        return new Response(
          JSON.stringify({
            status: 'completed',
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: JSON.stringify({
                      title: 'Recovered transmission',
                      replies: [
                        { companionId: 'snow', message: 'There you are. I finished the thought.' },
                      ],
                      memoryCandidates: [],
                    }),
                  },
                ],
              },
            ],
            usage: {
              input_tokens: 95,
              input_tokens_details: { cached_tokens: 30 },
              output_tokens: 40,
              output_tokens_details: { reasoning_tokens: 10 },
              total_tokens: 135,
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
          audience: 'snow',
          message: 'Finish that thought for me.',
          history: [],
          context: {
            party: { enabledCompanionIds: ['snow'] },
            bondMemory: { enabled: false, approved: [] },
          },
        }),
      }),
      { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
    );

    expect(response.status).toBe(200);
    expect(attempt).toBe(2);
    expect(openAiBodies[0]).toMatchObject({ max_output_tokens: 1_600 });
    expect(openAiBodies[1]).toMatchObject({ max_output_tokens: 3_600 });
    const retryInput = openAiBodies[1].input as Array<{ role: string; content: string }>;
    expect(retryInput[0].content).toContain('RECOVERY ATTEMPT');
    const firstFormat = openAiBodies[0].text as {
      format: { schema: { required: string[] } };
    };
    expect(firstFormat.format.schema.required).toEqual([
      'title',
      'replies',
      'memoryCandidates',
      'handoff',
    ]);
    expect(await response.json()).toMatchObject({
      workload: 'conversation',
      title: 'Recovered transmission',
      usage: {
        inputTokens: 185,
        cachedInputTokens: 55,
        outputTokens: 1_640,
        reasoningTokens: 1_210,
        totalTokens: 1_825,
      },
    });
  });

  it('finishes an owner-bound transmission after the visible app is suspended', async () => {
    type TransmissionRow = {
      request_id: string;
      user_id: string;
      status: string;
      response_status: number | null;
      result_json: string | null;
      expires_at: string;
    };
    const rows = new Map<string, TransmissionRow>();
    const db = {
      prepare: (sql: string) => {
        let values: unknown[] = [];
        const statement = {
          bind: (...bound: unknown[]) => {
            values = bound;
            return statement;
          },
          first: async () => {
            const [requestId, userId] = values.map(String);
            const row = rows.get(`${userId}:${requestId}`);
            return row ? { ...row } : null;
          },
          run: async () => {
            if (sql.includes('DELETE FROM ai_transmissions')) return { success: true };
            if (sql.includes('INSERT INTO ai_transmissions')) {
              const [requestId, userId, , , expiresAt] = values.map(String);
              rows.set(`${userId}:${requestId}`, {
                request_id: requestId,
                user_id: userId,
                status: 'pending',
                response_status: null,
                result_json: null,
                expires_at: expiresAt,
              });
              return { success: true };
            }
            if (sql.includes('UPDATE ai_transmissions')) {
              const [status, responseStatus, resultJson, , requestId, userId] = values;
              const key = `${String(userId)}:${String(requestId)}`;
              const row = rows.get(key);
              if (row) {
                rows.set(key, {
                  ...row,
                  status: String(status),
                  response_status: Number(responseStatus),
                  result_json: String(resultJson),
                });
              }
              return { success: true };
            }
            throw new Error(`Unexpected D1 statement: ${sql}`);
          },
        };
        return statement;
      },
    };

    let finishOpenAi!: (response: Response) => void;
    const openAiPending = new Promise<Response>((resolve) => {
      finishOpenAi = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => openAiPending),
    );
    const backgroundWork: Promise<unknown>[] = [];
    const requestId = 'transmission_1234567890abcdef';
    const headers = {
      'content-type': 'application/json',
      origin: 'https://system.test',
      'oai-authenticated-user-id': 'hunter-one',
      'x-system-transmission-id': requestId,
    };
    const env = { DB: db, OPENAI_API_KEY: 'test-key' };
    const started = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/transmissions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          audience: 'snow',
          message: 'How is the team doing?',
          history: [],
          context: {
            party: { enabledCompanionIds: ['snow'] },
            bondMemory: { enabled: false, approved: [] },
          },
          commandMode: 'none',
        }),
      }),
      env,
      { waitUntil: (promise) => backgroundWork.push(promise) },
    );
    expect(started.status).toBe(202);
    expect(await started.json()).toMatchObject({ requestId, status: 'pending' });
    expect(backgroundWork).toHaveLength(1);

    finishOpenAi(
      new Response(
        JSON.stringify({
          status: 'completed',
          output: [
            {
              type: 'message',
              content: [
                {
                  type: 'output_text',
                  text: JSON.stringify({
                    title: 'Team pulse',
                    replies: [{ companionId: 'snow', message: 'Everyone is linked and ready.' }],
                    memoryCandidates: [],
                    handoff: { companionId: 'snow', summary: '', prompt: '' },
                  }),
                },
              ],
            },
          ],
          usage: { input_tokens: 20, output_tokens: 10, total_tokens: 30 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    await Promise.all(backgroundWork);

    const resumed = await intelligence.default.fetch(
      new Request(`https://system.test/api/ai/transmissions/${requestId}`, {
        headers: {
          origin: 'https://system.test',
          'oai-authenticated-user-id': 'hunter-one',
        },
      }),
      env,
    );
    expect(resumed.status).toBe(200);
    expect(await resumed.json()).toMatchObject({ title: 'Team pulse' });

    const stranger = await intelligence.default.fetch(
      new Request(`https://system.test/api/ai/transmissions/${requestId}`, {
        headers: {
          origin: 'https://system.test',
          'oai-authenticated-user-id': 'hunter-two',
        },
      }),
      env,
    );
    expect(stranger.status).toBe(404);
    expect([...rows.values()][0]).not.toHaveProperty('request_body');
  });

  it('sends a campaign follow-up through the focused Reawakening schema', async () => {
    let openAiBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        openAiBody = JSON.parse(String(init.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            status: 'completed',
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: JSON.stringify({
                      title: 'Marvel Tokon Reawakening',
                      replies: [
                        {
                          companionId: 'haven',
                          message:
                            'That is enough direction. I can build the return around learning in public.',
                        },
                      ],
                      memoryCandidates: [],
                      campaign: {
                        name: '',
                        strategy: '',
                        weeks: 0,
                        operations: [],
                        confirmation: '',
                      },
                    }),
                  },
                ],
              },
            ],
            usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 },
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
          audience: 'haven',
          message: "There's a new Marvel Tokon game. I am bad at it, but it is fun.",
          history: [
            {
              role: 'companion',
              companionId: 'haven',
              message: 'What game should this four-week Reawakening campaign be built around?',
            },
          ],
          context: {
            party: { enabledCompanionIds: ['haven'] },
            bondMemory: { enabled: false, approved: [] },
          },
          commandMode: 'propose',
        }),
      }),
      { OPENAI_API_KEY: 'test-key' },
    );

    expect(response.status).toBe(200);
    expect(openAiBody).toMatchObject({
      model: 'gpt-5.6-sol',
      max_output_tokens: 8_000,
      reasoning: { effort: 'high' },
    });
    const format = openAiBody?.text as {
      format: {
        name: string;
        schema: {
          required: string[];
          properties: {
            campaign: {
              properties: { weeks: { maximum: number }; operations: { maxItems: number } };
            };
          };
        };
      };
    };
    expect(format.format.name).toBe('headquarters_campaign_forge');
    expect(format.format.schema.required).toEqual([
      'title',
      'replies',
      'memoryCandidates',
      'handoff',
      'campaign',
    ]);
    expect(format.format.schema.properties.campaign.properties.weeks.maximum).toBe(12);
    expect(format.format.schema.properties.campaign.properties.operations.maxItems).toBe(12);
    expect(await response.json()).toMatchObject({
      route: 'sovereign',
      workload: 'campaign-forge',
    });
  });

  it('surfaces a structured refusal clearly without wasting a retry', async () => {
    const mockedFetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: 'completed',
            output: [
              {
                type: 'message',
                content: [{ type: 'refusal', refusal: 'I cannot help with that request.' }],
              },
            ],
            usage: { input_tokens: 50, output_tokens: 8, total_tokens: 58 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    vi.stubGlobal('fetch', mockedFetch);

    const response = await intelligence.default.fetch(
      new Request('https://system.test/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://system.test' },
        body: JSON.stringify({
          audience: 'snow',
          message: 'Respond to this request.',
          history: [],
          context: {
            party: { enabledCompanionIds: ['snow'] },
            bondMemory: { enabled: false, approved: [] },
          },
        }),
      }),
      { OPENAI_API_KEY: 'test-key', OPENAI_TEXT_MODEL: 'test-model' },
    );

    expect(response.status).toBe(422);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({
      code: 'response-refused',
      message: 'I cannot help with that request.',
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
