import { PARTY_BANTER } from '@/config/banter';
import { db } from '@/db/database';
import { stableId } from '@/utils/id';
import type { LocalDateKey, MissionCategory, PartyBanter, PartyChatMessage } from '@/types/game';

function hashSource(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export async function queuePartyBanter(input: {
  date: LocalDateKey;
  sourceId: string;
  category: MissionCategory;
}) {
  const settings = await db.settings.get('primary');
  if (!settings || settings.companionMode === 'off') return undefined;
  const chance = {
    quiet: 0.04,
    balanced: 0.12,
    talkative: 0.24,
    off: 0,
  }[settings.companionMode];
  if (hashSource(`banter-roll:${input.sourceId}`) / 0xffffffff >= chance) return undefined;
  const enabled = new Set(settings.enabledCompanionIds);
  const available = PARTY_BANTER[input.category].filter((exchange) =>
    exchange.messages.every((message) => enabled.has(message.companionId)),
  );
  if (!available.length) return undefined;
  const exchange = available[hashSource(`banter-choice:${input.sourceId}`) % available.length];
  const id = stableId('party-banter', input.sourceId);
  if (await db.partyBanters.get(id)) return undefined;
  const createdAt = new Date().toISOString();
  const messages: PartyChatMessage[] = exchange.messages.map((message, order) => ({
    id: `${id}:message:${order}`,
    messageId: `banter:${exchange.id}:${order}`,
    companionId: message.companionId,
    message: message.message,
    role: 'response',
    order,
  }));
  const banter: PartyBanter = {
    id,
    date: input.date,
    sourceId: input.sourceId,
    category: input.category,
    createdAt,
    messages,
    acknowledged: false,
  };
  await db.partyBanters.put(banter);
  return banter;
}

export async function getNextPartyBanter() {
  return db.partyBanters.orderBy('createdAt').filter((banter) => !banter.acknowledged).first();
}

export async function acknowledgePartyBanter(id: string) {
  await db.partyBanters.update(id, { acknowledged: true });
}
