import { KITCHEN_RECIPES } from '@/config/kitchen';
import { CANON_VOICE_PROFILES, cloneCanonVoiceProfile } from '@/config/aiVoices';
import { db, TABLE_NAMES } from '@/db/database';
import type {
  AccountProgression,
  BackupSnapshot,
  CompanionId,
  Profile,
  SaveFile,
  Settings,
} from '@/types/game';

export const SAVE_VERSION = 26;
export const MAX_IMPORT_BYTES = 32 * 1024 * 1024;
const MAX_SNAPSHOTS = 5;
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const KITCHEN_RECIPE_IDS = new Set<string>(KITCHEN_RECIPES.map((recipe) => recipe.id));

export interface SavePreview {
  displayName: string;
  level: number;
  rank: string;
  exportedAt: string;
  version: number;
  byteSize: number;
}

export interface PreparedImport {
  save: SaveFile;
  preview: SavePreview;
}

async function checksum(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function safeParse(text: string): unknown {
  return JSON.parse(text, (key, value: unknown) => {
    if (FORBIDDEN_KEYS.has(key)) throw new Error('The save contains an unsafe property name.');
    return value;
  });
}

async function readFileText(file: File) {
  if (typeof file.text === 'function') return file.text();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () =>
      reject(new Error('The selected file could not be read.')),
    );
    reader.readAsText(file);
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidCustomKitchenRecipe(value: unknown) {
  if (!isObject(value)) return false;
  const strings = ['id', 'name', 'codename', 'equipment', 'plate', 'storage', 'safety'];
  const lists = ['ingredients', 'steps', 'swaps'];
  return (
    strings.every((key) => typeof value[key] === 'string') &&
    lists.every(
      (key) =>
        Array.isArray(value[key]) &&
        (value[key] as unknown[]).every((item) => typeof item === 'string'),
    ) &&
    (value.costTier === '$' || value.costTier === '$$' || value.costTier === '$$$') &&
    Number.isInteger(value.servings) &&
    Number(value.servings) >= 1 &&
    Number(value.servings) <= 20 &&
    Number.isInteger(value.prepMinutes) &&
    Number(value.prepMinutes) >= 0 &&
    Number(value.prepMinutes) <= 240 &&
    Number.isInteger(value.cookMinutes) &&
    Number(value.cookMinutes) >= 0 &&
    Number(value.cookMinutes) <= 480 &&
    typeof value.dailyRotationEnabled === 'boolean' &&
    value.sourceCompanionId === 'saffron'
  );
}

function requiredSingleton<T>(data: Record<string, unknown[]>, table: string, id = 'primary') {
  const row = data[table]?.find((candidate) => isObject(candidate) && candidate.id === id);
  if (!row) throw new Error(`The save is missing required ${table} data.`);
  return row as T;
}

function migrateData(
  version: number,
  source: Record<string, unknown[]>,
): Record<string, unknown[]> {
  const data = Object.fromEntries(
    TABLE_NAMES.map((table) => [table, Array.isArray(source[table]) ? source[table] : []]),
  );
  if (version <= 2) {
    data.cosmetics ??= [];
    data.cosmeticUnlocks ??= [];
    data.auditEntries ??= [];
    data.reports ??= [];
    data.progressionEvents ??= [];
  }
  if (version <= 3) {
    data.dailyEvents ??= [];
    data.inventory ??= [];
    data.companionReactions ??= [];
  }
  if (version <= 4) {
    data.partyCheckIns ??= [];
  }
  if (version <= 5) {
    data.supportConversations ??= [];
    data.favoriteMessages ??= [];
    data.partyBanters ??= [];
  }
  if (version <= 6) {
    data.campfireRecaps ??= [];
  }
  if (version <= 7) {
    data.dailyBriefings ??= [];
    data.campaignArcs ??= [];
    data.arcMilestones ??= [];
    data.companionQuestProgress ??= [];
    data.monthlyCouncils ??= [];
  }
  if (version <= 8) {
    data.treasurySettings ??= [];
    data.treasuryTransactions ??= [];
    data.treasuryBills ??= [];
    data.treasuryDebts ??= [];
    data.treasurySavingsGoals ??= [];
    data.treasuryWeeks ??= [];
    data.treasuryChallenges ??= [];
  }
  if (version <= 9) {
    data.trainingSessions ??= [];
  }
  if (version <= 10) {
    data.sanctuarySessions ??= [];
  }
  if (version <= 11) {
    data.kitchenSessions ??= [];
  }
  if (version <= 13) {
    data.aiConversations ??= [];
  }
  if (version <= 14) {
    data.aiMemories ??= [];
  }
  if (version <= 15) {
    data.aiVoiceProfiles ??= [];
    data.aiUsageRecords ??= [];
  }
  if (version <= 18) {
    data.creatorSettings ??= [];
    data.creatorSnapshots ??= [];
    data.creatorProjects ??= [];
  }
  if (version <= 19) data.creatorVideoInsights ??= [];
  if (version <= 22) data.dailyOperations ??= [];
  if (version <= 23) data.bodyDiagnostics ??= [];
  if (version <= 24) {
    data.arcCharacters ??= [];
    data.arcCanonSources ??= [];
  }
  data.dailyOperations = data.dailyOperations.map((row) => {
    if (!isObject(row) || !isObject(row.pendingProposal)) return row;
    const pendingProposal = row.pendingProposal;
    return {
      ...row,
      pendingProposal: {
        ...pendingProposal,
        includeTraining:
          typeof pendingProposal.includeTraining === 'boolean'
            ? pendingProposal.includeTraining
            : pendingProposal.kind === 'prepare-training' ||
              typeof pendingProposal.trainingLocation === 'string',
      },
    };
  });
  data.aiVoiceProfiles = data.aiVoiceProfiles.map((row) => {
    if (
      !isObject(row) ||
      typeof row.id !== 'string' ||
      !Object.hasOwn(CANON_VOICE_PROFILES, row.id)
    ) {
      return row;
    }
    const canon = cloneCanonVoiceProfile(row.id as CompanionId);
    if (version <= 18 && row.id === 'haven') return canon;
    return {
      delivery: canon.delivery,
      cadence: canon.cadence,
      texture: canon.texture,
      register: canon.register,
      resonance: canon.resonance,
      performanceTake: canon.performanceTake,
      naturalism: canon.naturalism,
      pauseDiscipline: canon.pauseDiscipline,
      intonation: canon.intonation,
      articulation: canon.articulation,
      emotionalRange: canon.emotionalRange,
      ...row,
    };
  });
  const migrationTime = new Date().toISOString();
  if (!data.creatorSettings.some((row) => isObject(row) && row.id === 'primary')) {
    data.creatorSettings.push({
      id: 'primary',
      channelName: '',
      channelHandle: '',
      channelUrl: '',
      weeklyUploadTarget: 1,
      currentArcFocus: '',
      accountabilityMode: 'direct',
      createdAt: migrationTime,
      updatedAt: migrationTime,
    });
  }
  if (!data.treasurySettings.some((row) => isObject(row) && row.id === 'primary')) {
    data.treasurySettings.push({
      id: 'primary',
      currency: 'USD',
      weeklyReviewDay: 0,
      challengeEnabled: true,
      challengeChance: 0.75,
      challengeRewardXp: 60,
      createdAt: migrationTime,
      updatedAt: migrationTime,
    });
  }
  if (!data.stats.some((row) => isObject(row) && row.id === 'stewardship')) {
    data.stats.push({
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
  data.settings = data.settings.map((row) => {
    if (isObject(row)) {
      const companionIds = Array.isArray(row.enabledCompanionIds)
        ? row.enabledCompanionIds.filter((id): id is string => typeof id === 'string')
        : ['rook', 'selah', 'cipher', 'haven'];
      const withEmber =
        version <= 6 && !companionIds.includes('ember') ? [...companionIds, 'ember'] : companionIds;
      const migratedCompanionIds =
        version <= 7 && !withEmber.includes('amara') ? [...withEmber, 'amara'] : withEmber;
      const withCassian =
        version <= 8 && !migratedCompanionIds.includes('cassian')
          ? [...migratedCompanionIds, 'cassian']
          : migratedCompanionIds;
      const withSaffron =
        version <= 11 && !withCassian.includes('saffron')
          ? [...withCassian, 'saffron']
          : withCassian;
      const withMira =
        version <= 12 && !withSaffron.includes('mira') ? [...withSaffron, 'mira'] : withSaffron;
      const withQuill =
        version <= 24 && !withMira.includes('quill') ? [...withMira, 'quill'] : withMira;
      return {
        privacyScreenEnabled: false,
        sensitiveMissionAlias: 'Integrity Protocol',
        firstDayGuideCompleted: false,
        soundVolume: 0.55,
        interfaceStyle: 'system',
        colorTheme: 'abyss',
        dailyEventsEnabled: true,
        companionMode: 'balanced',
        dailyBriefingEnabled: true,
        aiLinkMode: 'offline',
        aiDataSharingAcknowledged: false,
        aiRelationshipMemoryEnabled: false,
        aiTreasurySharingEnabled: false,
        aiVoiceOutputEnabled: false,
        aiVoiceAutoPlay: false,
        aiVoiceDisclosureAcknowledged: false,
        aiVoiceProvider: 'openai',
        aiCartesiaPlan: 'free',
        aiUsageWarningUsd: 5,
        aiSoulprintNotes: {},
        ...row,
        enabledCompanionIds: ['snow', ...withQuill.filter((id) => id !== 'snow')],
      };
    }
    return row;
  });
  data.missions = data.missions.map((row) =>
    isObject(row) ? { optional: false, archived: false, ...row } : row,
  );
  return data;
}

function validateData(data: Record<string, unknown[]>) {
  for (const table of TABLE_NAMES) {
    if (!Array.isArray(data[table])) throw new Error(`The ${table} table is not valid.`);
    const ids = new Set<string>();
    for (const row of data[table]) {
      if (!isObject(row) || typeof row.id !== 'string' || !row.id.trim()) {
        throw new Error(`The ${table} table contains a malformed record.`);
      }
      if (ids.has(row.id)) throw new Error(`The ${table} table contains a duplicate ID.`);
      ids.add(row.id);
    }
  }

  const profile = requiredSingleton<Profile>(data, 'profiles');
  const settings = requiredSingleton<Settings>(data, 'settings');
  const progression = requiredSingleton<AccountProgression>(data, 'progression');
  if (typeof profile.displayName !== 'string' || profile.displayName.length > 100) {
    throw new Error('The profile name is not valid.');
  }
  if (
    typeof settings.resetTime !== 'string' ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings.resetTime)
  ) {
    throw new Error('The daily reset time is not valid.');
  }
  if (typeof settings.aiRelationshipMemoryEnabled !== 'boolean') {
    throw new Error('The Bond Memory setting is not valid.');
  }
  if (typeof settings.aiTreasurySharingEnabled !== 'boolean') {
    throw new Error('The Cassian Ledger Counsel setting is not valid.');
  }
  if (
    typeof settings.aiVoiceOutputEnabled !== 'boolean' ||
    typeof settings.aiVoiceAutoPlay !== 'boolean' ||
    typeof settings.aiVoiceDisclosureAcknowledged !== 'boolean' ||
    !['openai', 'cartesia'].includes(settings.aiVoiceProvider ?? 'openai') ||
    !['free', 'pro'].includes(settings.aiCartesiaPlan ?? 'free') ||
    !Number.isFinite(settings.aiUsageWarningUsd) ||
    settings.aiUsageWarningUsd < 0 ||
    settings.aiUsageWarningUsd > 1_000
  ) {
    throw new Error('The Voice Link setting is not valid.');
  }
  const aiCompanionIds = new Set([
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
  if (!isObject(settings.aiSoulprintNotes)) {
    throw new Error('The Soulprint Studio setting is not valid.');
  }
  const soulprintFields = ['humor', 'challenge', 'care', 'casual', 'conflict', 'bonds', 'never'];
  for (const [companionId, notes] of Object.entries(settings.aiSoulprintNotes)) {
    if (!aiCompanionIds.has(companionId) || !isObject(notes)) {
      throw new Error('A Soulprint Studio note contains an impossible value.');
    }
    if (
      soulprintFields.some(
        (field) => typeof notes[field] !== 'string' || String(notes[field]).length > 600,
      )
    ) {
      throw new Error('A Soulprint Studio note contains an impossible value.');
    }
  }
  for (const key of [
    'level',
    'totalXp',
    'lifetimeMissionCompletions',
    'completedDays',
    'perfectDays',
  ] as const) {
    const value = progression[key];
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Progression contains an impossible ${key} value.`);
    }
  }
  for (const row of data.stats) {
    if (!isObject(row) || Number(row.level) < 1 || Number(row.totalXp) < 0) {
      throw new Error('A stat contains an impossible value.');
    }
  }

  const aiAudiences = new Set(['party', ...aiCompanionIds]);
  for (const row of data.aiConversations) {
    if (
      !isObject(row) ||
      typeof row.title !== 'string' ||
      !row.title.trim() ||
      row.title.length > 120 ||
      !aiAudiences.has(String(row.audience)) ||
      typeof row.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.updatedAt)) ||
      !Array.isArray(row.messages) ||
      row.messages.length > 500
    ) {
      throw new Error('An AI Headquarters conversation contains an impossible value.');
    }
    for (const message of row.messages) {
      if (
        !isObject(message) ||
        typeof message.id !== 'string' ||
        !message.id.trim() ||
        (message.role !== 'hunter' && message.role !== 'companion') ||
        (message.role === 'companion' && !aiCompanionIds.has(String(message.companionId))) ||
        typeof message.message !== 'string' ||
        !message.message.trim() ||
        message.message.length > 8_000 ||
        typeof message.createdAt !== 'string' ||
        !Number.isFinite(Date.parse(message.createdAt))
      ) {
        throw new Error('An AI Headquarters message contains an impossible value.');
      }
    }
  }

  const aiMemoryCategories = new Set([
    'preference',
    'goal',
    'boundary',
    'background',
    'commitment',
  ]);
  const aiMemoryStatuses = new Set(['pending', 'approved']);
  for (const row of data.aiMemories) {
    if (
      !isObject(row) ||
      typeof row.fact !== 'string' ||
      !row.fact.trim() ||
      row.fact.length > 240 ||
      !aiMemoryCategories.has(String(row.category)) ||
      !aiAudiences.has(String(row.scope)) ||
      !aiMemoryStatuses.has(String(row.status)) ||
      typeof row.sourceConversationId !== 'string' ||
      !row.sourceConversationId.trim() ||
      typeof row.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.updatedAt))
    ) {
      throw new Error('A Bond Memory record contains an impossible value.');
    }
  }

  const aiVoiceNames = new Set([
    'alloy',
    'ash',
    'ballad',
    'coral',
    'echo',
    'fable',
    'nova',
    'onyx',
    'sage',
    'shimmer',
    'verse',
    'marin',
    'cedar',
  ]);
  const aiVoiceAccents = new Set([
    'natural',
    'general-american',
    'british',
    'irish',
    'australian',
    'caribbean',
    'west-african',
    'southern-us',
  ]);
  const aiVoiceDeliveries = new Set([
    'conversational',
    'cinematic',
    'playful',
    'intense',
    'soothing',
    'commanding',
    'dry',
    'intimate',
  ]);
  const aiVoiceCadences = new Set(['natural', 'clipped', 'flowing', 'measured', 'rapid-fire']);
  const aiVoiceTextures = new Set(['clean', 'smooth', 'airy', 'textured', 'grounded', 'bright']);
  const aiVoiceRegisters = new Set(['low', 'low-mid', 'mid', 'high-mid', 'high']);
  const aiVoiceResonances = new Set(['chest', 'balanced', 'forward', 'head']);
  const aiVoicePerformanceTakes = new Set(['grounded', 'balanced', 'dynamic']);
  for (const row of data.aiVoiceProfiles) {
    if (
      !isObject(row) ||
      !aiCompanionIds.has(String(row.id)) ||
      !aiVoiceNames.has(String(row.voice)) ||
      (row.cartesiaVoiceId !== undefined &&
        (typeof row.cartesiaVoiceId !== 'string' ||
          !/^[a-zA-Z0-9_-]{8,128}$/.test(row.cartesiaVoiceId))) ||
      (row.cartesiaVoiceName !== undefined &&
        (typeof row.cartesiaVoiceName !== 'string' || row.cartesiaVoiceName.length > 160)) ||
      !aiVoiceAccents.has(String(row.accent)) ||
      !aiVoiceDeliveries.has(String(row.delivery)) ||
      !aiVoiceCadences.has(String(row.cadence)) ||
      !aiVoiceTextures.has(String(row.texture)) ||
      !aiVoiceRegisters.has(String(row.register)) ||
      !aiVoiceResonances.has(String(row.resonance)) ||
      !aiVoicePerformanceTakes.has(String(row.performanceTake)) ||
      !Number.isFinite(row.pace) ||
      Number(row.pace) < 0.75 ||
      Number(row.pace) > 1.65 ||
      !Number.isInteger(row.warmth) ||
      Number(row.warmth) < 1 ||
      Number(row.warmth) > 5 ||
      !Number.isInteger(row.energy) ||
      Number(row.energy) < 1 ||
      Number(row.energy) > 5 ||
      !Number.isInteger(row.expressiveness) ||
      Number(row.expressiveness) < 1 ||
      Number(row.expressiveness) > 5 ||
      !Number.isInteger(row.naturalism) ||
      Number(row.naturalism) < 1 ||
      Number(row.naturalism) > 5 ||
      !Number.isInteger(row.pauseDiscipline) ||
      Number(row.pauseDiscipline) < 1 ||
      Number(row.pauseDiscipline) > 5 ||
      !Number.isInteger(row.intonation) ||
      Number(row.intonation) < 1 ||
      Number(row.intonation) > 5 ||
      !Number.isInteger(row.articulation) ||
      Number(row.articulation) < 1 ||
      Number(row.articulation) > 5 ||
      !Number.isInteger(row.emotionalRange) ||
      Number(row.emotionalRange) < 1 ||
      Number(row.emotionalRange) > 5 ||
      typeof row.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.updatedAt))
    ) {
      throw new Error('A Voice Forge profile contains an impossible value.');
    }
  }

  const aiUsageKinds = new Set(['text', 'vision', 'transcription', 'speech', 'realtime']);
  for (const row of data.aiUsageRecords) {
    if (
      !isObject(row) ||
      !aiUsageKinds.has(String(row.kind)) ||
      typeof row.sessionId !== 'string' ||
      !row.sessionId.trim() ||
      typeof row.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.model !== 'string' ||
      !row.model.trim() ||
      (row.provider !== undefined && !['openai', 'cartesia'].includes(String(row.provider))) ||
      (row.companionId !== undefined && !aiCompanionIds.has(String(row.companionId))) ||
      [
        row.inputTokens,
        row.outputTokens,
        row.totalTokens,
        row.characters,
        row.audioSeconds,
        row.estimatedCostUsd,
      ].some((value) => !Number.isFinite(value) || Number(value) < 0) ||
      (row.cachedInputTokens !== undefined &&
        (!Number.isFinite(row.cachedInputTokens) || Number(row.cachedInputTokens) < 0)) ||
      (row.reasoningTokens !== undefined &&
        (!Number.isFinite(row.reasoningTokens) || Number(row.reasoningTokens) < 0)) ||
      (row.audioInputTokens !== undefined &&
        (!Number.isFinite(row.audioInputTokens) || Number(row.audioInputTokens) < 0)) ||
      (row.cachedAudioInputTokens !== undefined &&
        (!Number.isFinite(row.cachedAudioInputTokens) || Number(row.cachedAudioInputTokens) < 0)) ||
      (row.audioOutputTokens !== undefined &&
        (!Number.isFinite(row.audioOutputTokens) || Number(row.audioOutputTokens) < 0)) ||
      typeof row.exactUsage !== 'boolean'
    ) {
      throw new Error('An AI usage record contains an impossible value.');
    }
  }

  const diagnosticGoals = new Set([
    'balanced',
    'recomposition',
    'fat-loss',
    'muscle-gain',
    'performance',
    'mobility',
  ]);
  const diagnosticConfidence = new Set(['high', 'medium', 'low']);
  const diagnosticCompanions = new Set(['rook', 'ember', 'mira']);
  for (const row of data.bodyDiagnostics) {
    if (!isObject(row)) {
      throw new Error('A Training Hall Body Diagnostic contains an impossible value.');
    }
    const assessment = isObject(row.assessment) ? row.assessment : undefined;
    const usage = isObject(row.usage) ? row.usage : undefined;
    const sourceKinds = Array.isArray(row.sourceKinds) ? row.sourceKinds : [];
    const metrics = Array.isArray(assessment?.metrics) ? assessment.metrics : [];
    const observations = Array.isArray(assessment?.observations) ? assessment.observations : [];
    const priorities = Array.isArray(assessment?.priorities) ? assessment.priorities : [];
    const bonusExercises = Array.isArray(assessment?.bonusExercises)
      ? assessment.bonusExercises
      : [];
    const companionMessages = Array.isArray(assessment?.companionMessages)
      ? assessment.companionMessages
      : [];
    const stringListIsValid = (value: unknown, maximum: number) =>
      Array.isArray(value) &&
      value.length <= maximum &&
      value.every((item) => typeof item === 'string' && item.trim().length > 0);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(String(row.weekStart)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(String(row.weekEnd)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(String(row.date)) ||
      String(row.weekStart) > String(row.date) ||
      String(row.date) > String(row.weekEnd) ||
      !diagnosticGoals.has(String(row.goal)) ||
      sourceKinds.length < 1 ||
      sourceKinds.length > 4 ||
      sourceKinds.filter((kind) => kind === 'physique').length > 3 ||
      sourceKinds.filter((kind) => kind === 'scale').length > 1 ||
      sourceKinds.some((kind) => kind !== 'physique' && kind !== 'scale') ||
      !assessment ||
      !['physique', 'scale', 'combined'].includes(String(assessment.scanType)) ||
      !['strong', 'usable', 'limited'].includes(String(assessment.dataQuality)) ||
      typeof assessment.title !== 'string' ||
      !assessment.title.trim() ||
      typeof assessment.summary !== 'string' ||
      !assessment.summary.trim() ||
      typeof assessment.comparison !== 'string' ||
      !stringListIsValid(assessment.dataQualityNotes, 6) ||
      !stringListIsValid(assessment.warnings, 6) ||
      typeof assessment.disclaimer !== 'string' ||
      !assessment.disclaimer.trim() ||
      metrics.length > 20 ||
      observations.length > 8 ||
      priorities.length < 1 ||
      priorities.length > 4 ||
      bonusExercises.length > 4 ||
      companionMessages.length !== 3 ||
      new Set(companionMessages.map((message) => isObject(message) && message.companionId)).size !==
        3 ||
      companionMessages.some(
        (message) =>
          !isObject(message) ||
          !diagnosticCompanions.has(String(message.companionId)) ||
          typeof message.message !== 'string' ||
          !message.message.trim(),
      ) ||
      metrics.some(
        (metric) =>
          !isObject(metric) ||
          typeof metric.label !== 'string' ||
          typeof metric.value !== 'string' ||
          typeof metric.unit !== 'string' ||
          !['physique', 'scale', 'hunter'].includes(String(metric.source)) ||
          !diagnosticConfidence.has(String(metric.confidence)),
      ) ||
      observations.some(
        (observation) =>
          !isObject(observation) ||
          typeof observation.area !== 'string' ||
          typeof observation.observation !== 'string' ||
          typeof observation.evidence !== 'string' ||
          !diagnosticConfidence.has(String(observation.confidence)),
      ) ||
      priorities.some(
        (priority) =>
          !isObject(priority) ||
          typeof priority.title !== 'string' ||
          !priority.title.trim() ||
          typeof priority.why !== 'string' ||
          !priority.why.trim() ||
          typeof priority.nextAction !== 'string' ||
          !priority.nextAction.trim(),
      ) ||
      bonusExercises.some(
        (exercise) =>
          !isObject(exercise) ||
          typeof exercise.name !== 'string' ||
          !exercise.name.trim() ||
          typeof exercise.prescription !== 'string' ||
          !exercise.prescription.trim() ||
          typeof exercise.rationale !== 'string' ||
          !exercise.rationale.trim(),
      ) ||
      !usage ||
      [
        usage.inputTokens,
        usage.cachedInputTokens,
        usage.outputTokens,
        usage.reasoningTokens,
        usage.totalTokens,
        row.rewardXp,
      ].some((value) => !Number.isFinite(value) || Number(value) < 0) ||
      typeof row.rewardApplied !== 'boolean' ||
      typeof row.model !== 'string' ||
      !row.model.trim() ||
      typeof row.completedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.completedAt)) ||
      Object.keys(row).some((key) => /(?:image|photo|dataurl|base64)/i.test(key))
    ) {
      throw new Error('A Training Hall Body Diagnostic contains an impossible value.');
    }
  }

  const arcSourceKinds = new Set([
    'character-dossier',
    'world-lore',
    'faction',
    'location',
    'timeline',
    'plot',
    'reference',
  ]);
  for (const row of data.arcCharacters) {
    if (
      !isObject(row) ||
      typeof row.name !== 'string' ||
      !row.name.trim() ||
      row.name.length > 200 ||
      typeof row.alias !== 'string' ||
      row.alias.length > 240 ||
      typeof row.style !== 'string' ||
      row.style.length > 100 ||
      typeof row.faction !== 'string' ||
      row.faction.length > 240 ||
      typeof row.overallClass !== 'string' ||
      row.overallClass.length > 80 ||
      typeof row.startingClass !== 'string' ||
      row.startingClass.length > 80 ||
      typeof row.endingClass !== 'string' ||
      row.endingClass.length > 80 ||
      !Number.isFinite(row.completion) ||
      Number(row.completion) < 0 ||
      Number(row.completion) > 100 ||
      !Number.isInteger(row.schemaVersion) ||
      Number(row.schemaVersion) < 1 ||
      Number(row.schemaVersion) > 20 ||
      !isObject(row.data) ||
      JSON.stringify(row.data).length > 2_500_000 ||
      typeof row.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.updatedAt))
    ) {
      throw new Error('An A.R.C. character dossier contains an impossible value.');
    }
  }
  for (const row of data.arcCanonSources) {
    if (!isObject(row)) {
      throw new Error('An A.R.C. canon source contains an impossible value.');
    }
    const tags = Array.isArray(row.tags) ? row.tags : [];
    const characterNames = Array.isArray(row.characterNames) ? row.characterNames : [];
    if (
      typeof row.title !== 'string' ||
      !row.title.trim() ||
      row.title.length > 240 ||
      !arcSourceKinds.has(String(row.kind)) ||
      tags.length > 80 ||
      tags.some((tag: unknown) => typeof tag !== 'string' || tag.length > 100) ||
      characterNames.length > 120 ||
      characterNames.some((name: unknown) => typeof name !== 'string' || name.length > 200) ||
      typeof row.text !== 'string' ||
      !row.text.trim() ||
      row.text.length > 2_500_000 ||
      typeof row.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.updatedAt))
    ) {
      throw new Error('An A.R.C. canon source contains an impossible value.');
    }
  }

  const commandCapacities = new Set(['low', 'steady', 'high']);
  const commandOutcomes = new Set([
    'pending',
    'standard-clear',
    'full-clear',
    'missed',
    'not-applicable',
  ]);
  for (const row of data.dailyBriefings) {
    if (!isObject(row) || row.rulesVersion !== 1) continue;
    const missionIds = row.scheduledMissionIds;
    if (
      !commandCapacities.has(String(row.capacity)) ||
      !Array.isArray(missionIds) ||
      missionIds.length < 1 ||
      missionIds.length > 500 ||
      missionIds.some((id) => typeof id !== 'string' || !id.trim()) ||
      new Set(missionIds).size !== missionIds.length ||
      !Number.isFinite(row.targetCompletionRate) ||
      Number(row.targetCompletionRate) < 0 ||
      Number(row.targetCompletionRate) > 1 ||
      !Number.isInteger(row.targetMissionCount) ||
      Number(row.targetMissionCount) < 0 ||
      Number(row.targetMissionCount) > missionIds.length ||
      !Number.isFinite(row.standardMultiplier) ||
      Number(row.standardMultiplier) < 1 ||
      Number(row.standardMultiplier) > 3 ||
      !Number.isFinite(row.fullClearMultiplier) ||
      Number(row.fullClearMultiplier) < 1 ||
      Number(row.fullClearMultiplier) > 3 ||
      (row.outcome !== undefined && !commandOutcomes.has(String(row.outcome)))
    ) {
      throw new Error('A Daily Command record contains an impossible value.');
    }
  }

  const treasurySettings = requiredSingleton<Record<string, unknown>>(data, 'treasurySettings');
  if (
    treasurySettings.currency !== 'USD' ||
    typeof treasurySettings.challengeEnabled !== 'boolean' ||
    !Number.isFinite(treasurySettings.challengeChance) ||
    Number(treasurySettings.challengeChance) < 0 ||
    Number(treasurySettings.challengeChance) > 1
  ) {
    throw new Error('Treasury challenge settings are not valid.');
  }
  const validDate = (value: unknown) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const operationStatuses = new Set(['awaiting-confirmation', 'preparing', 'ready', 'partial']);
  const operationKinds = new Set([
    'assemble-day',
    'prepare-training',
    'prepare-kitchen',
    'prepare-sanctuary',
  ]);
  const operationTrainingLocations = new Set(['home', 'gym', 'conditioning', 'recovery']);
  const operationSanctuaryModes = new Set(['study', 'stronghold']);
  const operationSanctuaryConcerns = new Set([
    'sexual-integrity',
    'shame',
    'anger',
    'sadness',
    'loneliness',
    'stress',
    'numbness',
    'focus',
    'doubt',
    'forgiveness',
    'identity',
    'gratitude',
  ]);
  const operationStates = new Set(['ready', 'active', 'completed', 'changed']);
  const validOptionalText = (value: unknown, maximum: number) =>
    value === undefined || (typeof value === 'string' && value.length <= maximum);
  const validCompanions = (value: unknown) =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 10 &&
    value.every((id) => aiCompanionIds.has(String(id)));
  const validPreparedBase = (value: Record<string, unknown>) =>
    typeof value.sessionId === 'string' &&
    value.sessionId.trim().length > 0 &&
    value.sessionId.length <= 200 &&
    typeof value.label === 'string' &&
    value.label.trim().length > 0 &&
    value.label.length <= 200 &&
    typeof value.detail === 'string' &&
    value.detail.length <= 500 &&
    validCompanions(value.companionIds) &&
    (value.state === undefined || operationStates.has(String(value.state)));
  for (const row of data.dailyOperations) {
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      row.id !== row.date ||
      !operationStatuses.has(String(row.status)) ||
      !aiCompanionIds.has(String(row.sourceCompanionId)) ||
      !Number.isInteger(row.pendingMissionCount) ||
      Number(row.pendingMissionCount) < 0 ||
      !Number.isInteger(row.completedMissionCount) ||
      Number(row.completedMissionCount) < 0 ||
      !Array.isArray(row.preparationNotes) ||
      row.preparationNotes.length > 12 ||
      row.preparationNotes.some((note) => typeof note !== 'string' || note.length > 500) ||
      typeof row.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.updatedAt)) ||
      !validOptionalText(row.conversationId, 200) ||
      (row.preparedAt !== undefined &&
        (typeof row.preparedAt !== 'string' || !Number.isFinite(Date.parse(row.preparedAt))))
    ) {
      throw new Error('A Party Operations record contains an impossible value.');
    }
    if (row.pendingProposal !== undefined) {
      const proposal = row.pendingProposal;
      if (!isObject(proposal)) {
        throw new Error('A Party Operations proposal contains an impossible value.');
      }
      const kind = String(proposal.kind);
      const includeTraining = proposal.includeTraining === true;
      const includeKitchen = proposal.includeKitchen === true;
      const includeSanctuary = proposal.includeSanctuary === true;
      const ownershipAllowed =
        (kind === 'assemble-day' && proposal.companionId === 'snow') ||
        (kind === 'prepare-training' &&
          ['snow', 'rook', 'ember', 'mira'].includes(String(proposal.companionId))) ||
        (kind === 'prepare-kitchen' && proposal.companionId === 'saffron') ||
        (kind === 'prepare-sanctuary' && proposal.companionId === 'selah');
      if (
        !operationKinds.has(kind) ||
        !aiCompanionIds.has(String(proposal.companionId)) ||
        !ownershipAllowed ||
        typeof proposal.includeTraining !== 'boolean' ||
        typeof proposal.includeKitchen !== 'boolean' ||
        typeof proposal.includeSanctuary !== 'boolean' ||
        (proposal.trainingLocation !== undefined &&
          !operationTrainingLocations.has(String(proposal.trainingLocation))) ||
        (includeTraining && !operationTrainingLocations.has(String(proposal.trainingLocation))) ||
        (kind === 'assemble-day' && !includeTraining && !includeKitchen && !includeSanctuary) ||
        (kind === 'prepare-training' && !includeTraining) ||
        (kind === 'prepare-kitchen' && !includeKitchen) ||
        (kind === 'prepare-sanctuary' && !includeSanctuary) ||
        !validOptionalText(proposal.foodConstraints, 400) ||
        (proposal.sanctuaryMode !== undefined &&
          !operationSanctuaryModes.has(String(proposal.sanctuaryMode))) ||
        (proposal.primaryConcern !== undefined &&
          !operationSanctuaryConcerns.has(String(proposal.primaryConcern))) ||
        (proposal.secondaryConcern !== undefined &&
          !operationSanctuaryConcerns.has(String(proposal.secondaryConcern))) ||
        (includeSanctuary &&
          (!operationSanctuaryModes.has(String(proposal.sanctuaryMode)) ||
            !operationSanctuaryConcerns.has(String(proposal.primaryConcern)))) ||
        typeof proposal.summary !== 'string' ||
        !proposal.summary.trim() ||
        proposal.summary.length > 320 ||
        typeof proposal.confirmation !== 'string' ||
        !proposal.confirmation.trim() ||
        proposal.confirmation.length > 240
      ) {
        throw new Error('A Party Operations proposal contains an impossible value.');
      }
    }
    if (row.training !== undefined) {
      const prepared = row.training;
      if (
        !isObject(prepared) ||
        !validPreparedBase(prepared) ||
        !operationTrainingLocations.has(String(prepared.location))
      ) {
        throw new Error('A prepared Training operation contains an impossible value.');
      }
    }
    if (row.kitchen !== undefined) {
      const prepared = row.kitchen;
      if (
        !isObject(prepared) ||
        !validPreparedBase(prepared) ||
        typeof prepared.recipeId !== 'string' ||
        !prepared.recipeId.trim() ||
        prepared.recipeId.length > 200 ||
        typeof prepared.customRecipe !== 'boolean' ||
        !validOptionalText(prepared.constraints, 400)
      ) {
        throw new Error('A prepared Kitchen operation contains an impossible value.');
      }
    }
    if (row.sanctuary !== undefined) {
      const prepared = row.sanctuary;
      if (
        !isObject(prepared) ||
        !validPreparedBase(prepared) ||
        !operationSanctuaryModes.has(String(prepared.mode))
      ) {
        throw new Error('A prepared Sanctuary operation contains an impossible value.');
      }
    }
  }
  const validCents = (value: unknown, allowZero = false) =>
    Number.isInteger(value) &&
    Number(value) >= (allowZero ? 0 : 1) &&
    Number(value) <= 1_000_000_000;
  const transactionKinds = new Set([
    'income',
    'expense',
    'bill-payment',
    'debt-payment',
    'savings',
    'adjustment',
  ]);
  for (const row of data.treasuryTransactions) {
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      !transactionKinds.has(String(row.kind)) ||
      !validCents(row.amountCents) ||
      typeof row.label !== 'string' ||
      !row.label.trim()
    ) {
      throw new Error('A Treasury ledger entry contains an impossible value.');
    }
  }
  for (const row of data.treasuryBills) {
    if (
      !isObject(row) ||
      !validCents(row.amountCents) ||
      !Number.isInteger(row.dueDay) ||
      Number(row.dueDay) < 1 ||
      Number(row.dueDay) > 31
    ) {
      throw new Error('A Treasury bill contains an impossible value.');
    }
  }
  for (const row of data.treasuryDebts) {
    if (
      !isObject(row) ||
      !validCents(row.balanceCents, true) ||
      (row.aprBasisPoints !== undefined &&
        (!validCents(row.aprBasisPoints, true) || Number(row.aprBasisPoints) > 10000))
    ) {
      throw new Error('A Treasury debt account contains an impossible value.');
    }
  }
  for (const row of data.treasurySavingsGoals) {
    if (!isObject(row) || !validCents(row.targetCents) || !validCents(row.currentCents, true)) {
      throw new Error('A Treasury savings goal contains an impossible value.');
    }
  }
  for (const row of data.treasuryWeeks) {
    if (
      !isObject(row) ||
      !validDate(row.weekStart) ||
      !validDate(row.weekEnd) ||
      !['planned', 'reviewed'].includes(String(row.status)) ||
      !['spendingLimitCents', 'diningLimitCents', 'savingsTargetCents', 'debtTargetCents'].every(
        (key) => validCents(row[key], true),
      )
    ) {
      throw new Error('A Treasury weekly plan contains an impossible value.');
    }
  }
  for (const row of data.treasuryChallenges) {
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      !['active', 'passed', 'failed', 'declined', 'expired'].includes(String(row.status)) ||
      !Number.isFinite(row.roll) ||
      Number(row.roll) < 0 ||
      Number(row.roll) > 1 ||
      !validCents(row.rewardXp, true) ||
      !validCents(row.stabilityPenalty, true)
    ) {
      throw new Error('A Treasury challenge contains an impossible value.');
    }
  }
  const trainingLocations = new Set(['home', 'gym', 'conditioning', 'recovery']);
  const trainingStatuses = new Set(['assigned', 'active', 'paused', 'completed', 'abandoned']);
  const trainingCircuits = new Set([
    'iron-foundation',
    'vanguard-frame',
    'shadow-engine',
    'guardian-citadel',
  ]);
  const gymWorkouts = new Set([
    'vanguard-frame-gym',
    'iron-citadel-gym',
    'shadow-hunter-gym',
    'heavenly-restriction-gym',
  ]);
  const mobilityDisciplines = new Set(['mobility', 'yoga', 'pilates']);
  const mobilityMoods = new Set(['still-waters', 'open-sky', 'quiet-fire']);
  const mobilityKinds = new Set(['breath', 'mobility', 'yoga', 'pilates', 'core']);
  for (const row of data.trainingSessions) {
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      (row.id !== row.date && !String(row.id).startsWith(`${row.date}:`)) ||
      !trainingLocations.has(String(row.location)) ||
      !trainingStatuses.has(String(row.status)) ||
      (row.circuitId !== undefined && !trainingCircuits.has(String(row.circuitId))) ||
      (row.gymWorkoutId !== undefined && !gymWorkouts.has(String(row.gymWorkoutId))) ||
      (row.durationMinutes !== undefined &&
        ![15, 20, 25, 30].includes(Number(row.durationMinutes))) ||
      (row.loggedDurationMinutes !== undefined &&
        (!Number.isFinite(row.loggedDurationMinutes) ||
          Number(row.loggedDurationMinutes) < 1 ||
          Number(row.loggedDurationMinutes) > 1440)) ||
      (row.roundsCompleted !== undefined &&
        (!Number.isInteger(row.roundsCompleted) || Number(row.roundsCompleted) < 0)) ||
      (row.partialReps !== undefined &&
        (!Number.isInteger(row.partialReps) || Number(row.partialReps) < 0)) ||
      typeof row.rerollUsed !== 'boolean' ||
      typeof row.bossExtensionUsed !== 'boolean'
    ) {
      throw new Error('A Training Hall record contains an impossible value.');
    }
    if (
      (row.mobilityDiscipline !== undefined &&
        !mobilityDisciplines.has(String(row.mobilityDiscipline))) ||
      (row.mobilityMoodId !== undefined && !mobilityMoods.has(String(row.mobilityMoodId))) ||
      (row.mobilityEstimatedMinutes !== undefined &&
        (![14, 18, 22].includes(Number(row.mobilityEstimatedMinutes)) ||
          !Number.isInteger(row.mobilityEstimatedMinutes))) ||
      (row.mobilityCompletedMovementIds !== undefined &&
        (!Array.isArray(row.mobilityCompletedMovementIds) ||
          row.mobilityCompletedMovementIds.length > 12 ||
          row.mobilityCompletedMovementIds.some((id) => typeof id !== 'string' || id.length > 100)))
    ) {
      throw new Error('A mobility protocol contains an impossible value.');
    }
    if (row.mobilityMovements !== undefined) {
      if (
        !Array.isArray(row.mobilityMovements) ||
        row.mobilityMovements.length < 4 ||
        row.mobilityMovements.length > 12 ||
        row.mobilityMovements.some(
          (movement) =>
            !isObject(movement) ||
            typeof movement.id !== 'string' ||
            movement.id.length > 100 ||
            typeof movement.name !== 'string' ||
            movement.name.length > 150 ||
            !mobilityKinds.has(String(movement.kind)) ||
            typeof movement.prescription !== 'string' ||
            !Array.isArray(movement.instructions) ||
            movement.instructions.length < 1 ||
            movement.instructions.length > 5 ||
            movement.instructions.some(
              (instruction) => typeof instruction !== 'string' || instruction.length > 500,
            ) ||
            typeof movement.breathingCue !== 'string' ||
            movement.breathingCue.length > 500,
        )
      ) {
        throw new Error('A mobility movement contains an impossible value.');
      }
    }
    if (row.exerciseLoads !== undefined) {
      if (
        !isObject(row.exerciseLoads) ||
        Object.values(row.exerciseLoads).some(
          (value) => !Number.isFinite(value) || Number(value) < 0 || Number(value) > 500,
        )
      ) {
        throw new Error('A Training Hall load record contains an impossible value.');
      }
    }
    if (row.gymExerciseLogs !== undefined) {
      if (!isObject(row.gymExerciseLogs)) {
        throw new Error('A Training Hall set log contains an impossible value.');
      }
      for (const sets of Object.values(row.gymExerciseLogs)) {
        if (
          !Array.isArray(sets) ||
          sets.length > 12 ||
          sets.some(
            (set) =>
              !isObject(set) ||
              typeof set.completed !== 'boolean' ||
              (set.weight !== undefined &&
                (!Number.isFinite(set.weight) ||
                  Number(set.weight) < 0 ||
                  Number(set.weight) > 1500)) ||
              (set.reps !== undefined &&
                (!Number.isFinite(set.reps) || Number(set.reps) < 0 || Number(set.reps) > 1000)),
          )
        ) {
          throw new Error('A Training Hall set log contains an impossible value.');
        }
      }
    }
  }

  for (const row of data.kitchenSessions) {
    const hasBuiltInRecipe = isObject(row) && KITCHEN_RECIPE_IDS.has(String(row.recipeId));
    const hasCustomRecipe =
      isObject(row) &&
      isValidCustomKitchenRecipe(row.customRecipeSnapshot) &&
      (row.customRecipeSnapshot as Record<string, unknown>).id === row.recipeId;
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      row.id !== row.date ||
      (!hasBuiltInRecipe && !hasCustomRecipe) ||
      (row.customRecipeSnapshot !== undefined &&
        !isValidCustomKitchenRecipe(row.customRecipeSnapshot)) ||
      !['assigned', 'completed', 'declined'].includes(String(row.status)) ||
      typeof row.rerollUsed !== 'boolean' ||
      typeof row.rewardApplied !== 'boolean' ||
      (row.servingsPrepared !== undefined &&
        (!Number.isInteger(row.servingsPrepared) ||
          Number(row.servingsPrepared) < 1 ||
          Number(row.servingsPrepared) > 30)) ||
      (row.difficulty !== undefined &&
        (!Number.isInteger(row.difficulty) ||
          Number(row.difficulty) < 1 ||
          Number(row.difficulty) > 5)) ||
      (row.rating !== undefined &&
        (!Number.isInteger(row.rating) || Number(row.rating) < 1 || Number(row.rating) > 5)) ||
      (row.note !== undefined && (typeof row.note !== 'string' || row.note.length > 2000))
    ) {
      throw new Error('A Kitchen order contains an impossible value.');
    }
    for (const checklist of [row.ingredientChecks, row.stepChecks]) {
      if (
        checklist !== undefined &&
        (!isObject(checklist) ||
          Object.values(checklist).some((value) => typeof value !== 'boolean'))
      ) {
        throw new Error('A Kitchen checklist contains an impossible value.');
      }
    }
  }

  const sanctuaryModes = new Set(['study', 'stronghold']);
  const sanctuaryStatuses = new Set(['active', 'completed', 'abandoned']);
  const sanctuaryOutcomes = new Set(['steadier', 'moved', 'connected', 'need-support']);
  const sanctuaryConcerns = new Set([
    'sexual-integrity',
    'shame',
    'anger',
    'sadness',
    'loneliness',
    'stress',
    'numbness',
    'focus',
    'doubt',
    'forgiveness',
    'identity',
    'gratitude',
  ]);
  const companionIds = new Set([
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
  for (const row of data.sanctuarySessions) {
    if (!isObject(row)) {
      throw new Error('A Scripture Sanctuary record contains an impossible value.');
    }
    const passages = row.passageIds;
    const companions = row.companionIds;
    if (
      !validDate(row.date) ||
      !sanctuaryModes.has(String(row.mode)) ||
      !sanctuaryStatuses.has(String(row.status)) ||
      !sanctuaryConcerns.has(String(row.primaryConcern)) ||
      (row.secondaryConcern !== undefined &&
        (!sanctuaryConcerns.has(String(row.secondaryConcern)) ||
          row.secondaryConcern === row.primaryConcern)) ||
      !Array.isArray(passages) ||
      passages.length < 1 ||
      passages.length > 4 ||
      passages.some((id) => typeof id !== 'string' || !id.trim()) ||
      new Set(passages).size !== passages.length ||
      !Array.isArray(companions) ||
      companions.length < 2 ||
      companions.length > 9 ||
      companions.some((id) => !companionIds.has(String(id))) ||
      new Set(companions).size !== companions.length ||
      !companions.includes('snow') ||
      !companions.includes('selah') ||
      typeof row.bibleMissionCredited !== 'boolean' ||
      (row.bibleMissionCredited && (row.mode !== 'study' || row.status !== 'completed')) ||
      (row.status === 'completed' && typeof row.completedAt !== 'string') ||
      (row.outcome !== undefined && !sanctuaryOutcomes.has(String(row.outcome))) ||
      typeof row.createdAt !== 'string' ||
      typeof row.updatedAt !== 'string' ||
      (row.reflection !== undefined &&
        (typeof row.reflection !== 'string' || row.reflection.length > 2000)) ||
      (row.prayer !== undefined && (typeof row.prayer !== 'string' || row.prayer.length > 3000)) ||
      (row.nextAction !== undefined &&
        (typeof row.nextAction !== 'string' || row.nextAction.length > 500))
    ) {
      throw new Error('A Scripture Sanctuary record contains an impossible value.');
    }
  }

  const creatorSettings = requiredSingleton<Record<string, unknown>>(data, 'creatorSettings');
  if (
    typeof creatorSettings.channelName !== 'string' ||
    creatorSettings.channelName.length > 160 ||
    typeof creatorSettings.channelHandle !== 'string' ||
    creatorSettings.channelHandle.length > 100 ||
    typeof creatorSettings.channelUrl !== 'string' ||
    creatorSettings.channelUrl.length > 500 ||
    !Number.isInteger(creatorSettings.weeklyUploadTarget) ||
    Number(creatorSettings.weeklyUploadTarget) < 0 ||
    Number(creatorSettings.weeklyUploadTarget) > 21 ||
    typeof creatorSettings.currentArcFocus !== 'string' ||
    creatorSettings.currentArcFocus.length > 500 ||
    !['supportive', 'direct', 'relentless'].includes(String(creatorSettings.accountabilityMode)) ||
    typeof creatorSettings.createdAt !== 'string' ||
    typeof creatorSettings.updatedAt !== 'string'
  ) {
    throw new Error('The Creator Forge settings contain an impossible value.');
  }

  for (const row of data.creatorSnapshots) {
    if (
      !isObject(row) ||
      typeof row.capturedAt !== 'string' ||
      !['manual', 'studio-csv', 'youtube-api'].includes(String(row.source)) ||
      !Number.isInteger(row.periodDays) ||
      Number(row.periodDays) < 1 ||
      Number(row.periodDays) > 3650 ||
      [
        row.subscribers,
        row.views,
        row.watchHours,
        row.impressions,
        row.averageViewDurationSeconds,
        row.uploads,
      ].some((value) => value !== undefined && (!Number.isFinite(value) || Number(value) < 0)) ||
      (row.clickThroughRate !== undefined &&
        (!Number.isFinite(row.clickThroughRate) ||
          Number(row.clickThroughRate) < 0 ||
          Number(row.clickThroughRate) > 100)) ||
      (row.note !== undefined && (typeof row.note !== 'string' || row.note.length > 1000))
    ) {
      throw new Error('A Creator Forge channel snapshot contains an impossible value.');
    }
  }

  const creatorStatuses = new Set([
    'idea',
    'script',
    'record',
    'edit',
    'thumbnail',
    'scheduled',
    'published',
    'paused',
  ]);
  const creatorPlatforms = new Set(['youtube', 'youtube-shorts', 'arc', 'other']);
  const creatorContentTypes = new Set([
    'long-form',
    'short-form',
    'livestream',
    'community-post',
    'arc-project',
    'other',
  ]);
  for (const row of data.creatorProjects) {
    if (
      !isObject(row) ||
      typeof row.title !== 'string' ||
      !row.title.trim() ||
      row.title.length > 180 ||
      !creatorPlatforms.has(String(row.platform)) ||
      !creatorContentTypes.has(String(row.contentType)) ||
      !creatorStatuses.has(String(row.status)) ||
      [row.pillar, row.hook, row.audiencePromise, row.nextAction, row.notes].some(
        (value) => typeof value !== 'string' || value.length > 4000,
      ) ||
      typeof row.createdAt !== 'string' ||
      typeof row.updatedAt !== 'string' ||
      (row.publishedAt !== undefined && typeof row.publishedAt !== 'string')
    ) {
      throw new Error('A Creator Forge project contains an impossible value.');
    }
  }

  for (const row of data.creatorVideoInsights) {
    if (
      !isObject(row) ||
      typeof row.id !== 'string' ||
      row.id.length > 160 ||
      typeof row.videoId !== 'string' ||
      !row.videoId.trim() ||
      row.videoId.length > 100 ||
      typeof row.title !== 'string' ||
      !row.title.trim() ||
      row.title.length > 200 ||
      !Number.isInteger(row.periodDays) ||
      Number(row.periodDays) < 1 ||
      Number(row.periodDays) > 3650 ||
      [
        row.views,
        row.watchHours,
        row.averageViewDurationSeconds,
        row.averageViewPercentage,
        row.likes,
        row.comments,
      ].some((value) => value !== undefined && (!Number.isFinite(value) || Number(value) < 0)) ||
      (row.averageViewPercentage !== undefined && Number(row.averageViewPercentage) > 100) ||
      typeof row.capturedAt !== 'string' ||
      (row.publishedAt !== undefined && typeof row.publishedAt !== 'string')
    ) {
      throw new Error('A Creator Forge video insight contains an impossible value.');
    }
  }
}

async function readCurrentData() {
  const data: Record<string, unknown[]> = {};
  await db.transaction(
    'r',
    TABLE_NAMES.map((name) => db.table(name)),
    async () => {
      for (const name of TABLE_NAMES) data[name] = await db.table(name).toArray();
    },
  );
  return data;
}

export async function createSaveFile(): Promise<SaveFile> {
  const data = await readCurrentData();
  const payload = JSON.stringify(data);
  return {
    format: 'the-system-save',
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    checksum: await checksum(payload),
    data,
  };
}

export async function createLocalSnapshot(reason: BackupSnapshot['reason']) {
  const data = await readCurrentData();
  const now = new Date().toISOString();
  const snapshot: BackupSnapshot = {
    id: `${now}:${crypto.randomUUID()}`,
    createdAt: now,
    reason,
    byteSize: new Blob([JSON.stringify(data)]).size,
    data,
  };
  await db.transaction('rw', db.backupSnapshots, async () => {
    await db.backupSnapshots.put(snapshot);
    const snapshots = await db.backupSnapshots.orderBy('createdAt').reverse().toArray();
    if (snapshots.length > MAX_SNAPSHOTS) {
      await db.backupSnapshots.bulkDelete(snapshots.slice(MAX_SNAPSHOTS).map((item) => item.id));
    }
  });
  return snapshot;
}

export async function listLocalSnapshots() {
  return db.backupSnapshots.orderBy('createdAt').reverse().toArray();
}

async function replaceCurrentData(data: Record<string, unknown[]>) {
  await db.transaction(
    'rw',
    TABLE_NAMES.map((name) => db.table(name)),
    async () => {
      for (const name of TABLE_NAMES) {
        const table = db.table(name);
        await table.clear();
        const rows = data[name] ?? [];
        if (rows.length) await table.bulkAdd(rows);
      }
    },
  );
}

export async function restoreLocalSnapshot(snapshotId: string) {
  const snapshot = await db.backupSnapshots.get(snapshotId);
  if (!snapshot) throw new Error('That recovery snapshot is no longer available.');
  validateData(snapshot.data);
  await createLocalSnapshot('before-import');
  await replaceCurrentData(snapshot.data);
}

export async function downloadSave() {
  const save = await createSaveFile();
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `the-system-save-${save.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  const exportTime = new Date().toISOString();
  await db.appMetadata.put({ id: 'last-manual-export', value: exportTime, updatedAt: exportTime });
  const achievement = await db.achievements.get('first-backup');
  if (achievement && !achievement.unlockedAt) {
    const now = new Date().toISOString();
    await db.transaction('rw', db.achievements, db.progressionEvents, db.auditEntries, async () => {
      await db.achievements.put({ ...achievement, unlockedAt: now });
      await db.progressionEvents.put({
        id: 'progression-event:achievement:first-backup',
        kind: 'achievement',
        createdAt: now,
        headline: achievement.name,
        detail: achievement.description,
        acknowledged: false,
      });
      await db.auditEntries.put({
        id: 'audit:achievement:first-backup',
        timestamp: now,
        action: 'achievement-unlocked',
        targetId: 'first-backup',
        note: 'A manual save was exported.',
      });
    });
  }
}

export async function prepareSaveImport(file: File): Promise<PreparedImport> {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error('That file is too large. The import limit is 32 MB.');
  }
  const text = await readFileText(file);
  const parsed = safeParse(text);
  if (!isObject(parsed) || parsed.format !== 'the-system-save' || !isObject(parsed.data)) {
    throw new Error('This is not a valid The System save file.');
  }
  const version = Number(parsed.version);
  if (!Number.isInteger(version) || version < 1 || version > SAVE_VERSION) {
    throw new Error('This save version is not supported by this app.');
  }
  const rawData = parsed.data as Record<string, unknown[]>;
  const actualChecksum = await checksum(JSON.stringify(rawData));
  if (actualChecksum !== parsed.checksum) {
    throw new Error('The save file failed its integrity check.');
  }
  const data = migrateData(version, rawData);
  validateData(data);
  const save: SaveFile = {
    format: 'the-system-save',
    version: SAVE_VERSION,
    exportedAt: String(parsed.exportedAt),
    checksum: await checksum(JSON.stringify(data)),
    data,
  };
  const profile = requiredSingleton<Profile>(data, 'profiles');
  const progression = requiredSingleton<AccountProgression>(data, 'progression');
  return {
    save,
    preview: {
      displayName: profile.displayName,
      level: progression.level,
      rank: progression.rank,
      exportedAt: save.exportedAt,
      version,
      byteSize: file.size,
    },
  };
}

export async function commitPreparedImport(prepared: PreparedImport) {
  validateData(prepared.save.data);
  await createLocalSnapshot('before-import');
  await replaceCurrentData(prepared.save.data);
}

export async function resetAllData() {
  await createLocalSnapshot('before-reset');
  await db.transaction(
    'rw',
    TABLE_NAMES.map((name) => db.table(name)),
    async () => {
      for (const name of TABLE_NAMES) await db.table(name).clear();
    },
  );
}

export async function getStorageSummary() {
  const [data, snapshots, estimate] = await Promise.all([
    readCurrentData(),
    db.backupSnapshots.toArray(),
    navigator.storage?.estimate?.(),
  ]);
  const saveBytes = new Blob([JSON.stringify(data)]).size;
  const backupBytes = snapshots.reduce((sum, item) => sum + item.byteSize, 0);
  return {
    saveBytes,
    backupBytes,
    browserUsageBytes: estimate?.usage,
    browserQuotaBytes: estimate?.quota,
  };
}
