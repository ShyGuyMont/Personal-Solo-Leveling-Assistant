import { db } from '@/db/database';
import type { CompanionId, FavoriteMessage, FavoriteMessageSource } from '@/types/game';

export function getFavoriteId(sourceType: FavoriteMessageSource, messageId: string) {
  return `${sourceType}:${messageId}`;
}

export async function getFavoriteMessages() {
  return db.favoriteMessages.orderBy('createdAt').reverse().toArray();
}

export async function toggleFavoriteMessage(input: {
  sourceType: FavoriteMessageSource;
  sourceId: string;
  messageId: string;
  companionId: CompanionId;
  message: string;
}) {
  const id = getFavoriteId(input.sourceType, input.messageId);
  if (await db.favoriteMessages.get(id)) {
    await db.favoriteMessages.delete(id);
    return false;
  }
  const favorite: FavoriteMessage = {
    id,
    ...input,
    createdAt: new Date().toISOString(),
  };
  await db.favoriteMessages.put(favorite);
  return true;
}
