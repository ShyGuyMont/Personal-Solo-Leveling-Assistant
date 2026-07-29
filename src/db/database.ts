import Dexie, { type EntityTable } from 'dexie';
import type {
  AccountProgression,
  Achievement,
  AuditEntry,
  AppMetadata,
  BackupSnapshot,
  ChallengeProgress,
  ChallengeTemplate,
  CosmeticDefinition,
  CosmeticUnlock,
  DailyMissionRecord,
  DailyReview,
  LevelHistory,
  MissionDefinition,
  Profile,
  ProgressionEvent,
  PeriodicReport,
  RankHistory,
  Settings,
  StatProgress,
  StatTransaction,
  StreakRecord,
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
  'appMetadata',
] as const;

export const SNAPSHOT_TABLE_NAMES = TABLE_NAMES;
