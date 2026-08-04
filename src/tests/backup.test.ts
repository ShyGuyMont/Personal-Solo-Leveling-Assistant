import { beforeEach, describe, expect, it } from 'vitest';
import {
  commitPreparedImport,
  createLocalSnapshot,
  createSaveFile,
  listLocalSnapshots,
  prepareSaveImport,
} from '@/db/backup';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import type { SaveFile } from '@/types/game';

async function digest(data: Record<string, unknown[]>) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function asFile(save: SaveFile) {
  return new File([JSON.stringify(save)], 'save.json', { type: 'application/json' });
}

describe('save validation and recovery', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Backup Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('previews a valid save and atomically restores it after preserving current data', async () => {
    const save = await createSaveFile();
    const prepared = await prepareSaveImport(asFile(save));
    expect(prepared.preview.displayName).toBe('Backup Candidate');
    await db.progression.update('primary', { totalXp: 999 });
    await commitPreparedImport(prepared);
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
    expect(await db.backupSnapshots.count()).toBe(1);
  });

  it('rejects impossible negative progression values even with a matching checksum', async () => {
    const save = await createSaveFile();
    const progression = save.data.progression[0] as Record<string, unknown>;
    progression.totalXp = -50;
    save.checksum = await digest(save.data);
    await expect(prepareSaveImport(asFile(save))).rejects.toThrow(/impossible totalXp/);
  });

  it('retains only the five newest automatic snapshots', async () => {
    for (let index = 0; index < 7; index += 1) {
      await createLocalSnapshot('manual');
    }
    expect(await listLocalSnapshots()).toHaveLength(5);
  });

  it('round-trips every Version 4.0 campaign, Treasury, Training, and Sanctuary record through Archive Shield', async () => {
    const now = new Date().toISOString();
    await db.dailyBriefings.put({
      id: '2026-08-01',
      date: '2026-08-01',
      capacity: 'steady',
      status: 'planned',
      mainMissionId: 'prayer',
      supportMissionId: 'movement',
      rulesVersion: 1,
      scheduledMissionIds: ['prayer', 'movement'],
      targetCompletionRate: 0.65,
      targetMissionCount: 2,
      standardMultiplier: 1.5,
      fullClearMultiplier: 1.75,
      outcome: 'pending',
      snowMessage: 'Protected briefing record.',
      createdAt: now,
      updatedAt: now,
    });
    await db.campaignArcs.put({
      id: 'arc:backup',
      name: 'Protected Campaign',
      purpose: 'Verify complete portability.',
      category: 'balanced',
      companionId: 'snow',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
    await db.arcMilestones.put({
      id: 'arc-mark:backup',
      arcId: 'arc:backup',
      title: 'First protected marker',
      description: 'Archive Shield test.',
      order: 0,
      status: 'completed',
      createdAt: now,
      completedAt: now,
    });
    await db.companionQuestProgress.put({
      id: 'amara-courage-to-connect',
      questlineId: 'amara-courage-to-connect',
      companionId: 'amara',
      status: 'active',
      currentChapterIndex: 1,
      startedAt: now,
      chapterStartedAt: now,
      objectiveRecords: [
        { objectiveId: 'amara-1-map', completedAt: now, note: 'Safe connection.' },
      ],
      completedChapterIds: ['amara-1-heart-map'],
    });
    await db.monthlyCouncils.put({
      id: 'monthly-council:2026-07-01',
      monthStart: '2026-07-01',
      monthEnd: '2026-07-31',
      createdAt: now,
      acknowledged: true,
      intention: 'Protect connection and consistency.',
      metrics: {
        recordedDays: 4,
        completedMissions: 12,
        availableMissions: 18,
        completionRate: 2 / 3,
        perfectDays: 1,
        categoryCompleted: { character: 3 },
        strongestCategory: 'character',
        focusCategory: 'physical',
        relationshipActions: 3,
        arcMilestones: 1,
        questChapters: 1,
        levelsGained: 2,
        rankChanges: 0,
        titlesGained: 1,
        treasuryReviews: 0,
        noEatingOutWins: 0,
        savingsContributedCents: 0,
        debtPaidCents: 0,
      },
      messages: [
        {
          id: 'council-message:amara',
          messageId: 'council-message:amara',
          companionId: 'amara',
          role: 'response',
          message: 'Connection is part of the permanent record.',
          order: 0,
        },
      ],
    });
    await db.treasuryTransactions.put({
      id: 'treasury:backup',
      date: '2026-08-01',
      kind: 'expense',
      amountCents: 2450,
      label: 'Protected groceries',
      category: 'groceries',
      createdAt: now,
    });
    await db.trainingSessions.put({
      id: '2026-08-01',
      date: '2026-08-01',
      location: 'home',
      status: 'completed',
      circuitId: 'iron-foundation',
      durationMinutes: 20,
      briefingVariant: 1,
      debriefVariant: 3,
      rerollUsed: false,
      bossExtensionUsed: false,
      assignedAt: now,
      completedAt: now,
      remainingSeconds: 0,
      roundsCompleted: 5,
      partialReps: 4,
      difficulty: 4,
      exerciseLoads: { 'double-db-front-squat': 25 },
      updatedAt: now,
    });
    await db.sanctuarySessions.put({
      id: 'sanctuary:backup',
      date: '2026-08-01',
      mode: 'study',
      status: 'completed',
      primaryConcern: 'loneliness',
      secondaryConcern: 'sexual-integrity',
      passageIds: ['lonely-1', 'lonely-2', 'integrity-1'],
      companionIds: ['snow', 'selah', 'amara'],
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      reflection: 'The urge was connected to isolation.',
      prayer: 'Help me move toward honest connection.',
      nextAction: 'Text a trusted friend.',
      outcome: 'connected',
      bibleMissionCredited: true,
    });

    const save = await createSaveFile();
    expect(save.version).toBe(11);
    for (const table of [
      'dailyBriefings',
      'campaignArcs',
      'arcMilestones',
      'companionQuestProgress',
      'monthlyCouncils',
      'treasuryTransactions',
      'trainingSessions',
      'sanctuarySessions',
    ]) {
      expect(save.data[table]).toHaveLength(1);
    }

    const prepared = await prepareSaveImport(asFile(save));
    await db.transaction(
      'rw',
      [
        db.dailyBriefings,
        db.campaignArcs,
        db.arcMilestones,
        db.companionQuestProgress,
        db.monthlyCouncils,
        db.treasuryTransactions,
        db.trainingSessions,
        db.sanctuarySessions,
      ],
      async () => {
        await db.dailyBriefings.clear();
        await db.campaignArcs.clear();
        await db.arcMilestones.clear();
        await db.companionQuestProgress.clear();
        await db.monthlyCouncils.clear();
        await db.treasuryTransactions.clear();
        await db.trainingSessions.clear();
        await db.sanctuarySessions.clear();
      },
    );
    await commitPreparedImport(prepared);
    expect((await db.dailyBriefings.get('2026-08-01'))?.mainMissionId).toBe('prayer');
    expect((await db.dailyBriefings.get('2026-08-01'))?.scheduledMissionIds).toEqual([
      'prayer',
      'movement',
    ]);
    expect((await db.campaignArcs.get('arc:backup'))?.purpose).toBe('Verify complete portability.');
    expect((await db.arcMilestones.get('arc-mark:backup'))?.status).toBe('completed');
    expect(
      (await db.companionQuestProgress.get('amara-courage-to-connect'))?.objectiveRecords[0].note,
    ).toBe('Safe connection.');
    expect((await db.monthlyCouncils.get('monthly-council:2026-07-01'))?.intention).toBe(
      'Protect connection and consistency.',
    );
    expect((await db.treasuryTransactions.get('treasury:backup'))?.amountCents).toBe(2450);
    expect((await db.trainingSessions.get('2026-08-01'))?.roundsCompleted).toBe(5);
    expect((await db.sanctuarySessions.get('sanctuary:backup'))?.prayer).toBe(
      'Help me move toward honest connection.',
    );
  });

  it('migrates a Version 2.1 save to Version 4.0 without losing the existing party', async () => {
    const save = await createSaveFile();
    save.version = 7;
    for (const table of [
      'dailyBriefings',
      'campaignArcs',
      'arcMilestones',
      'companionQuestProgress',
      'monthlyCouncils',
    ])
      delete save.data[table];
    const settings = save.data.settings[0] as Record<string, unknown>;
    settings.enabledCompanionIds = (settings.enabledCompanionIds as string[]).filter(
      (id) => id !== 'amara',
    );
    delete settings.dailyBriefingEnabled;
    save.checksum = await digest(save.data);

    const prepared = await prepareSaveImport(asFile(save));
    expect(prepared.save.version).toBe(11);
    expect(prepared.save.data.dailyBriefings).toEqual([]);
    const migrated = prepared.save.data.settings[0] as Record<string, unknown>;
    expect(migrated.enabledCompanionIds).toContain('amara');
    expect(migrated.enabledCompanionIds).toContain('cassian');
    expect(migrated.dailyBriefingEnabled).toBe(true);
    expect(prepared.save.data.treasurySettings).toHaveLength(1);
    expect(prepared.save.data.treasuryTransactions).toEqual([]);
    expect(prepared.save.data.trainingSessions).toEqual([]);
    expect(prepared.save.data.sanctuarySessions).toEqual([]);
  });

  it('rejects impossible Treasury values even when the checksum matches', async () => {
    const save = await createSaveFile();
    save.data.treasuryTransactions = [
      {
        id: 'malformed-money',
        date: '2026-08-01',
        kind: 'expense',
        amountCents: -500,
        label: 'Impossible expense',
        createdAt: new Date().toISOString(),
      },
    ];
    save.checksum = await digest(save.data);
    await expect(prepareSaveImport(asFile(save))).rejects.toThrow(/Treasury ledger entry/i);
  });

  it('rejects impossible Sanctuary credit even when the checksum matches', async () => {
    const now = new Date().toISOString();
    const save = await createSaveFile();
    save.data.sanctuarySessions = [
      {
        id: 'sanctuary:impossible',
        date: '2026-08-01',
        mode: 'stronghold',
        status: 'completed',
        primaryConcern: 'stress',
        passageIds: ['stress-1', 'stress-2'],
        companionIds: ['snow', 'selah', 'haven'],
        createdAt: now,
        updatedAt: now,
        completedAt: now,
        bibleMissionCredited: true,
      },
    ];
    save.checksum = await digest(save.data);
    await expect(prepareSaveImport(asFile(save))).rejects.toThrow(/Scripture Sanctuary/i);
  });
});
