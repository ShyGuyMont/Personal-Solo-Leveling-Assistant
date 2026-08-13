import { beforeEach, describe, expect, it } from 'vitest';
import { getMilestoneCelebration } from '@/config/milestoneCelebrations';
import { SUPPORT_DIALOGUE, SUPPORT_TOPICS } from '@/config/support';
import { db } from '@/db/database';
import { getArchiveData } from '@/db/repositories';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { getNextPartyBanter, queuePartyBanter } from '@/game/banter';
import { getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { buildSupportMessages, createSupportConversation } from '@/game/support';

describe('Party Expansion', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Expansion Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('provides complete topic-specific support for every companion', () => {
    expect(SUPPORT_TOPICS).toHaveLength(6);
    for (const topic of SUPPORT_TOPICS) {
      const dialogue = SUPPORT_DIALOGUE[topic.id];
      expect(Object.keys(dialogue)).toEqual([
        'snow',
        'rook',
        'selah',
        'cipher',
        'haven',
        'ember',
        'amara',
        'snow-close',
        'mira',
        'cassian',
        'saffron',
        'quill',
      ]);
      expect(Object.values(dialogue).every((pool) => pool.length >= 3)).toBe(true);
    }
  });

  it('builds a full-party channel or a focused two-message channel', () => {
    const party = buildSupportMessages('motivation', 'party', [], 'party-support');
    const focused = buildSupportMessages('recover', 'haven', [], 'focused-support');

    expect(party.map((message) => message.companionId)).toEqual([
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
    expect(focused).toHaveLength(2);
    expect(focused.every((message) => message.companionId === 'haven')).toBe(true);
    expect(new Set(focused.map((message) => message.messageId)).size).toBe(2);
  });

  it('saves direct support without altering progression', async () => {
    const before = await db.progression.get('primary');
    const conversation = await createSupportConversation('make-a-plan', 'party', '2026-08-01');
    const archive = await getArchiveData();

    expect(archive.supportConversations.map((item) => item.id)).toContain(conversation.id);
    expect(await db.progression.get('primary')).toEqual(before);
  });

  it('adds and removes a portable favorite message', async () => {
    const input = {
      sourceType: 'support' as const,
      sourceId: 'support:1',
      messageId: 'support:1:message:0',
      companionId: 'snow' as const,
      message: 'A message worth carrying.',
    };

    expect(await toggleFavoriteMessage(input)).toBe(true);
    expect(await getFavoriteMessages()).toHaveLength(1);
    expect(await toggleFavoriteMessage(input)).toBe(false);
    expect(await getFavoriteMessages()).toHaveLength(0);
  });

  it('queues banter only as an occasional, dismissible companion event', async () => {
    const settings = await db.settings.get('primary');
    await db.settings.put({ ...settings!, companionMode: 'talkative' });
    let queued;
    for (let index = 0; index < 100 && !queued; index += 1) {
      queued = await queuePartyBanter({
        date: '2026-08-01',
        sourceId: `mission:banter-test:${index}`,
        category: 'creator',
      });
    }

    expect(queued).toBeDefined();
    expect(queued?.messages).toHaveLength(2);
    expect((await getNextPartyBanter())?.id).toBe(queued?.id);
  });

  it('gives every major progression event a complete party celebration', () => {
    const celebration = getMilestoneCelebration({
      id: 'rank-event',
      kind: 'rank-up',
      createdAt: new Date().toISOString(),
      headline: 'RANK E',
      detail: 'Classification advanced.',
      acknowledged: false,
    });

    expect(celebration.map((entry) => entry.companionId)).toEqual([
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
    ]);
  });
});
