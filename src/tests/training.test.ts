import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { BALANCE } from '@/config/balance';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  activateBossExtension,
  abandonTrainingSession,
  assignGymWorkout,
  assignHomeTraining,
  awardDoubleDeploymentReward,
  awardMultiPathRewards,
  completeGymTraining,
  completeHomeTraining,
  completeLoggedTraining,
  getRemainingTrainingSeconds,
  getTrainingDebriefMessage,
  markTrainingTimerComplete,
  pauseTrainingTimer,
  resetGymWorkoutSelection,
  selectTrainingLocation,
  startTrainingTimer,
} from '@/game/training';
import type { LocalDateKey } from '@/types/game';

const DATE = '2026-08-03' as LocalDateKey;

describe('Training Hall', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Training Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('locks one home assignment across refreshes and permits exactly one true reassignment', async () => {
    const first = await selectTrainingLocation(DATE, 'home');
    const reopened = await assignHomeTraining(DATE);

    expect(reopened).toEqual(first);
    expect(await db.trainingSessions.count()).toBe(1);

    const reassigned = await assignHomeTraining(DATE, true);
    expect(reassigned.circuitId).not.toBe(first.circuitId);
    expect(reassigned.durationMinutes).not.toBe(first.durationMinutes);
    expect(reassigned.rerollUsed).toBe(true);
    await expect(assignHomeTraining(DATE, true)).rejects.toThrow(/already been used/i);
  });

  it('persists timer state, Boss overtime, performance, and all-party debrief text', async () => {
    await assignHomeTraining(DATE);
    const started = await startTrainingTimer(DATE);
    expect(started.status).toBe('active');
    expect(getRemainingTrainingSeconds(started)).toBeGreaterThan(0);

    const paused = await pauseTrainingTimer(DATE);
    expect(paused?.status).toBe('paused');
    expect(paused?.remainingSeconds).toBeGreaterThan(0);

    await db.trainingSessions.update(DATE, {
      status: 'active',
      timerEndsAt: new Date(Date.now() - 1000).toISOString(),
      remainingSeconds: 1,
    });
    const clockCleared = await markTrainingTimerComplete(DATE);
    expect(clockCleared?.remainingSeconds).toBe(0);

    const overtime = await activateBossExtension(DATE);
    expect(overtime.bossExtensionUsed).toBe(true);
    expect(overtime.remainingSeconds).toBe(300);

    await db.trainingSessions.update(DATE, {
      timerEndsAt: new Date(Date.now() - 1000).toISOString(),
    });
    await markTrainingTimerComplete(DATE);
    const completed = await completeHomeTraining({
      date: DATE,
      roundsCompleted: 5,
      partialReps: 7,
      difficulty: 4,
      exerciseLoads: { 'double-db-front-squat': 25 },
      note: 'Strong controlled work.',
    });

    expect(completed.status).toBe('completed');
    expect(completed.roundsCompleted).toBe(5);
    expect(completed.bossExtensionUsed).toBe(true);
    expect(getTrainingDebriefMessage(completed, 'cassian')).not.toMatch(/\{\w+\}/);
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
  });

  it('requires a complete structured Gym Deployment and bounds its recorded facts', async () => {
    const opened = await selectTrainingLocation(DATE, 'gym');
    const assigned = await assignGymWorkout(opened.id, 'vanguard-frame-gym');
    const logs = Object.fromEntries(
      Object.entries(assigned.gymExerciseLogs ?? {}).map(([exerciseId, sets]) => [
        exerciseId,
        sets.map((set) => ({ ...set, weight: 25, reps: 10, completed: true })),
      ]),
    );
    const gym = await completeGymTraining({
      sessionId: assigned.id,
      duration: 2000,
      difficulty: 7,
      logs,
      choices: assigned.gymExerciseChoices ?? {},
      finisherCompleted: true,
      note: 'Full session.',
    });

    expect(gym.location).toBe('gym');
    expect(gym.gymWorkoutId).toBe('vanguard-frame-gym');
    expect(gym.loggedDurationMinutes).toBe(360);
    expect(gym.difficulty).toBe(5);
    expect(gym.gymPersonalRecords).toEqual(['First structured baseline secured']);
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
  });

  it('lets an unfinished Gym Deployment change workouts or leave without a failure or reward', async () => {
    const opened = await selectTrainingLocation(DATE, 'gym');
    const first = await assignGymWorkout(opened.id, 'vanguard-frame-gym');
    const firstExercise = Object.keys(first.gymExerciseLogs ?? {})[0];

    await db.trainingSessions.update(first.id, {
      gymExerciseLogs: {
        ...first.gymExerciseLogs,
        [firstExercise]: (first.gymExerciseLogs?.[firstExercise] ?? []).map((set, index) =>
          index === 0 ? { ...set, weight: 25, reps: 8, completed: true } : set,
        ),
      },
    });

    const reset = await resetGymWorkoutSelection(first.id);
    expect(reset.status).toBe('assigned');
    expect(reset.gymWorkoutId).toBeUndefined();
    expect(reset.gymExerciseLogs).toBeUndefined();

    const changed = await assignGymWorkout(reset.id, 'iron-citadel-gym');
    expect(changed.gymWorkoutId).toBe('iron-citadel-gym');

    const left = await abandonTrainingSession(changed.id);
    expect(left?.status).toBe('abandoned');
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);

    const home = await selectTrainingLocation(DATE, 'home');
    expect(home.location).toBe('home');
    expect(home.status).toBe('assigned');
  });

  it('awards the Home + Gym Double Deployment surge exactly once', async () => {
    const home = await assignHomeTraining(DATE);
    await db.trainingSessions.update(home.id, { status: 'paused', remainingSeconds: 0 });
    await completeHomeTraining({
      sessionId: home.id,
      date: DATE,
      roundsCompleted: 4,
      partialReps: 0,
      difficulty: 4,
      exerciseLoads: {},
    });

    const opened = await selectTrainingLocation(DATE, 'gym');
    const assigned = await assignGymWorkout(opened.id, 'iron-citadel-gym');
    const logs = Object.fromEntries(
      Object.entries(assigned.gymExerciseLogs ?? {}).map(([exerciseId, sets]) => [
        exerciseId,
        sets.map((set) => ({ ...set, weight: 30, reps: 12, completed: true })),
      ]),
    );
    await completeGymTraining({
      sessionId: assigned.id,
      duration: 70,
      difficulty: 4,
      logs,
      choices: assigned.gymExerciseChoices ?? {},
      finisherCompleted: false,
    });

    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.training.multiPathTiers[2].accountXp,
    );
    expect(await db.trainingSessions.where('date').equals(DATE).toArray()).toHaveLength(2);
    expect((await awardDoubleDeploymentReward(DATE)).alreadyAwarded).toBe(true);
    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.training.multiPathTiers[2].accountXp,
    );

    const recovery = await selectTrainingLocation(DATE, 'recovery');
    await completeLoggedTraining({
      sessionId: recovery.id,
      date: DATE,
      location: 'recovery',
      duration: recovery.mobilityEstimatedMinutes ?? 14,
      difficulty: 2,
      mobilityCompletedMovementIds: recovery.mobilityMovements?.map((movement) => movement.id),
    });
    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.training.multiPathTiers[2].accountXp + BALANCE.training.multiPathTiers[3].accountXp,
    );
    const ladder = await awardMultiPathRewards(DATE);
    expect(ladder.earnedTiers).toEqual([2, 3]);
    expect(ladder.newlyAwardedTiers).toEqual([]);
    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.training.multiPathTiers[2].accountXp + BALANCE.training.multiPathTiers[3].accountXp,
    );

    const conditioning = await selectTrainingLocation(DATE, 'conditioning');
    await completeLoggedTraining({
      sessionId: conditioning.id,
      date: DATE,
      location: 'conditioning',
      duration: 30,
      difficulty: 3,
      conditioningType: 'walk-run',
    });
    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.training.multiPathTiers[2].accountXp +
        BALANCE.training.multiPathTiers[3].accountXp +
        BALANCE.training.multiPathTiers[4].accountXp,
    );
    expect((await awardMultiPathRewards(DATE)).earnedTiers).toEqual([2, 3, 4]);
  });

  it('keeps conditioning and recovery as bounded non-gym paths', async () => {
    await selectTrainingLocation(DATE, 'conditioning');
    const conditioning = await completeLoggedTraining({
      date: DATE,
      location: 'conditioning',
      duration: 2000,
      difficulty: 7,
      conditioningType: 'walk-run',
    });
    expect(conditioning.loggedDurationMinutes).toBe(1440);
    expect(conditioning.difficulty).toBe(5);

    const recoveryDate = '2026-08-04' as LocalDateKey;
    const assignedRecovery = await selectTrainingLocation(recoveryDate, 'recovery');
    expect(assignedRecovery.mobilityMovements).toHaveLength(
      assignedRecovery.mobilityMovements?.length ?? 0,
    );
    expect(assignedRecovery.mobilityMovements?.length).toBeGreaterThanOrEqual(6);
    expect(assignedRecovery.mobilityMovements?.length).toBeLessThanOrEqual(8);
    expect(assignedRecovery.mobilityMovements?.some((movement) => movement.kind === 'core')).toBe(
      true,
    );
    expect(assignedRecovery.mobilityMovements?.some((movement) => movement.kind === 'breath')).toBe(
      true,
    );
    expect(
      assignedRecovery.mobilityMovements?.every(
        (movement) => movement.instructions.length > 0 && movement.breathingCue.length > 0,
      ),
    ).toBe(true);
    const recovery = await completeLoggedTraining({
      sessionId: assignedRecovery.id,
      date: recoveryDate,
      location: 'recovery',
      duration: 20,
      difficulty: 2,
      recoveryProtocol: 'PT planks and mobility',
      mobilityCompletedMovementIds: assignedRecovery.mobilityMovements?.map(
        (movement) => movement.id,
      ),
    });
    expect(recovery.recoveryProtocol).toBe('PT planks and mobility');
  });
});
