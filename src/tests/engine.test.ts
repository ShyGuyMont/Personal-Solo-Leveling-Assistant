import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  completeMission,
  ensureDailyRecords,
  finalizeDailyReview,
  setMissionStatus,
  undoMission,
} from '@/game/engine';
import { addDays, getSystemDateKey } from '@/utils/date';

describe('mission transaction engine', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Test Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('prevents duplicate reward application', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    await ensureDailyRecords(today);
    await completeMission({ date: today, missionId: 'prayer', systemDate: today });
    await completeMission({ date: today, missionId: 'prayer', systemDate: today });
    const rewards = await db.xpTransactions.where('sourceId').equals('prayer').toArray();
    expect(rewards).toHaveLength(1);
    expect((await db.progression.get('primary'))?.totalXp).toBe(20);
  });

  it('reverses mission rewards once', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    await ensureDailyRecords(today);
    await completeMission({ date: today, missionId: 'workout', systemDate: today });
    await undoMission(today, 'workout');
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
    expect((await db.dailyMissions.get(`${today}:workout`))?.status).toBe('pending');
    expect(await db.xpTransactions.where('sourceId').equals('workout').count()).toBe(2);
  });

  it('blocks ordinary undo outside the active System day', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    await expect(undoMission(addDays(today, -1), 'workout')).rejects.toThrow(/active System day/);
  });

  it('does not allow the full-day integrity mission to complete early', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    await ensureDailyRecords(today);
    await expect(
      completeMission({ date: today, missionId: 'no-porn', systemDate: today }),
    ).rejects.toThrow(/Daily Review/);
  });

  it('finalizes a missed date exactly once', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    const yesterday = addDays(today, -1);
    await db.appMetadata.put({
      id: 'last-system-day',
      value: yesterday,
      updatedAt: new Date().toISOString(),
    });
    await ensureDailyRecords(today);
    const records = await db.dailyMissions.where('date').equals(yesterday).toArray();
    for (const record of records) {
      await setMissionStatus({
        date: yesterday,
        missionId: record.missionId,
        status: 'failed',
      });
    }
    const first = await finalizeDailyReview(yesterday, today);
    const second = await finalizeDailyReview(yesterday, today);
    expect(first.finalizedAt).toBe(second.finalizedAt);
    expect(await db.dailyReviews.where('date').equals(yesterday).count()).toBe(1);
  });

  it('does not let an unresolved optional mission prevent a Perfect Day', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    const yesterday = addDays(today, -1);
    await db.missions.put({
      id: 'optional-test',
      name: 'Optional Test',
      shortName: 'Optional',
      description: 'Test-only optional mission.',
      category: 'discipline',
      method: 'toggle',
      accountXp: 1,
      statRewards: [{ stat: 'discipline', xp: 1 }],
      enabled: true,
      isCore: false,
      optional: true,
      allowNotes: false,
      detailFields: [],
      recoveryEligible: true,
    });
    await db.appMetadata.put({
      id: 'last-system-day',
      value: yesterday,
      updatedAt: new Date().toISOString(),
    });
    await ensureDailyRecords(today);
    const records = await db.dailyMissions.where('date').equals(yesterday).toArray();
    for (const record of records.filter((item) => item.missionId !== 'optional-test')) {
      await completeMission({
        date: yesterday,
        missionId: record.missionId,
        systemDate: today,
      });
    }
    const review = await finalizeDailyReview(yesterday, today);
    expect(review.perfectDay).toBe(true);
    expect((await db.dailyMissions.get(`${yesterday}:optional-test`))?.status).toBe('skipped');
  });
});
