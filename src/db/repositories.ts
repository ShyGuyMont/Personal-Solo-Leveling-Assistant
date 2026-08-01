import { db } from '@/db/database';
import type { MissionDefinition, Profile, Settings, StatName } from '@/types/game';

export async function getDailyMissionRecords(date: string) {
  return db.dailyMissions.where('date').equals(date).toArray();
}

export async function getDashboardHistory() {
  const [lastReview, recentStats] = await Promise.all([
    db.dailyReviews.where('status').equals('finalized').last(),
    db.statTransactions.toArray().then((items) =>
      items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 3),
    ),
  ]);
  return { lastReview, recentStats };
}

export async function getStatHistory(stat: StatName) {
  return db.statTransactions.where('stat').equals(stat).reverse().limit(8).toArray();
}

export async function getArchiveData() {
  const [
    reviews,
    records,
    statTransactions,
    challengeHistory,
    levelHistory,
    rankHistory,
    reports,
    dailyEvents,
    companionReactions,
    partyCheckIns,
    supportConversations,
    favoriteMessages,
    partyBanters,
    campfireRecaps,
  ] = await Promise.all([
      db.dailyReviews.where('status').equals('finalized').sortBy('date'),
      db.dailyMissions.toArray(),
      db.statTransactions.toArray().then((items) =>
        items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      ),
      db.challengeProgress.orderBy('startedAt').reverse().toArray(),
      db.levelHistory.toArray().then((items) =>
        items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      ),
      db.rankHistory.toArray().then((items) =>
        items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      ),
      db.reports.orderBy('periodStart').reverse().toArray(),
      db.dailyEvents.orderBy('date').reverse().toArray(),
      db.companionReactions.orderBy('createdAt').reverse().toArray(),
      db.partyCheckIns.orderBy('createdAt').reverse().toArray(),
      db.supportConversations.orderBy('createdAt').reverse().toArray(),
      db.favoriteMessages.orderBy('createdAt').reverse().toArray(),
      db.partyBanters.orderBy('createdAt').reverse().toArray(),
      db.campfireRecaps.orderBy('weekStart').reverse().toArray(),
    ]);
  return {
    reviews,
    records,
    statTransactions,
    challengeHistory,
    levelHistory,
    rankHistory,
    reports,
    dailyEvents,
    companionReactions,
    partyCheckIns,
    supportConversations,
    favoriteMessages,
    partyBanters,
    campfireRecaps,
  };
}

export async function saveConfiguration(input: {
  profile: Profile;
  settings: Settings;
  missions: MissionDefinition[];
}) {
  await db.transaction(
    'rw',
    [db.profiles, db.settings, db.missions, db.auditEntries, db.achievements, db.progressionEvents],
    async () => {
      const previousProfile = await db.profiles.get('primary');
      const previousSettings = await db.settings.get('primary');
      await db.profiles.put(input.profile);
      await db.settings.put(input.settings);
      await db.missions.bulkPut(input.missions);
      await db.auditEntries.put({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'configuration-updated',
        targetId: 'primary',
        before: { profile: previousProfile, settings: previousSettings },
        after: { profile: input.profile, settings: input.settings },
        note: 'Profile, interface, or mission configuration changed.',
      });
      for (const [id, met] of [
        ['customized', true],
        ['recovery-started', input.settings.recoveryMode.active],
      ] as const) {
        if (!met) continue;
        const achievement = await db.achievements.get(id);
        if (achievement && !achievement.unlockedAt) {
          const now = new Date().toISOString();
          await db.achievements.put({ ...achievement, unlockedAt: now });
          await db.progressionEvents.put({
            id: `progression-event:achievement:${id}`,
            kind: 'achievement',
            createdAt: now,
            headline: achievement.name,
            detail: achievement.description,
            acknowledged: false,
          });
        }
      }
    },
  );
}

export async function equipTitle(titleId: string) {
  await db.profiles.update('primary', { equippedTitleId: titleId });
}

export async function equipCosmetic(kind: 'frame' | 'sigil', cosmeticId: string) {
  const field = kind === 'frame' ? 'cosmeticFrame' : 'backgroundSigil';
  await db.profiles.update('primary', { [field]: cosmeticId });
}

export async function getCollectionData() {
  const [achievements, cosmetics, cosmeticUnlocks] = await Promise.all([
    db.achievements.toArray(),
    db.cosmetics.toArray(),
    db.cosmeticUnlocks.toArray(),
  ]);
  return { achievements, cosmetics, cosmeticUnlocks };
}

export async function setFirstDayGuideCompleted(completed: boolean) {
  await db.settings.update('primary', { firstDayGuideCompleted: completed });
}

export async function acknowledgeProgressionEvent(id: string) {
  await db.progressionEvents.update(id, { acknowledged: true });
}

export async function getNextProgressionEvent() {
  return db.progressionEvents
    .orderBy('createdAt')
    .filter((event) => !event.acknowledged)
    .first();
}
