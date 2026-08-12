import type {
  AiConversationAudience,
  AiConversationMessage,
  AiVoiceProfile,
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
  momentum: Array<{
    stat: StatName;
    level: number;
    trend: string;
    neglectedDays: number;
  }>;
  party: {
    enabledCompanionIds: CompanionId[];
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
}

export interface AiLinkStatus {
  ok: boolean;
  configured: boolean;
  model?: string;
  intelligenceVersion?: string;
  speechModel?: string;
  transcriptionModel?: string;
}

export interface AiHeadquartersReply {
  model: string;
  title: string;
  replies: Array<{
    companionId: CompanionId;
    message: string;
  }>;
  memoryCandidates: Array<{
    fact: string;
    category: 'preference' | 'goal' | 'boundary' | 'background' | 'commitment';
  }>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
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
      intelligenceVersion:
        typeof payload?.intelligenceVersion === 'string' ? payload.intelligenceVersion : undefined,
      speechModel: typeof payload?.speechModel === 'string' ? payload.speechModel : undefined,
      transcriptionModel:
        typeof payload?.transcriptionModel === 'string' ? payload.transcriptionModel : undefined,
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
    memoryCandidates: Array.isArray(payload.memoryCandidates)
      ? (payload.memoryCandidates as AiHeadquartersReply['memoryCandidates'])
      : [],
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
        pace: input.profile.pace,
        warmth: input.profile.warmth,
        energy: input.profile.energy,
        expressiveness: input.profile.expressiveness,
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
