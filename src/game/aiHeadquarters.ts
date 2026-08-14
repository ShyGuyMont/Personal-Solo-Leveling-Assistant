import { db } from '@/db/database';
import type {
  AiConversation,
  AiConversationAudience,
  AiConversationMessage,
  AiMemoryCategory,
  AiRelationshipMemory,
  CompanionId,
} from '@/types/game';

export interface AiMemoryCandidate {
  fact: string;
  category: AiMemoryCategory;
}

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
  voiceSummary?: string,
): AiConversationMessage {
  const normalizedVoiceSummary = voiceSummary?.trim();
  return {
    id: crypto.randomUUID(),
    role: 'companion',
    companionId,
    message: message.trim(),
    voiceSummary: normalizedVoiceSummary || undefined,
    createdAt: now,
  };
}

export async function getRecentAiConversations(limit = 12) {
  return db.aiConversations.orderBy('updatedAt').reverse().limit(limit).toArray();
}

export async function getAiConversation(id: string) {
  return db.aiConversations.get(id);
}

export async function getContinuingAiConversation(
  audience: AiConversationAudience,
  now = new Date(),
  maxAgeHours = 12,
) {
  const conversations = await db.aiConversations.where('audience').equals(audience).toArray();
  const latest = conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (!latest) return createAiConversation(audience, now.toISOString());
  const age = now.getTime() - new Date(latest.updatedAt).getTime();
  return age >= 0 && age <= maxAgeHours * 60 * 60 * 1_000
    ? latest
    : createAiConversation(audience, now.toISOString());
}

export async function saveAiConversation(conversation: AiConversation) {
  await db.aiConversations.put(conversation);
  return conversation;
}

export async function deleteAiConversation(id: string) {
  await db.aiConversations.delete(id);
}

export async function getAiRelationshipMemories() {
  return db.aiMemories.orderBy('updatedAt').reverse().toArray();
}

export async function getRelevantApprovedMemories(audience: AiConversationAudience, limit = 12) {
  const memories = await db.aiMemories
    .where('status')
    .equals('approved')
    .reverse()
    .sortBy('updatedAt');
  return memories
    .filter(
      (memory) => audience === 'party' || memory.scope === 'party' || memory.scope === audience,
    )
    .slice(0, limit);
}

export async function saveAiMemoryCandidates(
  candidates: AiMemoryCandidate[],
  scope: AiConversationAudience,
  sourceConversationId: string,
) {
  if (!candidates.length) return [];
  const current = await db.aiMemories.toArray();
  const known = new Set(
    current.map((memory) => `${memory.scope}:${memory.fact.trim().toLowerCase()}`),
  );
  const pendingCount = current.filter((memory) => memory.status === 'pending').length;
  const remainingSlots = Math.max(0, 12 - pendingCount);
  const now = new Date().toISOString();
  const additions: AiRelationshipMemory[] = [];

  for (const candidate of candidates.slice(0, remainingSlots)) {
    const fact = candidate.fact.trim().replace(/\s+/g, ' ').slice(0, 240);
    const key = `${scope}:${fact.toLowerCase()}`;
    if (!fact || known.has(key)) continue;
    known.add(key);
    additions.push({
      id: crypto.randomUUID(),
      fact,
      category: candidate.category,
      scope,
      status: 'pending',
      sourceConversationId,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (additions.length) await db.aiMemories.bulkPut(additions);
  return additions;
}

export async function approveAiRelationshipMemory(id: string) {
  await db.aiMemories.update(id, { status: 'approved', updatedAt: new Date().toISOString() });
}

export async function forgetAiRelationshipMemory(id: string) {
  await db.aiMemories.delete(id);
}
