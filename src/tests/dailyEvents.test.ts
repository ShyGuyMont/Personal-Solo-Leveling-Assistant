import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  activateDailyEvent,
  claimMissionPass,
  completeEmergencyQuest,
  consumeMissionPass,
  ensureDailyEvent,
  rollDailyEventKind,
} from '@/game/dailyEvents';
import { ensureDailyRecords } from '@/game/engine';
import { getSystemDateKey } from '@/utils/date';

describe('rare daily events', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Event Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('uses one weighted roll with the documented boundaries', () => {
    expect(rollDailyEventKind(0)).toBe('emergency-quest');
    expect(rollDailyEventKind(0.0699)).toBe('emergency-quest');
    expect(rollDailyEventKind(0.07)).toBe('mission-pass');
    expect(rollDailyEventKind(0.1199)).toBe('mission-pass');
    expect(rollDailyEventKind(0.12)).toBe('none');
  });

  it('persists the first roll and cannot be rerolled by refreshing', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    const first = await ensureDailyEvent(today, () => 0.08);
    const second = await ensureDailyEvent(today, () => 0);
    expect(first?.kind).toBe('mission-pass');
    expect(second?.kind).toBe('mission-pass');
    expect(await db.dailyEvents.where('date').equals(today).count()).toBe(1);
  });

  it('claims and consumes a Mission Pass without spending a monthly exception', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    await ensureDailyRecords(today);
    await ensureDailyEvent(today, () => 0.08);
    await claimMissionPass(today);
    expect((await db.inventory.get('mission-pass'))?.quantity).toBe(1);
    await consumeMissionPass(today, 'prayer');
    const record = await db.dailyMissions.get(`${today}:prayer`);
    expect(record?.status).toBe('excused');
    expect(record?.protectedException).toBe(true);
    expect(record?.protectionSource).toBe('mission-pass');
    expect((await db.inventory.get('mission-pass'))?.quantity).toBe(0);
    expect((await db.settings.get('primary'))?.protectedExceptionsUsed).toEqual({});
  });

  it('awards an Emergency Quest exactly once', async () => {
    const settings = await db.settings.get('primary');
    const today = getSystemDateKey(new Date(), settings!.resetTime, settings!.timeZone);
    await ensureDailyEvent(today, () => 0);
    await activateDailyEvent(today);
    const reward = await completeEmergencyQuest(today);
    expect(reward.awardedXp).toBe(120);
    expect((await db.progression.get('primary'))?.totalXp).toBe(120);
    expect((await db.dailyEvents.get(today))?.status).toBe('completed');
    await expect(completeEmergencyQuest(today)).rejects.toThrow(/not active/);
    expect((await db.progression.get('primary'))?.totalXp).toBe(120);
  });
});

