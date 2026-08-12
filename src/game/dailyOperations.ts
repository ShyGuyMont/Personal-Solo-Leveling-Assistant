import { getGymWorkout, getTrainingCircuit } from '@/config/training';
import { getSanctuaryConcern } from '@/config/scripture';
import { db } from '@/db/database';
import { resolveKitchenSessionRecipe, assignKitchenOrder } from '@/game/kitchen';
import { getSanctuaryData, startSanctuarySession } from '@/game/sanctuary';
import {
  assignGymWorkout,
  getGymWorkoutAvailability,
  selectTrainingLocation,
} from '@/game/training';
import type {
  CompanionId,
  CompanionOperationRequest,
  DailyOperationsRecord,
  KitchenSession,
  LocalDateKey,
  PreparedKitchenOperation,
  PreparedOperationState,
  PreparedSanctuaryOperation,
  PreparedTrainingOperation,
  SanctuarySession,
  TrainingLocation,
  TrainingSession,
} from '@/types/game';

const INTERRUPTED_PREPARATION_MS = 30_000;
const INTERRUPTED_PREPARATION_NOTE =
  'A previous preparation was interrupted. Existing assignments were preserved; ask Snow to retry any unfinished realm.';

function emitOperationsChanged(date: LocalDateKey) {
  window.dispatchEvent(new CustomEvent('system:daily-operations-changed', { detail: { date } }));
}

function normalizeOperationRequest(request: CompanionOperationRequest): CompanionOperationRequest {
  return {
    ...request,
    includeTraining:
      typeof request.includeTraining === 'boolean'
        ? request.includeTraining
        : request.kind === 'prepare-training' || Boolean(request.trainingLocation),
  };
}

function trainingCompanions(location: TrainingLocation): CompanionId[] {
  return location === 'recovery' ? ['mira'] : ['rook', 'ember'];
}

function trainingState(session: TrainingSession): PreparedOperationState {
  if (session.status === 'completed') return 'completed';
  if (session.status === 'active' || session.status === 'paused') return 'active';
  return session.status === 'assigned' ? 'ready' : 'changed';
}

function describeTraining(session: TrainingSession): PreparedTrainingOperation {
  if (session.location === 'home') {
    const circuit = session.circuitId ? getTrainingCircuit(session.circuitId) : undefined;
    return {
      sessionId: session.id,
      location: session.location,
      label: circuit?.name ?? 'Home Circuit',
      detail: `${session.durationMinutes ?? 20}-minute ${circuit?.focus ?? 'home'} deployment`,
      companionIds: trainingCompanions(session.location),
      state: trainingState(session),
    };
  }
  if (session.location === 'gym') {
    const workout = session.gymWorkoutId ? getGymWorkout(session.gymWorkoutId) : undefined;
    return {
      sessionId: session.id,
      location: session.location,
      label: workout?.name ?? 'Gym Deployment',
      detail: workout?.focus ?? 'Recommended gym operation ready for review',
      companionIds: trainingCompanions(session.location),
      state: trainingState(session),
    };
  }
  if (session.location === 'recovery') {
    return {
      sessionId: session.id,
      location: session.location,
      label: session.recoveryProtocol ?? 'Stillpoint Protocol',
      detail: `${session.mobilityEstimatedMinutes ?? 15}-minute mobility and recovery assignment`,
      companionIds: trainingCompanions(session.location),
      state: trainingState(session),
    };
  }
  return {
    sessionId: session.id,
    location: session.location,
    label: 'Conditioning Deployment',
    detail: 'Conditioning path prepared; choose the final modality when you enter the Hall',
    companionIds: trainingCompanions(session.location),
    state: trainingState(session),
  };
}

async function prepareTraining(date: LocalDateKey, location: TrainingLocation) {
  let session = await selectTrainingLocation(date, location);
  if (location === 'gym' && session.status !== 'completed' && !session.gymWorkoutId) {
    const availability = await getGymWorkoutAvailability(date);
    const recommended =
      availability.find((entry) => entry.status === 'recommended') ?? availability[0];
    if (!recommended) throw new Error('No safe Gym Deployment is available today.');
    session = await assignGymWorkout(session.id, recommended.id);
  }
  return describeTraining(session);
}

function describeKitchen(session: KitchenSession, constraints?: string): PreparedKitchenOperation {
  const recipe = resolveKitchenSessionRecipe(session);
  if (!recipe) throw new Error("Saffron's selected recipe could not be opened.");
  return {
    sessionId: session.id,
    recipeId: session.recipeId,
    label: recipe.name,
    detail: `${recipe.prepMinutes + recipe.cookMinutes} minutes · ${recipe.servings} servings`,
    customRecipe: Boolean(session.customRecipeSnapshot),
    constraints: constraints?.trim() || undefined,
    companionIds: ['saffron'],
    state: session.status === 'completed' ? 'completed' : 'ready',
  };
}

async function prepareKitchen(date: LocalDateKey, constraints?: string) {
  const session = await assignKitchenOrder(date);
  if (!session) throw new Error('No Kitchen Order could be prepared.');
  if (session.status === 'declined') {
    throw new Error(
      "Today's Kitchen Order was already declined and will not be replaced silently.",
    );
  }
  return describeKitchen(session, constraints);
}

function describeSanctuary(session: SanctuarySession): PreparedSanctuaryOperation {
  const primary = getSanctuaryConcern(session.primaryConcern);
  return {
    sessionId: session.id,
    mode: session.mode,
    label: session.mode === 'study' ? 'Guided Scripture Study' : 'Stronghold Protocol',
    detail: `${primary.label}${session.secondaryConcern ? ` · ${getSanctuaryConcern(session.secondaryConcern).label}` : ''}`,
    companionIds: session.companionIds,
    state:
      session.status === 'completed'
        ? 'completed'
        : session.status === 'active'
          ? 'active'
          : 'changed',
  };
}

async function prepareSanctuary(date: LocalDateKey, request: CompanionOperationRequest) {
  if (!request.sanctuaryMode || !request.primaryConcern) {
    throw new Error('Selah still needs a Sanctuary mode and a primary concern.');
  }
  const data = await getSanctuaryData(date);
  if (data.active) {
    const sameAssignment =
      data.active.date === date &&
      data.active.mode === request.sanctuaryMode &&
      data.active.primaryConcern === request.primaryConcern &&
      data.active.secondaryConcern === request.secondaryConcern;
    if (!sameAssignment) {
      throw new Error(
        'A different Sanctuary session is already active. It was preserved instead of being replaced.',
      );
    }
    return describeSanctuary(data.active);
  }
  return describeSanctuary(
    await startSanctuarySession({
      date,
      mode: request.sanctuaryMode,
      primaryConcern: request.primaryConcern,
      secondaryConcern: request.secondaryConcern,
    }),
  );
}

async function missionCounts(date: LocalDateKey) {
  const records = await db.dailyMissions.where('date').equals(date).toArray();
  return {
    pendingMissionCount: records.filter((record) => record.status === 'pending').length,
    completedMissionCount: records.filter((record) => record.status === 'completed').length,
  };
}

export async function getDailyOperations(date: LocalDateKey) {
  let current = await db.dailyOperations.get(date);
  if (!current) return undefined;
  if (current.pendingProposal && typeof current.pendingProposal.includeTraining !== 'boolean') {
    current = {
      ...current,
      pendingProposal: normalizeOperationRequest(current.pendingProposal),
      updatedAt: new Date().toISOString(),
    };
    await db.dailyOperations.put(current);
  }
  if (
    current.status === 'preparing' &&
    (!Number.isFinite(Date.parse(current.updatedAt)) ||
      Date.now() - Date.parse(current.updatedAt) >= INTERRUPTED_PREPARATION_MS)
  ) {
    const preparationNotes = Array.from(
      new Set([...current.preparationNotes, INTERRUPTED_PREPARATION_NOTE]),
    ).slice(-12);
    current = {
      ...current,
      status: 'partial',
      pendingProposal: undefined,
      preparationNotes,
      updatedAt: new Date().toISOString(),
    };
    await db.dailyOperations.put(current);
    emitOperationsChanged(date);
  }

  const [counts, trainingSession, kitchenSession, sanctuarySession] = await Promise.all([
    missionCounts(date),
    current.training ? db.trainingSessions.get(current.training.sessionId) : undefined,
    current.kitchen ? db.kitchenSessions.get(current.kitchen.sessionId) : undefined,
    current.sanctuary ? db.sanctuarySessions.get(current.sanctuary.sessionId) : undefined,
  ]);
  const trainingState: PreparedOperationState | undefined = current.training
    ? !trainingSession || trainingSession.location !== current.training.location
      ? 'changed'
      : trainingSession.status === 'completed'
        ? 'completed'
        : trainingSession.status === 'active' || trainingSession.status === 'paused'
          ? 'active'
          : trainingSession.status === 'assigned'
            ? 'ready'
            : 'changed'
    : undefined;
  const kitchenState: PreparedOperationState | undefined = current.kitchen
    ? !kitchenSession || kitchenSession.recipeId !== current.kitchen.recipeId
      ? 'changed'
      : kitchenSession.status === 'completed'
        ? 'completed'
        : kitchenSession.status === 'assigned'
          ? 'ready'
          : 'changed'
    : undefined;
  const sanctuaryState: PreparedOperationState | undefined = current.sanctuary
    ? !sanctuarySession || sanctuarySession.mode !== current.sanctuary.mode
      ? 'changed'
      : sanctuarySession.status === 'completed'
        ? 'completed'
        : sanctuarySession.status === 'active'
          ? 'active'
          : 'changed'
    : undefined;
  const reconciledStates = [trainingState, kitchenState, sanctuaryState].filter(Boolean);
  const hasChangedAssignment = reconciledStates.includes('changed');
  const reconciliationNote =
    'A prepared assignment changed outside Party Operations. Open the marked realm to review its current state.';
  return {
    ...current,
    status: hasChangedAssignment && current.status === 'ready' ? 'partial' : current.status,
    ...counts,
    training: current.training ? { ...current.training, state: trainingState } : undefined,
    kitchen: current.kitchen ? { ...current.kitchen, state: kitchenState } : undefined,
    sanctuary: current.sanctuary ? { ...current.sanctuary, state: sanctuaryState } : undefined,
    preparationNotes: hasChangedAssignment
      ? Array.from(new Set([...current.preparationNotes, reconciliationNote])).slice(-12)
      : current.preparationNotes,
  };
}

export async function stageCompanionOperation(
  date: LocalDateKey,
  proposal: CompanionOperationRequest,
  conversationId?: string,
) {
  proposal = normalizeOperationRequest(proposal);
  const now = new Date().toISOString();
  const previous = await db.dailyOperations.get(date);
  const counts = await missionCounts(date);
  const next: DailyOperationsRecord = {
    id: date,
    date,
    status: 'awaiting-confirmation',
    sourceCompanionId: proposal.companionId,
    conversationId: conversationId ?? previous?.conversationId,
    pendingProposal: proposal,
    training: previous?.training,
    kitchen: previous?.kitchen,
    sanctuary: previous?.sanctuary,
    ...counts,
    preparationNotes: previous?.preparationNotes ?? [],
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    preparedAt: previous?.preparedAt,
  };
  await db.dailyOperations.put(next);
  emitOperationsChanged(date);
  return next;
}

export async function cancelStagedCompanionOperation(date: LocalDateKey) {
  const current = await db.dailyOperations.get(date);
  if (!current?.pendingProposal) return current;
  const hasPreparedAssignments = Boolean(current.training || current.kitchen || current.sanctuary);
  if (!hasPreparedAssignments) {
    await db.dailyOperations.delete(date);
    emitOperationsChanged(date);
    return undefined;
  }
  const next: DailyOperationsRecord = {
    ...current,
    status: current.preparationNotes.length ? 'partial' : 'ready',
    pendingProposal: undefined,
    updatedAt: new Date().toISOString(),
  };
  await db.dailyOperations.put(next);
  emitOperationsChanged(date);
  return next;
}

export async function prepareCompanionOperation(
  date: LocalDateKey,
  request: CompanionOperationRequest,
  conversationId?: string,
) {
  request = normalizeOperationRequest(request);
  const wantsTraining =
    request.kind === 'prepare-training' ||
    (request.kind === 'assemble-day' &&
      (request.includeTraining ?? Boolean(request.trainingLocation)));
  const wantsKitchen =
    request.kind === 'prepare-kitchen' ||
    (request.kind === 'assemble-day' && request.includeKitchen);
  const wantsSanctuary =
    request.kind === 'prepare-sanctuary' ||
    (request.kind === 'assemble-day' && request.includeSanctuary);
  if (!wantsTraining && !wantsKitchen && !wantsSanctuary) {
    throw new Error('Choose at least one realm before waking the party.');
  }
  const now = new Date().toISOString();
  const previous = await db.dailyOperations.get(date);
  const preparing: DailyOperationsRecord = {
    id: date,
    date,
    status: 'preparing',
    sourceCompanionId: request.companionId,
    conversationId: conversationId ?? previous?.conversationId,
    pendingProposal: request,
    training: previous?.training,
    kitchen: previous?.kitchen,
    sanctuary: previous?.sanctuary,
    ...(await missionCounts(date)),
    preparationNotes: [],
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    preparedAt: previous?.preparedAt,
  };
  await db.dailyOperations.put(preparing);
  emitOperationsChanged(date);

  const notes: string[] = [];
  let training = preparing.training;
  let kitchen = preparing.kitchen;
  let sanctuary = preparing.sanctuary;
  if (wantsTraining) {
    if (!request.trainingLocation) {
      notes.push('Training Hall: Snow still needs a deployment path.');
    } else {
      try {
        training = await prepareTraining(date, request.trainingLocation);
      } catch (error) {
        notes.push(
          `Training Hall: ${error instanceof Error ? error.message : 'Preparation failed.'}`,
        );
      }
    }
  }
  if (wantsKitchen) {
    try {
      kitchen = await prepareKitchen(date, request.foodConstraints);
    } catch (error) {
      notes.push(`Kitchen: ${error instanceof Error ? error.message : 'Preparation failed.'}`);
    }
  }
  if (wantsSanctuary) {
    try {
      sanctuary = await prepareSanctuary(date, request);
    } catch (error) {
      notes.push(`Sanctuary: ${error instanceof Error ? error.message : 'Preparation failed.'}`);
    }
  }

  const preparedAt = new Date().toISOString();
  const next: DailyOperationsRecord = {
    ...preparing,
    status: notes.length ? 'partial' : 'ready',
    pendingProposal: undefined,
    training,
    kitchen,
    sanctuary,
    ...(await missionCounts(date)),
    preparationNotes: notes,
    updatedAt: preparedAt,
    preparedAt,
  };
  await db.dailyOperations.put(next);
  emitOperationsChanged(date);
  return next;
}

export async function synchronizeKitchenOperation(date: LocalDateKey, constraints?: string) {
  const [current, session] = await Promise.all([
    db.dailyOperations.get(date),
    db.kitchenSessions.get(date),
  ]);
  if (!current || !session || session.status === 'declined') return current;
  const next: DailyOperationsRecord = {
    ...current,
    kitchen: describeKitchen(session, constraints ?? current.kitchen?.constraints),
    updatedAt: new Date().toISOString(),
  };
  await db.dailyOperations.put(next);
  emitOperationsChanged(date);
  return next;
}

export async function addDailyOperationNote(date: LocalDateKey, note: string) {
  const current = await db.dailyOperations.get(date);
  if (!current) return current;
  const normalized = note.trim().slice(0, 500);
  if (!normalized) return current;
  const preparationNotes = Array.from(new Set([...current.preparationNotes, normalized])).slice(
    -12,
  );
  const next: DailyOperationsRecord = {
    ...current,
    status: 'partial',
    preparationNotes,
    updatedAt: new Date().toISOString(),
  };
  await db.dailyOperations.put(next);
  emitOperationsChanged(date);
  return next;
}
