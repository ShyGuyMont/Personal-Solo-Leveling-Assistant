import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  cancelStagedCompanionOperation,
  getDailyOperations,
  prepareCompanionOperation,
  stageCompanionOperation,
} from '@/game/dailyOperations';
import { getKitchenData } from '@/game/kitchen';
import { getSanctuaryData } from '@/game/sanctuary';
import { getTrainingHallData } from '@/game/training';
import type { CompanionOperationRequest, LocalDateKey } from '@/types/game';

const DATE = '2026-08-12' as LocalDateKey;

function assembly(overrides: Partial<CompanionOperationRequest> = {}): CompanionOperationRequest {
  return {
    kind: 'assemble-day',
    companionId: 'snow',
    includeTraining: true,
    trainingLocation: 'home',
    includeKitchen: true,
    foodConstraints: 'No chicken today',
    includeSanctuary: true,
    sanctuaryMode: 'study',
    primaryConcern: 'focus',
    summary: 'Wake the party and prepare the three core realms.',
    confirmation: 'Should I wake everyone and prepare these assignments?',
    ...overrides,
  };
}

describe('Party Operations', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Operations Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('stages permission without changing a realm and cancels cleanly', async () => {
    await stageCompanionOperation(DATE, assembly(), 'conversation-1');
    expect(await getDailyOperations(DATE)).toMatchObject({
      status: 'awaiting-confirmation',
      conversationId: 'conversation-1',
    });
    expect(await db.trainingSessions.count()).toBe(0);
    expect(await db.kitchenSessions.count()).toBe(0);
    expect(await db.sanctuarySessions.count()).toBe(0);

    await cancelStagedCompanionOperation(DATE);
    expect(await getDailyOperations(DATE)).toBeUndefined();
  });

  it('preloads the existing Training, Kitchen, and Sanctuary experiences without completing them', async () => {
    const prepared = await prepareCompanionOperation(DATE, assembly(), 'conversation-2');
    expect(prepared).toMatchObject({
      status: 'ready',
      conversationId: 'conversation-2',
      training: { location: 'home' },
      kitchen: { constraints: 'No chicken today' },
      sanctuary: { mode: 'study' },
    });

    const [training, kitchen, sanctuary] = await Promise.all([
      getTrainingHallData(DATE),
      getKitchenData(DATE),
      getSanctuaryData(DATE),
    ]);
    expect(training.today).toMatchObject({ status: 'assigned', location: 'home' });
    expect(kitchen.today).toMatchObject({ status: 'assigned', rewardApplied: false });
    expect(sanctuary.active).toMatchObject({ status: 'active', primaryConcern: 'focus' });
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
  });

  it('lets Snow assemble selected realms while leaving Training untouched', async () => {
    const prepared = await prepareCompanionOperation(
      DATE,
      assembly({
        includeTraining: false,
        trainingLocation: undefined,
        includeKitchen: true,
        includeSanctuary: false,
        sanctuaryMode: undefined,
        primaryConcern: undefined,
      }),
    );

    expect(prepared).toMatchObject({ status: 'ready', kitchen: { state: 'ready' } });
    expect(prepared.training).toBeUndefined();
    expect(prepared.sanctuary).toBeUndefined();
    expect(await db.trainingSessions.count()).toBe(0);
  });

  it('reconciles the operations board with real completion and mission counts', async () => {
    await prepareCompanionOperation(
      DATE,
      assembly({ includeKitchen: false, includeSanctuary: false }),
    );
    const now = new Date().toISOString();
    await db.trainingSessions.update(DATE, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    });
    await db.dailyMissions.bulkPut([
      {
        id: `${DATE}:workout`,
        date: DATE,
        missionId: 'workout',
        status: 'completed',
        details: {},
        completedAt: now,
        updatedAt: now,
        protectedException: false,
      },
      {
        id: `${DATE}:prayer`,
        date: DATE,
        missionId: 'prayer',
        status: 'pending',
        details: {},
        updatedAt: now,
        protectedException: false,
      },
    ]);

    expect(await getDailyOperations(DATE)).toMatchObject({
      training: { state: 'completed' },
      completedMissionCount: 1,
      pendingMissionCount: 1,
    });
  });

  it('recovers a preparation interrupted before its final save', async () => {
    const old = new Date(Date.now() - 60_000).toISOString();
    await db.dailyOperations.put({
      id: DATE,
      date: DATE,
      status: 'preparing',
      sourceCompanionId: 'snow',
      pendingProposal: assembly(),
      pendingMissionCount: 0,
      completedMissionCount: 0,
      preparationNotes: [],
      createdAt: old,
      updatedAt: old,
    });

    const recovered = await getDailyOperations(DATE);
    expect(recovered?.status).toBe('partial');
    expect(recovered?.pendingProposal).toBeUndefined();
    expect(recovered?.preparationNotes.join(' ')).toMatch(/interrupted/i);
  });

  it('repairs a staged Version 7.7 proposal already stored on this device', async () => {
    const now = new Date().toISOString();
    const legacyProposal = { ...assembly() } as Partial<CompanionOperationRequest>;
    delete legacyProposal.includeTraining;
    await db.dailyOperations.put({
      id: DATE,
      date: DATE,
      status: 'awaiting-confirmation',
      sourceCompanionId: 'snow',
      pendingProposal: legacyProposal as CompanionOperationRequest,
      pendingMissionCount: 0,
      completedMissionCount: 0,
      preparationNotes: [],
      createdAt: now,
      updatedAt: now,
    });

    expect((await getDailyOperations(DATE))?.pendingProposal?.includeTraining).toBe(true);
  });

  it('preserves an incompatible active Sanctuary instead of silently replacing it', async () => {
    await prepareCompanionOperation(
      DATE,
      assembly({
        includeTraining: false,
        trainingLocation: undefined,
        includeKitchen: false,
        sanctuaryMode: 'study',
        primaryConcern: 'stress',
      }),
    );
    const second = await prepareCompanionOperation(
      DATE,
      assembly({
        includeTraining: false,
        trainingLocation: undefined,
        includeKitchen: false,
        sanctuaryMode: 'stronghold',
        primaryConcern: 'anger',
      }),
    );

    expect(second.status).toBe('partial');
    expect(second.preparationNotes.join(' ')).toMatch(
      /different Sanctuary session is already active/i,
    );
    expect((await getSanctuaryData(DATE)).active).toMatchObject({
      mode: 'study',
      primaryConcern: 'stress',
    });
  });
});
