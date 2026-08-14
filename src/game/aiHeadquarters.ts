import { db } from '@/db/database';
import { COMPANIONS, getCompanion } from '@/config/companions';
import type {
  AiConversation,
  AiConversationAudience,
  AiConversationKind,
  AiConversationMessage,
  AiMemoryCategory,
  AiRelationshipMemory,
  CompanionId,
} from '@/types/game';

export interface AiMemoryCandidate {
  fact: string;
  category: AiMemoryCategory;
}

const KNOWN_COMPANION_IDS = new Set(COMPANIONS.map((companion) => companion.id));

export function normalizeAiConversationParticipants(
  audience: AiConversationAudience,
  participantIds: readonly CompanionId[] = [],
) {
  if (audience !== 'party') return [audience];
  return [...new Set(participantIds)].filter((id) => KNOWN_COMPANION_IDS.has(id));
}

export function getAiConversationParticipantIds(
  conversation: Pick<AiConversation, 'audience' | 'participantIds'>,
  partyFallback: readonly CompanionId[] = [],
) {
  if (conversation.audience !== 'party') return [conversation.audience];
  const explicit = normalizeAiConversationParticipants('party', conversation.participantIds);
  return explicit.length ? explicit : normalizeAiConversationParticipants('party', partyFallback);
}

export function getAiConversationKind(conversation: Pick<AiConversation, 'audience' | 'kind'>) {
  if (conversation.kind) return conversation.kind;
  return conversation.audience === 'party' ? 'party-council' : 'direct';
}

export function getAiConversationDisplayName(conversation: AiConversation) {
  const kind = getAiConversationKind(conversation);
  if (kind === 'spoiler-room') return 'A.R.C. Spoiler Room';
  if (kind === 'commons') return 'Party Commons';
  if (conversation.audience === 'party') return 'Party Council';
  return getCompanion(conversation.audience).name;
}

export function addAiConversationParticipants(
  conversation: AiConversation,
  companionIds: readonly CompanionId[],
  kind?: Extract<AiConversationKind, 'commons' | 'spoiler-room'>,
  partyFallback: readonly CompanionId[] = [],
) {
  const resolvedKind =
    kind ?? (getAiConversationKind(conversation) === 'spoiler-room' ? 'spoiler-room' : 'commons');
  const current = getAiConversationParticipantIds(conversation, partyFallback);
  const participantIds = normalizeAiConversationParticipants('party', [
    ...current,
    ...companionIds,
  ]);
  const defaultTitle = resolvedKind === 'spoiler-room' ? 'A.R.C. Spoiler Room' : 'Party Commons';
  return {
    ...conversation,
    audience: 'party' as const,
    kind: resolvedKind,
    participantIds,
    title:
      conversation.messages.length &&
      !/^New (?:Direct Link|Party Council)$/i.test(conversation.title)
        ? conversation.title
        : defaultTitle,
    updatedAt: new Date().toISOString(),
  };
}

export function removeAiConversationParticipants(
  conversation: AiConversation,
  companionIds: readonly CompanionId[],
  partyFallback: readonly CompanionId[] = [],
) {
  const removed = new Set(companionIds);
  const remaining = getAiConversationParticipantIds(conversation, partyFallback).filter(
    (id) => !removed.has(id),
  );
  if (remaining.length === 1) {
    const [audience] = remaining;
    return {
      ...conversation,
      audience,
      kind: 'direct' as const,
      participantIds: undefined,
      title: `Direct Link · ${getCompanion(audience).name}`,
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...conversation,
    participantIds: remaining,
    updatedAt: new Date().toISOString(),
  };
}

export function createAiConversation(
  audience: AiConversationAudience = 'party',
  now = new Date().toISOString(),
  options?: { kind?: AiConversationKind; participantIds?: CompanionId[]; title?: string },
): AiConversation {
  const kind = options?.kind ?? (audience === 'party' ? 'party-council' : 'direct');
  const participantIds = normalizeAiConversationParticipants(audience, options?.participantIds);
  return {
    id: crypto.randomUUID(),
    title:
      options?.title ??
      (kind === 'spoiler-room'
        ? 'A.R.C. Spoiler Room'
        : kind === 'commons'
          ? 'Party Commons'
          : audience === 'party'
            ? 'New Party Council'
            : 'New Direct Link'),
    audience,
    kind,
    participantIds: audience === 'party' && participantIds.length ? participantIds : undefined,
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
  options?: { participantIds?: CompanionId[]; kind?: AiConversationKind },
) {
  const requestedParticipants = normalizeAiConversationParticipants(
    audience,
    options?.participantIds,
  ).sort();
  const conversations = (
    await db.aiConversations.where('audience').equals(audience).toArray()
  ).filter((conversation) => {
    if (options?.kind && getAiConversationKind(conversation) !== options.kind) return false;
    if (audience !== 'party' || !requestedParticipants.length) return true;
    const current = normalizeAiConversationParticipants(
      'party',
      conversation.participantIds,
    ).sort();
    return (
      current.length === requestedParticipants.length &&
      current.every((id, index) => id === requestedParticipants[index])
    );
  });
  const latest = conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (!latest) return createAiConversation(audience, now.toISOString(), options);
  const age = now.getTime() - new Date(latest.updatedAt).getTime();
  return age >= 0 && age <= maxAgeHours * 60 * 60 * 1_000
    ? latest
    : createAiConversation(audience, now.toISOString(), options);
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
