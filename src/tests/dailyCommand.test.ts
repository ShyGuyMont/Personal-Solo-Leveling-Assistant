import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_MISSIONS } from '@/config/missions';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { createSuggestedDailyBriefing, getDailyCommandProgress } from '@/game/briefing';
import {
  completeMission,
  ensureDailyRecords,
  finalizeDailyReview,
  setMissionStatus,
} from '@/game/engine';
import type { DailyMissionRecord } from '@/types/game';
import { addDays, getSystemDateKey } from '@/utils/date';

describe("Snow's retired Daily Command compatibility", () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Command Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('requires broad daily completion in addition to Snow’s priority slots', async () => {
    const settings = (await db.settings.get('primary'))!;
    const systemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
    await ensureDailyRecords(systemDate);
    const briefing = await createSuggestedDailyBriefing(systemDate, 'high');
    const records = await db.dailyMissions.where('date').equals(systemDate).toArray();
    const priorityIds = new Set([
      briefing.mainMissionId,
      briefing.supportMissionId,
      briefing.bonusMissionId,
    ]);
    const threePriorityRecords = records.map((record) => ({
      ...record,
      status: priorityIds.has(record.missionId) ? ('completed' as const) : record.status,
    }));
    const prioritiesOnly = getDailyCommandProgress(briefing, threePriorityRecords);
    expect(prioritiesOnly.prioritiesComplete).toBe(true);
    expect(prioritiesOnly.clearedMissionCount).toBe(3);
    expect(prioritiesOnly.targetMissionCount).toBe(5);
    expect(prioritiesOnly.outcome).toBe('pending');
    expect(prioritiesOnly.multiplier).toBe(1);

    let added = 0;
    const fiveClears = threePriorityRecords.map((record) => {
      if (record.status === 'completed' || added >= 2) return record;
      added += 1;
      return { ...record, status: 'completed' as const };
    });
    const highClear = getDailyCommandProgress(briefing, fiveClears);
    expect(highClear.clearedMissionCount).toBe(5);
    expect(highClear.outcome).toBe('standard-clear');
    expect(highClear.multiplier).toBe(2);
  });

  it('closes a legacy High command without stacking rewards over the amplified baseline', async () => {
    const settings = (await db.settings.get('primary'))!;
    const systemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
    const commandDate = addDays(systemDate, -1);
    await ensureDailyRecords(commandDate);
    await createSuggestedDailyBriefing(commandDate, 'high');

    for (const mission of DEFAULT_MISSIONS) {
      await completeMission({
        date: commandDate,
        missionId: mission.id,
        systemDate,
      });
    }

    const beforeReview = (await db.progression.get('primary'))!;
    expect(beforeReview.totalXp).toBe(430);
    const review = await finalizeDailyReview(commandDate, systemDate);
    expect(review.dailyCommandOutcome).toBeUndefined();
    expect(review.dailyCommandMultiplier).toBe(1);
    expect(review.dailyCommandBonusXp).toBe(0);
    expect(review.accountXpAwarded).toBe(125);
    expect((await db.progression.get('primary'))?.totalXp).toBe(555);
    expect((await db.stats.get('strength'))?.totalXp).toBe(27);
    expect(await db.xpTransactions.where('kind').equals('daily-command').count()).toBe(0);
    expect(await db.statTransactions.where('kind').equals('daily-command').count()).toBe(0);

    const repeated = await finalizeDailyReview(commandDate, systemDate);
    expect(repeated).toEqual(review);
    expect((await db.progression.get('primary'))?.totalXp).toBe(555);
  });

  it('keeps Low Capacity penalty-free and gives it no command multiplier', async () => {
    const settings = (await db.settings.get('primary'))!;
    const systemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
    await ensureDailyRecords(systemDate);
    const briefing = await createSuggestedDailyBriefing(systemDate, 'low');
    const records = (await db.dailyMissions.where('date').equals(systemDate).toArray()).map(
      (record, index): DailyMissionRecord => ({
        ...record,
        status: index === 0 ? 'completed' : 'pending',
      }),
    );
    const progress = getDailyCommandProgress(briefing, records);
    expect(progress.outcome).toBe('not-applicable');
    expect(progress.multiplier).toBe(1);
    expect(briefing.supportMissionId).toBeUndefined();
    expect(briefing.bonusMissionId).toBeUndefined();
  });

  it('keeps every normal reward when a High command target is missed', async () => {
    const settings = (await db.settings.get('primary'))!;
    const systemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
    const commandDate = addDays(systemDate, -1);
    await ensureDailyRecords(commandDate);
    const briefing = await createSuggestedDailyBriefing(commandDate, 'high');
    const priorityIds = new Set([
      briefing.mainMissionId,
      briefing.supportMissionId,
      briefing.bonusMissionId,
    ]);
    const records = await db.dailyMissions.where('date').equals(commandDate).toArray();
    for (const record of records) {
      if (priorityIds.has(record.missionId)) {
        await completeMission({ date: commandDate, missionId: record.missionId, systemDate });
      } else {
        await setMissionStatus({
          date: commandDate,
          missionId: record.missionId,
          status: 'failed',
        });
      }
    }
    const earnedBeforeReview = (await db.progression.get('primary'))!.totalXp;
    const review = await finalizeDailyReview(commandDate, systemDate);
    expect(review.dailyCommandOutcome).toBeUndefined();
    expect(review.dailyCommandMultiplier).toBe(1);
    expect(review.dailyCommandBonusXp).toBe(0);
    expect(review.accountXpAwarded).toBe(0);
    expect((await db.progression.get('primary'))?.totalXp).toBe(earnedBeforeReview);
    expect(await db.xpTransactions.where('kind').equals('daily-command').count()).toBe(0);
  });
});
