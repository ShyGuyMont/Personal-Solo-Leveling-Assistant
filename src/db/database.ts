import Dexie, { type EntityTable } from 'dexie';
import type {
  AccountProgression,
  Achievement,
  ArcMilestone,
  AuditEntry,
  AppMetadata,
  BackupSnapshot,
  CampfireRecap,
  CampaignArc,
  ChallengeProgress,
  ChallengeTemplate,
  CosmeticDefinition,
  CosmeticUnlock,
  DailyMissionRecord,
  DailyCommandBriefing,
  DailyEventRecord,
  DailyReview,
  LevelHistory,
  MissionDefinition,
  InventoryItem,
  Profile,
  ProgressionEvent,
  CompanionReaction,
  FavoriteMessage,
  PartyCheckIn,
  PartyBanter,
  CompanionQuestProgress,
  MonthlyCouncil,
  SupportConversation,
  PeriodicReport,
  RankHistory,
  Settings,
  StatProgress,
  StatTransaction,
  StreakRecord,
  TreasuryBill,
  TreasuryDailyChallenge,
  TreasuryDebt,
  TreasurySavingsGoal,
  TreasurySettings,
  TreasuryTransaction,
  TreasuryWeek,
  UnlockedTitle,
  XpTransaction,
} from '@/types/game';

export class SystemDatabase extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  missions!: EntityTable<MissionDefinition, 'id'>;
  dailyMissions!: EntityTable<DailyMissionRecord, 'id'>;
  dailyReviews!: EntityTable<DailyReview, 'id'>;
  progression!: EntityTable<AccountProgression, 'id'>;
  stats!: EntityTable<StatProgress, 'id'>;
  statTransactions!: EntityTable<StatTransaction, 'id'>;
  xpTransactions!: EntityTable<XpTransaction, 'id'>;
  streaks!: EntityTable<StreakRecord, 'id'>;
  challenges!: EntityTable<ChallengeTemplate, 'id'>;
  challengeProgress!: EntityTable<ChallengeProgress, 'id'>;
  rankHistory!: EntityTable<RankHistory, 'id'>;
  levelHistory!: EntityTable<LevelHistory, 'id'>;
  titles!: EntityTable<UnlockedTitle, 'id'>;
  achievements!: EntityTable<Achievement, 'id'>;
  cosmetics!: EntityTable<CosmeticDefinition, 'id'>;
  cosmeticUnlocks!: EntityTable<CosmeticUnlock, 'id'>;
  backupSnapshots!: EntityTable<BackupSnapshot, 'id'>;
  auditEntries!: EntityTable<AuditEntry, 'id'>;
  reports!: EntityTable<PeriodicReport, 'id'>;
  progressionEvents!: EntityTable<ProgressionEvent, 'id'>;
  dailyEvents!: EntityTable<DailyEventRecord, 'id'>;
  inventory!: EntityTable<InventoryItem, 'id'>;
  companionReactions!: EntityTable<CompanionReaction, 'id'>;
  partyCheckIns!: EntityTable<PartyCheckIn, 'id'>;
  supportConversations!: EntityTable<SupportConversation, 'id'>;
  favoriteMessages!: EntityTable<FavoriteMessage, 'id'>;
  partyBanters!: EntityTable<PartyBanter, 'id'>;
  campfireRecaps!: EntityTable<CampfireRecap, 'id'>;
  dailyBriefings!: EntityTable<DailyCommandBriefing, 'id'>;
  campaignArcs!: EntityTable<CampaignArc, 'id'>;
  arcMilestones!: EntityTable<ArcMilestone, 'id'>;
  companionQuestProgress!: EntityTable<CompanionQuestProgress, 'id'>;
  monthlyCouncils!: EntityTable<MonthlyCouncil, 'id'>;
  treasurySettings!: EntityTable<TreasurySettings, 'id'>;
  treasuryTransactions!: EntityTable<TreasuryTransaction, 'id'>;
  treasuryBills!: EntityTable<TreasuryBill, 'id'>;
  treasuryDebts!: EntityTable<TreasuryDebt, 'id'>;
  treasurySavingsGoals!: EntityTable<TreasurySavingsGoal, 'id'>;
  treasuryWeeks!: EntityTable<TreasuryWeek, 'id'>;
  treasuryChallenges!: EntityTable<TreasuryDailyChallenge, 'id'>;
  appMetadata!: EntityTable<AppMetadata, 'id'>;

  constructor(name = 'the-system-db') {
    super(name);
    this.version(1).stores({
      profiles: 'id',
      settings: 'id',
      missions: 'id,category,enabled',
      dailyMissions: 'id,date,missionId,status,[date+missionId]',
      dailyReviews: 'id,date,status',
      progression: 'id,level,rank',
      stats: 'id,level,momentum',
      statTransactions: 'id,stat,date,sourceId,[stat+date]',
      xpTransactions: 'id,date,sourceId,kind',
      streaks: 'id,kind',
      challenges: 'id,kind,category,difficulty',
      challengeProgress: 'id,templateId,kind,status,startedAt,endsAt',
      rankHistory: 'id,date,to',
      levelHistory: 'id,date,level',
      titles: 'id,titleId,unlockedAt',
      achievements: 'id,unlockedAt,rarity',
      appMetadata: 'id',
    });
    this.version(2)
      .stores({
        profiles: 'id',
        settings: 'id',
        missions: 'id,category,enabled,isCore',
        dailyMissions: 'id,date,missionId,status,[date+missionId],[date+status]',
        dailyReviews: 'id,date,status,perfectDay',
        progression: 'id,level,rank',
        stats: 'id,level,momentum,trend',
        statTransactions: 'id,stat,date,sourceId,kind,[stat+date]',
        xpTransactions: 'id,date,sourceId,kind',
        streaks: 'id,kind',
        challenges: 'id,kind,category,difficulty',
        challengeProgress: 'id,templateId,kind,status,startedAt,endsAt,[kind+status]',
        rankHistory: 'id,date,to',
        levelHistory: 'id,date,level',
        titles: 'id,titleId,unlockedAt',
        achievements: 'id,unlockedAt,rarity',
        appMetadata: 'id',
      })
      .upgrade(async (transaction) => {
        const settings = transaction.table<Settings, string>('settings');
        const current = await settings.get('primary');
        if (current && current.themeIntensity === undefined) {
          await settings.update('primary', { themeIntensity: 'standard' });
        }
      });
    this.version(3)
      .stores({
        profiles: 'id',
        settings: 'id',
        missions: 'id,category,enabled,isCore,optional,archived',
        dailyMissions: 'id,date,missionId,status,[date+missionId],[date+status]',
        dailyReviews: 'id,date,status,perfectDay',
        progression: 'id,level,rank',
        stats: 'id,level,momentum,trend',
        statTransactions: 'id,stat,date,sourceId,kind,[stat+date]',
        xpTransactions: 'id,date,sourceId,kind',
        streaks: 'id,kind',
        challenges: 'id,kind,category,difficulty',
        challengeProgress: 'id,templateId,kind,status,startedAt,endsAt,[kind+status]',
        rankHistory: 'id,date,to',
        levelHistory: 'id,date,level',
        titles: 'id,titleId,unlockedAt',
        achievements: 'id,unlockedAt,rarity',
        cosmetics: 'id,kind,rarity',
        cosmeticUnlocks: 'id,cosmeticId,unlockedAt',
        backupSnapshots: 'id,createdAt,reason',
        auditEntries: 'id,timestamp,action,targetId',
        reports: 'id,kind,periodStart,periodEnd',
        progressionEvents: 'id,kind,createdAt,acknowledged',
        appMetadata: 'id',
      })
      .upgrade(async (transaction) => {
        const settings = transaction.table<Settings, string>('settings');
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        const current = await settings.get('primary');
        if (current) {
          await settings.update('primary', {
            privacyScreenEnabled: current.privacyScreenEnabled ?? false,
            sensitiveMissionAlias: current.sensitiveMissionAlias ?? 'Integrity Protocol',
            firstDayGuideCompleted: current.firstDayGuideCompleted ?? false,
            soundVolume: current.soundVolume ?? 0.55,
          });
        }
        const now = new Date().toISOString();
        await metadata.put({ id: 'schema-seeded', value: 3, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '1.0.0', updatedAt: now });
      });
    this.version(4)
      .stores({
        profiles: 'id',
        settings: 'id',
        missions: 'id,category,enabled,isCore,optional,archived',
        dailyMissions: 'id,date,missionId,status,[date+missionId],[date+status]',
        dailyReviews: 'id,date,status,perfectDay',
        progression: 'id,level,rank',
        stats: 'id,level,momentum,trend',
        statTransactions: 'id,stat,date,sourceId,kind,[stat+date]',
        xpTransactions: 'id,date,sourceId,kind',
        streaks: 'id,kind',
        challenges: 'id,kind,category,difficulty',
        challengeProgress: 'id,templateId,kind,status,startedAt,endsAt,[kind+status]',
        rankHistory: 'id,date,to',
        levelHistory: 'id,date,level',
        titles: 'id,titleId,unlockedAt',
        achievements: 'id,unlockedAt,rarity',
        cosmetics: 'id,kind,rarity',
        cosmeticUnlocks: 'id,cosmeticId,unlockedAt',
        backupSnapshots: 'id,createdAt,reason',
        auditEntries: 'id,timestamp,action,targetId',
        reports: 'id,kind,periodStart,periodEnd',
        progressionEvents: 'id,kind,createdAt,acknowledged',
        dailyEvents: 'id,date,kind,status',
        inventory: 'id,quantity,updatedAt',
        companionReactions: 'id,companionId,trigger,createdAt,acknowledged,sourceId',
        appMetadata: 'id',
      })
      .upgrade(async (transaction) => {
        const settings = transaction.table<Settings, string>('settings');
        const current = await settings.get('primary');
        if (current) {
          await settings.update('primary', {
            interfaceStyle: current.interfaceStyle ?? 'system',
            colorTheme: current.colorTheme ?? 'abyss',
            dailyEventsEnabled: current.dailyEventsEnabled ?? true,
            companionMode: current.companionMode ?? 'balanced',
            enabledCompanionIds: current.enabledCompanionIds
              ? Array.from(new Set(['snow', ...current.enabledCompanionIds]))
              : ['snow', 'rook', 'selah', 'cipher', 'haven'],
          });
        }
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        const now = new Date().toISOString();
        await metadata.put({ id: 'schema-seeded', value: 4, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '2.0.0', updatedAt: now });
      });
    this.version(5)
      .stores({
        partyCheckIns: 'id,date,mood,createdAt',
      })
      .upgrade(async (transaction) => {
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        const now = new Date().toISOString();
        await metadata.put({ id: 'schema-seeded', value: 5, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '2.0.0', updatedAt: now });
      });
    this.version(6)
      .stores({
        supportConversations: 'id,date,topic,audience,createdAt',
        favoriteMessages: 'id,sourceType,sourceId,companionId,createdAt',
        partyBanters: 'id,date,sourceId,category,createdAt,acknowledged',
      })
      .upgrade(async (transaction) => {
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        const now = new Date().toISOString();
        await metadata.put({ id: 'schema-seeded', value: 6, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '2.0.0', updatedAt: now });
      });
    this.version(7)
      .stores({
        campfireRecaps: 'id,weekStart,weekEnd,createdAt,acknowledged',
      })
      .upgrade(async (transaction) => {
        const settings = transaction.table<Settings, string>('settings');
        const current = await settings.get('primary');
        if (current) {
          await settings.update('primary', {
            enabledCompanionIds: Array.from(
              new Set([
                ...(current.enabledCompanionIds ?? ['snow', 'rook', 'selah', 'cipher', 'haven']),
                'ember',
              ]),
            ),
          });
        }
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        const now = new Date().toISOString();
        await metadata.put({ id: 'schema-seeded', value: 7, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '2.1.0', updatedAt: now });
      });
    this.version(8)
      .stores({
        dailyBriefings: 'id,date,status',
        campaignArcs: 'id,status,companionId,category,createdAt',
        arcMilestones: 'id,arcId,status,[arcId+status],order',
        companionQuestProgress: 'id,questlineId,companionId,status',
        monthlyCouncils: 'id,monthStart,monthEnd,createdAt,acknowledged',
      })
      .upgrade(async (transaction) => {
        const settings = transaction.table<Settings, string>('settings');
        const current = await settings.get('primary');
        if (current) {
          await settings.update('primary', {
            dailyBriefingEnabled: current.dailyBriefingEnabled ?? true,
            enabledCompanionIds: Array.from(
              new Set([
                ...(current.enabledCompanionIds ?? [
                  'snow',
                  'rook',
                  'selah',
                  'cipher',
                  'haven',
                  'ember',
                ]),
                'amara',
              ]),
            ),
          });
        }
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        const now = new Date().toISOString();
        await metadata.put({ id: 'schema-seeded', value: 8, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '2.5.0', updatedAt: now });
      });
    this.version(9)
      .stores({
        treasurySettings: 'id',
        treasuryTransactions: 'id,date,kind,category,relatedId,[date+kind]',
        treasuryBills: 'id,active,dueDay,nextDueDate',
        treasuryDebts: 'id,active,kind',
        treasurySavingsGoals: 'id,active,targetDate',
        treasuryWeeks: 'id,weekStart,weekEnd,status',
        treasuryChallenges: 'id,date,status',
      })
      .upgrade(async (transaction) => {
        const now = new Date().toISOString();
        const settings = transaction.table<Settings, string>('settings');
        const current = await settings.get('primary');
        if (current) {
          await settings.update('primary', {
            enabledCompanionIds: Array.from(
              new Set([
                ...(current.enabledCompanionIds ?? [
                  'snow',
                  'rook',
                  'selah',
                  'cipher',
                  'haven',
                  'ember',
                  'amara',
                ]),
                'cassian',
              ]),
            ),
          });
        }
        const treasurySettings = transaction.table<TreasurySettings, string>('treasurySettings');
        await treasurySettings.put({
          id: 'primary',
          currency: 'USD',
          weeklyReviewDay: 0,
          challengeEnabled: true,
          challengeChance: 0.75,
          challengeRewardXp: 60,
          createdAt: now,
          updatedAt: now,
        });
        const stats = transaction.table<StatProgress, string>('stats');
        if (!(await stats.get('stewardship'))) {
          await stats.put({
            id: 'stewardship',
            name: 'stewardship',
            level: 1,
            totalXp: 0,
            currentLevelXp: 0,
            xpToNextLevel: 223,
            lifetimeXpGained: 0,
            momentum: 50,
            trend: 'stable',
            neglectedDays: 0,
            protectedFloorXp: 0,
          });
        }
        const metadata = transaction.table<AppMetadata, string>('appMetadata');
        await metadata.put({ id: 'schema-seeded', value: 9, updatedAt: now });
        await metadata.put({ id: 'app-version', value: '3.0.0', updatedAt: now });
      });
  }
}

export const db = new SystemDatabase();

export const TABLE_NAMES = [
  'profiles',
  'settings',
  'missions',
  'dailyMissions',
  'dailyReviews',
  'progression',
  'stats',
  'statTransactions',
  'xpTransactions',
  'streaks',
  'challenges',
  'challengeProgress',
  'rankHistory',
  'levelHistory',
  'titles',
  'achievements',
  'cosmetics',
  'cosmeticUnlocks',
  'auditEntries',
  'reports',
  'progressionEvents',
  'dailyEvents',
  'inventory',
  'companionReactions',
  'partyCheckIns',
  'supportConversations',
  'favoriteMessages',
  'partyBanters',
  'campfireRecaps',
  'dailyBriefings',
  'campaignArcs',
  'arcMilestones',
  'companionQuestProgress',
  'monthlyCouncils',
  'treasurySettings',
  'treasuryTransactions',
  'treasuryBills',
  'treasuryDebts',
  'treasurySavingsGoals',
  'treasuryWeeks',
  'treasuryChallenges',
  'appMetadata',
] as const;

export const SNAPSHOT_TABLE_NAMES = TABLE_NAMES;
