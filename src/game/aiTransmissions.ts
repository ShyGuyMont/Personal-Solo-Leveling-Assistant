import { db } from '@/db/database';
import type { AiConversationAudience } from '@/types/game';

export type AiTransmissionSurface = 'quick-link' | 'headquarters';

export interface PendingAiTransmission {
  surface: AiTransmissionSurface;
  transmissionId: string;
  conversationId: string;
  hunterMessageId: string;
  audience: AiConversationAudience;
  startedAt: string;
}

const TRANSMISSION_PREFIX = 'ai-pending-transmission:';

function emitTransmissionChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('system:ai-proposal-changed'));
}

function metadataId(surface: AiTransmissionSurface) {
  return `${TRANSMISSION_PREFIX}${surface}`;
}

function isPendingAiTransmission(value: unknown): value is PendingAiTransmission {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PendingAiTransmission>;
  return (
    (candidate.surface === 'quick-link' || candidate.surface === 'headquarters') &&
    typeof candidate.transmissionId === 'string' &&
    /^[a-zA-Z0-9_-]{20,100}$/.test(candidate.transmissionId) &&
    typeof candidate.conversationId === 'string' &&
    Boolean(candidate.conversationId) &&
    typeof candidate.hunterMessageId === 'string' &&
    Boolean(candidate.hunterMessageId) &&
    typeof candidate.audience === 'string' &&
    typeof candidate.startedAt === 'string' &&
    Number.isFinite(Date.parse(candidate.startedAt))
  );
}

export async function savePendingAiTransmission(record: PendingAiTransmission) {
  await db.appMetadata.put({
    id: metadataId(record.surface),
    value: record as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  });
  emitTransmissionChanged();
}

export async function getPendingAiTransmission(surface: AiTransmissionSurface) {
  const metadata = await db.appMetadata.get(metadataId(surface));
  if (!isPendingAiTransmission(metadata?.value)) return undefined;
  if (Date.now() - Date.parse(metadata.value.startedAt) > 20 * 60 * 1000) {
    await db.appMetadata.delete(metadataId(surface));
    return undefined;
  }
  return metadata.value;
}

export async function listPendingAiTransmissions() {
  const transmissions = await Promise.all([
    getPendingAiTransmission('quick-link'),
    getPendingAiTransmission('headquarters'),
  ]);
  return transmissions.filter(Boolean) as PendingAiTransmission[];
}

export async function clearPendingAiTransmission(
  surface: AiTransmissionSurface,
  transmissionId?: string,
) {
  if (transmissionId) {
    const current = await getPendingAiTransmission(surface);
    if (current && current.transmissionId !== transmissionId) return;
  }
  await db.appMetadata.delete(metadataId(surface));
  emitTransmissionChanged();
}
