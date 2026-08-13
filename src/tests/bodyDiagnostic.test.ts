import { beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/config/balance';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { completeBodyDiagnostic, getBodyDiagnosticData } from '@/game/bodyDiagnostic';
import type { BodyDiagnosticAssessment } from '@/types/game';

const assessment: BodyDiagnosticAssessment = {
  title: 'Weekly Training Hall Diagnostic',
  scanType: 'combined',
  dataQuality: 'usable',
  summary: 'The submitted evidence establishes a useful weekly baseline.',
  comparison: 'No earlier diagnostic is available for a trend comparison.',
  dataQualityNotes: ['Consumer smart-scale values are estimates, not clinical measurements.'],
  metrics: [
    {
      label: 'Scale weight',
      value: '213.9',
      unit: 'lb',
      source: 'scale',
      confidence: 'high',
    },
  ],
  observations: [
    {
      area: 'Baseline consistency',
      observation: 'The evidence can support future like-for-like comparisons.',
      evidence: 'A readable scale screenshot and physique image were supplied.',
      confidence: 'medium',
    },
  ],
  priorities: [
    {
      title: 'Repeat under consistent conditions',
      why: 'Comparable evidence is more useful than a single isolated reading.',
      nextAction: 'Use similar lighting, distance, pose, and time of day next week.',
    },
  ],
  bonusExercises: [],
  companionMessages: [
    { companionId: 'rook', message: 'Baseline secured. Repeat it next week.' },
    { companionId: 'ember', message: 'Evidence beats guessing. Do not dodge the next scan.' },
    { companionId: 'mira', message: 'Keep the conditions steady and let the trend speak.' },
  ],
  warnings: [],
  disclaimer: 'This is an AI training review, not medical advice or a diagnosis.',
};

const usage = {
  inputTokens: 1_000,
  cachedInputTokens: 0,
  outputTokens: 300,
  reasoningTokens: 100,
  totalTokens: 1_300,
};

describe('weekly Body Diagnostic', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Diagnostic Hunter',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
    await db.settings.update('primary', { weekStartsOn: 1 });
  });

  it('awards the optional 150 XP account reward exactly once per System week', async () => {
    const before = await getBodyDiagnosticData('2026-08-12');
    expect(before.weekStart).toBe('2026-08-10');
    expect(before.current).toBeUndefined();
    expect(before.weeklyXp).toBe(BALANCE.bodyDiagnostic.weeklyAccountXp);

    const first = await completeBodyDiagnostic({
      date: '2026-08-12',
      goal: 'recomposition',
      hunterContext: 'Compare this under ordinary morning conditions.',
      sourceKinds: ['physique', 'scale'],
      assessment,
      model: 'gpt-5.6-terra',
      usage,
    });
    const duplicate = await completeBodyDiagnostic({
      date: '2026-08-13',
      goal: 'recomposition',
      sourceKinds: ['scale'],
      assessment,
      model: 'gpt-5.6-terra',
      usage,
    });

    expect(first.awardedXp).toBe(150);
    expect(first.alreadyCompleted).toBe(false);
    expect(duplicate.awardedXp).toBe(0);
    expect(duplicate.alreadyCompleted).toBe(true);
    expect(await db.bodyDiagnostics.count()).toBe(1);
    expect(await db.xpTransactions.where('kind').equals('body-diagnostic').count()).toBe(1);
    expect((await db.progression.get('primary'))?.totalXp).toBe(150);

    const after = await getBodyDiagnosticData('2026-08-12');
    expect(after.current?.rewardApplied).toBe(true);
    expect(after.current?.sourceKinds).toEqual(['physique', 'scale']);
    expect(after.nextEligibleDate).toBe('2026-08-17');
  });

  it('opens a fresh diagnostic on the next configured week without retaining photos', async () => {
    await completeBodyDiagnostic({
      date: '2026-08-12',
      goal: 'balanced',
      sourceKinds: ['physique'],
      assessment,
      model: 'gpt-5.6-terra',
      usage,
    });

    const nextWeek = await getBodyDiagnosticData('2026-08-17');
    expect(nextWeek.current).toBeUndefined();
    expect(nextWeek.previous?.date).toBe('2026-08-12');
    expect(JSON.stringify(nextWeek.previous)).not.toMatch(/data:image|base64|photo/i);
  });
});
