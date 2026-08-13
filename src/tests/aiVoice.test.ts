import { beforeEach, describe, expect, it } from 'vitest';
import { CANON_VOICE_PROFILES, inferAiVoiceScene } from '@/config/aiVoices';
import { db } from '@/db/database';
import {
  estimateSpeechCostUsd,
  estimateRealtimeCostUsd,
  estimateTextCostUsd,
  getAiUsageSummary,
  getAiVoiceProfiles,
  recordAiUsage,
  resetAiVoiceProfile,
  saveAiVoiceProfile,
} from '@/game/aiVoice';
import type { AiVoiceProfile } from '@/types/game';

describe('Voice Link local profiles and usage', () => {
  beforeEach(async () => {
    await db.aiVoiceProfiles.clear();
    await db.aiUsageRecords.clear();
  });

  it('provides eleven distinct canon soulprints with deliberately authored performance directions', async () => {
    const profiles = await getAiVoiceProfiles();
    expect(Object.keys(profiles)).toHaveLength(11);
    expect(new Set(Object.values(profiles).map((profile) => profile.voice)).size).toBeGreaterThanOrEqual(10);
    expect(profiles.haven).toMatchObject({ voice: 'fable', accent: 'caribbean' });
    expect(profiles.ember).toMatchObject({
      register: 'low-mid',
      resonance: 'chest',
      performanceTake: 'dynamic',
    });
    expect(profiles.snow.performanceTake).not.toBe(profiles.saffron.performanceTake);
    expect(CANON_VOICE_PROFILES.snow.direction).toMatch(/older sister/i);
    expect(CANON_VOICE_PROFILES.ember.direction).toMatch(/obstacle/i);
    expect(CANON_VOICE_PROFILES.saffron.direction).toMatch(/high-pressure/i);
    expect(CANON_VOICE_PROFILES.quill.direction).toMatch(/lore connection/i);
  });

  it('saves tuning safely and restores the original soulprint', async () => {
    const profiles = await getAiVoiceProfiles();
    const saved = await saveAiVoiceProfile({
      ...profiles.snow,
      voice: 'verse',
      accent: 'irish',
      pace: 1.5,
      warmth: 20,
    });
    expect(saved).toMatchObject({
      voice: 'verse',
      accent: 'irish',
      pace: 1.5,
      warmth: 5,
      naturalism: 5,
      pauseDiscipline: 4,
    });
    expect((await getAiVoiceProfiles()).snow.voice).toBe('verse');

    const reset = await resetAiVoiceProfile('snow');
    expect(reset.voice).toBe(CANON_VOICE_PROFILES.snow.voice);
    expect((await getAiVoiceProfiles()).snow.accent).toBe('natural');
  });

  it('upgrades a legacy saved soulprint with the full living-performance controls', async () => {
    await db.aiVoiceProfiles.put({
      id: 'snow',
      voice: 'verse',
      accent: 'british',
      pace: 1.2,
      warmth: 4,
      energy: 3,
      expressiveness: 4,
      updatedAt: '2026-08-11T14:00:00.000Z',
    } as AiVoiceProfile);

    const profile = (await getAiVoiceProfiles()).snow;
    expect(profile).toMatchObject({
      voice: 'verse',
      accent: 'british',
      delivery: CANON_VOICE_PROFILES.snow.delivery,
      cadence: CANON_VOICE_PROFILES.snow.cadence,
      texture: CANON_VOICE_PROFILES.snow.texture,
      naturalism: CANON_VOICE_PROFILES.snow.naturalism,
      pauseDiscipline: CANON_VOICE_PROFILES.snow.pauseDiscipline,
      register: CANON_VOICE_PROFILES.snow.register,
      resonance: CANON_VOICE_PROFILES.snow.resonance,
      performanceTake: CANON_VOICE_PROFILES.snow.performanceTake,
      intonation: CANON_VOICE_PROFILES.snow.intonation,
      articulation: CANON_VOICE_PROFILES.snow.articulation,
      emotionalRange: CANON_VOICE_PROFILES.snow.emotionalRange,
    });
  });

  it('selects an emotional scene without changing the companion soulprint', () => {
    expect(inferAiVoiceScene('I am proud of you. You crushed that level up.')).toBe('celebration');
    expect(inferAiVoiceScene('Breathe. I know this feels overwhelming.')).toBe('support');
    expect(inferAiVoiceScene('No excuses. Do it now.')).toBe('accountability');
    expect(inferAiVoiceScene('First, hold this stretch for thirty seconds.')).toBe('instruction');
    expect(inferAiVoiceScene('Let us compare the best path to World Class.')).toBe('strategy');
  });

  it('prices mixed realtime text and audio tokens without double counting cached input', () => {
    expect(
      estimateRealtimeCostUsd({
        model: 'gpt-realtime-2.1-mini',
        inputTokens: 1_000,
        cachedInputTokens: 400,
        outputTokens: 500,
        audioInputTokens: 800,
        cachedAudioInputTokens: 300,
        audioOutputTokens: 400,
      }),
    ).toBeCloseTo(0.013396, 8);
  });

  it('separates session, daily, and monthly usage while keeping spend clearly estimated', async () => {
    await recordAiUsage({
      id: 'text:current',
      kind: 'text',
      sessionId: 'session:current',
      createdAt: '2026-08-11T14:00:00.000Z',
      model: 'gpt-5.6-luna',
      inputTokens: 1_000,
      cachedInputTokens: 500,
      outputTokens: 500,
      reasoningTokens: 25,
      totalTokens: 1_500,
      characters: 0,
      audioSeconds: 0,
      estimatedCostUsd: estimateTextCostUsd('gpt-5.6-luna', 1_000, 500, 500),
      exactUsage: true,
    });
    await recordAiUsage({
      id: 'speech:other-session',
      kind: 'speech',
      sessionId: 'session:older',
      createdAt: '2026-08-10T16:00:00.000Z',
      model: 'gpt-4o-mini-tts',
      companionId: 'snow',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      characters: 1_000,
      audioSeconds: 60,
      estimatedCostUsd: estimateSpeechCostUsd(1_000),
      exactUsage: false,
    });
    await recordAiUsage({
      id: 'text:previous-month',
      kind: 'text',
      sessionId: 'session:older',
      createdAt: '2026-07-31T16:00:00.000Z',
      model: 'gpt-5.6-luna',
      inputTokens: 100,
      outputTokens: 100,
      totalTokens: 200,
      characters: 0,
      audioSeconds: 0,
      estimatedCostUsd: 0.01,
      exactUsage: true,
    });

    const summary = await getAiUsageSummary(
      'session:current',
      new Date('2026-08-11T18:00:00.000Z'),
    );
    expect(summary.session.calls).toBe(1);
    expect(summary.today.calls).toBe(1);
    expect(summary.month.calls).toBe(2);
    expect(summary.month.totalTokens).toBe(1_500);
    expect(summary.month.cachedInputTokens).toBe(500);
    expect(summary.month.reasoningTokens).toBe(25);
    expect(summary.month.audioSeconds).toBe(60);
    expect(summary.month.estimatedCostUsd).toBeGreaterThan(0);
    expect(summary.byModel['gpt-5.6-luna'].calls).toBe(1);
    expect(estimateTextCostUsd('gpt-5.6-luna', 1_000, 500)).toBeCloseTo(0.0008, 8);
    expect(estimateTextCostUsd('gpt-5.6-luna', 1_000, 500, 500)).toBeCloseTo(0.00071, 8);
  });
});
