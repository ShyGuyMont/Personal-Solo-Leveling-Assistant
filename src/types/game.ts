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
  | 'empathy'
  | 'stewardship';
export type ChallengeKind = 'weekly' | 'monthly' | 'boss' | 'rank-trial' | 'recovery';
export type ChallengeCategory = MissionCategory | 'balanced' | 'recovery' | 'rank';
export type DifficultyTier = 'I' | 'II' | 'III' | 'IV' | 'V';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ascendant';
export type RecoveryReason = 'illness' | 'injury' | 'travel' | 'emergency' | 'overload' | 'other';
export type InterfaceStyle = 'clean' | 'system';
export type ColorTheme = 'abyss' | 'daybreak';
export type CompanionId =
  'snow' | 'rook' | 'selah' | 'cipher' | 'haven' | 'ember' | 'amara' | 'cassian';
export type CompanionMode = 'off' | 'quiet' | 'balanced' | 'talkative';
export type MoodId =
  | 'energized'
  | 'proud'
  | 'good'
  | 'okay'
  | 'tired'
  | 'stressed'
  | 'frustrated'
  | 'discouraged'
  | 'lonely'
  | 'unsure';
export type SupportTopicId =
  'motivation' | 'make-a-plan' | 'faith-perspective' | 'calm-down' | 'recover' | 'celebrate';
export type SupportAudience = 'party' | CompanionId;
export type FavoriteMessageSource =
  | 'check-in'
  | 'support'
  | 'banter'
  | 'reaction'
  | 'campfire'
  | 'council'
  | 'milestone'
  | 'treasury';
export type DailyEventKind = 'none' | 'emergency-quest' | 'mission-pass';
export type DailyCapacity = 'low' | 'steady' | 'high';
export type DailyCommandOutcome =
  'pending' | 'standard-clear' | 'full-clear' | 'missed' | 'not-applicable';
export type CampaignArcStatus = 'active' | 'paused' | 'completed' | 'archived';
export type ArcMilestoneStatus = 'pending' | 'completed';
export type CompanionQuestStatus = 'active' | 'paused' | 'completed';
export type DailyEventStatus =
  'none' | 'unrevealed' | 'active' | 'completed' | 'claimed' | 'declined' | 'expired';
export type CompanionTrigger =
  | 'daily-briefing'
  | 'mission'
  | 'stat-level'
  | 'rank-up'
  | 'rare-event'
  | 'mission-pass'
  | 'comeback'
  | 'lock-in'
  | 'treasury'
  | 'achievement';

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
  interfaceStyle: InterfaceStyle;
  colorTheme: ColorTheme;
  dailyEventsEnabled: boolean;
  companionMode: CompanionMode;
  enabledCompanionIds: CompanionId[];
  notificationsEnabled: boolean;
  advancedBalanceUnlocked: boolean;
  privacyScreenEnabled: boolean;
  sensitiveMissionAlias: string;
  firstDayGuideCompleted: boolean;
  soundVolume: number;
  dailyBriefingEnabled: boolean;
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
  protectionSource?: 'monthly-exception' | 'mission-pass';
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
  dailyCommandCapacity?: DailyCapacity;
  dailyCommandOutcome?: DailyCommandOutcome;
  dailyCommandMultiplier?: number;
  dailyCommandBonusXp?: number;
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
  kind:
    | 'mission'
    | 'perfect-day'
    | 'challenge'
    | 'companion-quest'
    | 'treasury'
    | 'daily-event'
    | 'daily-command'
    | 'recovery'
    | 'reversal'
    | 'penalty';
  amount: number;
  date: LocalDateKey;
  timestamp: string;
  sourceId: string;
  note: string;
}

export interface StatTransaction {
  id: string;
  stat: StatName;
  kind:
    | 'mission'
    | 'perfect-day'
    | 'challenge'
    | 'treasury'
    | 'daily-event'
    | 'daily-command'
    | 'recovery'
    | 'reversal'
    | 'decay';
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
  reason: 'daily-finalization' | 'before-import' | 'before-reset' | 'manual' | 'archive-shield';
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
  kind: 'level-up' | 'level-milestone' | 'rank-up' | 'achievement' | 'cosmetic' | 'questline';
  createdAt: string;
  headline: string;
  detail: string;
  acknowledged: boolean;
}

export interface DailyEventRecord {
  id: LocalDateKey;
  date: LocalDateKey;
  kind: DailyEventKind;
  status: DailyEventStatus;
  templateId?: string;
  title: string;
  description: string;
  category?: ChallengeCategory;
  accountXp: number;
  statRewards: StatReward[];
  rolledAt: string;
  revealedAt?: string;
  completedAt?: string;
  claimedAt?: string;
  declinedAt?: string;
  transactionIds: string[];
}

export interface InventoryItem {
  id: 'mission-pass';
  name: string;
  description: string;
  quantity: number;
  updatedAt: string;
}

export interface CompanionReaction {
  id: string;
  companionId: CompanionId;
  trigger: CompanionTrigger;
  sourceId: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface PartyChatMessage {
  id: string;
  messageId: string;
  companionId: CompanionId;
  role: 'opener' | 'response' | 'closing';
  message: string;
  order: number;
}

export interface PartyCheckIn {
  id: string;
  date: LocalDateKey;
  mood: MoodId;
  createdAt: string;
  messages: PartyChatMessage[];
}

export interface SupportConversation {
  id: string;
  date: LocalDateKey;
  topic: SupportTopicId;
  audience: SupportAudience;
  createdAt: string;
  messages: PartyChatMessage[];
}

export interface FavoriteMessage {
  id: string;
  sourceType: FavoriteMessageSource;
  sourceId: string;
  messageId: string;
  companionId: CompanionId;
  message: string;
  createdAt: string;
}

export interface PartyBanter {
  id: string;
  date: LocalDateKey;
  sourceId: string;
  category: MissionCategory;
  createdAt: string;
  messages: PartyChatMessage[];
  acknowledged: boolean;
}

export interface CampfireMetrics {
  recordedDays: number;
  completedMissions: number;
  availableMissions: number;
  completionRate: number;
  perfectDays: number;
  categoryCompleted: Partial<Record<MissionCategory, number>>;
  categoryAvailable: Partial<Record<MissionCategory, number>>;
  strongestCategory?: MissionCategory;
  focusCategory?: MissionCategory;
  relationshipActions?: number;
  treasuryReviews?: number;
  noEatingOutWins?: number;
  savingsContributedCents?: number;
  debtPaidCents?: number;
}

export interface CampfireRecap {
  id: string;
  weekStart: LocalDateKey;
  weekEnd: LocalDateKey;
  createdAt: string;
  acknowledged: boolean;
  metrics: CampfireMetrics;
  messages: PartyChatMessage[];
}

export interface DailyCommandBriefing {
  id: LocalDateKey;
  date: LocalDateKey;
  capacity: DailyCapacity;
  status: 'planned' | 'skipped';
  mainMissionId?: string;
  supportMissionId?: string;
  bonusMissionId?: string;
  rulesVersion?: 1;
  scheduledMissionIds?: string[];
  targetCompletionRate?: number;
  targetMissionCount?: number;
  standardMultiplier?: number;
  fullClearMultiplier?: number;
  outcome?: DailyCommandOutcome;
  awardedMultiplier?: number;
  awardedBonusXp?: number;
  rewardTransactionId?: string;
  finalizedAt?: string;
  snowMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignArc {
  id: string;
  name: string;
  purpose: string;
  category: MissionCategory | 'balanced' | 'treasury';
  companionId: CompanionId;
  status: CampaignArcStatus;
  createdAt: string;
  updatedAt: string;
  targetDate?: LocalDateKey;
  completedAt?: string;
}

export interface ArcMilestone {
  id: string;
  arcId: string;
  title: string;
  description: string;
  order: number;
  status: ArcMilestoneStatus;
  createdAt: string;
  completedAt?: string;
  note?: string;
}

export type QuestObjectiveMetric =
  | 'manual'
  | 'mission-count'
  | 'category-count'
  | 'completed-days'
  | 'perfect-days'
  | 'daily-reviews'
  | 'party-check-ins'
  | 'arc-milestones'
  | 'treasury-income'
  | 'treasury-expenses'
  | 'treasury-bills-paid'
  | 'treasury-debt-payments'
  | 'treasury-savings'
  | 'treasury-weekly-reviews'
  | 'no-eating-out-wins';

export interface QuestObjectiveDefinition {
  id: string;
  title: string;
  description: string;
  metric: QuestObjectiveMetric;
  target: number;
  category?: MissionCategory;
  missionIds?: string[];
  reflectionPrompt?: string;
}

export interface QuestChapterDefinition {
  id: string;
  number: number;
  title: string;
  intro: string;
  completionMessage: string;
  objectives: QuestObjectiveDefinition[];
  rewardXp: number;
}

export interface CompanionQuestlineDefinition {
  id: string;
  companionId: CompanionId;
  title: string;
  subtitle: string;
  premise: string;
  completionTitleId: string;
  chapters: QuestChapterDefinition[];
}

export interface QuestObjectiveRecord {
  objectiveId: string;
  completedAt: string;
  note?: string;
}

export interface CompanionQuestProgress {
  id: string;
  questlineId: string;
  companionId: CompanionId;
  status: CompanionQuestStatus;
  currentChapterIndex: number;
  startedAt: string;
  chapterStartedAt: string;
  completedAt?: string;
  pausedAt?: string;
  objectiveRecords: QuestObjectiveRecord[];
  completedChapterIds: string[];
  objectiveProgress?: Record<string, number>;
}

export interface MonthlyCouncilMetrics {
  recordedDays: number;
  completedMissions: number;
  availableMissions: number;
  completionRate: number;
  perfectDays: number;
  categoryCompleted: Partial<Record<MissionCategory, number>>;
  strongestCategory?: MissionCategory;
  focusCategory?: MissionCategory;
  relationshipActions: number;
  arcMilestones: number;
  questChapters: number;
  levelsGained: number;
  rankChanges: number;
  titlesGained: number;
  treasuryReviews: number;
  noEatingOutWins: number;
  savingsContributedCents: number;
  debtPaidCents: number;
}

export interface MonthlyCouncil {
  id: string;
  monthStart: LocalDateKey;
  monthEnd: LocalDateKey;
  createdAt: string;
  acknowledged: boolean;
  metrics: MonthlyCouncilMetrics;
  messages: PartyChatMessage[];
  intention?: string;
}

export type TreasuryTransactionKind =
  'income' | 'expense' | 'bill-payment' | 'debt-payment' | 'savings';

export type TreasuryExpenseCategory =
  | 'dining'
  | 'groceries'
  | 'housing'
  | 'utilities'
  | 'transportation'
  | 'health'
  | 'personal'
  | 'subscriptions'
  | 'entertainment'
  | 'shopping'
  | 'giving'
  | 'other';

export interface TreasurySettings {
  id: 'primary';
  currency: 'USD';
  weeklyReviewDay: number;
  challengeEnabled: boolean;
  challengeChance: number;
  challengeRewardXp: number;
  createdAt: string;
  updatedAt: string;
}

export interface TreasuryTransaction {
  id: string;
  date: LocalDateKey;
  kind: TreasuryTransactionKind;
  amountCents: number;
  label: string;
  category?: TreasuryExpenseCategory;
  relatedId?: string;
  periodKey?: string;
  isEatingOut?: boolean;
  note?: string;
  createdAt: string;
}

export interface TreasuryBill {
  id: string;
  name: string;
  amountCents: number;
  dueDay: number;
  cadence: 'weekly' | 'monthly' | 'one-time';
  nextDueDate?: LocalDateKey;
  autopay: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TreasuryDebt {
  id: string;
  name: string;
  kind: 'credit-card' | 'personal-loan' | 'student-loan' | 'medical' | 'other';
  balanceCents: number;
  aprBasisPoints?: number;
  minimumPaymentCents?: number;
  dueDay?: number;
  creditLimitCents?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TreasurySavingsGoal {
  id: string;
  name: string;
  targetCents: number;
  currentCents: number;
  targetDate?: LocalDateKey;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TreasuryWeek {
  id: LocalDateKey;
  weekStart: LocalDateKey;
  weekEnd: LocalDateKey;
  status: 'planned' | 'reviewed';
  spendingLimitCents: number;
  diningLimitCents: number;
  savingsTargetCents: number;
  debtTargetCents: number;
  intention?: string;
  reflection?: string;
  cassianMessage?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export type TreasuryChallengeStatus = 'active' | 'passed' | 'failed' | 'declined' | 'expired';
export type TreasuryChallengeOutcome = Exclude<TreasuryChallengeStatus, 'active' | 'expired'>;

export interface TreasuryDailyChallenge {
  id: LocalDateKey;
  date: LocalDateKey;
  status: TreasuryChallengeStatus;
  roll: number;
  rewardXp: number;
  stabilityPenalty: number;
  createdAt: string;
  revealedAt?: string;
  resolvedAt?: string;
  rewardTransactionId?: string;
  recoveryPlan?: string;
  recoveryCompletedAt?: string;
}

export interface TreasuryWeekSummary {
  week: TreasuryWeek;
  incomeCents: number;
  expenseCents: number;
  diningCents: number;
  billPaidCents: number;
  debtPaidCents: number;
  savingsCents: number;
  billsDue: number;
  billsPaid: number;
  noEatingOutWins: number;
  challengeFailures: number;
  stabilityScore: number;
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
  dailyEvent?: DailyEventRecord;
  inventory: InventoryItem[];
  companionReaction?: CompanionReaction;
  partyBanter?: PartyBanter;
  campfireRecap?: CampfireRecap;
  dailyBriefing?: DailyCommandBriefing;
  monthlyCouncil?: MonthlyCouncil;
  treasuryChallenge?: TreasuryDailyChallenge;
  treasuryWeek?: TreasuryWeek;
  systemDate: LocalDateKey;
}

export interface SaveFile {
  format: 'the-system-save';
  version: number;
  exportedAt: string;
  checksum: string;
  data: Record<string, unknown[]>;
}
