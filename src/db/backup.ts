import { db, TABLE_NAMES } from '@/db/database';
import type { BackupSnapshot, Profile, SaveFile, Settings, AccountProgression } from '@/types/game';

export const SAVE_VERSION = 9;
export const MAX_IMPORT_BYTES = 32 * 1024 * 1024;
const MAX_SNAPSHOTS = 5;
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export interface SavePreview {
  displayName: string;
  level: number;
  rank: string;
  exportedAt: string;
  version: number;
  byteSize: number;
}

export interface PreparedImport {
  save: SaveFile;
  preview: SavePreview;
}

async function checksum(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function safeParse(text: string): unknown {
  return JSON.parse(text, (key, value: unknown) => {
    if (FORBIDDEN_KEYS.has(key)) throw new Error('The save contains an unsafe property name.');
    return value;
  });
}

async function readFileText(file: File) {
  if (typeof file.text === 'function') return file.text();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () =>
      reject(new Error('The selected file could not be read.')),
    );
    reader.readAsText(file);
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requiredSingleton<T>(data: Record<string, unknown[]>, table: string, id = 'primary') {
  const row = data[table]?.find((candidate) => isObject(candidate) && candidate.id === id);
  if (!row) throw new Error(`The save is missing required ${table} data.`);
  return row as T;
}

function migrateData(
  version: number,
  source: Record<string, unknown[]>,
): Record<string, unknown[]> {
  const data = Object.fromEntries(
    TABLE_NAMES.map((table) => [table, Array.isArray(source[table]) ? source[table] : []]),
  );
  if (version <= 2) {
    data.cosmetics ??= [];
    data.cosmeticUnlocks ??= [];
    data.auditEntries ??= [];
    data.reports ??= [];
    data.progressionEvents ??= [];
  }
  if (version <= 3) {
    data.dailyEvents ??= [];
    data.inventory ??= [];
    data.companionReactions ??= [];
  }
  if (version <= 4) {
    data.partyCheckIns ??= [];
  }
  if (version <= 5) {
    data.supportConversations ??= [];
    data.favoriteMessages ??= [];
    data.partyBanters ??= [];
  }
  if (version <= 6) {
    data.campfireRecaps ??= [];
  }
  if (version <= 7) {
    data.dailyBriefings ??= [];
    data.campaignArcs ??= [];
    data.arcMilestones ??= [];
    data.companionQuestProgress ??= [];
    data.monthlyCouncils ??= [];
  }
  if (version <= 8) {
    data.treasurySettings ??= [];
    data.treasuryTransactions ??= [];
    data.treasuryBills ??= [];
    data.treasuryDebts ??= [];
    data.treasurySavingsGoals ??= [];
    data.treasuryWeeks ??= [];
    data.treasuryChallenges ??= [];
  }
  const migrationTime = new Date().toISOString();
  if (!data.treasurySettings.some((row) => isObject(row) && row.id === 'primary')) {
    data.treasurySettings.push({
      id: 'primary',
      currency: 'USD',
      weeklyReviewDay: 0,
      challengeEnabled: true,
      challengeChance: 0.75,
      challengeRewardXp: 60,
      createdAt: migrationTime,
      updatedAt: migrationTime,
    });
  }
  if (!data.stats.some((row) => isObject(row) && row.id === 'stewardship')) {
    data.stats.push({
      id: 'stewardship',
      name: 'stewardship',
      level: 1,
      totalXp: 0,
      currentLevelXp: 0,
      xpToNextLevel: 223,
      lifetimeXpGained: 0,
      momentum: 50,
      trend: 'stable',
      neglectedDays: 0,
      protectedFloorXp: 0,
    });
  }
  data.settings = data.settings.map((row) => {
    if (isObject(row)) {
      const companionIds = Array.isArray(row.enabledCompanionIds)
        ? row.enabledCompanionIds.filter((id): id is string => typeof id === 'string')
        : ['rook', 'selah', 'cipher', 'haven'];
      const withEmber =
        version <= 6 && !companionIds.includes('ember') ? [...companionIds, 'ember'] : companionIds;
      const migratedCompanionIds =
        version <= 7 && !withEmber.includes('amara') ? [...withEmber, 'amara'] : withEmber;
      const withCassian =
        version <= 8 && !migratedCompanionIds.includes('cassian')
          ? [...migratedCompanionIds, 'cassian']
          : migratedCompanionIds;
      return {
        privacyScreenEnabled: false,
        sensitiveMissionAlias: 'Integrity Protocol',
        firstDayGuideCompleted: false,
        soundVolume: 0.55,
        interfaceStyle: 'system',
        colorTheme: 'abyss',
        dailyEventsEnabled: true,
        companionMode: 'balanced',
        dailyBriefingEnabled: true,
        ...row,
        enabledCompanionIds: ['snow', ...withCassian.filter((id) => id !== 'snow')],
      };
    }
    return row;
  });
  data.missions = data.missions.map((row) =>
    isObject(row) ? { optional: false, archived: false, ...row } : row,
  );
  return data;
}

function validateData(data: Record<string, unknown[]>) {
  for (const table of TABLE_NAMES) {
    if (!Array.isArray(data[table])) throw new Error(`The ${table} table is not valid.`);
    const ids = new Set<string>();
    for (const row of data[table]) {
      if (!isObject(row) || typeof row.id !== 'string' || !row.id.trim()) {
        throw new Error(`The ${table} table contains a malformed record.`);
      }
      if (ids.has(row.id)) throw new Error(`The ${table} table contains a duplicate ID.`);
      ids.add(row.id);
    }
  }

  const profile = requiredSingleton<Profile>(data, 'profiles');
  const settings = requiredSingleton<Settings>(data, 'settings');
  const progression = requiredSingleton<AccountProgression>(data, 'progression');
  if (typeof profile.displayName !== 'string' || profile.displayName.length > 100) {
    throw new Error('The profile name is not valid.');
  }
  if (
    typeof settings.resetTime !== 'string' ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings.resetTime)
  ) {
    throw new Error('The daily reset time is not valid.');
  }
  for (const key of [
    'level',
    'totalXp',
    'lifetimeMissionCompletions',
    'completedDays',
    'perfectDays',
  ] as const) {
    const value = progression[key];
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Progression contains an impossible ${key} value.`);
    }
  }
  for (const row of data.stats) {
    if (!isObject(row) || Number(row.level) < 1 || Number(row.totalXp) < 0) {
      throw new Error('A stat contains an impossible value.');
    }
  }

  const treasurySettings = requiredSingleton<Record<string, unknown>>(data, 'treasurySettings');
  if (
    treasurySettings.currency !== 'USD' ||
    typeof treasurySettings.challengeEnabled !== 'boolean' ||
    !Number.isFinite(treasurySettings.challengeChance) ||
    Number(treasurySettings.challengeChance) < 0 ||
    Number(treasurySettings.challengeChance) > 1
  ) {
    throw new Error('Treasury challenge settings are not valid.');
  }
  const validDate = (value: unknown) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const validCents = (value: unknown, allowZero = false) =>
    Number.isInteger(value) &&
    Number(value) >= (allowZero ? 0 : 1) &&
    Number(value) <= 1_000_000_000;
  const transactionKinds = new Set([
    'income',
    'expense',
    'bill-payment',
    'debt-payment',
    'savings',
    'adjustment',
  ]);
  for (const row of data.treasuryTransactions) {
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      !transactionKinds.has(String(row.kind)) ||
      !validCents(row.amountCents) ||
      typeof row.label !== 'string' ||
      !row.label.trim()
    ) {
      throw new Error('A Treasury ledger entry contains an impossible value.');
    }
  }
  for (const row of data.treasuryBills) {
    if (
      !isObject(row) ||
      !validCents(row.amountCents) ||
      !Number.isInteger(row.dueDay) ||
      Number(row.dueDay) < 1 ||
      Number(row.dueDay) > 31
    ) {
      throw new Error('A Treasury bill contains an impossible value.');
    }
  }
  for (const row of data.treasuryDebts) {
    if (
      !isObject(row) ||
      !validCents(row.balanceCents, true) ||
      (row.aprBasisPoints !== undefined &&
        (!validCents(row.aprBasisPoints, true) || Number(row.aprBasisPoints) > 10000))
    ) {
      throw new Error('A Treasury debt account contains an impossible value.');
    }
  }
  for (const row of data.treasurySavingsGoals) {
    if (!isObject(row) || !validCents(row.targetCents) || !validCents(row.currentCents, true)) {
      throw new Error('A Treasury savings goal contains an impossible value.');
    }
  }
  for (const row of data.treasuryWeeks) {
    if (
      !isObject(row) ||
      !validDate(row.weekStart) ||
      !validDate(row.weekEnd) ||
      !['planned', 'reviewed'].includes(String(row.status)) ||
      !['spendingLimitCents', 'diningLimitCents', 'savingsTargetCents', 'debtTargetCents'].every(
        (key) => validCents(row[key], true),
      )
    ) {
      throw new Error('A Treasury weekly plan contains an impossible value.');
    }
  }
  for (const row of data.treasuryChallenges) {
    if (
      !isObject(row) ||
      !validDate(row.date) ||
      !['active', 'passed', 'failed', 'declined', 'expired'].includes(String(row.status)) ||
      !Number.isFinite(row.roll) ||
      Number(row.roll) < 0 ||
      Number(row.roll) > 1 ||
      !validCents(row.rewardXp, true) ||
      !validCents(row.stabilityPenalty, true)
    ) {
      throw new Error('A Treasury challenge contains an impossible value.');
    }
  }
}

async function readCurrentData() {
  const data: Record<string, unknown[]> = {};
  await db.transaction(
    'r',
    TABLE_NAMES.map((name) => db.table(name)),
    async () => {
      for (const name of TABLE_NAMES) data[name] = await db.table(name).toArray();
    },
  );
  return data;
}

export async function createSaveFile(): Promise<SaveFile> {
  const data = await readCurrentData();
  const payload = JSON.stringify(data);
  return {
    format: 'the-system-save',
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    checksum: await checksum(payload),
    data,
  };
}

export async function createLocalSnapshot(reason: BackupSnapshot['reason']) {
  const data = await readCurrentData();
  const now = new Date().toISOString();
  const snapshot: BackupSnapshot = {
    id: `${now}:${crypto.randomUUID()}`,
    createdAt: now,
    reason,
    byteSize: new Blob([JSON.stringify(data)]).size,
    data,
  };
  await db.transaction('rw', db.backupSnapshots, async () => {
    await db.backupSnapshots.put(snapshot);
    const snapshots = await db.backupSnapshots.orderBy('createdAt').reverse().toArray();
    if (snapshots.length > MAX_SNAPSHOTS) {
      await db.backupSnapshots.bulkDelete(snapshots.slice(MAX_SNAPSHOTS).map((item) => item.id));
    }
  });
  return snapshot;
}

export async function listLocalSnapshots() {
  return db.backupSnapshots.orderBy('createdAt').reverse().toArray();
}

async function replaceCurrentData(data: Record<string, unknown[]>) {
  await db.transaction(
    'rw',
    TABLE_NAMES.map((name) => db.table(name)),
    async () => {
      for (const name of TABLE_NAMES) {
        const table = db.table(name);
        await table.clear();
        const rows = data[name] ?? [];
        if (rows.length) await table.bulkAdd(rows);
      }
    },
  );
}

export async function restoreLocalSnapshot(snapshotId: string) {
  const snapshot = await db.backupSnapshots.get(snapshotId);
  if (!snapshot) throw new Error('That recovery snapshot is no longer available.');
  validateData(snapshot.data);
  await createLocalSnapshot('before-import');
  await replaceCurrentData(snapshot.data);
}

export async function downloadSave() {
  const save = await createSaveFile();
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `the-system-save-${save.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  const exportTime = new Date().toISOString();
  await db.appMetadata.put({ id: 'last-manual-export', value: exportTime, updatedAt: exportTime });
  const achievement = await db.achievements.get('first-backup');
  if (achievement && !achievement.unlockedAt) {
    const now = new Date().toISOString();
    await db.transaction('rw', db.achievements, db.progressionEvents, db.auditEntries, async () => {
      await db.achievements.put({ ...achievement, unlockedAt: now });
      await db.progressionEvents.put({
        id: 'progression-event:achievement:first-backup',
        kind: 'achievement',
        createdAt: now,
        headline: achievement.name,
        detail: achievement.description,
        acknowledged: false,
      });
      await db.auditEntries.put({
        id: 'audit:achievement:first-backup',
        timestamp: now,
        action: 'achievement-unlocked',
        targetId: 'first-backup',
        note: 'A manual save was exported.',
      });
    });
  }
}

export async function prepareSaveImport(file: File): Promise<PreparedImport> {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error('That file is too large. The import limit is 32 MB.');
  }
  const text = await readFileText(file);
  const parsed = safeParse(text);
  if (!isObject(parsed) || parsed.format !== 'the-system-save' || !isObject(parsed.data)) {
    throw new Error('This is not a valid The System save file.');
  }
  const version = Number(parsed.version);
  if (!Number.isInteger(version) || version < 1 || version > SAVE_VERSION) {
    throw new Error('This save version is not supported by this app.');
  }
  const rawData = parsed.data as Record<string, unknown[]>;
  const actualChecksum = await checksum(JSON.stringify(rawData));
  if (actualChecksum !== parsed.checksum) {
    throw new Error('The save file failed its integrity check.');
  }
  const data = migrateData(version, rawData);
  validateData(data);
  const save: SaveFile = {
    format: 'the-system-save',
    version: SAVE_VERSION,
    exportedAt: String(parsed.exportedAt),
    checksum: await checksum(JSON.stringify(data)),
    data,
  };
  const profile = requiredSingleton<Profile>(data, 'profiles');
  const progression = requiredSingleton<AccountProgression>(data, 'progression');
  return {
    save,
    preview: {
      displayName: profile.displayName,
      level: progression.level,
      rank: progression.rank,
      exportedAt: save.exportedAt,
      version,
      byteSize: file.size,
    },
  };
}

export async function commitPreparedImport(prepared: PreparedImport) {
  validateData(prepared.save.data);
  await createLocalSnapshot('before-import');
  await replaceCurrentData(prepared.save.data);
}

export async function resetAllData() {
  await createLocalSnapshot('before-reset');
  await db.transaction(
    'rw',
    TABLE_NAMES.map((name) => db.table(name)),
    async () => {
      for (const name of TABLE_NAMES) await db.table(name).clear();
    },
  );
}

export async function getStorageSummary() {
  const [data, snapshots, estimate] = await Promise.all([
    readCurrentData(),
    db.backupSnapshots.toArray(),
    navigator.storage?.estimate?.(),
  ]);
  const saveBytes = new Blob([JSON.stringify(data)]).size;
  const backupBytes = snapshots.reduce((sum, item) => sum + item.byteSize, 0);
  return {
    saveBytes,
    backupBytes,
    browserUsageBytes: estimate?.usage,
    browserQuotaBytes: estimate?.quota,
  };
}
