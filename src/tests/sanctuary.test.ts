import { beforeEach, describe, expect, it } from 'vitest';
import { LONELINESS_INTEGRITY_LINES, SCRIPTURE_LIBRARY } from '@/config/scripture';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  completeSanctuarySession,
  getSanctuaryMessages,
  getSanctuaryPassages,
  markSanctuaryMissionCredited,
  startSanctuarySession,
} from '@/game/sanctuary';
import type { LocalDateKey, SanctuaryConcern } from '@/types/game';

const DATE = '2026-08-04' as LocalDateKey;

describe('Scripture Sanctuary', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Sanctuary Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('contains 96 unique references with eight paths for every concern', () => {
    expect(SCRIPTURE_LIBRARY).toHaveLength(96);
    expect(new Set(SCRIPTURE_LIBRARY.map((passage) => passage.id)).size).toBe(96);
    expect(new Set(SCRIPTURE_LIBRARY.map((passage) => passage.reference)).size).toBe(96);

    const concerns = new Set<SanctuaryConcern>(SCRIPTURE_LIBRARY.map((passage) => passage.concern));
    expect(concerns.size).toBe(12);
    concerns.forEach((concern) => {
      expect(SCRIPTURE_LIBRARY.filter((passage) => passage.concern === concern)).toHaveLength(8);
    });
  });

  it('connects loneliness and sexual integrity with Amara and a three-passage study', async () => {
    const session = await startSanctuarySession({
      date: DATE,
      mode: 'study',
      primaryConcern: 'sexual-integrity',
      secondaryConcern: 'loneliness',
    });
    const passages = getSanctuaryPassages(session);
    const messages = getSanctuaryMessages(session);

    expect(passages).toHaveLength(3);
    expect(passages.filter((passage) => passage.concern === 'sexual-integrity')).toHaveLength(2);
    expect(passages.filter((passage) => passage.concern === 'loneliness')).toHaveLength(1);
    expect(session.companionIds).toContain('amara');
    expect(LONELINESS_INTEGRITY_LINES).toContain(
      messages.find((message) => message.companionId === 'amara')?.text,
    );
  });

  it('rotates unused passages before repeating a path', async () => {
    const first = await startSanctuarySession({
      date: DATE,
      mode: 'study',
      primaryConcern: 'stress',
    });
    await completeSanctuarySession({ id: first.id });
    const second = await startSanctuarySession({
      date: DATE,
      mode: 'study',
      primaryConcern: 'stress',
    });

    expect(new Set(first.passageIds).size).toBe(3);
    expect(second.passageIds).toHaveLength(3);
    expect(second.passageIds.some((id) => first.passageIds.includes(id))).toBe(false);
  });

  it('keeps Stronghold support free of XP and refuses Bible credit for that mode', async () => {
    const before = (await db.progression.get('primary'))?.totalXp;
    const active = await startSanctuarySession({
      date: DATE,
      mode: 'stronghold',
      primaryConcern: 'anger',
      secondaryConcern: 'stress',
    });
    const completed = await completeSanctuarySession({
      id: active.id,
      reflection: 'I need to leave the room before responding.',
      nextAction: 'Walk for ten minutes and call someone safe.',
      outcome: 'moved',
    });
    const afterCreditAttempt = await markSanctuaryMissionCredited(completed.id);

    expect(completed.status).toBe('completed');
    expect(completed.passageIds).toHaveLength(2);
    expect(afterCreditAttempt?.bibleMissionCredited).toBe(false);
    expect((await db.progression.get('primary'))?.totalXp).toBe(before);
  });

  it('stores bounded private study notes and marks a completed study credit once', async () => {
    const active = await startSanctuarySession({
      date: DATE,
      mode: 'study',
      primaryConcern: 'doubt',
    });
    const completed = await completeSanctuarySession({
      id: active.id,
      reflection: `  ${'r'.repeat(2200)}  `,
      prayer: `  ${'p'.repeat(3200)}  `,
      nextAction: `  ${'n'.repeat(700)}  `,
    });
    const credited = await markSanctuaryMissionCredited(completed.id);
    const creditedAgain = await markSanctuaryMissionCredited(completed.id);

    expect(completed.reflection).toHaveLength(2000);
    expect(completed.prayer).toHaveLength(3000);
    expect(completed.nextAction).toHaveLength(500);
    expect(credited?.bibleMissionCredited).toBe(true);
    expect(creditedAgain).toEqual(credited);
  });
});
