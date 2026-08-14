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
export type ColorTheme = 'abyss' | 'daybreak' | 'bloodmoon' | 'frostbound' | 'winter-crown';
export type CompanionId =
  | 'snow'
  | 'rook'
  | 'selah'
  | 'cipher'
  | 'haven'
  | 'ember'
  | 'mira'
  | 'amara'
  | 'cassian'
  | 'saffron'
  | 'quill'
  | 'kairo';
export type CompanionMode = 'off' | 'quiet' | 'balanced' | 'talkative';
export type AiLinkMode = 'offline' | 'online';
export type AiVoiceProvider = 'openai' | 'cartesia';
export type AiCartesiaPlan = 'free' | 'pro';
export type AiVoiceName =
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'coral'
  | 'echo'
  | 'fable'
  | 'nova'
  | 'onyx'
  | 'sage'
  | 'shimmer'
  | 'verse'
  | 'marin'
  | 'cedar';
export type AiVoiceAccent =
  | 'natural'
  | 'general-american'
  | 'british'
  | 'irish'
  | 'australian'
  | 'caribbean'
  | 'west-african'
  | 'southern-us';
export type AiVoiceDelivery =
  | 'conversational'
  | 'cinematic'
  | 'playful'
  | 'intense'
  | 'soothing'
  | 'commanding'
  | 'dry'
  | 'intimate';
export type AiVoiceCadence = 'natural' | 'clipped' | 'flowing' | 'measured' | 'rapid-fire';
export type AiVoiceTexture = 'clean' | 'smooth' | 'airy' | 'textured' | 'grounded' | 'bright';
export type AiVoiceRegister = 'low' | 'low-mid' | 'mid' | 'high-mid' | 'high';
export type AiVoiceResonance = 'chest' | 'balanced' | 'forward' | 'head';
export type AiVoiceTake = 'grounded' | 'balanced' | 'dynamic';
export type AiVoiceScene =
  'neutral' | 'celebration' | 'support' | 'accountability' | 'instruction' | 'strategy';
export interface AiSoulprintNotes {
  humor: string;
  challenge: string;
  care: string;
  casual: string;
  conflict: string;
  bonds: string;
  never: string;
}
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
  | 'treasury'
  | 'training'
  | 'kitchen';
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
  | 'kitchen'
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
  aiLinkMode: AiLinkMode;
  aiDataSharingAcknowledged: boolean;
  aiRelationshipMemoryEnabled: boolean;
  aiTreasurySharingEnabled: boolean;
  aiVoiceOutputEnabled: boolean;
  aiVoiceAutoPlay: boolean;
  aiVoiceDisclosureAcknowledged: boolean;
  aiVoiceProvider?: AiVoiceProvider;
  aiCartesiaPlan?: AiCartesiaPlan;
  aiUsageWarningUsd: number;
  aiSoulprintNotes: Partial<Record<CompanionId, AiSoulprintNotes>>;
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
  trainingSessionId?: string;
  sanctuarySessionId?: string;
}

export type TrainingLocation = 'home' | 'gym' | 'conditioning' | 'recovery';
export type TrainingCircuitId =
  'iron-foundation' | 'vanguard-frame' | 'shadow-engine' | 'guardian-citadel';
export type GymWorkoutId =
  'vanguard-frame-gym' | 'iron-citadel-gym' | 'shadow-hunter-gym' | 'heavenly-restriction-gym';
export type TrainingSessionStatus = 'assigned' | 'active' | 'paused' | 'completed' | 'abandoned';
export type MobilityDiscipline = 'mobility' | 'yoga' | 'pilates';
export type MobilityMoodId = 'still-waters' | 'open-sky' | 'quiet-fire';
export type MobilityMovementKind = 'breath' | 'mobility' | 'yoga' | 'pilates' | 'core';

export interface MobilityMovementAssignment {
  id: string;
  name: string;
  kind: MobilityMovementKind;
  prescription: string;
  instructions: string[];
  breathingCue: string;
  safetyCue?: string;
}

export interface GymExerciseSetLog {
  weight?: number;
  reps?: number;
  completed: boolean;
}

export interface GymFinisherAssignment {
  name: string;
  minutes: 5 | 8 | 10;
  cue: string;
}

export interface TrainingSession {
  id: string;
  date: LocalDateKey;
  location: TrainingLocation;
  status: TrainingSessionStatus;
  circuitId?: TrainingCircuitId;
  durationMinutes?: 15 | 20 | 25 | 30;
  loggedDurationMinutes?: number;
  briefingVariant: number;
  debriefVariant: number;
  rerollUsed: boolean;
  bossExtensionUsed: boolean;
  assignedAt: string;
  startedAt?: string;
  timerEndsAt?: string;
  remainingSeconds?: number;
  completedAt?: string;
  roundsCompleted?: number;
  partialReps?: number;
  exerciseLoads?: Record<string, number>;
  difficulty?: number;
  gymFocus?: 'strength' | 'cardio' | 'mixed' | 'class' | 'other';
  gymWorkoutId?: GymWorkoutId;
  gymExerciseLogs?: Record<string, GymExerciseSetLog[]>;
  gymExerciseChoices?: Record<string, string>;
  gymFinisher?: GymFinisherAssignment;
  gymFinisherCompleted?: boolean;
  gymProgressionPrompts?: string[];
  gymPersonalRecords?: string[];
  conditioningType?: 'walk' | 'run' | 'walk-run' | 'other';
  distance?: number;
  recoveryProtocol?: string;
  mobilityDiscipline?: MobilityDiscipline;
  mobilityMoodId?: MobilityMoodId;
  mobilityMovements?: MobilityMovementAssignment[];
  mobilityCompletedMovementIds?: string[];
  mobilityEstimatedMinutes?: number;
  note?: string;
  updatedAt: string;
}

export type BodyDiagnosticGoal =
  'balanced' | 'recomposition' | 'fat-loss' | 'muscle-gain' | 'performance' | 'mobility';
export type BodyDiagnosticSourceKind = 'physique' | 'scale';
export type BodyDiagnosticConfidence = 'high' | 'medium' | 'low';

export interface BodyDiagnosticMetric {
  label: string;
  value: string;
  unit: string;
  source: BodyDiagnosticSourceKind | 'hunter';
  confidence: BodyDiagnosticConfidence;
}

export interface BodyDiagnosticObservation {
  area: string;
  observation: string;
  evidence: string;
  confidence: BodyDiagnosticConfidence;
}

export interface BodyDiagnosticPriority {
  title: string;
  why: string;
  nextAction: string;
}

export interface BodyDiagnosticExercise {
  name: string;
  prescription: string;
  rationale: string;
}

export interface BodyDiagnosticAssessment {
  title: string;
  scanType: 'physique' | 'scale' | 'combined';
  dataQuality: 'strong' | 'usable' | 'limited';
  summary: string;
  comparison: string;
  dataQualityNotes: string[];
  metrics: BodyDiagnosticMetric[];
  observations: BodyDiagnosticObservation[];
  priorities: BodyDiagnosticPriority[];
  bonusExercises: BodyDiagnosticExercise[];
  companionMessages: Array<{
    companionId: 'rook' | 'ember' | 'mira';
    message: string;
  }>;
  warnings: string[];
  disclaimer: string;
}

export interface BodyDiagnosticRecord {
  id: string;
  weekStart: LocalDateKey;
  weekEnd: LocalDateKey;
  date: LocalDateKey;
  goal: BodyDiagnosticGoal;
  hunterContext?: string;
  sourceKinds: BodyDiagnosticSourceKind[];
  assessment: BodyDiagnosticAssessment;
  model: string;
  usage: {
    inputTokens: number;
    cachedInputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    totalTokens: number;
  };
  rewardApplied: boolean;
  rewardXp: number;
  completedAt: string;
}

export type KitchenRecipeId =
  | 'lemon-chicken-potatoes'
  | 'garlic-shrimp-rice'
  | 'turkey-taco-potato-skillet'
  | 'salmon-crispy-potatoes'
  | 'steak-bites-potatoes'
  | 'breakfast-potato-hash'
  | 'chicken-fajita-bowls'
  | 'beef-broccoli-stir-fry'
  | 'turkey-meatball-pasta'
  | 'cajun-shrimp-potato-skillet'
  | 'honey-garlic-chicken-bowls'
  | 'crab-loaded-potatoes'
  | 'blackened-cod-rice-bowls'
  | 'turkey-burger-potato-wedges'
  | 'chicken-spinach-pasta'
  | 'beef-egg-rice-skillet'
  | 'shrimp-tomato-orzo'
  | 'freezer-breakfast-burritos';
export type KitchenSessionStatus = 'assigned' | 'completed' | 'declined';

export interface KitchenSession {
  id: LocalDateKey;
  date: LocalDateKey;
  recipeId: string;
  customRecipeSnapshot?: CustomKitchenRecipe;
  status: KitchenSessionStatus;
  assignmentVariant: number;
  rerollUsed: boolean;
  assignedAt: string;
  completedAt?: string;
  ingredientChecks?: Record<string, boolean>;
  stepChecks?: Record<string, boolean>;
  servingsPrepared?: number;
  difficulty?: number;
  rating?: number;
  note?: string;
  rewardApplied: boolean;
  updatedAt: string;
}

export interface CustomKitchenRecipe {
  id: string;
  name: string;
  codename: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  costTier: '$' | '$$' | '$$$';
  equipment: string;
  plate: string;
  ingredients: string[];
  steps: string[];
  swaps: string[];
  storage: string;
  safety: string;
  dailyRotationEnabled: boolean;
  sourceCompanionId: 'saffron';
  createdAt: string;
  updatedAt: string;
}

export type CreatorPlatform = 'youtube' | 'youtube-shorts' | 'arc' | 'other';
export type CreatorContentType =
  'long-form' | 'short-form' | 'livestream' | 'community-post' | 'arc-project' | 'other';
export type CreatorProjectStatus =
  'idea' | 'script' | 'record' | 'edit' | 'thumbnail' | 'scheduled' | 'published' | 'paused';
export type CreatorSnapshotSource = 'manual' | 'studio-csv' | 'youtube-api';

export interface CreatorSettings {
  id: 'primary';
  channelName: string;
  channelHandle: string;
  channelUrl: string;
  weeklyUploadTarget: number;
  currentArcFocus: string;
  accountabilityMode: 'supportive' | 'direct' | 'relentless';
  createdAt: string;
  updatedAt: string;
}

export interface CreatorChannelSnapshot {
  id: string;
  capturedAt: string;
  source: CreatorSnapshotSource;
  periodDays: number;
  subscribers?: number;
  views?: number;
  watchHours?: number;
  impressions?: number;
  clickThroughRate?: number;
  averageViewDurationSeconds?: number;
  uploads?: number;
  note?: string;
}

export interface CreatorVideoInsight {
  id: string;
  videoId: string;
  title: string;
  publishedAt?: string;
  periodDays: number;
  views?: number;
  watchHours?: number;
  averageViewDurationSeconds?: number;
  averageViewPercentage?: number;
  likes?: number;
  comments?: number;
  capturedAt: string;
}

export interface CreatorProject {
  id: string;
  title: string;
  platform: CreatorPlatform;
  contentType: CreatorContentType;
  status: CreatorProjectStatus;
  pillar: string;
  hook: string;
  audiencePromise: string;
  nextAction: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ArcCanonSourceKind =
  'character-dossier' | 'world-lore' | 'faction' | 'location' | 'timeline' | 'plot' | 'reference';

export interface ArcCharacterRecord {
  id: string;
  name: string;
  alias: string;
  style: string;
  faction: string;
  overallClass: string;
  startingClass: string;
  endingClass: string;
  completion: number;
  schemaVersion: number;
  sourceFileName?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ArcCanonSource {
  id: string;
  title: string;
  kind: ArcCanonSourceKind;
  sourceFileName?: string;
  tags: string[];
  characterNames: string[];
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type SanctuaryMode = 'study' | 'stronghold';
export type SanctuaryStatus = 'active' | 'completed' | 'abandoned';
export type SanctuaryConcern =
  | 'sexual-integrity'
  | 'shame'
  | 'anger'
  | 'sadness'
  | 'loneliness'
  | 'stress'
  | 'numbness'
  | 'focus'
  | 'doubt'
  | 'forgiveness'
  | 'identity'
  | 'gratitude';

export interface SanctuarySession {
  id: string;
  date: LocalDateKey;
  mode: SanctuaryMode;
  status: SanctuaryStatus;
  primaryConcern: SanctuaryConcern;
  secondaryConcern?: SanctuaryConcern;
  passageIds: string[];
  companionIds: CompanionId[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  reflection?: string;
  prayer?: string;
  nextAction?: string;
  outcome?: 'steadier' | 'moved' | 'connected' | 'need-support';
  bibleMissionCredited: boolean;
}

export type CompanionOperationKind =
  'assemble-day' | 'prepare-training' | 'prepare-kitchen' | 'prepare-sanctuary';

export interface CompanionOperationRequest {
  kind: CompanionOperationKind;
  companionId: CompanionId;
  includeTraining: boolean;
  trainingLocation?: TrainingLocation;
  includeKitchen: boolean;
  foodConstraints?: string;
  includeSanctuary: boolean;
  sanctuaryMode?: SanctuaryMode;
  primaryConcern?: SanctuaryConcern;
  secondaryConcern?: SanctuaryConcern;
  summary: string;
  confirmation: string;
}

export type PreparedOperationState = 'ready' | 'active' | 'completed' | 'changed';

export interface PreparedTrainingOperation {
  sessionId: string;
  location: TrainingLocation;
  label: string;
  detail: string;
  companionIds: CompanionId[];
  state?: PreparedOperationState;
}

export interface PreparedKitchenOperation {
  sessionId: LocalDateKey;
  recipeId: string;
  label: string;
  detail: string;
  customRecipe: boolean;
  constraints?: string;
  companionIds: CompanionId[];
  state?: PreparedOperationState;
}

export interface PreparedSanctuaryOperation {
  sessionId: string;
  mode: SanctuaryMode;
  label: string;
  detail: string;
  companionIds: CompanionId[];
  state?: PreparedOperationState;
}

export interface DailyOperationsRecord {
  id: LocalDateKey;
  date: LocalDateKey;
  status: 'awaiting-confirmation' | 'preparing' | 'ready' | 'partial';
  sourceCompanionId: CompanionId;
  conversationId?: string;
  pendingProposal?: CompanionOperationRequest;
  training?: PreparedTrainingOperation;
  kitchen?: PreparedKitchenOperation;
  sanctuary?: PreparedSanctuaryOperation;
  pendingMissionCount: number;
  completedMissionCount: number;
  preparationNotes: string[];
  createdAt: string;
  updatedAt: string;
  preparedAt?: string;
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

export type AgentMissionDifficulty = 'minor' | 'standard' | 'major' | 'boss';
export type AgentMissionRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type AgentMissionStatus = 'active' | 'completed' | 'retired';
export type AgentMissionSource = 'hunter' | 'companion' | 'party';

export interface AgentMission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  companionId: CompanionId;
  createdBy: CompanionId | 'hunter';
  source: AgentMissionSource;
  difficulty: AgentMissionDifficulty;
  accountXp: number;
  statRewards: StatReward[];
  status: AgentMissionStatus;
  dueDate?: LocalDateKey;
  recurrence: AgentMissionRecurrence;
  recurrenceInterval: number;
  checklistItems: string[];
  checklist: Record<string, boolean>;
  completionCount: number;
  lastCompletedOn?: LocalDateKey;
  completedAt?: string;
  retiredAt?: string;
  rewardTransactionIds: string[];
  createdAt: string;
  updatedAt: string;
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
    | 'training'
    | 'body-diagnostic'
    | 'kitchen'
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
    | 'training'
    | 'kitchen'
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

export type AiConversationAudience = 'party' | CompanionId;

export interface AiConversationMessage {
  id: string;
  role: 'hunter' | 'companion';
  companionId?: CompanionId;
  message: string;
  voiceSummary?: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  title: string;
  audience: AiConversationAudience;
  createdAt: string;
  updatedAt: string;
  messages: AiConversationMessage[];
}

export type AiMemoryCategory = 'preference' | 'goal' | 'boundary' | 'background' | 'commitment';
export type AiMemoryStatus = 'pending' | 'approved';

export interface AiRelationshipMemory {
  id: string;
  fact: string;
  category: AiMemoryCategory;
  scope: AiConversationAudience;
  status: AiMemoryStatus;
  sourceConversationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiVoiceProfile {
  id: CompanionId;
  voice: AiVoiceName;
  cartesiaVoiceId?: string;
  cartesiaVoiceName?: string;
  cartesiaSpeed?: number;
  accent: AiVoiceAccent;
  delivery: AiVoiceDelivery;
  cadence: AiVoiceCadence;
  texture: AiVoiceTexture;
  register: AiVoiceRegister;
  resonance: AiVoiceResonance;
  performanceTake: AiVoiceTake;
  pace: number;
  warmth: number;
  energy: number;
  expressiveness: number;
  naturalism: number;
  pauseDiscipline: number;
  intonation: number;
  articulation: number;
  emotionalRange: number;
  updatedAt: string;
}

export type AiUsageKind = 'text' | 'vision' | 'transcription' | 'speech' | 'realtime';

export interface AiUsageRecord {
  id: string;
  kind: AiUsageKind;
  sessionId: string;
  createdAt: string;
  model: string;
  provider?: AiVoiceProvider;
  companionId?: CompanionId;
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  reasoningTokens?: number;
  audioInputTokens?: number;
  cachedAudioInputTokens?: number;
  audioOutputTokens?: number;
  totalTokens: number;
  characters: number;
  audioSeconds: number;
  estimatedCostUsd: number;
  exactUsage: boolean;
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
  kitchenOrders?: number;
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
  | 'no-eating-out-wins'
  | 'kitchen-orders';

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
  kitchenOrders?: number;
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

export type TreasuryAccountKind =
  'checking' | 'savings' | 'cash' | 'investment' | 'property' | 'other';

export interface TreasuryAccount {
  id: string;
  name: string;
  kind: TreasuryAccountKind;
  balanceCents: number;
  includeInNetWorth: boolean;
  active: boolean;
  note?: string;
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

export type CalendarEventCategory =
  'personal' | 'work' | 'training' | 'faith' | 'creator' | 'appointment' | 'deadline';
export type CalendarRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type CalendarEventStatus = 'scheduled' | 'completed' | 'canceled';
export type CalendarEventSource = 'hunter' | 'kairo' | 'snow';
export type CalendarRealm =
  'missions' | 'training' | 'kitchen' | 'sanctuary' | 'creator' | 'arc' | 'treasury';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: CalendarEventCategory;
  startAt: string;
  endAt: string;
  allDay: boolean;
  recurrence: CalendarRecurrence;
  recurrenceInterval: number;
  recurrenceEndsOn?: LocalDateKey;
  location: string;
  source: CalendarEventSource;
  linkedCompanionId?: CompanionId;
  linkedRealm?: CalendarRealm;
  status: CalendarEventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventOccurrence {
  occurrenceId: string;
  eventId: string;
  title: string;
  description: string;
  category: CalendarEventCategory;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string;
  source: CalendarEventSource;
  linkedCompanionId?: CompanionId;
  linkedRealm?: CalendarRealm;
  status: CalendarEventStatus;
  recurring: boolean;
}

export type IntegrityShieldEnforcement = 'not-configured' | 'screen-time' | 'managed-filter';

export interface IntegrityShieldProfile {
  id: 'primary';
  enabled: boolean;
  enforcement: IntegrityShieldEnforcement;
  adultWebLimitEnabled: boolean;
  restrictedSitesConfigured: boolean;
  settingsPasscodeProtected: boolean;
  accountabilityEnabled: boolean;
  lastVerifiedAt?: string;
  interruptionPlan: string;
  createdAt: string;
  updatedAt: string;
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
