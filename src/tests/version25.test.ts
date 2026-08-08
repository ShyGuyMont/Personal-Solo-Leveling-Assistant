import { beforeEach, describe, expect, it } from 'vitest';
import { COMPANION_QUESTLINES } from '@/config/questlines';
import { db } from '@/db/database';
import { saveConfiguration } from '@/db/repositories';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { createSuggestedDailyBriefing } from '@/game/briefing';
import { ensureDailyRecords } from '@/game/engine';
import { createCampaignArc, getCampaignArcs, toggleArcMilestone } from '@/game/campaigns';
import { ensureMonthlyCouncil } from '@/game/council';
import { createPartyCheckIn } from '@/game/partyChat';
import {
  completeManualQuestObjective,
  completeQuestChapter,
  getQuestProgressView,
  startQuestline,
} from '@/game/questlines';

describe('Campaign systems through Version 3.0', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Campaign Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('provides nine extensive five-chapter questlines with unique objectives and titles', () => {
    expect(COMPANION_QUESTLINES).toHaveLength(9);
    expect(new Set(COMPANION_QUESTLINES.map((questline) => questline.companionId)).size).toBe(9);
    expect(new Set(COMPANION_QUESTLINES.map((questline) => questline.completionTitleId)).size).toBe(
      9,
    );
    const chapters = COMPANION_QUESTLINES.flatMap((questline) => questline.chapters);
    const objectives = chapters.flatMap((chapter) => chapter.objectives);
    expect(chapters).toHaveLength(45);
    expect(objectives).toHaveLength(135);
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(45);
    expect(new Set(objectives.map((objective) => objective.id)).size).toBe(135);
    expect(
      chapters.every((chapter) => chapter.objectives.length === 3 && chapter.rewardXp > 0),
    ).toBe(true);
    expect(COMPANION_QUESTLINES.find((item) => item.companionId === 'amara')?.premise).toMatch(
      /unsafe person/i,
    );
  });

  it('keeps only one questline active while preserving every paused chapter', async () => {
    await startQuestline('snow-the-one-who-stayed');
    await startQuestline('amara-courage-to-connect');
    expect((await db.companionQuestProgress.get('snow-the-one-who-stayed'))?.status).toBe('paused');
    expect((await db.companionQuestProgress.get('amara-courage-to-connect'))?.status).toBe(
      'active',
    );
  });

  it('completes a fully satisfied chapter once and awards its fixed reward', async () => {
    const progress = await startQuestline('snow-the-one-who-stayed');
    expect(progress).toBeDefined();
    await createPartyCheckIn('good', '2026-08-01');
    await createPartyCheckIn('okay', '2026-08-01');
    const now = new Date().toISOString();
    for (const date of ['2026-08-01', '2026-08-02'] as const) {
      await db.dailyReviews.put({
        id: date,
        date,
        status: 'finalized',
        startedAt: now,
        finalizedAt: now,
        completionCount: 1,
        activeMissionCount: 2,
        completionRate: 0.5,
        perfectDay: false,
        protectedPerfectDay: false,
        accountXpAwarded: 0,
        statChanges: {},
        verdict: 'An honest day.',
        systemState: 'stable',
        transactionIds: [],
      });
    }
    await completeManualQuestObjective(
      progress!.id,
      'snow-1-truth',
      'Steady support helps me return without shame.',
    );
    const before = await db.progression.get('primary');
    const updated = (await db.companionQuestProgress.get(progress!.id))!;
    expect((await getQuestProgressView(updated)).canCompleteChapter).toBe(true);
    await completeQuestChapter(updated.id);
    const after = await db.progression.get('primary');
    expect(after!.totalXp - before!.totalXp).toBe(100);
    expect((await db.companionQuestProgress.get(updated.id))?.currentChapterIndex).toBe(1);
    expect(await db.xpTransactions.where('kind').equals('companion-quest').count()).toBe(1);
  });

  it('creates low-capacity briefings without bonus pressure or score changes', async () => {
    const before = await db.progression.get('primary');
    await ensureDailyRecords('2026-08-01');
    const briefing = await createSuggestedDailyBriefing('2026-08-01', 'low');
    expect(briefing.status).toBe('planned');
    expect(briefing.bonusMissionId).toBeUndefined();
    expect(briefing.snowMessage).toMatch(/low|protect|continuity/i);
    expect(await db.progression.get('primary')).toEqual(before);
  });

  it('stores user-authored Campaign Arcs and milestones without inventing XP', async () => {
    const before = await db.progression.get('primary');
    const arc = await createCampaignArc(
      {
        name: 'Launch the chapter',
        purpose: 'Turn a meaningful idea into a finished release.',
        category: 'creator',
        companionId: 'cipher',
      },
      ['Outline', 'Draft', 'Release'],
    );
    const bundle = (await getCampaignArcs()).find((item) => item.arc.id === arc.id)!;
    expect(bundle.milestones).toHaveLength(3);
    await toggleArcMilestone(bundle.milestones[0].id);
    expect((await db.arcMilestones.get(bundle.milestones[0].id))?.status).toBe('completed');
    expect(await db.progression.get('primary')).toEqual(before);
  });

  it('assembles one nine-message Monthly Council from finalized facts without changing XP', async () => {
    const now = new Date().toISOString();
    await db.dailyReviews.put({
      id: '2026-07-31',
      date: '2026-07-31',
      status: 'finalized',
      startedAt: now,
      finalizedAt: now,
      completionCount: 1,
      activeMissionCount: 1,
      completionRate: 1,
      perfectDay: true,
      protectedPerfectDay: false,
      accountXpAwarded: 0,
      statChanges: {},
      verdict: 'Perfect Day.',
      systemState: 'ascending',
      transactionIds: [],
    });
    await db.dailyMissions.put({
      id: '2026-07-31:kind-message',
      date: '2026-07-31',
      missionId: 'kind-message',
      status: 'completed',
      details: {},
      completedAt: now,
      updatedAt: now,
      protectedException: false,
    });
    const before = await db.progression.get('primary');
    const first = await ensureMonthlyCouncil('2026-08-01');
    const second = await ensureMonthlyCouncil('2026-08-01');
    expect(first?.id).toBe('monthly-council:2026-07-01');
    expect(second?.id).toBe(first?.id);
    expect(first?.messages).toHaveLength(11);
    expect(first?.messages.map((message) => message.companionId)).toEqual([
      'snow',
      'rook',
      'selah',
      'cipher',
      'haven',
      'ember',
      'mira',
      'amara',
      'cassian',
      'saffron',
      'snow',
    ]);
    expect(first?.metrics.relationshipActions).toBe(1);
    expect(await db.progression.get('primary')).toEqual(before);
  });

  it('reserves the System Architect achievement for an actual mission customization', async () => {
    const profile = (await db.profiles.get('primary'))!;
    const settings = (await db.settings.get('primary'))!;
    const missions = await db.missions.toArray();

    await saveConfiguration({
      profile,
      settings: { ...settings, colorTheme: 'daybreak' },
      missions,
    });

    expect((await db.achievements.get('customized'))?.unlockedAt).toBeUndefined();
    expect(
      await db.auditEntries.where('action').equals('mission-configuration-updated').count(),
    ).toBe(0);

    await saveConfiguration({
      profile,
      settings: { ...settings, colorTheme: 'daybreak' },
      missions: missions.map((mission) =>
        mission.id === 'prayer' ? { ...mission, name: 'Focused Prayer' } : mission,
      ),
    });

    expect((await db.achievements.get('customized'))?.unlockedAt).toBeTruthy();
    expect(
      await db.auditEntries.where('action').equals('mission-configuration-updated').count(),
    ).toBe(1);
  });
});
