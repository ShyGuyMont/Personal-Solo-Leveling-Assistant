export type LocalDateKey = `${number}-${number}-${number}`;

export type Focus = 'balanced' | 'faith' | 'discipline' | 'physical' | 'creator';
export type MissionCategory = 'faith' | 'discipline' | 'physical' | 'creator' | 'character';
export type MissionStatus = 'pending' | 'completed' | 'failed' | 'skipped' | 'excused';
export type MissionCompletionMethod =
  'toggle' | 'numeric' | 'duration' | 'checklist' | 'day-boundary' | 'choice';
export type SystemState =
  | 'initializing'
  | 'stable'
  | 'ascending'
  | 'warning'
  | 'stagnant'
  | 'recovery'
  | 'trial'
  | 'rank-qualified'
  | 'offline';
export type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'WORLD CLASS';
export type StatName =
  | 'faith'
  | 'strength'
  | 'endurance'
  | 'discipline'
  | 'willpower'
  | 'wisdom'
  | 'creativity'
  | 'focus'
  | 'vitality'
  | 'character'
  | 'empathy';
export type ChallengeKind = 'weekly' | 'monthly' | 'boss' | 'rank-trial' | 'recovery';
export type ChallengeCategory = MissionCategory | 'balanced' | 'recovery' | 'rank';
export type DifficultyTier = 'I' | 'II' | 'III' | 'IV' | 'V';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ascendant';
export type RecoveryReason = 'illness' | 'injury' | 'travel' | 'emergency' | 'overload' | 'other';

export interface Profile {
  id: 'primary';
  displayName: string;
  systemTitle: string;
  startingFocus: Focus;
  createdAt: string;
  equippedTitleId: string;
  cosmeticFrame: string;
  backgroundSigil: string;
}

export interface Settings {
  id: 'primary';
  resetTime: string;
  timeZone: string;
  weekStartsOn: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
  protectedExceptionsPerMonth: number;
  protectedExceptionsUsed: Record<string, number>;
  recoveryMode: {
    active: boolean;
    reason?: RecoveryReason;
    endDate?: LocalDateKey;
    disabledMissionIds: string[];
  };
  themeIntensity: 'subtle' | 'standard' | 'intense';
  notificationsEnabled: boolean;
  advancedBalanceUnlocked: boolean;
  privacyScreenEnabled: boolean;
  sensitiveMissionAlias: string;
  firstDayGuideCompleted: boolean;
  soundVolume: number;
}

export interface StatReward {
  stat: StatName;
  xp: number;
}

export interface MissionDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: MissionCategory;
  method: MissionCompletionMethod;
  accountXp: number;
  statRewards: StatReward[];
  enabled: boolean;
  isCore: boolean;
  allowNotes: boolean;
  detailFields: string[];
  recoveryEligible: boolean;
  activeWeekdays?: number[];
  optional?: boolean;
  archived?: boolean;
  checklistItems?: string[];
  numericUnit?: string;
  numericTarget?: number;
  customDescription?: string;
  customAccountXp?: number;
}

export interface MissionDetails {
  note?: string;
  passage?: string;
  recipient?: string;
  minutes?: number;
  distance?: number;
  workoutType?: string;
  duration?: number;
  difficulty?: number;
  creatorChoice?: 'youtube' | 'arc' | 'both';
  workPerformed?: string;
  eveningStatus?: 'successful' | 'struggling' | 'failed';
  quantity?: number;
  checklist?: Record<string, boolean>;
}

export interface DailyMissionRecord {
  id: string;
  date: LocalDateKey;
  missionId: string;
  status: MissionStatus;
  details: MissionDetails;
  completedAt?: string;
  updatedAt: string;
  rewardTransactionId?: string;
  reversedTransactionId?: string;
  protectedException: boolean;
}

export interface DailyReview {
  id: LocalDateKey;
  date: LocalDateKey;
  status: 'in-progress' | 'finalized';
  startedAt: string;
  finalizedAt?: string;
  completionCount: number;
  activeMissionCount: number;
  completionRate: number;
  perfectDay: boolean;
  protectedPerfectDay: boolean;
  accountXpAwarded: number;
  statChanges: Partial<Record<StatName, number>>;
  verdict: string;
  systemState: SystemState;
  transactionIds: string[];
}

export interface AccountProgression {
  id: 'primary';
  level: number;
  totalXp: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  lifetimeMissionCompletions: number;
  completedDays: number;
  perfectDays: number;
  protectedPerfectDays: number;
  currentPerfectStreak: number;
  longestPerfectStreak: number;
  currentDayStreak: number;
  longestDayStreak: number;
  rank: Rank;
  xpMultiplier: number;
  lastLevelUpAt?: string;
  lastRankUpAt?: string;
  recentLevelUp: boolean;
  recentRankUp: boolean;
}

export interface StatProgress {
  id: StatName;
  name: StatName;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  lifetimeXpGained: number;
  momentum: number;
  trend: 'rising' | 'stable' | 'declining';
  lastIncreasedAt?: string;
  lastDecreasedAt?: string;
  neglectedDays: number;
  protectedFloorXp: number;
}

export interface XpTransaction {
  id: string;
  kind: 'mission' | 'perfect-day' | 'challenge' | 'recovery' | 'reversal' | 'penalty';
  amount: number;
  date: LocalDateKey;
  timestamp: string;
  sourceId: string;
  note: string;
}

export interface StatTransaction {
  id: string;
  stat: StatName;
  kind: 'mission' | 'perfect-day' | 'challenge' | 'recovery' | 'reversal' | 'decay';
  amount: number;
  momentumDelta: number;
  date: LocalDateKey;
  timestamp: string;
  sourceId: string;
  note: string;
}

export interface StreakRecord {
  id: string;
  kind: 'mission' | 'perfect' | 'day';
  current: number;
  longest: number;
  lastQualifiedDate?: LocalDateKey;
  lastBrokenDate?: LocalDateKey;
}

export type ChallengeMetric =
  | 'mission-count'
  | 'category-count'
  | 'completion-rate'
  | 'perfect-days'
  | 'paired-days'
  | 'recovery'
  | 'balanced-thresholds'
  | 'trial-days';

export interface ChallengeRequirement {
  metric: ChallengeMetric;
  target: number;
  missionIds?: string[];
  category?: MissionCategory;
  minimumRate?: number;
  secondaryTarget?: number;
  groups?: Array<{ missionIds: string[]; target: number }>;
}

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  kind: ChallengeKind;
  category: ChallengeCategory;
  difficulty: DifficultyTier;
  durationDays: number;
  requirement: ChallengeRequirement;
  accountXp: number;
  statRewards: StatReward[];
  titleRewardId?: string;
  cosmeticReward?: string;
  failureCondition?: string;
  protectedExceptions: number;
  milestones: number[];
  rankTarget?: Rank;
}

export interface ChallengeProgress {
  id: string;
  templateId: string;
  kind: ChallengeKind;
  startedAt: LocalDateKey;
  endsAt: LocalDateKey;
  status: 'available' | 'active' | 'completed' | 'failed' | 'cooldown';
  current: number;
  target: number;
  milestoneReached: number;
  protectedExceptionsUsed: number;
  completedAt?: string;
  rewardApplied: boolean;
  cooldownUntil?: LocalDateKey;
}

export interface RankRequirement {
  rank: Rank;
  minimumLevel: number;
  lifetimeCompletions: number;
  completedDays: number;
  disciplineLevel: number;
  balancedStatLevel: number;
  balancedStatsRequired: number;
  challengesCompleted: number;
  trialTemplateId?: string;
}

export interface RankHistory {
  id: string;
  from: Rank;
  to: Rank;
  timestamp: string;
  date: LocalDateKey;
}

export interface LevelHistory {
  id: string;
  level: number;
  timestamp: string;
  date: LocalDateKey;
  sourceId: string;
}

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  condition: string;
  rarity: Rarity;
  accent: string;
}

export interface UnlockedTitle {
  id: string;
  titleId: string;
  unlockedAt: string;
  sourceId: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  hidden: boolean;
  unlockedAt?: string;
  rarity: Rarity;
}

export interface CosmeticDefinition {
  id: string;
  name: string;
  description: string;
  kind: 'frame' | 'sigil' | 'theme';
  rarity: Rarity;
  unlockCondition: string;
  previewClass: string;
}

export interface CosmeticUnlock {
  id: string;
  cosmeticId: string;
  unlockedAt: string;
  sourceId: string;
}

export interface BackupSnapshot {
  id: string;
  createdAt: string;
  reason: 'daily-finalization' | 'before-import' | 'before-reset' | 'manual';
  byteSize: number;
  data: Record<string, unknown[]>;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  note: string;
}

export interface PeriodicReport {
  id: string;
  kind: 'weekly' | 'monthly';
  periodStart: LocalDateKey;
  periodEnd: LocalDateKey;
  createdAt: string;
  completionRate: number;
  completedMissions: number;
  perfectDays: number;
  strongestCategory: MissionCategory;
  focusSuggestion: string;
  ruleExplanation: string;
}

export interface ProgressionEvent {
  id: string;
  kind: 'level-up' | 'level-milestone' | 'rank-up' | 'achievement' | 'cosmetic';
  createdAt: string;
  headline: string;
  detail: string;
  acknowledged: boolean;
}

export interface AppMetadata {
  id: string;
  value: string | number | boolean | Record<string, unknown>;
  updatedAt: string;
}

export interface GameSnapshot {
  profile?: Profile;
  settings?: Settings;
  missions: MissionDefinition[];
  todayRecords: DailyMissionRecord[];
  pendingReview?: DailyReview;
  progression?: AccountProgression;
  stats: StatProgress[];
  challenges: ChallengeProgress[];
  titles: UnlockedTitle[];
  streaks: StreakRecord[];
  systemDate: LocalDateKey;
}

export interface SaveFile {
  format: 'the-system-save';
  version: number;
  exportedAt: string;
  checksum: string;
  data: Record<string, unknown[]>;
}
