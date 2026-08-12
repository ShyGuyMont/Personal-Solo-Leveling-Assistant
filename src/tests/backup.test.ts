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

  it('round-trips campaign, Treasury, Training, Sanctuary, Kitchen, and AI records through Archive Shield', async () => {
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
    await db.dailyOperations.put({
      id: '2026-08-01',
      date: '2026-08-01',
      status: 'ready',
      sourceCompanionId: 'snow',
      conversationId: 'ai:backup',
      training: {
        sessionId: '2026-08-01',
        location: 'home',
        label: 'Iron Foundation',
        detail: '20-minute home deployment',
        companionIds: ['rook', 'ember'],
      },
      pendingMissionCount: 5,
      completedMissionCount: 1,
      preparationNotes: [],
      createdAt: now,
      updatedAt: now,
      preparedAt: now,
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
    await db.kitchenSessions.put({
      id: '2026-08-01',
      date: '2026-08-01',
      recipeId: 'custom-recipe:backup',
      customRecipeSnapshot: {
        id: 'custom-recipe:backup',
        name: 'Archive Shield Skillet',
        codename: 'PORTABLE PROVISION',
        servings: 4,
        prepMinutes: 10,
        cookMinutes: 20,
        costTier: '$',
        equipment: 'Skillet',
        plate: 'Chicken, rice, and vegetables.',
        ingredients: ['1 lb chicken', '2 cups rice', '2 cups vegetables'],
        steps: ['Cook chicken to 165°F.', 'Cook vegetables.', 'Serve over rice.'],
        swaps: ['Use turkey.'],
        storage: 'Refrigerate promptly.',
        safety: 'Chicken must reach 165°F.',
        dailyRotationEnabled: true,
        sourceCompanionId: 'saffron',
        createdAt: now,
        updatedAt: now,
      },
      status: 'completed',
      assignmentVariant: 2,
      rerollUsed: false,
      assignedAt: now,
      completedAt: now,
      ingredientChecks: { chicken: true },
      stepChecks: { roast: true },
      servingsPrepared: 4,
      difficulty: 3,
      rating: 5,
      note: 'Archive Shield meal.',
      rewardApplied: true,
      updatedAt: now,
    });
    await db.aiConversations.put({
      id: 'ai:backup',
      title: 'A protected council',
      audience: 'party',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'ai-message:hunter',
          role: 'hunter',
          message: 'Help me plan the next honest move.',
          createdAt: now,
        },
        {
          id: 'ai-message:cipher',
          role: 'companion',
          companionId: 'cipher',
          message: 'We will reduce it to one executable step.',
          createdAt: now,
        },
      ],
    });
    await db.aiMemories.put({
      id: 'ai-memory:backup',
      fact: 'The Hunter prefers morning workouts.',
      category: 'preference',
      scope: 'rook',
      status: 'approved',
      sourceConversationId: 'ai:backup',
      createdAt: now,
      updatedAt: now,
    });
    await db.aiVoiceProfiles.put({
      id: 'snow',
      voice: 'verse',
      accent: 'irish',
      delivery: 'conversational',
      cadence: 'flowing',
      texture: 'smooth',
      register: 'low-mid',
      resonance: 'balanced',
      performanceTake: 'balanced',
      pace: 0.95,
      warmth: 5,
      energy: 2,
      expressiveness: 3,
      naturalism: 5,
      pauseDiscipline: 4,
      intonation: 4,
      articulation: 4,
      emotionalRange: 4,
      updatedAt: now,
    });
    await db.aiUsageRecords.put({
      id: 'ai-usage:backup',
      kind: 'speech',
      sessionId: 'session:backup',
      createdAt: now,
      model: 'gpt-4o-mini-tts',
      companionId: 'snow',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      characters: 120,
      audioSeconds: 8,
      estimatedCostUsd: 0.0018,
      exactUsage: false,
    });

    const save = await createSaveFile();
    expect(save.version).toBe(23);
    for (const table of [
      'dailyBriefings',
      'dailyOperations',
      'campaignArcs',
      'arcMilestones',
      'companionQuestProgress',
      'monthlyCouncils',
      'treasuryTransactions',
      'trainingSessions',
      'kitchenSessions',
      'sanctuarySessions',
      'aiConversations',
      'aiMemories',
      'aiVoiceProfiles',
      'aiUsageRecords',
    ]) {
      expect(save.data[table]).toHaveLength(1);
    }

    const prepared = await prepareSaveImport(asFile(save));
    await db.transaction(
      'rw',
      [
        db.dailyBriefings,
        db.dailyOperations,
        db.campaignArcs,
        db.arcMilestones,
        db.companionQuestProgress,
        db.monthlyCouncils,
        db.treasuryTransactions,
        db.trainingSessions,
        db.kitchenSessions,
        db.sanctuarySessions,
        db.aiConversations,
        db.aiMemories,
        db.aiVoiceProfiles,
        db.aiUsageRecords,
      ],
      async () => {
        await db.dailyBriefings.clear();
        await db.dailyOperations.clear();
        await db.campaignArcs.clear();
        await db.arcMilestones.clear();
        await db.companionQuestProgress.clear();
        await db.monthlyCouncils.clear();
        await db.treasuryTransactions.clear();
        await db.trainingSessions.clear();
        await db.kitchenSessions.clear();
        await db.sanctuarySessions.clear();
        await db.aiConversations.clear();
        await db.aiMemories.clear();
        await db.aiVoiceProfiles.clear();
        await db.aiUsageRecords.clear();
      },
    );
    await commitPreparedImport(prepared);
    expect((await db.dailyBriefings.get('2026-08-01'))?.mainMissionId).toBe('prayer');
    expect((await db.dailyBriefings.get('2026-08-01'))?.scheduledMissionIds).toEqual([
      'prayer',
      'movement',
    ]);
    expect((await db.dailyOperations.get('2026-08-01'))?.training?.label).toBe('Iron Foundation');
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
    expect((await db.kitchenSessions.get('2026-08-01'))?.servingsPrepared).toBe(4);
    expect((await db.kitchenSessions.get('2026-08-01'))?.recipeId).toBe('custom-recipe:backup');
    expect((await db.sanctuarySessions.get('sanctuary:backup'))?.prayer).toBe(
      'Help me move toward honest connection.',
    );
    expect((await db.aiConversations.get('ai:backup'))?.messages[1].companionId).toBe('cipher');
    expect((await db.aiMemories.get('ai-memory:backup'))?.status).toBe('approved');
    expect((await db.aiVoiceProfiles.get('snow'))?.accent).toBe('irish');
    expect((await db.aiUsageRecords.get('ai-usage:backup'))?.characters).toBe(120);
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
    expect(prepared.save.version).toBe(23);
    expect(prepared.save.data.dailyBriefings).toEqual([]);
    expect(prepared.save.data.dailyOperations).toEqual([]);
    const migrated = prepared.save.data.settings[0] as Record<string, unknown>;
    expect(migrated.enabledCompanionIds).toContain('amara');
    expect(migrated.enabledCompanionIds).toContain('cassian');
    expect(migrated.enabledCompanionIds).toContain('saffron');
    expect(migrated.enabledCompanionIds).toContain('mira');
    expect(migrated.dailyBriefingEnabled).toBe(true);
    expect(migrated.aiLinkMode).toBe('offline');
    expect(migrated.aiDataSharingAcknowledged).toBe(false);
    expect(migrated.aiRelationshipMemoryEnabled).toBe(false);
    expect(migrated.aiTreasurySharingEnabled).toBe(false);
    expect(migrated.aiVoiceOutputEnabled).toBe(false);
    expect(migrated.aiVoiceAutoPlay).toBe(false);
    expect(migrated.aiVoiceDisclosureAcknowledged).toBe(false);
    expect(migrated.aiUsageWarningUsd).toBe(5);
    expect(migrated.aiSoulprintNotes).toEqual({});
    expect(prepared.save.data.treasurySettings).toHaveLength(1);
    expect(prepared.save.data.treasuryTransactions).toEqual([]);
    expect(prepared.save.data.trainingSessions).toEqual([]);
    expect(prepared.save.data.sanctuarySessions).toEqual([]);
    expect(prepared.save.data.kitchenSessions).toEqual([]);
    expect(prepared.save.data.aiConversations).toEqual([]);
    expect(prepared.save.data.aiMemories).toEqual([]);
    expect(prepared.save.data.aiVoiceProfiles).toEqual([]);
    expect(prepared.save.data.aiUsageRecords).toEqual([]);
  });

  it('rejects malformed AI Headquarters messages even when the checksum matches', async () => {
    const now = new Date().toISOString();
    const save = await createSaveFile();
    save.data.aiConversations = [
      {
        id: 'ai:impossible',
        title: 'Invalid party link',
        audience: 'party',
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: 'ai-message:impossible',
            role: 'companion',
            companionId: 'unknown-companion',
            message: 'This identity does not exist.',
            createdAt: now,
          },
        ],
      },
    ];
    save.checksum = await digest(save.data);
    await expect(prepareSaveImport(asFile(save))).rejects.toThrow(/AI Headquarters message/i);
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
