import type {
  AiConversationAudience,
  AiConversationMessage,
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
}

export interface AiHeadquartersReply {
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
    memoryCandidates: Array.isArray(payload.memoryCandidates)
      ? (payload.memoryCandidates as AiHeadquartersReply['memoryCandidates'])
      : [],
  };
}
