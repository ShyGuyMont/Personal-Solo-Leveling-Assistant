import { inferAiVoiceScene } from '@/config/aiVoices';
import type {
  AiConversationAudience,
  AiConversationMessage,
  AiVoiceProfile,
  AiVoiceScene,
  CompanionId,
  Focus,
  LocalDateKey,
  Rank,
  StatName,
} from '@/types/game';

export interface AiProgressContext {
  hunter: {
    firstName: string;
    systemTitle: string;
    level: number;
    class: Rank;
    startingFocus: Focus;
  };
  today: {
    date: LocalDateKey;
    completedMissions: number;
    availableMissions: number;
    pendingMissionNames: string[];
  };
  progression: {
    totalXp: number;
    currentLevelXp: number;
    xpToNextLevel: number;
    lifetimeMissionCompletions: number;
    completedDays: number;
    perfectDays: number;
    currentDayStreak: number;
    currentPerfectStreak: number;
    xpMultiplier: number;
  };
  classification: {
    nextClass?: Rank;
    qualifiedForNextClass: boolean;
    trialStatus: 'locked' | 'available' | 'active' | 'completed' | 'cooldown' | 'none';
    nextRequirements: Array<{
      label: string;
      current: number;
      target: number;
      remaining: number;
      met: boolean;
      display?: string;
    }>;
    roadmap: Array<{
      class: Rank;
      minimumLevel: number;
      lifetimeCompletions: number;
      completedDays: number;
      disciplineLevel: number;
      balancedStatLevel: number;
      balancedStatsRequired: number;
      challengesCompleted: number;
      requiresTrial: boolean;
    }>;
    worldClass: {
      remainingLevels: number;
      remainingXpToMinimumLevel: number;
      remainingMissionCompletions: number;
      remainingCompletedDays: number;
      remainingDisciplineLevels: number;
      remainingBalancedStats: number;
      remainingChallenges: number;
      lowerBoundCompletedDaysAtRecentPace: number;
      forecastCaveat: string;
    };
  };
  recentThirtyDays: {
    finalizedDays: number;
    missionsCompleted: number;
    xpEarned: number;
    averageXpPerCompletedDay: number;
    averageMissionsPerCompletedDay: number;
    perfectDays: number;
    trainingSessions: number;
    kitchenOrders: number;
    sanctuarySessions: number;
  };
  momentum: Array<{
    stat: StatName;
    level: number;
    trend: string;
    neglectedDays: number;
  }>;
  party: {
    enabledCompanionIds: CompanionId[];
    directorNotes: Array<{
      companionId: CompanionId;
      humor: string;
      challenge: string;
      care: string;
      casual: string;
      conflict: string;
      bonds: string;
      never: string;
    }>;
  };
  state: {
    recoveryActive: boolean;
  };
  bondMemory: {
    enabled: boolean;
    approved: Array<{
      fact: string;
      category: string;
      scope: AiConversationAudience;
    }>;
  };
  kitchen: {
    todayOrder?: {
      status: 'assigned' | 'completed' | 'declined';
      name: string;
      codename: string;
      totalMinutes: number;
      servings: number;
      equipment: string;
      ingredients: string[];
      steps: string[];
      completedStepNumbers: number[];
      storage: string;
      safety: string;
    };
    savedRecipeNames: string[];
  };
  specialists: {
    sanctuary: {
      recentSessions: Array<{
        date: LocalDateKey;
        mode: 'study' | 'stronghold';
        status: 'active' | 'completed' | 'abandoned';
        concerns: string[];
        passageIds: string[];
        nextAction?: string;
        outcome?: string;
      }>;
      privateWritingExcluded: true;
    };
    training: {
      recentSessions: Array<{
        date: LocalDateKey;
        location: string;
        status: string;
        circuitId?: string;
        plannedMinutes?: number;
        loggedMinutes?: number;
        roundsCompleted?: number;
        recoveryProtocol?: string;
      }>;
      privateNotesExcluded: true;
    };
    campaigns: {
      activeArcs: Array<{
        id: string;
        name: string;
        purpose: string;
        category: string;
        companionId: CompanionId;
        targetDate?: LocalDateKey;
        incompleteMilestones: string[];
        completedMilestones: number;
      }>;
      milestoneNotesExcluded: true;
    };
    creator: {
      identity: {
        channelName: string;
        channelHandle: string;
        weeklyUploadTarget: number;
        currentArcFocus: string;
        accountabilityMode: string;
      };
      latestSnapshot?: {
        capturedAt: string;
        periodDays: number;
        subscribers?: number;
        views?: number;
        watchHours?: number;
        impressions?: number;
        clickThroughRate?: number;
        averageViewDurationSeconds?: number;
        uploads?: number;
      };
      historyWindows: Array<{
        periodDays: number;
        views?: number;
        watchHours?: number;
        averageViewDurationSeconds?: number;
        uploads?: number;
      }>;
      provenVideos: Array<{
        title: string;
        publishedAt?: string;
        periodDays: number;
        views?: number;
        watchHours?: number;
        averageViewPercentage?: number;
        likes?: number;
        comments?: number;
      }>;
      activeProjects: Array<{
        id: string;
        title: string;
        platform: string;
        contentType: string;
        status: string;
        pillar: string;
        hook: string;
        audiencePromise: string;
        nextAction: string;
        updatedAt: string;
      }>;
      recentlyPublished: Array<{
        title: string;
        platform: string;
        publishedAt?: string;
      }>;
      privateNotesExcluded: true;
    };
    treasury: {
      sharingEnabled: boolean;
      privacy: string;
      recentThirtyDays?: {
        incomeCents: number;
        expenseCents: number;
        diningCents: number;
        groceriesCents: number;
        debtPaymentCents: number;
        savingsCents: number;
      };
      currentWeek?: {
        status: string;
        spendingLimitCents: number;
        diningLimitCents: number;
        savingsTargetCents: number;
        debtTargetCents: number;
        spendingSoFarCents: number;
        diningSoFarCents: number;
      };
      obligations?: {
        activeBillCount: number;
        knownBillAmountCents: number;
        activeDebtCount: number;
        debtBalanceCents: number;
        minimumPaymentsCents: number;
        aprRangeBasisPoints?: [number, number];
        activeSavingsGoalCount: number;
        savingsCurrentCents: number;
        savingsTargetCents: number;
      };
    };
  };
  commands: {
    confirmationRequired: true;
    allowedActions: Array<{
      actionId: string;
      label: string;
      description: string;
      impact: string;
    }>;
  };
}

export interface AiLinkStatus {
  ok: boolean;
  configured: boolean;
  model?: string;
  fastModel?: string;
  intelligenceModel?: string;
  apexModel?: string;
  intelligenceVersion?: string;
  speechModel?: string;
  transcriptionModel?: string;
  realtimeModel?: string;
}

export interface AiHeadquartersReply {
  model: string;
  route?: 'quick' | 'counsel' | 'sovereign';
  reasoningEffort?: 'low' | 'medium' | 'high';
  title: string;
  replies: Array<{
    companionId: CompanionId;
    message: string;
  }>;
  memoryCandidates: Array<{
    fact: string;
    category: 'preference' | 'goal' | 'boundary' | 'background' | 'commitment';
  }>;
  commandProposal?: {
    actionId: string;
    companionId: CompanionId;
    summary: string;
    confirmation: string;
  };
  recipeProposal?: {
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
    confirmation: string;
  };
  contentProposal?: {
    title: string;
    platform: 'youtube' | 'youtube-shorts' | 'arc' | 'other';
    contentType:
      'long-form' | 'short-form' | 'livestream' | 'community-post' | 'arc-project' | 'other';
    pillar: string;
    hook: string;
    audiencePromise: string;
    nextAction: string;
    notes: string;
    confirmation: string;
  };
  campaignProposal?: {
    name: string;
    strategy: string;
    weeks: number;
    operations: Array<{
      title: string;
      platform: 'youtube' | 'youtube-shorts' | 'arc' | 'other';
      contentType:
        'long-form' | 'short-form' | 'livestream' | 'community-post' | 'arc-project' | 'other';
      pillar: string;
      hook: string;
      audiencePromise: string;
      nextAction: string;
      notes: string;
    }>;
    confirmation: string;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedInputTokens: number;
    reasoningTokens: number;
  };
}

export interface AiTranscriptionResult {
  text: string;
  model: string;
  audioSeconds: number;
  estimatedCostUsd: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    exact: boolean;
  };
}

export interface AiSpeechResult {
  audio: Blob;
  model: string;
  characters: number;
  estimatedAudioSeconds: number;
  estimatedCostUsd: number;
}

export class AiLinkError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AiLinkError';
  }
}

async function readJson(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;
  return (await response.json()) as Record<string, unknown>;
}

export async function getAiLinkStatus(): Promise<AiLinkStatus> {
  try {
    const response = await fetch('/api/ai/status', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    const payload = await readJson(response);
    return {
      ok: response.ok && payload?.ok === true,
      configured: response.ok && payload?.configured === true,
      model: typeof payload?.model === 'string' ? payload.model : undefined,
      fastModel: typeof payload?.fastModel === 'string' ? payload.fastModel : undefined,
      intelligenceModel:
        typeof payload?.intelligenceModel === 'string' ? payload.intelligenceModel : undefined,
      apexModel: typeof payload?.apexModel === 'string' ? payload.apexModel : undefined,
      intelligenceVersion:
        typeof payload?.intelligenceVersion === 'string' ? payload.intelligenceVersion : undefined,
      speechModel: typeof payload?.speechModel === 'string' ? payload.speechModel : undefined,
      transcriptionModel:
        typeof payload?.transcriptionModel === 'string' ? payload.transcriptionModel : undefined,
      realtimeModel: typeof payload?.realtimeModel === 'string' ? payload.realtimeModel : undefined,
    };
  } catch {
    return { ok: false, configured: false };
  }
}

export async function requestAiHeadquartersReply(input: {
  audience: AiConversationAudience;
  message: string;
  history: AiConversationMessage[];
  context: AiProgressContext;
  commandMode?: 'none' | 'propose';
}): Promise<AiHeadquartersReply> {
  let response: Response;
  try {
    response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audience: input.audience,
        message: input.message,
        history: input.history.slice(-16).map((item) => ({
          role: item.role,
          companionId: item.companionId,
          message: item.message.slice(0, 4_000),
        })),
        context: input.context,
        commandMode: input.commandMode ?? 'none',
      }),
    });
  } catch {
    throw new AiLinkError(
      'The online link could not be reached. Your message is still saved on this device.',
      'network',
    );
  }

  const payload = await readJson(response);
  if (!response.ok) {
    const code = typeof payload?.code === 'string' ? payload.code : 'request-failed';
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Headquarters could not complete that transmission.';
    throw new AiLinkError(message, code);
  }

  if (!payload || !Array.isArray(payload.replies) || typeof payload.title !== 'string') {
    throw new AiLinkError('Headquarters returned an unreadable transmission.', 'invalid-response');
  }

  return {
    ...(payload as unknown as AiHeadquartersReply),
    model: typeof payload.model === 'string' ? payload.model : 'unknown',
    route:
      payload.route === 'sovereign'
        ? 'sovereign'
        : payload.route === 'counsel'
          ? 'counsel'
          : 'quick',
    reasoningEffort:
      payload.reasoningEffort === 'high'
        ? 'high'
        : payload.reasoningEffort === 'medium'
          ? 'medium'
          : 'low',
    memoryCandidates: Array.isArray(payload.memoryCandidates)
      ? (payload.memoryCandidates as AiHeadquartersReply['memoryCandidates'])
      : [],
    commandProposal:
      payload.commandProposal && typeof payload.commandProposal === 'object'
        ? (payload.commandProposal as AiHeadquartersReply['commandProposal'])
        : undefined,
    recipeProposal:
      payload.recipeProposal && typeof payload.recipeProposal === 'object'
        ? (payload.recipeProposal as AiHeadquartersReply['recipeProposal'])
        : undefined,
    contentProposal:
      payload.contentProposal && typeof payload.contentProposal === 'object'
        ? (payload.contentProposal as AiHeadquartersReply['contentProposal'])
        : undefined,
    campaignProposal:
      payload.campaignProposal && typeof payload.campaignProposal === 'object'
        ? (payload.campaignProposal as AiHeadquartersReply['campaignProposal'])
        : undefined,
  };
}

export async function requestAiTranscription(input: {
  audio: Blob;
  fileName: string;
  audioSeconds: number;
}): Promise<AiTranscriptionResult> {
  const form = new FormData();
  form.append('audio', input.audio, input.fileName);
  form.append('durationSeconds', String(input.audioSeconds));
  let response: Response;
  try {
    response = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: form,
    });
  } catch {
    throw new AiLinkError(
      'The microphone recording is safe, but the transcription link could not be reached.',
      'network',
    );
  }

  const payload = await readJson(response);
  if (!response.ok) {
    throw new AiLinkError(
      typeof payload?.message === 'string'
        ? payload.message
        : 'The voice transmission could not be transcribed.',
      typeof payload?.code === 'string' ? payload.code : 'transcription-failed',
    );
  }
  if (!payload || typeof payload.text !== 'string' || !payload.text.trim()) {
    throw new AiLinkError('No clear speech was detected in that recording.', 'empty-transcript');
  }
  const usage =
    payload.usage && typeof payload.usage === 'object'
      ? (payload.usage as Record<string, unknown>)
      : {};
  return {
    text: payload.text.trim(),
    model: typeof payload.model === 'string' ? payload.model : 'gpt-4o-transcribe',
    audioSeconds: Number(payload.audioSeconds ?? input.audioSeconds) || input.audioSeconds,
    estimatedCostUsd: Number(payload.estimatedCostUsd ?? 0) || 0,
    usage: {
      inputTokens: Number(usage.inputTokens ?? 0) || 0,
      outputTokens: Number(usage.outputTokens ?? 0) || 0,
      totalTokens: Number(usage.totalTokens ?? 0) || 0,
      exact: usage.exact === true,
    },
  };
}

export async function requestAiSpeech(input: {
  companionId: CompanionId;
  text: string;
  profile: AiVoiceProfile;
  scene?: AiVoiceScene;
}): Promise<AiSpeechResult> {
  let response: Response;
  try {
    response = await fetch('/api/ai/speech', {
      method: 'POST',
      headers: {
        accept: 'audio/wav',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        companionId: input.companionId,
        text: input.text.slice(0, 4_000),
        voice: input.profile.voice,
        accent: input.profile.accent,
        delivery: input.profile.delivery,
        cadence: input.profile.cadence,
        texture: input.profile.texture,
        register: input.profile.register,
        resonance: input.profile.resonance,
        performanceTake: input.profile.performanceTake,
        pace: input.profile.pace,
        warmth: input.profile.warmth,
        energy: input.profile.energy,
        expressiveness: input.profile.expressiveness,
        naturalism: input.profile.naturalism,
        pauseDiscipline: input.profile.pauseDiscipline,
        intonation: input.profile.intonation,
        articulation: input.profile.articulation,
        emotionalRange: input.profile.emotionalRange,
        scene: input.scene ?? inferAiVoiceScene(input.text),
      }),
    });
  } catch {
    throw new AiLinkError('The companion voice link could not be reached.', 'network');
  }

  if (!response.ok) {
    const payload = await readJson(response);
    throw new AiLinkError(
      typeof payload?.message === 'string'
        ? payload.message
        : 'That companion could not open their voice channel.',
      typeof payload?.code === 'string' ? payload.code : 'speech-failed',
    );
  }
  const audio = await response.blob();
  if (!audio.size) throw new AiLinkError('The voice channel returned no audio.', 'empty-audio');
  return {
    audio,
    model: response.headers.get('x-ai-model') ?? 'unknown',
    characters: Number(response.headers.get('x-ai-characters') ?? input.text.length),
    estimatedAudioSeconds: Number(response.headers.get('x-ai-audio-seconds') ?? 0),
    estimatedCostUsd: Number(response.headers.get('x-ai-estimated-cost-usd') ?? 0),
  };
}
