import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  activateBossExtension,
  assignHomeTraining,
  completeHomeTraining,
  completeLoggedTraining,
  getRemainingTrainingSeconds,
  getTrainingDebriefMessage,
  markTrainingTimerComplete,
  pauseTrainingTimer,
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

  it('records gym, conditioning, and recovery as bounded alternate workout paths', async () => {
    await selectTrainingLocation(DATE, 'gym');
    const gym = await completeLoggedTraining({
      date: DATE,
      location: 'gym',
      duration: 2000,
      difficulty: 7,
      gymFocus: 'mixed',
      note: 'Full session.',
    });

    expect(gym.location).toBe('gym');
    expect(gym.loggedDurationMinutes).toBe(1440);
    expect(gym.difficulty).toBe(5);
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
  });
});
