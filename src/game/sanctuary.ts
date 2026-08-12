import {
  LONELINESS_INTEGRITY_LINES,
  SANCTUARY_CONCERNS,
  SELAH_SANCTUARY_LINES,
  SNOW_SANCTUARY_LINES,
  SPECIALIST_SANCTUARY_LINES,
  SCRIPTURE_LIBRARY,
  getSanctuaryConcern,
  getScripturePassage,
} from '@/config/scripture';
import { db } from '@/db/database';
import type {
  CompanionId,
  LocalDateKey,
  SanctuaryConcern,
  SanctuaryMode,
  SanctuarySession,
} from '@/types/game';
import { createId } from '@/utils/id';

export interface SanctuaryMessage {
  id: string;
  companionId: CompanionId;
  text: string;
  role: 'opening' | 'guide' | 'specialist';
}

function stableNumber(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stablePick<T>(items: readonly T[], seed: string): T {
  return items[stableNumber(seed) % items.length];
}

function trimOptional(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function choosePassages(
  concern: SanctuaryConcern,
  count: number,
  history: SanctuarySession[],
  seed: string,
) {
  const usage = new Map<string, { count: number; lastUsed: number }>();
  history.forEach((session, historyIndex) => {
    session.passageIds.forEach((id) => {
      const current = usage.get(id);
      usage.set(id, {
        count: (current?.count ?? 0) + 1,
        lastUsed: Math.min(current?.lastUsed ?? Number.POSITIVE_INFINITY, historyIndex),
      });
    });
  });

  return SCRIPTURE_LIBRARY.filter((passage) => passage.concern === concern)
    .sort((left, right) => {
      const leftUse = usage.get(left.id);
      const rightUse = usage.get(right.id);
      const countDifference = (leftUse?.count ?? 0) - (rightUse?.count ?? 0);
      if (countDifference !== 0) return countDifference;
      const recencyDifference = (rightUse?.lastUsed ?? 9999) - (leftUse?.lastUsed ?? 9999);
      if (recencyDifference !== 0) return recencyDifference;
      return stableNumber(`${seed}:${left.id}`) - stableNumber(`${seed}:${right.id}`);
    })
    .slice(0, count)
    .map((passage) => passage.id);
}

function sessionCompanions(primaryConcern: SanctuaryConcern, secondaryConcern?: SanctuaryConcern) {
  const companions: CompanionId[] = [
    'snow',
    'selah',
    getSanctuaryConcern(primaryConcern).companionId,
  ];
  if (secondaryConcern) companions.push(getSanctuaryConcern(secondaryConcern).companionId);
  if (
    (primaryConcern === 'sexual-integrity' && secondaryConcern === 'loneliness') ||
    (primaryConcern === 'loneliness' && secondaryConcern === 'sexual-integrity')
  ) {
    companions.push('amara');
  }
  return Array.from(new Set(companions));
}

export async function startSanctuarySession(input: {
  date: LocalDateKey;
  mode: SanctuaryMode;
  primaryConcern: SanctuaryConcern;
  secondaryConcern?: SanctuaryConcern;
}) {
  if (!SANCTUARY_CONCERNS.some((concern) => concern.id === input.primaryConcern)) {
    throw new Error('Choose what you need help carrying before the session begins.');
  }
  if (input.secondaryConcern === input.primaryConcern) {
    throw new Error('Choose a different secondary concern, or leave it open.');
  }

  const [activeSessions, history] = await Promise.all([
    db.sanctuarySessions.where('status').equals('active').toArray(),
    db.sanctuarySessions.orderBy('createdAt').reverse().limit(64).toArray(),
  ]);
  const now = new Date().toISOString();
  await Promise.all(
    activeSessions.map((session) =>
      db.sanctuarySessions.update(session.id, { status: 'abandoned', updatedAt: now }),
    ),
  );

  const primaryCount =
    input.mode === 'study' ? (input.secondaryConcern ? 2 : 3) : input.secondaryConcern ? 1 : 2;
  const passageIds = choosePassages(
    input.primaryConcern,
    primaryCount,
    history,
    `${input.date}:${input.mode}:${history.length}:primary`,
  );
  if (input.secondaryConcern) {
    passageIds.push(
      ...choosePassages(
        input.secondaryConcern,
        1,
        history,
        `${input.date}:${input.mode}:${history.length}:secondary`,
      ),
    );
  }
  const session: SanctuarySession = {
    id: createId('sanctuary'),
    date: input.date,
    mode: input.mode,
    status: 'active',
    primaryConcern: input.primaryConcern,
    secondaryConcern: input.secondaryConcern,
    passageIds,
    companionIds: sessionCompanions(input.primaryConcern, input.secondaryConcern),
    createdAt: now,
    updatedAt: now,
    bibleMissionCredited: false,
  };
  await db.sanctuarySessions.put(session);
  return session;
}

export async function getSanctuaryData(date: LocalDateKey) {
  const [active, todayCompleted, recent] = await Promise.all([
    db.sanctuarySessions.where('status').equals('active').first(),
    db.sanctuarySessions
      .where('date')
      .equals(date)
      .filter((session) => session.status === 'completed')
      .reverse()
      .sortBy('createdAt'),
    db.sanctuarySessions
      .orderBy('createdAt')
      .reverse()
      .filter((session) => session.status === 'completed')
      .limit(16)
      .toArray(),
  ]);
  return { active, todayCompleted: todayCompleted.reverse(), recent };
}

export async function completeSanctuarySession(input: {
  id: string;
  reflection?: string;
  prayer?: string;
  nextAction?: string;
  outcome?: SanctuarySession['outcome'];
}) {
  const session = await db.sanctuarySessions.get(input.id);
  if (!session) throw new Error('This Sanctuary session could not be found.');
  if (session.status === 'completed') return session;
  if (session.status !== 'active') throw new Error('This Sanctuary session is no longer active.');
  const now = new Date().toISOString();
  const completed: SanctuarySession = {
    ...session,
    status: 'completed',
    reflection: trimOptional(input.reflection, 2000),
    prayer: trimOptional(input.prayer, 3000),
    nextAction: trimOptional(input.nextAction, 500),
    outcome: input.outcome,
    completedAt: now,
    updatedAt: now,
  };
  await db.sanctuarySessions.put(completed);
  return completed;
}

export async function saveSanctuaryDraft(
  id: string,
  input: { reflection?: string; prayer?: string; nextAction?: string },
) {
  const session = await db.sanctuarySessions.get(id);
  if (!session || session.status !== 'active') return session;
  await db.sanctuarySessions.update(id, {
    reflection: trimOptional(input.reflection, 2000),
    prayer: trimOptional(input.prayer, 3000),
    nextAction: trimOptional(input.nextAction, 500),
    updatedAt: new Date().toISOString(),
  });
  return db.sanctuarySessions.get(id);
}

export async function markSanctuaryMissionCredited(id: string) {
  const session = await db.sanctuarySessions.get(id);
  if (!session || session.status !== 'completed' || session.mode !== 'study') return session;
  if (!session.bibleMissionCredited) {
    await db.sanctuarySessions.update(id, {
      bibleMissionCredited: true,
      updatedAt: new Date().toISOString(),
    });
  }
  return db.sanctuarySessions.get(id);
}

export async function reopenSanctuaryCredit(date: LocalDateKey) {
  const credited = await db.sanctuarySessions
    .where('date')
    .equals(date)
    .filter(
      (session) =>
        session.mode === 'study' && session.status === 'completed' && session.bibleMissionCredited,
    )
    .toArray();
  const now = new Date().toISOString();
  await Promise.all(
    credited.map((session) =>
      db.sanctuarySessions.update(session.id, {
        bibleMissionCredited: false,
        updatedAt: now,
      }),
    ),
  );
}

export async function abandonSanctuarySession(id: string) {
  const session = await db.sanctuarySessions.get(id);
  if (!session || session.status !== 'active') return session;
  const next: SanctuarySession = {
    ...session,
    status: 'abandoned',
    updatedAt: new Date().toISOString(),
  };
  await db.sanctuarySessions.put(next);
  return next;
}

export function getSanctuaryPassages(session: SanctuarySession) {
  return session.passageIds.map(getScripturePassage).filter(Boolean);
}

export function getSanctuaryMessages(session: SanctuarySession): SanctuaryMessage[] {
  const seed = session.id;
  const concerns = [session.primaryConcern, session.secondaryConcern].filter(
    (concern): concern is SanctuaryConcern => Boolean(concern),
  );
  const messages: SanctuaryMessage[] = [
    {
      id: `${session.id}:snow`,
      companionId: 'snow',
      text: stablePick(SNOW_SANCTUARY_LINES, `${seed}:snow`),
      role: 'opening',
    },
    {
      id: `${session.id}:selah`,
      companionId: 'selah',
      text: stablePick(SELAH_SANCTUARY_LINES, `${seed}:selah`),
      role: 'guide',
    },
  ];

  const lonelinessIntegrity =
    concerns.includes('sexual-integrity') && concerns.includes('loneliness');
  if (lonelinessIntegrity) {
    messages.push({
      id: `${session.id}:amara:connection`,
      companionId: 'amara',
      text: stablePick(LONELINESS_INTEGRITY_LINES, `${seed}:amara:connection`),
      role: 'specialist',
    });
  }

  const specialistIds = Array.from(
    new Set(concerns.map((concern) => getSanctuaryConcern(concern).companionId)),
  ).filter((id) => id !== 'snow' && id !== 'selah' && (!lonelinessIntegrity || id !== 'amara'));
  specialistIds.forEach((companionId, index) => {
    const concern = concerns.find(
      (candidate) => getSanctuaryConcern(candidate).companionId === companionId,
    )!;
    messages.push({
      id: `${session.id}:${companionId}:${concern}`,
      companionId,
      text: stablePick(SPECIALIST_SANCTUARY_LINES[concern], `${seed}:${concern}:${index}`),
      role: 'specialist',
    });
  });
  return messages;
}

export function getStrongholdSteps(session: SanctuarySession) {
  const primary = getSanctuaryConcern(session.primaryConcern);
  const secondary = session.secondaryConcern
    ? getSanctuaryConcern(session.secondaryConcern)
    : undefined;
  return [
    'Stop and name what is happening without insulting yourself. An urge or emotion is a signal, not an order.',
    primary.strongholdAction,
    secondary?.strongholdAction,
    'Read the assigned passages slowly. Notice what they reveal about God, then say one true sentence aloud.',
    'Choose the next faithful ten minutes—not a promise about forever. Make the environment help that choice.',
    'If isolation is feeding this moment, move toward safe human connection: enter a shared space or contact someone trustworthy.',
  ].filter((step): step is string => Boolean(step));
}
