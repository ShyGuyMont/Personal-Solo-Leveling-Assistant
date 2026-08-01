import {
  getCompanion,
  getCompanionForCategory,
  getCompanionForStat,
} from '@/config/companions';
import { db } from '@/db/database';
import { stableId } from '@/utils/id';
import type {
  CompanionId,
  CompanionMode,
  CompanionTrigger,
  MissionCategory,
  StatName,
} from '@/types/game';

function hashSource(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shouldSpeak(mode: CompanionMode, trigger: CompanionTrigger, sourceId: string) {
  if (mode === 'off') return false;
  if (trigger !== 'mission') return true;
  const value = hashSource(sourceId) / 0xffffffff;
  if (mode === 'quiet') return false;
  if (mode === 'balanced') return value < 0.34;
  return value < 0.68;
}

function chooseMessage(
  companionId: CompanionId,
  trigger: CompanionTrigger,
  sourceId: string,
  values?: { stat?: string; level?: number },
) {
  const companion = getCompanion(companionId);
  const pool = companion.messages[trigger] ?? companion.messages.mission ?? ['Progress recorded.'];
  const template = pool[hashSource(`${sourceId}:${companionId}:${trigger}`) % pool.length];
  return template
    .replaceAll('{stat}', values?.stat ?? 'stat')
    .replaceAll('{level}', String(values?.level ?? ''));
}

export async function queueCompanionReaction(input: {
  trigger: CompanionTrigger;
  sourceId: string;
  companionId?: CompanionId;
  category?: MissionCategory;
  stat?: StatName;
  statLabel?: string;
  level?: number;
}) {
  const settings = await db.settings.get('primary');
  if (!settings || settings.companionMode === 'off') return undefined;
  const companion = input.companionId
    ? getCompanion(input.companionId)
    : input.stat
      ? getCompanionForStat(input.stat)
      : input.category
        ? getCompanionForCategory(input.category)
        : getCompanion('snow');
  if (!settings.enabledCompanionIds.includes(companion.id)) return undefined;
  if (!shouldSpeak(settings.companionMode, input.trigger, input.sourceId)) return undefined;
  const id = stableId('companion', input.trigger, input.sourceId);
  if (await db.companionReactions.get(id)) return undefined;
  const reaction = {
    id,
    companionId: companion.id,
    trigger: input.trigger,
    sourceId: input.sourceId,
    message: chooseMessage(companion.id, input.trigger, input.sourceId, {
      stat: input.statLabel,
      level: input.level,
    }),
    createdAt: new Date().toISOString(),
    acknowledged: false,
  } as const;
  await db.companionReactions.put(reaction);
  return reaction;
}

export async function queueLockInIfNeeded(systemDate: string) {
  const settings = await db.settings.get('primary');
  if (!settings || settings.recoveryMode.active) return undefined;
  const previousReview = await db.dailyReviews
    .where('date')
    .below(systemDate)
    .last();
  if (!previousReview) return undefined;
  const needsReentry =
    previousReview.status === 'in-progress' || previousReview.completionRate < 0.5;
  if (!needsReentry) return undefined;
  return queueCompanionReaction({
    trigger: 'lock-in',
    sourceId: `lock-in:${previousReview.date}:${previousReview.status}:${previousReview.completionRate}`,
    companionId: 'ember',
  });
}

export async function getNextCompanionReaction() {
  const settings = await db.settings.get('primary');
  if (!settings || settings.companionMode === 'off') return undefined;
  return db.companionReactions
    .orderBy('createdAt')
    .filter(
      (reaction) =>
        !reaction.acknowledged && settings.enabledCompanionIds.includes(reaction.companionId),
    )
    .first();
}

export async function acknowledgeCompanionReaction(id: string) {
  await db.companionReactions.update(id, { acknowledged: true });
}
