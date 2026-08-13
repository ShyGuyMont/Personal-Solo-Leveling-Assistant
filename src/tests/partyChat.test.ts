import { beforeEach, describe, expect, it } from 'vitest';
import { PARTY_DIALOGUE, PARTY_MOODS } from '@/config/partyChat';
import { db } from '@/db/database';
import { getArchiveData } from '@/db/repositories';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { buildPartyMessages, createPartyCheckIn } from '@/game/partyChat';

describe('Party Check-In', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Party Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('gives every mood a deep, complete dialogue library', () => {
    expect(PARTY_MOODS).toHaveLength(10);
    for (const mood of PARTY_MOODS) {
      const pools = PARTY_DIALOGUE[mood.id];
      expect(Object.values(pools)).toHaveLength(12);
      for (const pool of Object.values(pools)) {
        expect(pool.length).toBeGreaterThanOrEqual(4);
        expect(pool.every((line: string) => line.length > 30)).toBe(true);
      }
    }
  });

  it('builds the full party response with Snow opening and closing', () => {
    const messages = buildPartyMessages('good', [], 'test-check-in');
    expect(messages).toHaveLength(12);
    expect(messages.map((message) => message.companionId)).toEqual([
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
      'quill',
      'snow',
    ]);
    expect(messages[0].role).toBe('opener');
    expect(messages.at(-1)?.role).toBe('closing');
  });

  it('does not repeat a line until its relevant pool is exhausted', async () => {
    const checkIns = [];
    for (let index = 0; index < 4; index += 1) {
      checkIns.push(await createPartyCheckIn('tired', '2026-08-01'));
    }
    for (let order = 0; order < 12; order += 1) {
      expect(new Set(checkIns.map((checkIn) => checkIn.messages[order].messageId)).size).toBe(4);
    }
    const fifth = await createPartyCheckIn('tired', '2026-08-01');
    for (let order = 0; order < 12; order += 1) {
      expect(fifth.messages[order].messageId).not.toBe(checkIns[3].messages[order].messageId);
    }
  });

  it('saves privately without changing XP, streaks, missions, or rewards', async () => {
    const progressionBefore = await db.progression.get('primary');
    const transactionsBefore = await db.xpTransactions.count();
    const missionsBefore = await db.dailyMissions.count();
    const checkIn = await createPartyCheckIn('lonely', '2026-08-01');
    const progressionAfter = await db.progression.get('primary');

    expect(await db.partyCheckIns.get(checkIn.id)).toEqual(checkIn);
    expect(progressionAfter).toEqual(progressionBefore);
    expect(await db.xpTransactions.count()).toBe(transactionsBefore);
    expect(await db.dailyMissions.count()).toBe(missionsBefore);
  });

  it('appears in the Archive after it is saved', async () => {
    const checkIn = await createPartyCheckIn('okay', '2026-08-01');
    const archive = await getArchiveData();

    expect(archive.partyCheckIns.map((item) => item.id)).toContain(checkIn.id);
  });
});
