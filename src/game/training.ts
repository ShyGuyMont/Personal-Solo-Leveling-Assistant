import {
  GYM_WORKOUTS,
  TRAINING_CIRCUITS,
  TRAINING_DEBRIEF_LINES,
  TRAINING_TIME_ROLLS,
  getGymWorkout,
  getTrainingCircuit,
} from '@/config/training';
import { BALANCE } from '@/config/balance';
import { db } from '@/db/database';
import { putLevelHistory } from '@/game/engine';
import { applyStatChange } from '@/game/stats';
import { applyAccountXp } from '@/game/xp';
import { stableId } from '@/utils/id';
import type {
  CompanionId,
  GymExerciseSetLog,
  GymWorkoutId,
  LocalDateKey,
  StatName,
  TrainingCircuitId,
  TrainingLocation,
  TrainingSession,
} from '@/types/game';

export interface GymWorkoutAvailability {
  id: GymWorkoutId;
  status: 'recommended' | 'ready' | 'recent';
  lastCompletedDate?: LocalDateKey;
  reason: string;
}

export interface DoubleDeploymentReward {
  earned: boolean;
  accountXp: number;
  alreadyAwarded: boolean;
}

function randomUnit() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] / 0x1_0000_0000;
  }
  return Math.random();
}

function randomIndex(length: number) {
  return Math.min(length - 1, Math.floor(randomUnit() * Math.max(length, 1)));
}

function weightedPick<T extends { weight: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = randomUnit() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor < 0) return item;
  }
  return items.at(-1)!;
}

async function sessionsOn(date: LocalDateKey) {
  return db.trainingSessions.where('date').equals(date).toArray();
}

function nextSessionId(date: LocalDateKey, location: TrainingLocation, rows: TrainingSession[]) {
  if (!rows.length) return date;
  const base = `${date}:${location}`;
  if (!rows.some((row) => row.id === base)) return base;
  let suffix = 2;
  while (rows.some((row) => row.id === `${base}:${suffix}`)) suffix += 1;
  return `${base}:${suffix}`;
}

async function recentHomeSessions(date: LocalDateKey) {
  return db.trainingSessions
    .where('date')
    .below(date)
    .reverse()
    .filter((session) => session.status === 'completed' && session.location === 'home')
    .limit(8)
    .toArray();
}

function buildAssignedSession(input: {
  id: string;
  date: LocalDateKey;
  circuitId: TrainingCircuitId;
  durationMinutes: 15 | 20 | 25 | 30;
  rerollUsed: boolean;
  assignedAt?: string;
}): TrainingSession {
  const now = new Date().toISOString();
  return {
    id: input.id,
    date: input.date,
    location: 'home',
    status: 'assigned',
    circuitId: input.circuitId,
    durationMinutes: input.durationMinutes,
    briefingVariant: randomIndex(4),
    debriefVariant: randomIndex(8),
    rerollUsed: input.rerollUsed,
    bossExtensionUsed: false,
    assignedAt: input.assignedAt ?? now,
    remainingSeconds: input.durationMinutes * 60,
    roundsCompleted: 0,
    partialReps: 0,
    exerciseLoads: {},
    difficulty: 3,
    updatedAt: now,
  };
}

async function drawHomeAssignment(
  id: string,
  date: LocalDateKey,
  previous?: TrainingSession,
): Promise<TrainingSession> {
  const recent = await recentHomeSessions(date);
  const lastCircuit = recent[0]?.circuitId;
  const blocked = new Set<TrainingCircuitId>();
  if (lastCircuit) blocked.add(lastCircuit);
  if (previous?.circuitId) blocked.add(previous.circuitId);
  const eligible = TRAINING_CIRCUITS.filter((circuit) => !blocked.has(circuit.id));
  const circuit = weightedPick(
    (eligible.length ? eligible : TRAINING_CIRCUITS).map((entry) => ({
      ...entry,
      weight: entry.drawWeight,
    })),
  );
  const availableTimes = TRAINING_TIME_ROLLS.filter(
    (roll) => !previous?.durationMinutes || roll.minutes !== previous.durationMinutes,
  );
  const time = weightedPick(availableTimes.length ? availableTimes : TRAINING_TIME_ROLLS);
  return buildAssignedSession({
    id,
    date,
    circuitId: circuit.id,
    durationMinutes: time.minutes,
    rerollUsed: Boolean(previous),
    assignedAt: previous?.assignedAt,
  });
}

function dateDistance(later: LocalDateKey, earlier?: LocalDateKey) {
  if (!earlier) return Number.POSITIVE_INFINITY;
  const laterMs = Date.parse(`${later}T00:00:00Z`);
  const earlierMs = Date.parse(`${earlier}T00:00:00Z`);
  return Math.max(0, Math.round((laterMs - earlierMs) / 86_400_000));
}

export async function getGymWorkoutAvailability(
  date: LocalDateKey,
): Promise<GymWorkoutAvailability[]> {
  const history = await db.trainingSessions
    .where('date')
    .below(date)
    .reverse()
    .filter(
      (session) =>
        session.status === 'completed' &&
        session.location === 'gym' &&
        Boolean(session.gymWorkoutId),
    )
    .limit(80)
    .toArray();
  const lastByWorkout = new Map<GymWorkoutId, LocalDateKey>();
  for (const session of history) {
    if (session.gymWorkoutId && !lastByWorkout.has(session.gymWorkoutId)) {
      lastByWorkout.set(session.gymWorkoutId, session.date);
    }
  }
  const core = GYM_WORKOUTS.filter((workout) => workout.core);
  const overdueCore = core.filter(
    (workout) => dateDistance(date, lastByWorkout.get(workout.id)) >= 7,
  );
  const recommended = overdueCore.length
    ? overdueCore.sort(
        (left, right) =>
          dateDistance(date, lastByWorkout.get(right.id)) -
          dateDistance(date, lastByWorkout.get(left.id)),
      )[0]
    : (GYM_WORKOUTS.find(
        (workout) => !workout.core && dateDistance(date, lastByWorkout.get(workout.id)) >= 7,
      ) ??
      core.sort(
        (left, right) =>
          dateDistance(date, lastByWorkout.get(right.id)) -
          dateDistance(date, lastByWorkout.get(left.id)),
      )[0]);

  return GYM_WORKOUTS.map((workout) => {
    const lastCompletedDate = lastByWorkout.get(workout.id);
    const daysSince = dateDistance(date, lastCompletedDate);
    const status =
      workout.id === recommended.id ? 'recommended' : daysSince <= 2 ? 'recent' : 'ready';
    const reason =
      status === 'recommended'
        ? workout.core
          ? `${workout.name} has the oldest foundational signal in your ledger.`
          : 'All three foundational sessions are represented; specialization is authorized.'
        : status === 'recent'
          ? `Completed ${daysSince || 'less than one'} day${daysSince === 1 ? '' : 's'} ago; recovery may still be active.`
          : lastCompletedDate
            ? `Last cleared ${daysSince} days ago and available when needed.`
            : 'No completed record yet; this deployment is ready.';
    return { id: workout.id, status, lastCompletedDate, reason };
  });
}

export async function getTrainingHallData(date: LocalDateKey) {
  const todaySessions = (await sessionsOn(date)).sort((left, right) =>
    left.assignedAt.localeCompare(right.assignedAt),
  );
  const open = todaySessions.find((session) =>
    ['assigned', 'active', 'paused'].includes(session.status),
  );
  const completed = todaySessions.filter((session) => session.status === 'completed');
  const today = open ?? completed.at(-1) ?? todaySessions.at(-1);
  const [recent, gymAvailability, doubleTransaction] = await Promise.all([
    db.trainingSessions
      .orderBy('date')
      .reverse()
      .filter((session) => session.status === 'completed')
      .limit(20)
      .toArray(),
    getGymWorkoutAvailability(date),
    db.xpTransactions.get(stableId('training', date, 'double-deployment')),
  ]);
  return {
    today,
    todaySessions,
    recent: recent.sort((left, right) =>
      (right.completedAt ?? right.updatedAt).localeCompare(left.completedAt ?? left.updatedAt),
    ),
    gymAvailability,
    doubleDeploymentRewarded: Boolean(doubleTransaction),
  };
}

export async function assignHomeTraining(
  date: LocalDateKey,
  reroll = false,
  requestedSessionId?: string,
) {
  const rows = await sessionsOn(date);
  const existing = requestedSessionId
    ? await db.trainingSessions.get(requestedSessionId)
    : (rows.find(
        (session) =>
          session.location === 'home' && !['completed', 'abandoned'].includes(session.status),
      ) ?? rows.find((session) => session.location === 'home' && session.status === 'completed'));
  if (existing?.status === 'completed') return existing;
  if (!reroll && existing?.location === 'home' && existing.status !== 'abandoned') return existing;
  if (reroll) {
    if (!existing || existing.location !== 'home') {
      throw new Error('Open a home assignment before requesting a reassignment.');
    }
    if (existing.rerollUsed) throw new Error('Today’s reassignment has already been used.');
    if (existing.status === 'active' || existing.status === 'paused') {
      throw new Error('An active trial cannot be reassigned.');
    }
  }
  if (!existing) {
    const completed = rows.filter((session) => session.status === 'completed');
    const openOther = rows.find(
      (session) =>
        session.location !== 'home' && ['assigned', 'active', 'paused'].includes(session.status),
    );
    if (openOther) {
      throw new Error('End the active deployment before opening a Home Circuit.');
    }
    if (completed.length && !(completed.length === 1 && completed[0].location === 'gym')) {
      throw new Error(
        'Today’s recorded deployment is complete. Only a Home + Gym Double Deployment can be added.',
      );
    }
  }
  const id = existing?.id ?? nextSessionId(date, 'home', rows);
  const next = await drawHomeAssignment(id, date, reroll ? existing : undefined);
  await db.trainingSessions.put(next);
  return next;
}

export async function selectTrainingLocation(date: LocalDateKey, location: TrainingLocation) {
  if (location === 'home') return assignHomeTraining(date);
  const rows = await sessionsOn(date);
  const completedSamePath = rows.find(
    (session) => session.location === location && session.status === 'completed',
  );
  if (completedSamePath) return completedSamePath;
  const open = rows.find((session) => ['assigned', 'active', 'paused'].includes(session.status));
  if (open && open.location === location) return open;
  if (open && ['active', 'paused'].includes(open.status)) {
    throw new Error('End the active timer before switching training paths.');
  }
  const completed = rows.filter((session) => session.status === 'completed');
  if (completed.length) {
    const pairAllowed =
      completed.length === 1 && completed[0].location === 'home' && location === 'gym';
    if (!pairAllowed) {
      throw new Error(
        'Today’s recorded deployment is complete. Only a Home + Gym Double Deployment can be added.',
      );
    }
  }
  const now = new Date().toISOString();
  const reusable =
    open ?? rows.find((session) => session.status === 'abandoned' && !completed.length);
  const next: TrainingSession = {
    id: reusable?.id ?? nextSessionId(date, location, rows),
    date,
    location,
    status: 'assigned',
    briefingVariant: reusable?.briefingVariant ?? randomIndex(4),
    debriefVariant: reusable?.debriefVariant ?? randomIndex(8),
    rerollUsed: reusable?.rerollUsed ?? false,
    bossExtensionUsed: false,
    assignedAt: reusable?.assignedAt ?? now,
    updatedAt: now,
  };
  await db.trainingSessions.put(next);
  return next;
}

function finisherFor(workoutId: GymWorkoutId) {
  const workout = getGymWorkout(workoutId);
  const option = workout.finisherOptions[randomIndex(workout.finisherOptions.length)];
  const minutes = ([5, 8, 10] as const)[randomIndex(3)];
  return { ...option, minutes };
}

export async function assignGymWorkout(sessionId: string, workoutId: GymWorkoutId) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.location !== 'gym' || session.status === 'completed') {
    throw new Error('Open an active Gym Deployment before selecting the session.');
  }
  const workout = getGymWorkout(workoutId);
  const previous = await db.trainingSessions
    .where('date')
    .below(session.date)
    .reverse()
    .filter(
      (candidate) =>
        candidate.status === 'completed' &&
        candidate.location === 'gym' &&
        candidate.gymWorkoutId === workoutId,
    )
    .first();
  const gymExerciseLogs = Object.fromEntries(
    workout.exercises.map((exercise) => [
      exercise.id,
      Array.from({ length: exercise.sets }, (_, index) => ({
        weight: previous?.gymExerciseLogs?.[exercise.id]?.[index]?.weight,
        reps: previous?.gymExerciseLogs?.[exercise.id]?.[index]?.reps,
        completed: false,
      })),
    ]),
  );
  const gymExerciseChoices = Object.fromEntries(
    workout.exercises.map((exercise) => [
      exercise.id,
      previous?.gymExerciseChoices?.[exercise.id] ?? exercise.name,
    ]),
  );
  const next: TrainingSession = {
    ...session,
    gymWorkoutId: workoutId,
    gymFocus: 'strength',
    gymExerciseLogs,
    gymExerciseChoices,
    gymFinisher: finisherFor(workoutId),
    gymFinisherCompleted: false,
    gymProgressionPrompts: undefined,
    gymPersonalRecords: undefined,
    updatedAt: new Date().toISOString(),
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function resetGymWorkoutSelection(sessionId: string) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.location !== 'gym' || session.status === 'completed') {
    throw new Error('Only an unfinished Gym Deployment can return to workout selection.');
  }
  const next: TrainingSession = {
    ...session,
    gymWorkoutId: undefined,
    gymFocus: undefined,
    gymExerciseLogs: undefined,
    gymExerciseChoices: undefined,
    gymFinisher: undefined,
    gymFinisherCompleted: undefined,
    gymProgressionPrompts: undefined,
    gymPersonalRecords: undefined,
    loggedDurationMinutes: undefined,
    difficulty: undefined,
    note: undefined,
    updatedAt: new Date().toISOString(),
  };
  await db.trainingSessions.put(next);
  return next;
}

function sanitizeGymLogs(logs: Record<string, GymExerciseSetLog[]>) {
  return Object.fromEntries(
    Object.entries(logs).map(([exerciseId, sets]) => [
      exerciseId,
      sets.slice(0, 12).map((set) => ({
        weight:
          set.weight !== undefined && Number.isFinite(set.weight)
            ? Math.max(0, Math.min(2000, Math.round(set.weight * 10) / 10))
            : undefined,
        reps:
          set.reps !== undefined && Number.isFinite(set.reps)
            ? Math.max(0, Math.min(999, Math.floor(set.reps)))
            : undefined,
        completed: Boolean(set.completed),
      })),
    ]),
  );
}

export async function saveGymProgress(
  sessionId: string,
  input: {
    logs: Record<string, GymExerciseSetLog[]>;
    choices: Record<string, string>;
    finisherCompleted: boolean;
  },
) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.location !== 'gym' || session.status === 'completed') return session;
  const choices = Object.fromEntries(
    Object.entries(input.choices)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([key, value]) => [key, value.trim().slice(0, 120)]),
  );
  await db.trainingSessions.update(sessionId, {
    gymExerciseLogs: sanitizeGymLogs(input.logs),
    gymExerciseChoices: choices,
    gymFinisherCompleted: Boolean(input.finisherCompleted),
    updatedAt: new Date().toISOString(),
  });
  return db.trainingSessions.get(sessionId);
}

export function isGymWorkoutComplete(session: TrainingSession) {
  if (!session.gymWorkoutId) return false;
  const workout = getGymWorkout(session.gymWorkoutId);
  return workout.exercises.every((exercise) => {
    const sets = session.gymExerciseLogs?.[exercise.id] ?? [];
    return (
      sets.length === exercise.sets &&
      sets.every((set) => set.completed && Number.isFinite(set.reps) && (set.reps ?? 0) >= 1)
    );
  });
}

function exerciseVolume(sets: GymExerciseSetLog[] | undefined) {
  return (sets ?? []).reduce(
    (total, set) => total + (set.completed ? Math.max(1, set.weight ?? 1) * (set.reps ?? 0) : 0),
    0,
  );
}

export async function completeGymTraining(input: {
  sessionId: string;
  duration: number;
  difficulty: number;
  logs: Record<string, GymExerciseSetLog[]>;
  choices: Record<string, string>;
  finisherCompleted: boolean;
  note?: string;
}) {
  const session = await db.trainingSessions.get(input.sessionId);
  if (!session || session.location !== 'gym' || !session.gymWorkoutId) {
    throw new Error('Choose a structured Gym Deployment before recording it.');
  }
  if (session.status === 'completed') return session;
  const gymExerciseLogs = sanitizeGymLogs(input.logs);
  const prepared: TrainingSession = { ...session, gymExerciseLogs };
  if (!isGymWorkoutComplete(prepared)) {
    throw new Error('Check off every prescribed working set before clearing this Gym Deployment.');
  }
  const workout = getGymWorkout(session.gymWorkoutId);
  const previous = await db.trainingSessions
    .where('date')
    .below(session.date)
    .reverse()
    .filter(
      (candidate) =>
        candidate.status === 'completed' && candidate.gymWorkoutId === session.gymWorkoutId,
    )
    .first();
  const gymProgressionPrompts = workout.exercises
    .filter((exercise) =>
      (gymExerciseLogs[exercise.id] ?? []).every((set) => (set.reps ?? 0) >= exercise.repMax),
    )
    .map((exercise) =>
      exercise.bodyweight
        ? `${input.choices[exercise.id] ?? exercise.name}: advance only to the next therapist-approved variation.`
        : `${input.choices[exercise.id] ?? exercise.name}: every set reached the top of the range—use the smallest available weight increase next time.`,
    );
  const gymPersonalRecords = previous
    ? workout.exercises
        .filter(
          (exercise) =>
            exerciseVolume(gymExerciseLogs[exercise.id]) >
            exerciseVolume(previous.gymExerciseLogs?.[exercise.id]) * 1.001,
        )
        .map((exercise) => input.choices[exercise.id] ?? exercise.name)
    : ['First structured baseline secured'];
  const now = new Date().toISOString();
  const next: TrainingSession = {
    ...session,
    status: 'completed',
    completedAt: now,
    remainingSeconds: 0,
    loggedDurationMinutes: Math.max(1, Math.min(360, Math.round(input.duration))),
    difficulty: Math.max(1, Math.min(5, Math.floor(input.difficulty))),
    gymExerciseLogs,
    gymExerciseChoices: Object.fromEntries(
      Object.entries(input.choices).map(([key, value]) => [key, value.trim().slice(0, 120)]),
    ),
    gymFinisherCompleted: Boolean(input.finisherCompleted),
    gymProgressionPrompts,
    gymPersonalRecords,
    note: input.note?.trim() || undefined,
    updatedAt: now,
  };
  await db.trainingSessions.put(next);
  await awardDoubleDeploymentReward(session.date);
  return next;
}

export function getRemainingTrainingSeconds(session: TrainingSession, now = Date.now()) {
  if (session.status === 'active' && session.timerEndsAt) {
    return Math.max(0, Math.ceil((new Date(session.timerEndsAt).getTime() - now) / 1000));
  }
  return Math.max(0, session.remainingSeconds ?? (session.durationMinutes ?? 0) * 60);
}

export async function saveTrainingLoads(sessionId: string, exerciseLoads: Record<string, number>) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.status === 'completed') return session;
  const sanitized = Object.fromEntries(
    Object.entries(exerciseLoads)
      .filter(([, value]) => Number.isFinite(value) && value >= 0 && value <= 500)
      .map(([key, value]) => [key, Math.round(value * 10) / 10]),
  );
  await db.trainingSessions.update(sessionId, {
    exerciseLoads: sanitized,
    updatedAt: new Date().toISOString(),
  });
  return db.trainingSessions.get(sessionId);
}

export async function saveTrainingProgress(
  sessionId: string,
  input: { roundsCompleted?: number; partialReps?: number },
) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.status === 'completed') return session;
  await db.trainingSessions.update(sessionId, {
    roundsCompleted:
      input.roundsCompleted === undefined
        ? session.roundsCompleted
        : Math.max(0, Math.floor(input.roundsCompleted)),
    partialReps:
      input.partialReps === undefined
        ? session.partialReps
        : Math.max(0, Math.floor(input.partialReps)),
    updatedAt: new Date().toISOString(),
  });
  return db.trainingSessions.get(sessionId);
}

export async function startTrainingTimer(sessionId: string) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session?.circuitId || !session.durationMinutes || session.location !== 'home') {
    throw new Error('A home circuit must be assigned before the timer begins.');
  }
  if (session.status === 'completed') return session;
  const now = new Date();
  const remaining = getRemainingTrainingSeconds(session, now.getTime());
  const next: TrainingSession = {
    ...session,
    status: 'active',
    startedAt: session.startedAt ?? now.toISOString(),
    timerEndsAt: new Date(now.getTime() + Math.max(remaining, 1) * 1000).toISOString(),
    remainingSeconds: Math.max(remaining, 1),
    updatedAt: now.toISOString(),
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function pauseTrainingTimer(sessionId: string) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.status !== 'active') return session;
  const remainingSeconds = getRemainingTrainingSeconds(session);
  const next: TrainingSession = {
    ...session,
    status: 'paused',
    timerEndsAt: undefined,
    remainingSeconds,
    updatedAt: new Date().toISOString(),
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function markTrainingTimerComplete(sessionId: string) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.status !== 'active' || getRemainingTrainingSeconds(session) > 0) {
    return session;
  }
  const next: TrainingSession = {
    ...session,
    status: 'paused',
    timerEndsAt: undefined,
    remainingSeconds: 0,
    updatedAt: new Date().toISOString(),
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function activateBossExtension(sessionId: string) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.location !== 'home' || getRemainingTrainingSeconds(session) > 0) {
    throw new Error('The Boss Extension opens only after the assigned timer is cleared.');
  }
  if (session.bossExtensionUsed) throw new Error('Today’s Boss Extension is already complete.');
  const now = new Date();
  const next: TrainingSession = {
    ...session,
    status: 'active',
    bossExtensionUsed: true,
    timerEndsAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    remainingSeconds: 5 * 60,
    updatedAt: now.toISOString(),
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function completeHomeTraining(input: {
  sessionId?: string;
  date: LocalDateKey;
  roundsCompleted: number;
  partialReps: number;
  difficulty: number;
  exerciseLoads: Record<string, number>;
  note?: string;
}) {
  const session = input.sessionId
    ? await db.trainingSessions.get(input.sessionId)
    : (await sessionsOn(input.date)).find(
        (candidate) => candidate.location === 'home' && candidate.status !== 'abandoned',
      );
  if (!session?.circuitId || session.location !== 'home') {
    throw new Error('No home circuit is available to complete.');
  }
  if (getRemainingTrainingSeconds(session) > 0) {
    throw new Error('The assigned clock is still active.');
  }
  if (session.status === 'completed') return session;
  const now = new Date().toISOString();
  const next: TrainingSession = {
    ...session,
    status: 'completed',
    timerEndsAt: undefined,
    remainingSeconds: 0,
    completedAt: now,
    roundsCompleted: Math.max(0, Math.floor(input.roundsCompleted)),
    partialReps: Math.max(0, Math.floor(input.partialReps)),
    difficulty: Math.max(1, Math.min(5, Math.floor(input.difficulty))),
    exerciseLoads: Object.fromEntries(
      Object.entries(input.exerciseLoads)
        .filter(([, value]) => Number.isFinite(value) && value >= 0 && value <= 500)
        .map(([key, value]) => [key, Math.round(value * 10) / 10]),
    ),
    note: input.note?.trim() || undefined,
    updatedAt: now,
  };
  await db.trainingSessions.put(next);
  await awardDoubleDeploymentReward(session.date);
  return next;
}

export async function completeLoggedTraining(input: {
  sessionId?: string;
  date: LocalDateKey;
  location: Exclude<TrainingLocation, 'home'>;
  duration: number;
  difficulty: number;
  gymFocus?: TrainingSession['gymFocus'];
  conditioningType?: TrainingSession['conditioningType'];
  distance?: number;
  recoveryProtocol?: string;
  note?: string;
}) {
  const rows = await sessionsOn(input.date);
  const existing = input.sessionId
    ? await db.trainingSessions.get(input.sessionId)
    : rows.find((session) => session.location === input.location && session.status !== 'abandoned');
  if (existing?.status === 'completed') return existing;
  if (input.location === 'gym') {
    throw new Error('Choose and complete one of Rook’s structured Gym Deployments.');
  }
  const now = new Date().toISOString();
  const next: TrainingSession = {
    id: existing?.id ?? nextSessionId(input.date, input.location, rows),
    date: input.date,
    location: input.location,
    status: 'completed',
    briefingVariant: existing?.briefingVariant ?? randomIndex(4),
    debriefVariant: existing?.debriefVariant ?? randomIndex(8),
    rerollUsed: existing?.rerollUsed ?? false,
    bossExtensionUsed: false,
    assignedAt: existing?.assignedAt ?? now,
    completedAt: now,
    remainingSeconds: 0,
    difficulty: Math.max(1, Math.min(5, Math.floor(input.difficulty))),
    conditioningType: input.conditioningType,
    distance:
      input.distance && Number.isFinite(input.distance) && input.distance > 0
        ? Math.round(input.distance * 100) / 100
        : undefined,
    recoveryProtocol: input.recoveryProtocol?.trim() || undefined,
    loggedDurationMinutes: Math.max(1, Math.min(1440, Math.round(input.duration))),
    note: input.note?.trim() || undefined,
    durationMinutes: undefined,
    updatedAt: now,
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function awardDoubleDeploymentReward(
  date: LocalDateKey,
): Promise<DoubleDeploymentReward> {
  const rewardId = stableId('training', date, 'double-deployment');
  const existingReward = await db.xpTransactions.get(rewardId);
  if (existingReward) {
    return {
      earned: true,
      accountXp: existingReward.amount,
      alreadyAwarded: true,
    };
  }
  const sessions = await sessionsOn(date);
  const earned = ['home', 'gym'].every((location) =>
    sessions.some((session) => session.location === location && session.status === 'completed'),
  );
  if (!earned) return { earned: false, accountXp: 0, alreadyAwarded: false };

  const now = new Date().toISOString();
  await db.transaction(
    'rw',
    [
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.levelHistory,
      db.progressionEvents,
    ],
    async () => {
      if (await db.xpTransactions.get(rewardId)) return;
      const progression = await db.progression.get('primary');
      if (!progression) throw new Error('Account progression is unavailable.');
      const applied = applyAccountXp(
        progression.totalXp,
        BALANCE.training.doubleDeploymentAccountXp,
      );
      await db.progression.put({
        ...progression,
        ...applied,
        lastLevelUpAt: applied.levelsGained ? now : progression.lastLevelUpAt,
        recentLevelUp: progression.recentLevelUp || applied.levelsGained > 0,
      });
      await db.xpTransactions.put({
        id: rewardId,
        kind: 'training',
        amount: BALANCE.training.doubleDeploymentAccountXp,
        date,
        timestamp: now,
        sourceId: date,
        note: 'Home + Gym Double Deployment Ascension Surge',
      });
      await putLevelHistory({ ...progression, ...applied }, progression.level, date, rewardId, now);
      for (const [statName, amount] of Object.entries(BALANCE.training.doubleDeploymentStatXp) as [
        StatName,
        number,
      ][]) {
        const stat = await db.stats.get(statName);
        if (!stat) continue;
        const transactionId = stableId(rewardId, statName);
        await db.stats.put(applyStatChange(stat, amount, 0, now));
        await db.statTransactions.put({
          id: transactionId,
          stat: statName,
          kind: 'training',
          amount,
          momentumDelta: 0,
          date,
          timestamp: now,
          sourceId: date,
          note: 'Double Deployment Ascension Surge',
        });
      }
    },
  );
  return {
    earned: true,
    accountXp: BALANCE.training.doubleDeploymentAccountXp,
    alreadyAwarded: false,
  };
}

export async function abandonTrainingSession(sessionId: string) {
  const session = await db.trainingSessions.get(sessionId);
  if (!session || session.status === 'completed') return session;
  const now = new Date().toISOString();
  const next: TrainingSession = {
    ...session,
    status: 'abandoned',
    timerEndsAt: undefined,
    remainingSeconds: getRemainingTrainingSeconds(session),
    updatedAt: now,
  };
  await db.trainingSessions.put(next);
  return next;
}

export async function reopenTrainingCompletion(_date: LocalDateKey) {
  void _date;
  // Completed Training Hall records are permanent facts. Undoing Daily Workout only removes the
  // mission credit; the existing completion screen can safely sync that credit again once.
}

export function getTrainingDebriefMessage(session: TrainingSession, companionId: CompanionId) {
  const lines = TRAINING_DEBRIEF_LINES[companionId];
  const offset = [
    'snow',
    'rook',
    'ember',
    'selah',
    'cipher',
    'haven',
    'amara',
    'cassian',
    'saffron',
  ].indexOf(companionId);
  const line = lines[(session.debriefVariant + Math.max(0, offset)) % lines.length];
  const circuit = session.circuitId
    ? getTrainingCircuit(session.circuitId).name
    : session.gymWorkoutId
      ? getGymWorkout(session.gymWorkoutId).name
      : session.location === 'gym'
        ? 'Gym Deployment'
        : session.location === 'conditioning'
          ? 'Conditioning Mission'
          : 'Recovery Protocol';
  const minutes = session.durationMinutes
    ? session.durationMinutes + (session.bossExtensionUsed ? 5 : 0)
    : session.loggedDurationMinutes;
  return line
    .replaceAll('{rounds}', String(session.roundsCompleted ?? 'the completed'))
    .replaceAll('{minutes}', String(minutes || 'your'))
    .replaceAll('{circuit}', circuit)
    .replaceAll('1 minutes', '1 minute');
}
