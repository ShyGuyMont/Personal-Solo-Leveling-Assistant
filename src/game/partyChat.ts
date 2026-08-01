import { PARTY_DIALOGUE, type PartySpeakerSlot } from '@/config/partyChat';
import { db } from '@/db/database';
import { createId } from '@/utils/id';
import type {
  CompanionId,
  LocalDateKey,
  MoodId,
  PartyChatMessage,
  PartyCheckIn,
} from '@/types/game';

const PARTY_ORDER: Array<{
  slot: PartySpeakerSlot;
  companionId: CompanionId;
  role: PartyChatMessage['role'];
}> = [
  { slot: 'snow', companionId: 'snow', role: 'opener' },
  { slot: 'rook', companionId: 'rook', role: 'response' },
  { slot: 'selah', companionId: 'selah', role: 'response' },
  { slot: 'cipher', companionId: 'cipher', role: 'response' },
  { slot: 'haven', companionId: 'haven', role: 'response' },
  { slot: 'ember', companionId: 'ember', role: 'response' },
  { slot: 'snow-close', companionId: 'snow', role: 'closing' },
];

function hashSource(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function chooseUnusedMessageIndex(
  messagePrefix: string,
  poolSize: number,
  recentMessageIds: string[],
  seed: string,
) {
  const lastUsedAt = Array.from({ length: poolSize }, (_, index) =>
    recentMessageIds.indexOf(`${messagePrefix}:${index}`),
  );
  const neverUsed = lastUsedAt
    .map((position, index) => ({ position, index }))
    .filter(({ position }) => position === -1)
    .map(({ index }) => index);
  if (neverUsed.length) {
    return neverUsed[hashSource(`${seed}:${messagePrefix}`) % neverUsed.length];
  }
  const oldestPosition = Math.max(...lastUsedAt);
  const leastRecent = lastUsedAt
    .map((position, index) => ({ position, index }))
    .filter(({ position }) => position === oldestPosition)
    .map(({ index }) => index);
  return leastRecent[hashSource(`${seed}:${messagePrefix}:reshuffle`) % leastRecent.length];
}

export function buildPartyMessages(
  mood: MoodId,
  recentMessageIds: string[],
  seed: string,
): PartyChatMessage[] {
  const dialogue = PARTY_DIALOGUE[mood];
  return PARTY_ORDER.map(({ slot, companionId, role }, order) => {
    const pool = dialogue[slot];
    const prefix = `${mood}:${slot}`;
    const index = chooseUnusedMessageIndex(prefix, pool.length, recentMessageIds, seed);
    return {
      id: `${seed}:message:${order}`,
      messageId: `${prefix}:${index}`,
      companionId,
      role,
      message: pool[index],
      order,
    };
  });
}

export async function createPartyCheckIn(
  mood: MoodId,
  date: LocalDateKey,
): Promise<PartyCheckIn> {
  const id = createId('party-check-in');
  const createdAt = new Date().toISOString();
  const history = await db.partyCheckIns.orderBy('createdAt').reverse().limit(120).toArray();
  const recentMessageIds = history.flatMap((checkIn) =>
    checkIn.messages.slice().sort((a, b) => a.order - b.order).map((message) => message.messageId),
  );
  const checkIn: PartyCheckIn = {
    id,
    date,
    mood,
    createdAt,
    messages: buildPartyMessages(mood, recentMessageIds, id),
  };
  await db.partyCheckIns.put(checkIn);
  return checkIn;
}

export async function getRecentPartyCheckIns(limit = 20) {
  return db.partyCheckIns.orderBy('createdAt').reverse().limit(limit).toArray();
}
