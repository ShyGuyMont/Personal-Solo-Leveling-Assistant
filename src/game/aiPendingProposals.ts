import { db } from '@/db/database';
import type { QuickLinkAction } from '@/game/aiQuickLink';
import type { AiHeadquartersReply } from '@/services/aiHeadquarters';
import type { AiConversationAudience, CompanionId } from '@/types/game';

export type AiPendingProposal =
  | {
      kind: 'command';
      ownerId: CompanionId;
      createdAt: string;
      payload: {
        action: QuickLinkAction;
        proposal: NonNullable<AiHeadquartersReply['commandProposal']>;
      };
    }
  | {
      kind: 'operation';
      ownerId: CompanionId;
      createdAt: string;
      payload: NonNullable<AiHeadquartersReply['operationProposal']>;
    }
  | {
      kind: 'recipe';
      ownerId: 'saffron';
      createdAt: string;
      payload: NonNullable<AiHeadquartersReply['recipeProposal']>;
    }
  | {
      kind: 'content';
      ownerId: 'haven';
      createdAt: string;
      payload: NonNullable<AiHeadquartersReply['contentProposal']>;
    }
  | {
      kind: 'campaign';
      ownerId: 'haven';
      createdAt: string;
      payload: NonNullable<AiHeadquartersReply['campaignProposal']>;
    }
  | {
      kind: 'calendar';
      ownerId: 'kairo' | 'snow';
      createdAt: string;
      payload: NonNullable<AiHeadquartersReply['calendarProposal']>;
    };

const PENDING_PREFIX = 'ai-pending-proposal:';

function metadataId(conversationId: string) {
  return `${PENDING_PREFIX}${conversationId}`;
}

export function extractAiPendingProposal(
  result: AiHeadquartersReply,
  actionCatalog: QuickLinkAction[],
  audience: AiConversationAudience,
): AiPendingProposal | undefined {
  const createdAt = new Date().toISOString();
  if (result.commandProposal) {
    const action = actionCatalog.find((item) => item.actionId === result.commandProposal?.actionId);
    if (action) {
      return {
        kind: 'command',
        ownerId: result.commandProposal.companionId,
        createdAt,
        payload: { action, proposal: result.commandProposal },
      };
    }
  }
  if (result.operationProposal) {
    return {
      kind: 'operation',
      ownerId: result.operationProposal.companionId,
      createdAt,
      payload: result.operationProposal,
    };
  }
  if (result.recipeProposal) {
    return { kind: 'recipe', ownerId: 'saffron', createdAt, payload: result.recipeProposal };
  }
  if (result.contentProposal) {
    return { kind: 'content', ownerId: 'haven', createdAt, payload: result.contentProposal };
  }
  if (result.campaignProposal) {
    return { kind: 'campaign', ownerId: 'haven', createdAt, payload: result.campaignProposal };
  }
  if (result.calendarProposal) {
    return {
      kind: 'calendar',
      ownerId: audience === 'snow' ? 'snow' : 'kairo',
      createdAt,
      payload: result.calendarProposal,
    };
  }
  return undefined;
}

function isPendingProposal(value: unknown): value is AiPendingProposal {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AiPendingProposal>;
  return (
    ['command', 'operation', 'recipe', 'content', 'campaign', 'calendar'].includes(
      String(candidate.kind),
    ) &&
    typeof candidate.ownerId === 'string' &&
    typeof candidate.createdAt === 'string' &&
    Boolean(candidate.payload && typeof candidate.payload === 'object')
  );
}

export async function savePendingAiProposal(conversationId: string, proposal: AiPendingProposal) {
  await db.appMetadata.put({
    id: metadataId(conversationId),
    value: proposal as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  });
}

export async function getPendingAiProposal(conversationId: string) {
  const record = await db.appMetadata.get(metadataId(conversationId));
  return isPendingProposal(record?.value) ? record.value : undefined;
}

export async function clearPendingAiProposal(conversationId: string) {
  await db.appMetadata.delete(metadataId(conversationId));
}
