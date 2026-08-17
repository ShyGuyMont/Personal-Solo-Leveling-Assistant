import { db } from '@/db/database';
import type { AiHeadquartersReply } from '@/services/aiHeadquarters';
import type { CompanionId, DailyMissionRecord, LocalDateKey, MissionDefinition } from '@/types/game';

export const SYSTEM_DEBRIEF_TIME = '20:30';

export type SystemDebriefStatus = 'local-scan' | 'council-complete' | 'failed' | 'skipped';
export type SystemDebriefSeverity = 'watch' | 'important' | 'critical';

export interface SystemExperienceSignal {
  id: string;
  date: LocalDateKey;
  kind: 'interface-error' | 'network-error' | 'invalid-response' | 'user-note';
  surface: string;
  summary: string;
  createdAt: string;
}

export interface SystemDebriefIssue {
  id: string;
  title: string;
  severity: SystemDebriefSeverity;
  evidence: string;
  recommendation: string;
}

export interface SystemDebriefReport {
  id: string;
  date: LocalDateKey;
  status: SystemDebriefStatus;
  title: string;
  summary: string;
  participants: CompanionId[];
  wins: string[];
  issues: SystemDebriefIssue[];
  councilReplies: Array<{ companionId: CompanionId; message: string }>;
  companionWishes: string[];
  snowPriority: string;
  codexBrief: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
}

const REPORT_PREFIX = 'system-debrief:';
const SIGNAL_PREFIX = 'system-signal:';

function safeId(prefix: string) {
  const suffix = typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${suffix}`;
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function sanitizeSignalText(value: string) {
  return value
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, '[secret removed]')
    .replace(/[A-Za-z0-9+/]{80,}={0,2}/g, '[encoded content removed]')
    .replace(/blob:[^\s]+/g, '[local media removed]')
    .replace(/data:[^\s]+/g, '[embedded media removed]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);
}

export function isSystemDebriefDue(
  localTime: string,
  completedToday: boolean,
  enabled = true,
  threshold = SYSTEM_DEBRIEF_TIME,
) {
  return enabled && !completedToday && /^\d{2}:\d{2}$/.test(localTime) && localTime >= threshold;
}

export function getLocalClockTime(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return `${hour}:${minute}`;
}

export async function recordSystemExperienceSignal(input: {
  date: LocalDateKey;
  kind: SystemExperienceSignal['kind'];
  surface: string;
  summary: string;
}) {
  const summary = sanitizeSignalText(input.summary);
  if (!summary) return;
  const signal: SystemExperienceSignal = {
    id: safeId(SIGNAL_PREFIX),
    date: input.date,
    kind: input.kind,
    surface: sanitizeSignalText(input.surface || 'unknown').slice(0, 80),
    summary,
    createdAt: new Date().toISOString(),
  };
  await db.appMetadata.put({
    id: signal.id,
    value: signal as unknown as Record<string, unknown>,
    updatedAt: signal.createdAt,
  });
  window.dispatchEvent(new CustomEvent('system:debrief-changed'));
}

export async function getRecentSystemSignals(limit = 24): Promise<SystemExperienceSignal[]> {
  const records = await db.appMetadata.filter((item) => item.id.startsWith(SIGNAL_PREFIX)).toArray();
  return records
    .map((item) => asRecord(item.value))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .filter((item) => typeof item.id === 'string' && typeof item.summary === 'string')
    .map((item) => item as unknown as SystemExperienceSignal)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export async function getSystemDebrief(date: LocalDateKey) {
  const item = await db.appMetadata.get(`${REPORT_PREFIX}${date}`);
  const value = asRecord(item?.value);
  return value ? (value as unknown as SystemDebriefReport) : undefined;
}

export async function getSystemDebriefHistory(limit = 30) {
  const records = await db.appMetadata.filter((item) => item.id.startsWith(REPORT_PREFIX)).toArray();
  return records
    .map((item) => asRecord(item.value))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => item as unknown as SystemDebriefReport)
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
}

export async function saveSystemDebrief(report: SystemDebriefReport) {
  await db.appMetadata.put({
    id: `${REPORT_PREFIX}${report.date}`,
    value: report as unknown as Record<string, unknown>,
    updatedAt: report.updatedAt,
  });
  window.dispatchEvent(new CustomEvent('system:debrief-changed'));
  return report;
}

export function chooseDebriefParticipants(
  signals: SystemExperienceSignal[] = [],
  date: LocalDateKey = '1970-01-01',
): CompanionId[] {
  const text = signals.map((signal) => `${signal.surface} ${signal.summary}`).join(' ').toLowerCase();
  const scored: Array<[CompanionId, RegExp]> = [
    ['kairo', /calendar|schedule|time|event/],
    ['haven', /creator|youtube|video|content/],
    ['quill', /arc|archive|dossier|canon|story/],
    ['saffron', /kitchen|recipe|meal|cook/],
    ['rook', /training|workout|gym|body/],
    ['cassian', /treasury|budget|money|ledger/],
    ['selah', /sanctuary|scripture|faith/],
  ];
  const specialists = scored.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
  const rotation: CompanionId[] = [
    'rook', 'selah', 'haven', 'ember', 'mira', 'amara', 'cassian', 'saffron', 'quill', 'kairo',
  ];
  const start = Number(date.slice(-2)) % rotation.length;
  const rotatingSeats = [rotation[start], rotation[(start + 3) % rotation.length]];
  return ['snow', 'cipher', ...specialists, ...rotatingSeats].filter(
    (id, index, all): id is CompanionId => all.indexOf(id) === index,
  ).slice(0, 5);
}

export function buildLocalSystemDebrief(input: {
  date: LocalDateKey;
  records: DailyMissionRecord[];
  missions: MissionDefinition[];
  signals: SystemExperienceSignal[];
}) {
  const now = new Date().toISOString();
  const missionMap = new Map(input.missions.map((mission) => [mission.id, mission]));
  const completed = input.records.filter((record) => record.status === 'completed');
  const pending = input.records.filter((record) => record.status === 'pending');
  const issues: SystemDebriefIssue[] = input.signals.slice(0, 8).map((signal) => ({
    id: signal.id,
    title:
      signal.kind === 'interface-error'
        ? `Interface fault in ${signal.surface}`
        : signal.kind === 'invalid-response'
          ? `Intelligence response issue in ${signal.surface}`
          : `Signal from ${signal.surface}`,
    severity: signal.kind === 'interface-error' ? 'important' : 'watch',
    evidence: signal.summary,
    recommendation: 'Reproduce once, isolate the responsible surface, and protect it with a regression test.',
  }));
  if (!issues.length) {
    issues.push({
      id: `observation-${input.date}`,
      title: 'No captured technical faults tonight',
      severity: 'watch',
      evidence: 'The private error ledger contains no recent sanitized failures.',
      recommendation: 'Keep observing real use; absence of a captured fault is not proof that every flow is flawless.',
    });
  }
  const pendingNames = pending
    .map((record) => missionMap.get(record.missionId)?.name)
    .filter((name): name is string => Boolean(name));
  const participants = chooseDebriefParticipants(input.signals, input.date);
  const report: SystemDebriefReport = {
    id: `${REPORT_PREFIX}${input.date}`,
    date: input.date,
    status: 'local-scan',
    title: `System Debrief · ${input.date}`,
    summary: `${completed.length} directives cleared, ${pending.length} still open, and ${input.signals.length} recent experience signal${input.signals.length === 1 ? '' : 's'} available for council review.`,
    participants,
    wins: [
      completed.length
        ? `${completed.length} daily directive${completed.length === 1 ? '' : 's'} reached a confirmed completion state.`
        : 'The System preserved an honest record instead of manufacturing completion.',
      'The complete campaign remains local and exportable through Archive Shield.',
      'Tonight’s scan excluded photos, voice recordings, API secrets, and private document contents.',
    ],
    issues,
    councilReplies: [],
    companionWishes: [
      'Snow wants fewer moments where the Hunter has to know the exact command wording.',
      'Cipher wants every recurring fault tied to a reproducible case and a regression test.',
      'The specialists want clearer handoffs that preserve context without pretending a change was already applied.',
    ],
    snowPriority: pendingNames.length
      ? `Preserve tomorrow’s clarity without hiding today’s unfinished work: ${pendingNames.slice(0, 3).join(', ')}.`
      : 'Protect the clean foundation; improve only where real use produces evidence.',
    codexBrief: `Review The System for ${input.date}. Prioritize the captured issues, preserve all local data and confirmation boundaries, reproduce each fault before changing behavior, and add regression coverage. Do not alter progression from this report alone.`,
    createdAt: now,
    updatedAt: now,
  };
  return report;
}

export function mergeCouncilIntoDebrief(
  report: SystemDebriefReport,
  reply: AiHeadquartersReply,
): SystemDebriefReport {
  const councilReplies = reply.replies.map((item) => ({
    companionId: item.companionId,
    message: item.message.slice(0, 4_000),
  }));
  const snow = councilReplies.find((item) => item.companionId === 'snow');
  const wishes = councilReplies.map((item) => `${item.companionId}: ${item.message}`);
  return {
    ...report,
    status: 'council-complete',
    title: reply.title || report.title,
    summary: councilReplies[0]?.message.slice(0, 700) || report.summary,
    councilReplies,
    companionWishes: wishes,
    snowPriority: snow?.message.slice(0, 900) || report.snowPriority,
    codexBrief: [
      report.codexBrief,
      '',
      'Council testimony:',
      ...councilReplies.map((item) => `- ${item.companionId}: ${item.message}`),
    ].join('\n'),
    model: reply.model,
    updatedAt: new Date().toISOString(),
  };
}

export function systemDebriefToMarkdown(report: SystemDebriefReport) {
  const lines = [
    `# ${report.title}`,
    '',
    report.summary,
    '',
    `Status: ${report.status}`,
    `Council: ${report.participants.join(', ')}`,
    '',
    '## What worked',
    ...report.wins.map((item) => `- ${item}`),
    '',
    '## Friction and cracks',
    ...report.issues.flatMap((issue) => [
      `### ${issue.title} · ${issue.severity}`,
      issue.evidence,
      '',
      `Recommended: ${issue.recommendation}`,
      '',
    ]),
    '## Companion council',
    ...(report.councilReplies.length
      ? report.councilReplies.map((item) => `- **${item.companionId}:** ${item.message}`)
      : ['- Online council has not been convened yet.']),
    '',
    '## Things the family wishes it could do better',
    ...report.companionWishes.map((item) => `- ${item}`),
    '',
    '## Snow’s priority',
    report.snowPriority,
    '',
    '## Codex development brief',
    report.codexBrief,
  ];
  return lines.join('\n');
}
