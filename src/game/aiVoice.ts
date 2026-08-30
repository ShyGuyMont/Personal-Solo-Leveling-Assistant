import {
  CANON_VOICE_PROFILES,
  cloneCanonVoiceProfile,
  normalizeAiVoiceProfile,
} from '@/config/aiVoices';
import { db } from '@/db/database';
import type {
  AiCartesiaPlan,
  AiConversationMessage,
  AiUsageKind,
  AiUsageRecord,
  AiVoiceProfile,
  CompanionId,
} from '@/types/game';
import { sanitizeSensitiveDisplayText } from '@/utils/privacy';

export const AI_VOICE_SUMMARY_THRESHOLD = 500;

export function hasAiVoiceSummary(
  message: Pick<AiConversationMessage, 'message' | 'voiceSummary'>,
) {
  return (
    message.message.trim().length > AI_VOICE_SUMMARY_THRESHOLD &&
    Boolean(message.voiceSummary?.trim())
  );
}

export function getAiSpokenText(
  message: Pick<AiConversationMessage, 'message' | 'voiceSummary'>,
  fullText = false,
) {
  const text = !fullText && hasAiVoiceSummary(message) ? message.voiceSummary! : message.message;
  return sanitizeSensitiveDisplayText(text.trim());
}

export interface AiUsageTotals {
  estimatedCostUsd: number;
  calls: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  audioInputTokens: number;
  cachedAudioInputTokens: number;
  audioOutputTokens: number;
  totalTokens: number;
  characters: number;
  audioSeconds: number;
}

export interface AiUsageSummary {
  session: AiUsageTotals;
  today: AiUsageTotals;
  month: AiUsageTotals;
  byKind: Record<AiUsageKind, AiUsageTotals>;
  byModel: Record<string, AiUsageTotals>;
}

export const CARTESIA_PLAN_CREDITS: Record<AiCartesiaPlan, number> = {
  free: 20_000,
  pro: 100_000,
};

export function getCartesiaMonthlyUsage(
  usage: AiUsageSummary | undefined,
  plan: AiCartesiaPlan = 'free',
) {
  const totals = Object.entries(usage?.byModel ?? {})
    .filter(([model]) => model.startsWith('cartesia/'))
    .reduce(
      (sum, [, current]) => ({
        characters: sum.characters + current.characters,
        audioSeconds: sum.audioSeconds + current.audioSeconds,
        calls: sum.calls + current.calls,
      }),
      { characters: 0, audioSeconds: 0, calls: 0 },
    );
  const limit = CARTESIA_PLAN_CREDITS[plan];
  const remaining = Math.max(0, limit - totals.characters);
  return {
    ...totals,
    limit,
    remaining,
    percent: limit ? Math.min(100, (totals.characters / limit) * 100) : 0,
    approximateMinutesRemaining: Math.floor(remaining / 750),
  };
}

const EMPTY_TOTALS: AiUsageTotals = {
  estimatedCostUsd: 0,
  calls: 0,
  inputTokens: 0,
  cachedInputTokens: 0,
  outputTokens: 0,
  reasoningTokens: 0,
  audioInputTokens: 0,
  cachedAudioInputTokens: 0,
  audioOutputTokens: 0,
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
      cachedInputTokens: sum.cachedInputTokens + (record.cachedInputTokens ?? 0),
      outputTokens: sum.outputTokens + record.outputTokens,
      reasoningTokens: sum.reasoningTokens + (record.reasoningTokens ?? 0),
      audioInputTokens: sum.audioInputTokens + (record.audioInputTokens ?? 0),
      cachedAudioInputTokens: sum.cachedAudioInputTokens + (record.cachedAudioInputTokens ?? 0),
      audioOutputTokens: sum.audioOutputTokens + (record.audioOutputTokens ?? 0),
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
      profiles[companionId] = normalizeAiVoiceProfile(
        companionId,
        saved.get(companionId) as Partial<AiVoiceProfile> | undefined,
      );
      return profiles;
    },
    {} as Record<CompanionId, AiVoiceProfile>,
  );
}

export async function saveAiVoiceProfile(profile: AiVoiceProfile) {
  const saved = normalizeAiVoiceProfile(profile.id, {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
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
    cachedInputTokens: Math.max(0, Math.round(input.cachedInputTokens || 0)),
    outputTokens: Math.max(0, Math.round(input.outputTokens || 0)),
    reasoningTokens: Math.max(0, Math.round(input.reasoningTokens || 0)),
    audioInputTokens: Math.max(0, Math.round(input.audioInputTokens || 0)),
    cachedAudioInputTokens: Math.max(0, Math.round(input.cachedAudioInputTokens || 0)),
    audioOutputTokens: Math.max(0, Math.round(input.audioOutputTokens || 0)),
    totalTokens: Math.max(0, Math.round(input.totalTokens || 0)),
    characters: Math.max(0, Math.round(input.characters || 0)),
    audioSeconds: Math.max(0, Number((input.audioSeconds || 0).toFixed(2))),
    estimatedCostUsd: Math.max(0, Number((input.estimatedCostUsd || 0).toFixed(8))),
  };
  await db.aiUsageRecords.put(record);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('system:ai-usage-changed'));
  return record;
}

export async function getAiUsageSummary(sessionId: string, now = new Date()) {
  const records = await db.aiUsageRecords.toArray();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const todayRecords = records.filter(
    (record) => validDate(record.createdAt).getTime() >= todayStart,
  );
  const monthRecords = records.filter(
    (record) => validDate(record.createdAt).getTime() >= monthStart,
  );
  const byKind = (
    ['text', 'vision', 'transcription', 'speech', 'realtime'] as AiUsageKind[]
  ).reduce(
    (result, kind) => {
      result[kind] = total(monthRecords.filter((record) => record.kind === kind));
      return result;
    },
    {} as Record<AiUsageKind, AiUsageTotals>,
  );
  const recordsByModel = monthRecords.reduce<Record<string, AiUsageRecord[]>>((result, record) => {
    (result[record.model] ??= []).push(record);
    return result;
  }, {});
  const byModel = Object.fromEntries(
    Object.entries(recordsByModel).map(([model, modelRecords]) => [model, total(modelRecords)]),
  );

  return {
    session: total(records.filter((record) => record.sessionId === sessionId)),
    today: total(todayRecords),
    month: total(monthRecords),
    byKind,
    byModel,
  } satisfies AiUsageSummary;
}

const TEXT_PRICES: Record<string, { input: number; cachedInput: number; output: number }> = {
  'gpt-5.6-luna': { input: 0.2, cachedInput: 0.02, output: 1.2 },
  'gpt-5.6-terra': { input: 2, cachedInput: 0.2, output: 12 },
  'gpt-5.6-sol': { input: 4, cachedInput: 0.4, output: 20 },
  'gpt-5.6': { input: 4, cachedInput: 0.4, output: 20 },
};

export function estimateTextCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0,
) {
  const price = TEXT_PRICES[model] ?? TEXT_PRICES['gpt-5.6-luna'];
  const cached = Math.min(Math.max(0, cachedInputTokens), Math.max(0, inputTokens));
  const uncached = Math.max(0, inputTokens) - cached;
  return (
    (uncached * price.input +
      cached * price.cachedInput +
      Math.max(0, outputTokens) * price.output) /
    1_000_000
  );
}

export function estimateTranscriptionCostUsd(audioSeconds: number) {
  return (Math.max(0, audioSeconds) / 60) * 0.006;
}

export function estimateSpeechCostUsd(characters: number) {
  return (Math.max(0, characters) / 1_000_000) * 15;
}

const REALTIME_PRICES: Record<
  string,
  {
    textInput: number;
    cachedTextInput: number;
    textOutput: number;
    audioInput: number;
    cachedAudioInput: number;
    audioOutput: number;
  }
> = {
  'gpt-realtime-2.1-mini': {
    textInput: 0.6,
    cachedTextInput: 0.06,
    textOutput: 2.4,
    audioInput: 10,
    cachedAudioInput: 0.3,
    audioOutput: 20,
  },
  'gpt-realtime-2.1': {
    textInput: 4,
    cachedTextInput: 0.4,
    textOutput: 24,
    audioInput: 32,
    cachedAudioInput: 0.4,
    audioOutput: 64,
  },
};

export function estimateRealtimeCostUsd(input: {
  model: string;
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  audioInputTokens?: number;
  cachedAudioInputTokens?: number;
  audioOutputTokens?: number;
}) {
  const price = REALTIME_PRICES[input.model] ?? REALTIME_PRICES['gpt-realtime-2.1-mini'];
  const audioInput = Math.min(input.audioInputTokens ?? 0, input.inputTokens);
  const audioOutput = Math.min(input.audioOutputTokens ?? 0, input.outputTokens);
  const textInput = Math.max(0, input.inputTokens - audioInput);
  const textOutput = Math.max(0, input.outputTokens - audioOutput);
  const cachedAudio = Math.min(input.cachedAudioInputTokens ?? 0, audioInput);
  const cachedAll = Math.min(input.cachedInputTokens ?? 0, input.inputTokens);
  const cachedText = Math.min(Math.max(0, cachedAll - cachedAudio), textInput);
  return (
    ((textInput - cachedText) * price.textInput +
      cachedText * price.cachedTextInput +
      textOutput * price.textOutput +
      (audioInput - cachedAudio) * price.audioInput +
      cachedAudio * price.cachedAudioInput +
      audioOutput * price.audioOutput) /
    1_000_000
  );
}

export function formatEstimatedSpend(value: number) {
  if (value <= 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  return `$${value.toFixed(2)}`;
}
