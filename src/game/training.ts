import {
  TRAINING_CIRCUITS,
  TRAINING_DEBRIEF_LINES,
  TRAINING_TIME_ROLLS,
  getTrainingCircuit,
} from '@/config/training';
import { db } from '@/db/database';
import type {
  CompanionId,
  LocalDateKey,
  TrainingCircuitId,
  TrainingLocation,
  TrainingSession,
} from '@/types/game';

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
  date: LocalDateKey;
  circuitId: TrainingCircuitId;
  durationMinutes: 15 | 20 | 25 | 30;
  rerollUsed: boolean;
  assignedAt?: string;
}): TrainingSession {
  const now = new Date().toISOString();
  return {
    id: input.date,
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
    date,
    circuitId: circuit.id,
    durationMinutes: time.minutes,
    rerollUsed: Boolean(previous),
    assignedAt: previous?.assignedAt,
  });
}

export async function getTrainingHallData(date: LocalDateKey) {
  const [today, recent] = await Promise.all([
    db.trainingSessions.get(date),
    db.trainingSessions
      .orderBy('date')
      .reverse()
      .filter((session) => session.status === 'completed')
      .limit(12)
      .toArray(),
  ]);
  return { today, recent };
}

export async function assignHomeTraining(date: LocalDateKey, reroll = false) {
  const existing = await db.trainingSessions.get(date);
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
  const next = await drawHomeAssignment(date, reroll ? existing : undefined);
  await db.trainingSessions.put(next);
  return next;
}

export async function selectTrainingLocation(date: LocalDateKey, location: TrainingLocation) {
  if (location === 'home') return assignHomeTraining(date);
  const existing = await db.trainingSessions.get(date);
  if (existing?.status === 'completed') return existing;
  if (existing && ['active', 'paused'].includes(existing.status)) {
    throw new Error('End the active timer before switching training paths.');
  }
  const now = new Date().toISOString();
  const next: TrainingSession = {
    id: date,
    date,
    location,
    status: 'assigned',
    briefingVariant: existing?.briefingVariant ?? randomIndex(4),
    debriefVariant: existing?.debriefVariant ?? randomIndex(8),
    rerollUsed: existing?.rerollUsed ?? false,
    bossExtensionUsed: false,
    assignedAt: existing?.assignedAt ?? now,
    updatedAt: now,
  };
  await db.trainingSessions.put(next);
  return next;
}

export function getRemainingTrainingSeconds(session: TrainingSession, now = Date.now()) {
  if (session.status === 'active' && session.timerEndsAt) {
    return Math.max(0, Math.ceil((new Date(session.timerEndsAt).getTime() - now) / 1000));
  }
  return Math.max(0, session.remainingSeconds ?? (session.durationMinutes ?? 0) * 60);
}

export async function saveTrainingLoads(date: LocalDateKey, exerciseLoads: Record<string, number>) {
  const session = await db.trainingSessions.get(date);
  if (!session || session.status === 'completed') return session;
  const sanitized = Object.fromEntries(
    Object.entries(exerciseLoads)
      .filter(([, value]) => Number.isFinite(value) && value >= 0 && value <= 500)
      .map(([key, value]) => [key, Math.round(value * 10) / 10]),
  );
  await db.trainingSessions.update(date, {
    exerciseLoads: sanitized,
    updatedAt: new Date().toISOString(),
  });
  return db.trainingSessions.get(date);
}

export async function saveTrainingProgress(
  date: LocalDateKey,
  input: { roundsCompleted?: number; partialReps?: number },
) {
  const session = await db.trainingSessions.get(date);
  if (!session || session.status === 'completed') return session;
  await db.trainingSessions.update(date, {
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
  return db.trainingSessions.get(date);
}

export async function startTrainingTimer(date: LocalDateKey) {
  const session = await db.trainingSessions.get(date);
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

export async function pauseTrainingTimer(date: LocalDateKey) {
  const session = await db.trainingSessions.get(date);
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

export async function markTrainingTimerComplete(date: LocalDateKey) {
  const session = await db.trainingSessions.get(date);
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

export async function activateBossExtension(date: LocalDateKey) {
  const session = await db.trainingSessions.get(date);
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
  date: LocalDateKey;
  roundsCompleted: number;
  partialReps: number;
  difficulty: number;
  exerciseLoads: Record<string, number>;
  note?: string;
}) {
  const session = await db.trainingSessions.get(input.date);
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
  return next;
}

export async function completeLoggedTraining(input: {
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
  const existing = await db.trainingSessions.get(input.date);
  if (existing?.status === 'completed') return existing;
  const now = new Date().toISOString();
  const next: TrainingSession = {
    id: input.date,
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
    gymFocus: input.gymFocus,
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

export async function abandonTrainingSession(date: LocalDateKey) {
  const session = await db.trainingSessions.get(date);
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

export async function reopenTrainingCompletion(date: LocalDateKey) {
  const session = await db.trainingSessions.get(date);
  if (!session || session.status !== 'completed') return;
  await db.trainingSessions.put({
    ...session,
    status: 'assigned',
    completedAt: undefined,
    updatedAt: new Date().toISOString(),
  });
}

export function getTrainingDebriefMessage(session: TrainingSession, companionId: CompanionId) {
  const lines = TRAINING_DEBRIEF_LINES[companionId];
  const offset = ['snow', 'rook', 'ember', 'selah', 'cipher', 'haven', 'amara', 'cassian'].indexOf(
    companionId,
  );
  const line = lines[(session.debriefVariant + Math.max(0, offset)) % lines.length];
  const circuit = session.circuitId
    ? getTrainingCircuit(session.circuitId).name
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
