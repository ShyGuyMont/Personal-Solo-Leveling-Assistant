import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { createDefaultProgression, createDefaultSettings } from '@/db/seed';
import { buildAiProgressContext } from '@/game/aiContext';
import { saveCreatorProject } from '@/game/creatorForge';
import { ALL_STATS, createInitialStat } from '@/game/stats';
import { COMPANIONS } from '@/config/companions';

describe('Awakened Intelligence progress context', () => {
  beforeEach(async () => {
    await Promise.all([
      db.dailyReviews.clear(),
      db.dailyMissions.clear(),
      db.xpTransactions.clear(),
      db.trainingSessions.clear(),
      db.kitchenSessions.clear(),
      db.sanctuarySessions.clear(),
      db.aiMemories.clear(),
      db.campaignArcs.clear(),
      db.arcMilestones.clear(),
      db.treasuryTransactions.clear(),
      db.treasuryWeeks.clear(),
      db.treasuryBills.clear(),
      db.treasuryDebts.clear(),
      db.treasurySavingsGoals.clear(),
      db.creatorSettings.clear(),
      db.creatorSnapshots.clear(),
      db.creatorProjects.clear(),
      db.creatorVideoInsights.clear(),
    ]);
  });

  it('supplies Class gates, a World Class forecast, and only relevant Director Notes', async () => {
    const settings = createDefaultSettings();
    settings.aiSoulprintNotes = {
      snow: {
        humor: 'Use dry sisterly teasing.',
        challenge: '',
        care: 'Stay close without babying me.',
        casual: '',
        conflict: '',
        bonds: '',
        never: 'Never sound corporate.',
      },
      saffron: {
        humor: 'Big expressive reactions.',
        challenge: '',
        care: '',
        casual: '',
        conflict: '',
        bonds: '',
        never: '',
      },
    };

    const context = await buildAiProgressContext({
      audience: 'snow',
      profile: {
        id: 'primary',
        displayName: 'Jordan Hunter',
        systemTitle: 'The Awakened',
        startingFocus: 'balanced',
        createdAt: '2026-08-01T00:00:00.000Z',
        equippedTitleId: 'newly-awakened',
        cosmeticFrame: 'focus-balanced',
        backgroundSigil: 'origin',
      },
      settings,
      progression: createDefaultProgression(),
      missions: [],
      todayRecords: [],
      stats: ALL_STATS.map(createInitialStat),
      challenges: [],
      systemDate: '2026-08-11',
      enabledCompanionIds: settings.enabledCompanionIds,
    });

    expect(context.hunter.firstName).toBe('Jordan');
    expect(context.classification.nextClass).toBe('E');
    expect(context.classification.roadmap.at(-1)?.class).toBe('WORLD CLASS');
    expect(context.classification.worldClass.remainingMissionCompletions).toBe(2_850);
    expect(context.classification.worldClass.lowerBoundCompletedDaysAtRecentPace).toBe(480);
    expect(context.classification.worldClass.designedTheoreticalFastestDays).toBe(570);
    expect(context.classification.worldClass.designedSustainableRangeDays).toEqual({
      minimum: 620,
      maximum: 725,
    });
    expect(context.classification.worldClass.recentPaceSampleDays).toBe(0);
    expect(context.classification.worldClass.recentPaceConfidence).toBe('early');
    expect(context.party.directorNotes).toEqual([
      expect.objectContaining({
        companionId: 'snow',
        humor: 'Use dry sisterly teasing.',
        never: 'Never sound corporate.',
      }),
    ]);
  });

  it('delivers all twelve saved Director Notes to a full-party room without cross-room leakage', async () => {
    const settings = createDefaultSettings();
    settings.aiSoulprintNotes = Object.fromEntries(
      COMPANIONS.map((companion) => [
        companion.id,
        {
          humor: `${companion.name} humor direction`,
          challenge: `${companion.name} challenge direction`,
          care: `${companion.name} care direction`,
          casual: `${companion.name} casual direction`,
          conflict: `${companion.name} conflict direction`,
          bonds: `${companion.name} bond direction`,
          never: `${companion.name} boundary direction`,
        },
      ]),
    );
    const base = {
      profile: {
        id: 'primary' as const,
        displayName: 'Jordan Hunter',
        systemTitle: 'The Awakened',
        startingFocus: 'balanced' as const,
        createdAt: '2026-08-01T00:00:00.000Z',
        equippedTitleId: 'newly-awakened',
        cosmeticFrame: 'focus-balanced',
        backgroundSigil: 'origin',
      },
      settings,
      progression: createDefaultProgression(),
      missions: [],
      todayRecords: [],
      stats: ALL_STATS.map(createInitialStat),
      challenges: [],
      systemDate: '2026-08-14' as const,
      enabledCompanionIds: settings.enabledCompanionIds,
    };

    const party = await buildAiProgressContext({
      ...base,
      audience: 'party',
      participantIds: settings.enabledCompanionIds,
    });
    expect(party.party.directorNotes).toHaveLength(12);
    expect(party.party.directorNotes.map((note) => note.companionId)).toEqual(
      settings.enabledCompanionIds,
    );

    const commons = await buildAiProgressContext({
      ...base,
      audience: 'party',
      participantIds: ['cassian', 'kairo', 'snow'],
    });
    expect(commons.party.directorNotes.map((note) => note.companionId).sort()).toEqual([
      'cassian',
      'kairo',
      'snow',
    ]);
  });

  it('gives specialists useful compact context while protecting private writing and ledger detail', async () => {
    const now = '2026-08-12T12:00:00.000Z';
    await Promise.all([
      db.sanctuarySessions.put({
        id: 'sanctuary:1',
        date: '2026-08-12',
        mode: 'stronghold',
        status: 'active',
        primaryConcern: 'stress',
        passageIds: ['philippians-4-6-7'],
        companionIds: ['selah'],
        createdAt: now,
        updatedAt: now,
        reflection: 'This stays completely local.',
        prayer: 'This also stays completely local.',
        bibleMissionCredited: false,
      }),
      db.campaignArcs.put({
        id: 'arc:1',
        name: 'Mobility Arc',
        purpose: 'Move without stiffness.',
        category: 'physical',
        companionId: 'mira',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }),
      db.arcMilestones.put({
        id: 'milestone:1',
        arcId: 'arc:1',
        title: 'Complete three recovery protocols',
        description: 'Build the base.',
        order: 1,
        status: 'pending',
        createdAt: now,
        note: 'Private milestone note.',
      }),
      db.treasuryTransactions.bulkPut([
        {
          id: 'income:1',
          date: '2026-08-12',
          kind: 'income',
          amountCents: 100_000,
          label: 'Secret employer name',
          note: 'Private transaction note',
          createdAt: now,
        },
        {
          id: 'expense:1',
          date: '2026-08-12',
          kind: 'expense',
          amountCents: 15_000,
          label: 'Secret restaurant name',
          category: 'dining',
          createdAt: now,
        },
      ]),
      db.treasuryWeeks.put({
        id: '2026-08-10',
        weekStart: '2026-08-10',
        weekEnd: '2026-08-16',
        status: 'planned',
        spendingLimitCents: 40_000,
        diningLimitCents: 10_000,
        savingsTargetCents: 20_000,
        debtTargetCents: 5_000,
        intention: 'Private intention',
        reflection: 'Private reflection',
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    const settings = createDefaultSettings();
    settings.aiTreasurySharingEnabled = true;
    const context = await buildAiProgressContext({
      audience: 'cassian',
      profile: {
        id: 'primary',
        displayName: 'Jordan Hunter',
        systemTitle: 'The Awakened',
        startingFocus: 'balanced',
        createdAt: now,
        equippedTitleId: 'newly-awakened',
        cosmeticFrame: 'focus-balanced',
        backgroundSigil: 'origin',
      },
      settings,
      progression: createDefaultProgression(),
      missions: [],
      todayRecords: [],
      stats: ALL_STATS.map(createInitialStat),
      challenges: [],
      systemDate: '2026-08-12',
      enabledCompanionIds: settings.enabledCompanionIds,
    });

    expect(context.specialists.sanctuary.recentSessions[0]).toMatchObject({
      concerns: ['stress'],
      passageIds: ['philippians-4-6-7'],
    });
    expect(context.specialists.campaigns.activeArcs[0].incompleteMilestones).toEqual([
      'Complete three recovery protocols',
    ]);
    expect(context.specialists.treasury.recentThirtyDays).toMatchObject({
      incomeCents: 100_000,
      expenseCents: 15_000,
      diningCents: 15_000,
    });
    const serialized = JSON.stringify(context);
    expect(serialized).not.toContain('This stays completely local');
    expect(serialized).not.toContain('Secret employer name');
    expect(serialized).not.toContain('Secret restaurant name');
    expect(serialized).not.toContain('Private transaction note');
    expect(serialized).not.toContain('Private milestone note');
  });

  it('keeps a creator workroom grounded through short follow-ups without leaking it elsewhere', async () => {
    await saveCreatorProject({
      title: 'Marvel Tokon Reawakening',
      platform: 'youtube',
      contentType: 'long-form',
      status: 'record',
      pillar: 'Honest beginner progress',
      hook: 'A real first week in a new fighting game.',
      audiencePromise: 'Specific improvement without fake expertise.',
      nextAction: 'Film session one.',
      notes: 'Private board note.',
    });
    const settings = createDefaultSettings();
    const shared = {
      audience: 'snow' as const,
      profile: {
        id: 'primary' as const,
        displayName: 'Jordan Hunter',
        systemTitle: 'The Awakened',
        startingFocus: 'balanced' as const,
        createdAt: '2026-08-12T12:00:00.000Z',
        equippedTitleId: 'newly-awakened',
        cosmeticFrame: 'focus-balanced',
        backgroundSigil: 'origin',
      },
      settings,
      progression: createDefaultProgression(),
      missions: [],
      todayRecords: [],
      stats: ALL_STATS.map(createInitialStat),
      challenges: [],
      systemDate: '2026-08-12' as const,
      enabledCompanionIds: settings.enabledCompanionIds,
    };
    const followUp = await buildAiProgressContext({
      ...shared,
      query: 'What should I do next?',
      history: [
        {
          id: 'creator-turn',
          role: 'hunter',
          message: 'Help me plan the next YouTube video.',
          createdAt: '2026-08-12T12:00:00.000Z',
        },
      ],
    });
    expect(followUp.specialists.creator.activeProjects[0]).toMatchObject({
      title: 'Marvel Tokon Reawakening',
      nextAction: 'Film session one.',
    });

    const unrelated = await buildAiProgressContext({
      ...shared,
      query: 'How is everyone doing today?',
      history: [],
    });
    expect(unrelated.specialists.creator.activeProjects).toEqual([]);
    expect(JSON.stringify(unrelated)).not.toContain('Private board note');
  });
});
