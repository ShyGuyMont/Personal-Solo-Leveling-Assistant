import { CANON_VOICE_PROFILES, cloneCanonVoiceProfile } from '@/config/aiVoices';
import { db } from '@/db/database';
import type { AiUsageKind, AiUsageRecord, AiVoiceProfile, CompanionId } from '@/types/game';

export interface AiUsageTotals {
  estimatedCostUsd: number;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  characters: number;
  audioSeconds: number;
}

export interface AiUsageSummary {
  session: AiUsageTotals;
  today: AiUsageTotals;
  month: AiUsageTotals;
  byKind: Record<AiUsageKind, AiUsageTotals>;
}

const EMPTY_TOTALS: AiUsageTotals = {
  estimatedCostUsd: 0,
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  characters: 0,
  audioSeconds: 0,
};

function total(records: AiUsageRecord[]): AiUsageTotals {
  return records.reduce<AiUsageTotals>(
    (sum, record) => ({
      estimatedCostUsd: sum.estimatedCostUsd + record.estimatedCostUsd,
      calls: sum.calls + 1,
      inputTokens: sum.inputTokens + record.inputTokens,
      outputTokens: sum.outputTokens + record.outputTokens,
      totalTokens: sum.totalTokens + record.totalTokens,
      characters: sum.characters + record.characters,
      audioSeconds: sum.audioSeconds + record.audioSeconds,
    }),
    { ...EMPTY_TOTALS },
  );
}

function validDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : new Date(0);
}

export async function getAiVoiceProfiles() {
  const saved = new Map(
    (await db.aiVoiceProfiles.toArray()).map((profile) => [profile.id, profile]),
  );
  return Object.keys(CANON_VOICE_PROFILES).reduce<Record<CompanionId, AiVoiceProfile>>(
    (profiles, id) => {
      const companionId = id as CompanionId;
      profiles[companionId] = saved.get(companionId) ?? cloneCanonVoiceProfile(companionId);
      return profiles;
    },
    {} as Record<CompanionId, AiVoiceProfile>,
  );
}

export async function saveAiVoiceProfile(profile: AiVoiceProfile) {
  const saved: AiVoiceProfile = {
    ...profile,
    pace: Math.min(1.2, Math.max(0.8, Number(profile.pace.toFixed(2)))),
    warmth: Math.min(5, Math.max(1, Math.round(profile.warmth))),
    energy: Math.min(5, Math.max(1, Math.round(profile.energy))),
    expressiveness: Math.min(5, Math.max(1, Math.round(profile.expressiveness))),
    updatedAt: new Date().toISOString(),
  };
  await db.aiVoiceProfiles.put(saved);
  return saved;
}

export async function resetAiVoiceProfile(companionId: CompanionId) {
  await db.aiVoiceProfiles.delete(companionId);
  return cloneCanonVoiceProfile(companionId);
}

export async function recordAiUsage(
  input: Omit<AiUsageRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
) {
  const record: AiUsageRecord = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    inputTokens: Math.max(0, Math.round(input.inputTokens || 0)),
    outputTokens: Math.max(0, Math.round(input.outputTokens || 0)),
    totalTokens: Math.max(0, Math.round(input.totalTokens || 0)),
    characters: Math.max(0, Math.round(input.characters || 0)),
    audioSeconds: Math.max(0, Number((input.audioSeconds || 0).toFixed(2))),
    estimatedCostUsd: Math.max(0, Number((input.estimatedCostUsd || 0).toFixed(8))),
  };
  await db.aiUsageRecords.put(record);
  return record;
}

export async function getAiUsageSummary(sessionId: string, now = new Date()) {
  const records = await db.aiUsageRecords.toArray();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const byKind = (['text', 'transcription', 'speech'] as AiUsageKind[]).reduce(
    (result, kind) => {
      result[kind] = total(records.filter((record) => record.kind === kind));
      return result;
    },
    {} as Record<AiUsageKind, AiUsageTotals>,
  );

  return {
    session: total(records.filter((record) => record.sessionId === sessionId)),
    today: total(records.filter((record) => validDate(record.createdAt).getTime() >= todayStart)),
    month: total(records.filter((record) => validDate(record.createdAt).getTime() >= monthStart)),
    byKind,
  } satisfies AiUsageSummary;
}

const TEXT_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-5.6-luna': { input: 1, output: 6 },
  'gpt-5.6-terra': { input: 2.5, output: 15 },
  'gpt-5.6-sol': { input: 5, output: 30 },
  'gpt-5.6': { input: 5, output: 30 },
};

export function estimateTextCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const price = TEXT_PRICES[model] ?? TEXT_PRICES['gpt-5.6-luna'];
  return (
    (Math.max(0, inputTokens) * price.input + Math.max(0, outputTokens) * price.output) / 1_000_000
  );
}

export function estimateTranscriptionCostUsd(audioSeconds: number) {
  return (Math.max(0, audioSeconds) / 60) * 0.006;
}

export function estimateSpeechCostUsd(characters: number) {
  return (Math.max(0, characters) / 1_000_000) * 15;
}

export function formatEstimatedSpend(value: number) {
  if (value <= 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  return `$${value.toFixed(2)}`;
}
