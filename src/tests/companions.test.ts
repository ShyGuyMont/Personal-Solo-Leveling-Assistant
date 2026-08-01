import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  acknowledgeCompanionReaction,
  getNextCompanionReaction,
  queueCompanionReaction,
} from '@/game/companions';

describe('System companions', () => {
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

  it('routes stat level-ups to the companion responsible for that stat', async () => {
    const reaction = await queueCompanionReaction({
      trigger: 'stat-level',
      sourceId: 'test:strength:2',
      stat: 'strength',
      statLabel: 'Strength',
      level: 2,
    });
    expect(reaction?.companionId).toBe('rook');
    expect(reaction?.message).toContain('2');
  });

  it('uses Snow as the primary whole-journey companion', async () => {
    const settings = await db.settings.get('primary');
    expect(settings?.enabledCompanionIds).toContain('snow');
    const reaction = await queueCompanionReaction({
      trigger: 'daily-briefing',
      sourceId: 'daily-briefing:2026-08-01',
    });
    expect(reaction?.companionId).toBe('snow');
    expect(reaction?.message.length).toBeGreaterThan(20);
  });

  it('deduplicates reactions and advances the saved queue', async () => {
    await queueCompanionReaction({
      trigger: 'stat-level',
      sourceId: 'test:faith:2',
      stat: 'faith',
      statLabel: 'Faith',
      level: 2,
    });
    await queueCompanionReaction({
      trigger: 'stat-level',
      sourceId: 'test:faith:2',
      stat: 'faith',
      statLabel: 'Faith',
      level: 2,
    });
    expect(await db.companionReactions.count()).toBe(1);
    const pending = await getNextCompanionReaction();
    expect(pending?.companionId).toBe('selah');
    await acknowledgeCompanionReaction(pending!.id);
    expect(await getNextCompanionReaction()).toBeUndefined();
  });
});
