import { db } from '@/db/database';
import { createDefaultCreatorSettings } from '@/db/seed';
import type {
  CreatorChannelSnapshot,
  CreatorProject,
  CreatorSettings,
  CreatorSnapshotSource,
  CreatorVideoInsight,
} from '@/types/game';

export interface CreatorReawakeningBriefing {
  state: 'unmapped' | 'dormant' | 'returning' | 'active';
  headline: string;
  diagnosis: string;
  focus: string;
  nextAction: string;
  proof: string[];
}
import { createId } from '@/utils/id';

export interface CreatorForgeSummary {
  settings: CreatorSettings;
  latestSnapshot?: CreatorChannelSnapshot;
  previousSnapshot?: CreatorChannelSnapshot;
  snapshotsByPeriod: Partial<Record<28 | 90 | 365, CreatorChannelSnapshot>>;
  videoInsights: CreatorVideoInsight[];
  reawakening: CreatorReawakeningBriefing;
  projects: CreatorProject[];
  activeProjects: CreatorProject[];
  publishedLastSevenDays: number;
  daysSinceLastCreatorAction?: number;
  momentum: 'unclaimed' | 'live' | 'cooling' | 'stalled';
  vesperCallout: string;
  cipherReadout: string;
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function cleanOptionalNumber(value: unknown, max = Number.MAX_SAFE_INTEGER) {
  if (value === '' || value === undefined || value === null) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return undefined;
  return Math.min(max, number);
}

function daysBetween(left: string, right: string) {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return 0;
  return Math.max(0, Math.floor((rightTime - leftTime) / 86_400_000));
}

export async function getCreatorSettings() {
  const settings = await db.creatorSettings.get('primary');
  if (settings) return settings;
  const created = createDefaultCreatorSettings();
  await db.creatorSettings.put(created);
  return created;
}

export async function saveCreatorSettings(
  input: Pick<
    CreatorSettings,
    | 'channelName'
    | 'channelHandle'
    | 'channelUrl'
    | 'weeklyUploadTarget'
    | 'currentArcFocus'
    | 'accountabilityMode'
  >,
) {
  const current = await getCreatorSettings();
  const updated: CreatorSettings = {
    ...current,
    channelName: cleanText(input.channelName, 160),
    channelHandle: cleanText(input.channelHandle, 100),
    channelUrl: cleanText(input.channelUrl, 500),
    weeklyUploadTarget: Math.max(0, Math.min(21, Math.round(input.weeklyUploadTarget || 0))),
    currentArcFocus: cleanText(input.currentArcFocus, 500),
    accountabilityMode: input.accountabilityMode,
    updatedAt: new Date().toISOString(),
  };
  await db.creatorSettings.put(updated);
  window.dispatchEvent(new CustomEvent('system:creator-forge-changed'));
  return updated;
}

export async function saveCreatorSnapshot(input: {
  source?: CreatorSnapshotSource;
  periodDays?: number;
  subscribers?: number;
  views?: number;
  watchHours?: number;
  impressions?: number;
  clickThroughRate?: number;
  averageViewDurationSeconds?: number;
  uploads?: number;
  note?: string;
}) {
  const capturedAt = new Date().toISOString();
  const snapshot: CreatorChannelSnapshot = {
    id: createId('creator-snapshot'),
    capturedAt,
    source: input.source ?? 'manual',
    periodDays: Math.max(1, Math.min(3650, Math.round(input.periodDays || 28))),
    subscribers: cleanOptionalNumber(input.subscribers),
    views: cleanOptionalNumber(input.views),
    watchHours: cleanOptionalNumber(input.watchHours),
    impressions: cleanOptionalNumber(input.impressions),
    clickThroughRate: cleanOptionalNumber(input.clickThroughRate, 100),
    averageViewDurationSeconds: cleanOptionalNumber(input.averageViewDurationSeconds),
    uploads: cleanOptionalNumber(input.uploads),
    note: cleanText(input.note, 1000) || undefined,
  };
  const hasMetric = [
    snapshot.subscribers,
    snapshot.views,
    snapshot.watchHours,
    snapshot.impressions,
    snapshot.clickThroughRate,
    snapshot.averageViewDurationSeconds,
    snapshot.uploads,
  ].some((value) => value !== undefined);
  if (!hasMetric) throw new Error('Enter at least one channel metric before syncing.');
  await db.creatorSnapshots.put(snapshot);
  window.dispatchEvent(new CustomEvent('system:creator-forge-changed'));
  return snapshot;
}

type CreatorSnapshotInput = Parameters<typeof saveCreatorSnapshot>[0];

function cleanCreatorSnapshot(input: CreatorSnapshotInput, capturedAt: string) {
  const snapshot: CreatorChannelSnapshot = {
    id: createId('creator-snapshot'),
    capturedAt,
    source: input.source ?? 'manual',
    periodDays: Math.max(1, Math.min(3650, Math.round(input.periodDays || 28))),
    subscribers: cleanOptionalNumber(input.subscribers),
    views: cleanOptionalNumber(input.views),
    watchHours: cleanOptionalNumber(input.watchHours),
    impressions: cleanOptionalNumber(input.impressions),
    clickThroughRate: cleanOptionalNumber(input.clickThroughRate, 100),
    averageViewDurationSeconds: cleanOptionalNumber(input.averageViewDurationSeconds),
    uploads: cleanOptionalNumber(input.uploads),
    note: cleanText(input.note, 1000) || undefined,
  };
  return snapshot;
}

export async function saveCreatorStudioIntelligence(input: {
  snapshots: CreatorSnapshotInput[];
  topVideos: Array<Omit<CreatorVideoInsight, 'id' | 'capturedAt'>>;
}) {
  const capturedAt = new Date().toISOString();
  const snapshots = input.snapshots.slice(0, 3).map((snapshot) =>
    cleanCreatorSnapshot({ ...snapshot, source: 'youtube-api' }, capturedAt),
  );
  if (!snapshots.some((snapshot) => snapshot.periodDays === 28)) {
    throw new Error('The Studio synchronization did not include its recent channel signal.');
  }
  const topVideos: CreatorVideoInsight[] = input.topVideos
    .filter((video) => cleanText(video.videoId, 100) && cleanText(video.title, 200))
    .slice(0, 10)
    .map((video) => ({
      id: cleanText(video.videoId, 100),
      videoId: cleanText(video.videoId, 100),
      title: cleanText(video.title, 200),
      publishedAt:
        typeof video.publishedAt === 'string' && Number.isFinite(new Date(video.publishedAt).getTime())
          ? video.publishedAt
          : undefined,
      periodDays: Math.max(1, Math.min(3650, Math.round(video.periodDays || 365))),
      views: cleanOptionalNumber(video.views),
      watchHours: cleanOptionalNumber(video.watchHours),
      averageViewDurationSeconds: cleanOptionalNumber(video.averageViewDurationSeconds),
      averageViewPercentage: cleanOptionalNumber(video.averageViewPercentage, 100),
      likes: cleanOptionalNumber(video.likes),
      comments: cleanOptionalNumber(video.comments),
      capturedAt,
    }));
  await db.transaction(
    'rw',
    db.creatorSnapshots,
    db.creatorVideoInsights,
    async () => {
      await db.creatorSnapshots.bulkPut(snapshots);
      await db.creatorVideoInsights.clear();
      if (topVideos.length) await db.creatorVideoInsights.bulkPut(topVideos);
    },
  );
  window.dispatchEvent(new CustomEvent('system:creator-forge-changed'));
  return { snapshots, topVideos };
}

export async function saveCreatorProject(
  input: Omit<CreatorProject, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
    id?: string;
    createdAt?: string;
  },
) {
  const now = new Date().toISOString();
  const existing = input.id ? await db.creatorProjects.get(input.id) : undefined;
  const title = cleanText(input.title, 180);
  if (!title) throw new Error('Every content operation needs a title.');
  const project: CreatorProject = {
    id: existing?.id ?? createId('creator-project'),
    title,
    platform: input.platform,
    contentType: input.contentType,
    status: input.status,
    pillar: cleanText(input.pillar, 200),
    hook: cleanText(input.hook, 1000),
    audiencePromise: cleanText(input.audiencePromise, 1000),
    nextAction: cleanText(input.nextAction, 1000),
    notes: typeof input.notes === 'string' ? input.notes.trim().slice(0, 4000) : '',
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
    publishedAt:
      input.status === 'published' ? (existing?.publishedAt ?? now) : existing?.publishedAt,
  };
  await db.creatorProjects.put(project);
  window.dispatchEvent(new CustomEvent('system:creator-forge-changed'));
  return project;
}

export async function updateCreatorProjectStatus(id: string, status: CreatorProject['status']) {
  const project = await db.creatorProjects.get(id);
  if (!project) throw new Error('That content operation no longer exists.');
  return saveCreatorProject({ ...project, status });
}

export async function saveCreatorCampaign(
  projects: Array<
    Pick<
      CreatorProject,
      | 'title'
      | 'platform'
      | 'contentType'
      | 'pillar'
      | 'hook'
      | 'audiencePromise'
      | 'nextAction'
      | 'notes'
    >
  >,
) {
  const candidates = projects.slice(0, 8);
  if (candidates.length < 2) throw new Error('A comeback campaign needs at least two releases.');
  const existingTitles = new Set(
    (await db.creatorProjects.toArray()).map((project) => project.title.trim().toLowerCase()),
  );
  const created: CreatorProject[] = [];
  for (const candidate of candidates) {
    const normalizedTitle = candidate.title.trim().toLowerCase();
    if (!normalizedTitle || existingTitles.has(normalizedTitle)) continue;
    const project = await saveCreatorProject({ ...candidate, status: 'idea' });
    existingTitles.add(normalizedTitle);
    created.push(project);
  }
  if (!created.length) throw new Error('Every campaign release is already on the Creator Forge board.');
  return created;
}

function buildReawakeningBriefing(
  settings: CreatorSettings,
  snapshotsByPeriod: CreatorForgeSummary['snapshotsByPeriod'],
  videoInsights: CreatorVideoInsight[],
  activeProjects: CreatorProject[],
): CreatorReawakeningBriefing {
  const recent = snapshotsByPeriod[28];
  const quarter = snapshotsByPeriod[90];
  const year = snapshotsByPeriod[365];
  const strongest = videoInsights[0];
  const currentFocus = settings.currentArcFocus || strongest?.title || 'your clearest audience promise';
  if (!recent) {
    return {
      state: 'unmapped',
      headline: 'The comeback has no evidence map yet.',
      diagnosis: 'Connect Studio or enter a snapshot so Vesper can separate a quiet season from a weak idea.',
      focus: `Define the next arc around ${currentFocus}.`,
      nextAction: 'Synchronize one real channel baseline.',
      proof: [],
    };
  }
  const proof = [
    `${recent.uploads ?? 0} upload${recent.uploads === 1 ? '' : 's'} in 28 days`,
    quarter ? `${quarter.views ?? 0} views across 90 days` : '',
    year ? `${year.watchHours?.toFixed(1) ?? 0} watch hours across 365 days` : '',
    strongest ? `Strongest one-year signal: “${strongest.title}”` : '',
  ].filter(Boolean);
  const quiet28 = (recent.uploads ?? 0) === 0;
  const quiet90 = (quarter?.uploads ?? 0) === 0;
  if (quiet28 && quiet90) {
    return {
      state: 'dormant',
      headline: 'This is a reawakening, not a continuation.',
      diagnosis:
        'The recent windows are quiet, so the first win is restoring a repeatable release rhythm—not trying to manufacture a viral comeback.',
      focus: strongest
        ? `Recover the audience promise that made “${strongest.title}” move, then express it through ${currentFocus}.`
        : `Build a clean return around ${currentFocus} and give the audience a reason to come back twice.`,
      nextAction: activeProjects[0]?.nextAction || 'Choose the first return video and write its opening 30 seconds.',
      proof,
    };
  }
  if (quiet28) {
    return {
      state: 'returning',
      headline: 'The channel still has heat. It needs a deliberate return.',
      diagnosis:
        'The last month cooled, but the longer window gives Vesper enough evidence to build from proven attention instead of starting blind.',
      focus: `Turn ${currentFocus} into one anchor release and one fast follow-up.`,
      nextAction: activeProjects[0]?.nextAction || 'Lock the anchor release title and recording date.',
      proof,
    };
  }
  return {
    state: 'active',
    headline: 'The creator signal is already live. Now make it compound.',
    diagnosis:
      'Recent publishing activity exists, so the next campaign should tighten the promise and sequence rather than reset the channel identity.',
    focus: `Build the next two releases around ${currentFocus}.`,
    nextAction: activeProjects[0]?.nextAction || 'Choose the next release and define its smallest physical move.',
    proof,
  };
}

export async function getCreatorForgeSummary(): Promise<CreatorForgeSummary> {
  const [settings, snapshots, projects, videoInsights] = await Promise.all([
    getCreatorSettings(),
    db.creatorSnapshots.orderBy('capturedAt').reverse().limit(30).toArray(),
    db.creatorProjects.orderBy('updatedAt').reverse().toArray(),
    db.creatorVideoInsights.orderBy('views').reverse().limit(10).toArray(),
  ]);
  const snapshotsByPeriod: CreatorForgeSummary['snapshotsByPeriod'] = {};
  for (const periodDays of [28, 90, 365] as const) {
    snapshotsByPeriod[periodDays] = snapshots.find(
      (snapshot) => snapshot.periodDays === periodDays,
    );
  }
  const latestSnapshot = snapshotsByPeriod[28] ?? snapshots[0];
  const previousSnapshot = latestSnapshot
    ? snapshots.find(
        (snapshot) =>
          snapshot.periodDays === latestSnapshot.periodDays && snapshot.id !== latestSnapshot.id,
      )
    : undefined;
  const now = new Date().toISOString();
  const activeProjects = projects.filter(
    (project) => project.status !== 'published' && project.status !== 'paused',
  );
  const lastCreatorAction = [latestSnapshot?.capturedAt, projects[0]?.updatedAt]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  const daysSinceLastCreatorAction = lastCreatorAction
    ? daysBetween(lastCreatorAction, now)
    : undefined;
  const publishedLastSevenDays = projects.filter(
    (project) => project.publishedAt && daysBetween(project.publishedAt, now) <= 7,
  ).length;
  const momentum: CreatorForgeSummary['momentum'] =
    !projects.length && !latestSnapshot
      ? 'unclaimed'
      : (daysSinceLastCreatorAction ?? 99) >= 8
        ? 'stalled'
        : (daysSinceLastCreatorAction ?? 99) >= 4
          ? 'cooling'
          : 'live';
  const next = activeProjects.find((project) => project.nextAction) ?? activeProjects[0];
  const accountabilityLead =
    settings.accountabilityMode === 'supportive'
      ? 'No panic. We just need one honest signal.'
      : settings.accountabilityMode === 'relentless'
        ? 'Camera check: the audience cannot watch a draft hiding in your head.'
        : 'The board tells the truth, and right now it needs motion.';
  const vesperCallout =
    momentum === 'unclaimed'
      ? 'Welcome to the greenroom. Give me one idea, one audience promise, and the smallest next move that gets it out of your head.'
      : momentum === 'stalled'
        ? `${accountabilityLead} ${daysSinceLastCreatorAction} days without a creator signal. ${next ? `Open “${next.title}” and clear: ${next.nextAction || 'define the next action'}.` : 'Put one real operation on the board.'}`
        : momentum === 'cooling'
          ? `${accountabilityLead} ${next ? `“${next.title}” is closest to the spotlight. ${next.nextAction || 'Name its next action before the session ends.'}` : 'Capture the next idea before momentum cools further.'}`
          : publishedLastSevenDays > 0
            ? `${publishedLastSevenDays} release${publishedLastSevenDays === 1 ? '' : 's'} this week. Good. Now turn the response into a smarter next upload, not an excuse to disappear.`
            : next
              ? `Signal is live. “${next.title}” is up next: ${next.nextAction || 'choose the next production action'}. Let’s make the board move.`
              : 'Signal is live. Capture the next idea while the channel is warm.';
  const cipherReadout = next
    ? `Constraint isolated: ${next.nextAction || `the next action for “${next.title}” is undefined`}. Vesper handles the room; I will keep the sequence honest.`
    : 'No active operation detected. Vesper can find the spark; I require a deliverable before I can optimize it.';

  return {
    settings,
    latestSnapshot,
    previousSnapshot,
    snapshotsByPeriod,
    videoInsights,
    reawakening: buildReawakeningBriefing(
      settings,
      snapshotsByPeriod,
      videoInsights,
      activeProjects,
    ),
    projects,
    activeProjects,
    publishedLastSevenDays,
    daysSinceLastCreatorAction,
    momentum,
    vesperCallout,
    cipherReadout,
  };
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseMetric(value: string | undefined) {
  if (!value) return undefined;
  const numeric = Number(value.replace(/[,%$\s]/g, ''));
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : undefined;
}

export function parseYouTubeStudioCsv(text: string) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error('That CSV does not contain a readable Studio table.');
  const headers = rows[0].map(normalizeHeader);
  const findColumn = (...aliases: string[]) =>
    headers.findIndex((header) =>
      aliases.some((alias) => header === alias || header.includes(alias)),
    );
  const indexes = {
    subscribers: findColumn('subscribers'),
    views: findColumn('views'),
    watchHours: findColumn('watch time hours', 'watch time'),
    impressions: findColumn('impressions'),
    clickThroughRate: findColumn('impressions click through rate', 'click through rate', 'ctr'),
    averageViewDurationSeconds: findColumn('average view duration'),
  };
  const dataRows = rows.slice(1);
  const totalRow = dataRows.find((row) => row.some((cell) => normalizeHeader(cell) === 'total'));
  const calculationRows = totalRow ? [totalRow] : dataRows;
  const sumColumn = (index: number) =>
    index < 0
      ? undefined
      : calculationRows.reduce((total, row) => total + (parseMetric(row[index]) ?? 0), 0);
  const durationValues =
    indexes.averageViewDurationSeconds < 0
      ? []
      : calculationRows
          .map((row) => row[indexes.averageViewDurationSeconds])
          .filter(Boolean)
          .map((value) => {
            if (!value.includes(':')) return parseMetric(value) ?? 0;
            const parts = value.split(':').map(Number);
            return parts.reduce(
              (total, part) => total * 60 + (Number.isFinite(part) ? part : 0),
              0,
            );
          });
  const impressions = sumColumn(indexes.impressions);
  const weightedCtrNumerator =
    indexes.impressions >= 0 && indexes.clickThroughRate >= 0
      ? calculationRows.reduce((total, row) => {
          const rowImpressions = parseMetric(row[indexes.impressions]) ?? 0;
          const rowCtr = parseMetric(row[indexes.clickThroughRate]) ?? 0;
          return total + rowImpressions * rowCtr;
        }, 0)
      : 0;
  const snapshot = {
    source: 'studio-csv' as const,
    periodDays: 28,
    subscribers: sumColumn(indexes.subscribers),
    views: sumColumn(indexes.views),
    watchHours: sumColumn(indexes.watchHours),
    impressions,
    clickThroughRate:
      impressions && weightedCtrNumerator ? weightedCtrNumerator / impressions : undefined,
    averageViewDurationSeconds: durationValues.length
      ? durationValues.reduce((total, value) => total + value, 0) / durationValues.length
      : undefined,
    note: 'Imported from YouTube Studio CSV.',
  };
  if (
    [
      snapshot.subscribers,
      snapshot.views,
      snapshot.watchHours,
      snapshot.impressions,
      snapshot.clickThroughRate,
      snapshot.averageViewDurationSeconds,
    ].every((value) => value === undefined)
  ) {
    throw new Error('No supported Studio metrics were found in that CSV.');
  }
  return snapshot;
}
