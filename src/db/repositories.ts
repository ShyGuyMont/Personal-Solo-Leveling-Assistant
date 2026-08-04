import { db } from '@/db/database';
import type { MissionDefinition, Profile, Settings, StatName } from '@/types/game';

export async function getDailyMissionRecords(date: string) {
  return db.dailyMissions.where('date').equals(date).toArray();
}

export async function getDashboardHistory() {
  const [lastReview, recentStats] = await Promise.all([
    db.dailyReviews.where('status').equals('finalized').last(),
    db.statTransactions
      .toArray()
      .then((items) => items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 3)),
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
    dailyBriefings,
    campaignArcs,
    arcMilestones,
    companionQuestProgress,
    monthlyCouncils,
    sanctuarySessions,
  ] = await Promise.all([
    db.dailyReviews.where('status').equals('finalized').sortBy('date'),
    db.dailyMissions.toArray(),
    db.statTransactions
      .toArray()
      .then((items) => items.sort((a, b) => b.timestamp.localeCompare(a.timestamp))),
    db.challengeProgress.orderBy('startedAt').reverse().toArray(),
    db.levelHistory
      .toArray()
      .then((items) => items.sort((a, b) => b.timestamp.localeCompare(a.timestamp))),
    db.rankHistory
      .toArray()
      .then((items) => items.sort((a, b) => b.timestamp.localeCompare(a.timestamp))),
    db.reports.orderBy('periodStart').reverse().toArray(),
    db.dailyEvents.orderBy('date').reverse().toArray(),
    db.companionReactions.orderBy('createdAt').reverse().toArray(),
    db.partyCheckIns.orderBy('createdAt').reverse().toArray(),
    db.supportConversations.orderBy('createdAt').reverse().toArray(),
    db.favoriteMessages.orderBy('createdAt').reverse().toArray(),
    db.partyBanters.orderBy('createdAt').reverse().toArray(),
    db.campfireRecaps.orderBy('weekStart').reverse().toArray(),
    db.dailyBriefings.orderBy('date').reverse().toArray(),
    db.campaignArcs.orderBy('createdAt').reverse().toArray(),
    db.arcMilestones
      .toArray()
      .then((items) => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    db.companionQuestProgress.toArray(),
    db.monthlyCouncils.orderBy('monthStart').reverse().toArray(),
    db.sanctuarySessions.orderBy('createdAt').reverse().toArray(),
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
    dailyBriefings,
    campaignArcs,
    arcMilestones,
    companionQuestProgress,
    monthlyCouncils,
    sanctuarySessions,
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function missionConfigurationChanged(previous: MissionDefinition[], next: MissionDefinition[]) {
  const ordered = (missions: MissionDefinition[]) =>
    [...missions].sort((left, right) => left.id.localeCompare(right.id));
  return (
    JSON.stringify(canonicalize(ordered(previous))) !== JSON.stringify(canonicalize(ordered(next)))
  );
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
      const [previousProfile, previousSettings, previousMissions] = await Promise.all([
        db.profiles.get('primary'),
        db.settings.get('primary'),
        db.missions.toArray(),
      ]);
      const missionsChanged = missionConfigurationChanged(previousMissions, input.missions);
      await db.profiles.put(input.profile);
      await db.settings.put(input.settings);
      await db.missions.bulkPut(input.missions);
      await db.auditEntries.put({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: missionsChanged ? 'mission-configuration-updated' : 'configuration-updated',
        targetId: 'primary',
        before: { profile: previousProfile, settings: previousSettings },
        after: {
          profile: input.profile,
          settings: input.settings,
          missionConfigurationChanged: missionsChanged,
        },
        note: missionsChanged
          ? 'Mission configuration changed.'
          : 'Profile or interface configuration changed.',
      });
      for (const [id, met] of [
        ['customized', missionsChanged],
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
