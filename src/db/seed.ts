import {
  ALL_CHALLENGE_TEMPLATES,
  MONTHLY_CHALLENGES,
  WEEKLY_CHALLENGES,
} from '@/config/challenges';
import { BALANCE } from '@/config/balance';
import { ACHIEVEMENTS } from '@/config/achievements';
import { COSMETICS } from '@/config/cosmetics';
import { DEFAULT_MISSIONS } from '@/config/missions';
import { db } from '@/db/database';
import { createChallengeProgress, chooseRotatingChallenge } from '@/game/challenges';
import { accountXpForLevel } from '@/game/xp';
import { ALL_STATS, createInitialStat } from '@/game/stats';
import { getSystemDateKey, startOfMonth, startOfWeek } from '@/utils/date';
import type {
  AccountProgression,
  Focus,
  LocalDateKey,
  Profile,
  Settings,
  TreasurySettings,
} from '@/types/game';

export function createDefaultSettings(): Settings {
  return {
    id: 'primary',
    resetTime: '04:00',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekStartsOn: 1,
    soundEnabled: true,
    vibrationEnabled: true,
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    protectedExceptionsPerMonth: BALANCE.protectedExceptionsPerMonth,
    protectedExceptionsUsed: {},
    recoveryMode: {
      active: false,
      disabledMissionIds: ['workout'],
    },
    themeIntensity: 'standard',
    interfaceStyle: 'system',
    colorTheme: 'abyss',
    dailyEventsEnabled: true,
    companionMode: 'balanced',
    enabledCompanionIds: [
      'snow',
      'rook',
      'selah',
      'cipher',
      'haven',
      'ember',
      'amara',
      'cassian',
      'saffron',
    ],
    notificationsEnabled: false,
    advancedBalanceUnlocked: false,
    privacyScreenEnabled: false,
    sensitiveMissionAlias: 'Integrity Protocol',
    firstDayGuideCompleted: false,
    soundVolume: 0.55,
    dailyBriefingEnabled: true,
  };
}

export function createDefaultTreasurySettings(now = new Date().toISOString()): TreasurySettings {
  return {
    id: 'primary',
    currency: 'USD',
    weeklyReviewDay: 0,
    challengeEnabled: true,
    challengeChance: 0.75,
    challengeRewardXp: 60,
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultProgression(): AccountProgression {
  return {
    id: 'primary',
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    xpToNextLevel: accountXpForLevel(1),
    lifetimeMissionCompletions: 0,
    completedDays: 0,
    perfectDays: 0,
    protectedPerfectDays: 0,
    currentPerfectStreak: 0,
    longestPerfectStreak: 0,
    currentDayStreak: 0,
    longestDayStreak: 0,
    rank: 'F',
    xpMultiplier: 1,
    recentLevelUp: false,
    recentRankUp: false,
  };
}

export async function seedReferenceData() {
  await db.transaction(
    'rw',
    db.missions,
    db.challenges,
    db.achievements,
    db.cosmetics,
    async () => {
      const existingMissions = await db.missions.count();
      if (!existingMissions) await db.missions.bulkPut(DEFAULT_MISSIONS);
      // Challenge templates are reference data, not user-authored records. Upserting them keeps
      // active and future challenges compatible when a retired mission is consolidated.
      await db.challenges.bulkPut(ALL_CHALLENGE_TEMPLATES);
      const unlocked = new Map(
        (await db.achievements.toArray()).map((achievement) => [
          achievement.id,
          achievement.unlockedAt,
        ]),
      );
      await db.achievements.bulkPut(
        ACHIEVEMENTS.map((definition) => ({
          ...definition,
          unlockedAt: unlocked.get(definition.id),
        })),
      );
      await db.cosmetics.bulkPut(COSMETICS);
    },
  );
}

export async function initializeProfile(input: {
  displayName: string;
  systemTitle?: string;
  resetTime: string;
  focus: Focus;
  soundEnabled: boolean;
  reducedMotion: boolean;
}) {
  const now = new Date().toISOString();
  const settings = createDefaultSettings();
  settings.resetTime = input.resetTime;
  settings.soundEnabled = input.soundEnabled;
  settings.reducedMotion = input.reducedMotion;
  const systemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
  const profile: Profile = {
    id: 'primary',
    displayName: input.displayName.trim(),
    systemTitle: input.systemTitle?.trim() || 'Candidate',
    startingFocus: input.focus,
    createdAt: now,
    equippedTitleId: 'newly-awakened',
    cosmeticFrame: `focus-${input.focus}`,
    backgroundSigil: 'origin',
  };
  await db.transaction(
    'rw',
    [
      db.profiles,
      db.settings,
      db.progression,
      db.stats,
      db.titles,
      db.appMetadata,
      db.challengeProgress,
      db.dailyReviews,
      db.cosmeticUnlocks,
      db.treasurySettings,
    ],
    async () => {
      await db.profiles.put(profile);
      await db.settings.put(settings);
      await db.progression.put(createDefaultProgression());
      await db.stats.bulkPut(ALL_STATS.map(createInitialStat));
      await db.treasurySettings.put(createDefaultTreasurySettings(now));
      await db.titles.put({
        id: 'newly-awakened',
        titleId: 'newly-awakened',
        unlockedAt: now,
        sourceId: 'onboarding',
      });
      await db.cosmeticUnlocks.bulkPut([
        {
          id: 'frame-origin',
          cosmeticId: 'frame-origin',
          unlockedAt: now,
          sourceId: 'onboarding',
        },
        {
          id: 'sigil-origin',
          cosmeticId: 'sigil-origin',
          unlockedAt: now,
          sourceId: 'onboarding',
        },
      ]);
      await db.appMetadata.bulkPut([
        { id: 'schema-seeded', value: 12, updatedAt: now },
        { id: 'last-system-day', value: systemDate, updatedAt: now },
        { id: 'app-version', value: '6.0.0', updatedAt: now },
      ]);
      await ensureRotatingChallenges(systemDate, settings.weekStartsOn);
    },
  );
  return profile;
}

export async function ensureCoreData() {
  await seedReferenceData();
  const profile = await db.profiles.get('primary');
  if (!profile) return;
  const settings = (await db.settings.get('primary')) ?? createDefaultSettings();
  const progression = await db.progression.get('primary');
  const treasurySettings = await db.treasurySettings.get('primary');
  await db.transaction(
    'rw',
    db.settings,
    db.progression,
    db.stats,
    db.treasurySettings,
    async () => {
      if (!(await db.settings.get('primary'))) await db.settings.put(settings);
      if (!progression) await db.progression.put(createDefaultProgression());
      const existingStats = new Set((await db.stats.toArray()).map((stat) => stat.id));
      const missingStats = ALL_STATS.filter((stat) => !existingStats.has(stat));
      if (missingStats.length) await db.stats.bulkPut(missingStats.map(createInitialStat));
      if (!treasurySettings) {
        await db.treasurySettings.put(createDefaultTreasurySettings());
      }
    },
  );
  const systemDate = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
  await ensureRotatingChallenges(systemDate, settings.weekStartsOn);
}

export async function ensureRotatingChallenges(systemDate: LocalDateKey, weekStartsOn: number) {
  const weekKey = startOfWeek(systemDate, weekStartsOn);
  const month = startOfMonth(systemDate);
  const [weeklyExists, monthlyExists, recent, recentReviews] = await Promise.all([
    db.challengeProgress.where('id').startsWith(`weekly:${weekKey}:`).first(),
    db.challengeProgress.where('id').startsWith(`monthly:${month}:`).first(),
    db.challengeProgress.orderBy('startedAt').reverse().limit(8).toArray(),
    db.dailyReviews
      .orderBy('date')
      .reverse()
      .filter((review) => review.status === 'finalized')
      .limit(14)
      .toArray(),
  ]);
  const recentRate = recentReviews.length
    ? recentReviews.reduce((sum, review) => sum + review.completionRate, 0) / recentReviews.length
    : 0.72;
  const difficultyCeiling =
    recentRate >= 0.9 ? 'IV' : recentRate >= 0.78 ? 'III' : recentRate >= 0.64 ? 'II' : 'I';
  if (!weeklyExists) {
    const template = chooseRotatingChallenge(
      WEEKLY_CHALLENGES,
      weekKey,
      recent.filter((item) => item.kind === 'weekly').map((item) => item.templateId),
      difficultyCeiling,
    );
    await db.challengeProgress.put(createChallengeProgress(template, systemDate, weekStartsOn));
  }
  if (!monthlyExists) {
    const template = chooseRotatingChallenge(
      MONTHLY_CHALLENGES,
      month,
      recent.filter((item) => item.kind === 'monthly').map((item) => item.templateId),
      difficultyCeiling === 'IV' ? 'V' : difficultyCeiling,
    );
    await db.challengeProgress.put(createChallengeProgress(template, systemDate, weekStartsOn));
  }
}
