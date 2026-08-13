import { SUPPORT_DIALOGUE } from '@/config/support';
import { db } from '@/db/database';
import { chooseUnusedMessageIndex } from '@/game/partyChat';
import { createId } from '@/utils/id';
import type {
  CompanionId,
  LocalDateKey,
  PartyChatMessage,
  SupportAudience,
  SupportConversation,
  SupportTopicId,
} from '@/types/game';

const PARTY_ORDER: CompanionId[] = [
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
  'kairo',
];

function chooseMessage(
  topic: SupportTopicId,
  speaker: CompanionId | 'snow-close',
  recentMessageIds: string[],
  selectedMessageIds: string[],
  seed: string,
) {
  const pool = SUPPORT_DIALOGUE[topic][speaker];
  const prefix = `support:${topic}:${speaker}`;
  const index = chooseUnusedMessageIndex(
    prefix,
    pool.length,
    [...selectedMessageIds, ...recentMessageIds],
    seed,
  );
  return {
    messageId: `${prefix}:${index}`,
    message: pool[index],
  };
}

export function buildSupportMessages(
  topic: SupportTopicId,
  audience: SupportAudience,
  recentMessageIds: string[],
  seed: string,
): PartyChatMessage[] {
  const messages: PartyChatMessage[] = [];
  const selected: string[] = [];
  const add = (
    companionId: CompanionId,
    speaker: CompanionId | 'snow-close',
    role: PartyChatMessage['role'],
  ) => {
    const choice = chooseMessage(
      topic,
      speaker,
      recentMessageIds,
      selected,
      `${seed}:${messages.length}`,
    );
    selected.unshift(choice.messageId);
    messages.push({
      id: `${seed}:message:${messages.length}`,
      companionId,
      role,
      order: messages.length,
      ...choice,
    });
  };

  if (audience === 'party') {
    PARTY_ORDER.forEach((companionId, index) =>
      add(companionId, companionId, index === 0 ? 'opener' : 'response'),
    );
    add('snow', 'snow-close', 'closing');
  } else {
    add(audience, audience, 'opener');
    add(audience, audience, 'closing');
  }
  return messages;
}

export async function createSupportConversation(
  topic: SupportTopicId,
  audience: SupportAudience,
  date: LocalDateKey,
) {
  const id = createId('support-conversation');
  const history = await db.supportConversations.orderBy('createdAt').reverse().limit(120).toArray();
  const recentMessageIds = history.flatMap((conversation) =>
    conversation.messages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((message) => message.messageId),
  );
  const conversation: SupportConversation = {
    id,
    date,
    topic,
    audience,
    createdAt: new Date().toISOString(),
    messages: buildSupportMessages(topic, audience, recentMessageIds, id),
  };
  await db.supportConversations.put(conversation);
  return conversation;
}

export function getRecentSupportConversations(limit = 20) {
  return db.supportConversations.orderBy('createdAt').reverse().limit(limit).toArray();
}
