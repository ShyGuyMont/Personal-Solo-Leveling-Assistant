import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { createDefaultProgression, createDefaultSettings } from '@/db/seed';
import { buildAiProgressContext } from '@/game/aiContext';
import { ALL_STATS, createInitialStat } from '@/game/stats';

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
    expect(context.party.directorNotes).toEqual([
      expect.objectContaining({
        companionId: 'snow',
        humor: 'Use dry sisterly teasing.',
        never: 'Never sound corporate.',
      }),
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
});
