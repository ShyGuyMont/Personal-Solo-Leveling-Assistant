import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { buildCampfireMessages, ensureWeeklyCampfireRecap } from '@/game/campfire';
import type { CampfireMetrics } from '@/types/game';

describe('Weekly Campfire Recaps', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Campfire Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('gives every companion an evidence-based seat at the campfire', () => {
    const metrics: CampfireMetrics = {
      recordedDays: 5,
      completedMissions: 18,
      availableMissions: 25,
      completionRate: 0.72,
      perfectDays: 1,
      categoryCompleted: { faith: 4, physical: 3, discipline: 4, creator: 4, character: 3 },
      categoryAvailable: { faith: 5, physical: 5, discipline: 5, creator: 5, character: 5 },
      strongestCategory: 'faith',
      focusCategory: 'physical',
    };
    const messages = buildCampfireMessages(metrics, '2026-07-27');
    expect(messages.map((message) => message.companionId)).toEqual([
      'snow',
      'rook',
      'selah',
      'cipher',
      'haven',
      'ember',
      'amara',
      'cassian',
      'snow',
    ]);
    expect(messages.every((message) => message.message.length > 40)).toBe(true);
  });

  it('creates one permanent recap for the completed week without changing progression', async () => {
    const now = new Date().toISOString();
    await db.dailyReviews.put({
      id: '2026-08-01',
      date: '2026-08-01',
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
      id: '2026-08-01:workout',
      date: '2026-08-01',
      missionId: 'workout',
      status: 'completed',
      details: {},
      completedAt: now,
      updatedAt: now,
      protectedException: false,
    });
    const before = await db.progression.get('primary');
    const first = await ensureWeeklyCampfireRecap('2026-08-03', 1);
    const second = await ensureWeeklyCampfireRecap('2026-08-03', 1);
    expect(first?.id).toBe('campfire:2026-07-27');
    expect(second?.id).toBe(first?.id);
    expect(await db.campfireRecaps.count()).toBe(1);
    expect(first?.metrics.completedMissions).toBe(1);
    expect(await db.progression.get('primary')).toEqual(before);
  });
});
