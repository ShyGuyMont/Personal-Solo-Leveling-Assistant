import { db } from '@/db/database';
import type {
  AiConversation,
  AiConversationAudience,
  AiConversationMessage,
  CompanionId,
} from '@/types/game';

export function createAiConversation(
  audience: AiConversationAudience = 'party',
  now = new Date().toISOString(),
): AiConversation {
  return {
    id: crypto.randomUUID(),
    title: audience === 'party' ? 'New Party Council' : 'New Direct Link',
    audience,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function createHunterMessage(message: string, now = new Date().toISOString()) {
  return {
    id: crypto.randomUUID(),
    role: 'hunter' as const,
    message: message.trim(),
    createdAt: now,
  };
}

export function createCompanionMessage(
  companionId: CompanionId,
  message: string,
  now = new Date().toISOString(),
): AiConversationMessage {
  return {
    id: crypto.randomUUID(),
    role: 'companion',
    companionId,
    message: message.trim(),
    createdAt: now,
  };
}

export async function getRecentAiConversations(limit = 12) {
  return db.aiConversations.orderBy('updatedAt').reverse().limit(limit).toArray();
}

export async function saveAiConversation(conversation: AiConversation) {
  await db.aiConversations.put(conversation);
  return conversation;
}

export async function deleteAiConversation(id: string) {
  await db.aiConversations.delete(id);
}
