import { db } from '@/db/database';

const PROGRESS_ID = 'cipher-study:progress';

export interface CipherStudyProgress {
  attempts: number;
  bestPercent: number;
  questionsAnswered: number;
  lastAttemptAt?: string;
}

const EMPTY_PROGRESS: CipherStudyProgress = {
  attempts: 0,
  bestPercent: 0,
  questionsAnswered: 0,
};

export async function getCipherStudyProgress() {
  const row = await db.appMetadata.get(PROGRESS_ID);
  const saved = row?.value as Partial<CipherStudyProgress> | undefined;
  return {
    attempts: Math.max(0, Number(saved?.attempts ?? 0) || 0),
    bestPercent: Math.min(100, Math.max(0, Number(saved?.bestPercent ?? 0) || 0)),
    questionsAnswered: Math.max(0, Number(saved?.questionsAnswered ?? 0) || 0),
    lastAttemptAt: typeof saved?.lastAttemptAt === 'string' ? saved.lastAttemptAt : undefined,
  } satisfies CipherStudyProgress;
}

export async function saveCipherQuizAttempt(correct: number, total: number) {
  const current = await getCipherStudyProgress();
  const percent = total > 0 ? Math.round((Math.max(0, correct) / total) * 100) : 0;
  const next: CipherStudyProgress = {
    attempts: current.attempts + 1,
    bestPercent: Math.max(current.bestPercent, percent),
    questionsAnswered: current.questionsAnswered + Math.max(0, total),
    lastAttemptAt: new Date().toISOString(),
  };
  await db.appMetadata.put({
    id: PROGRESS_ID,
    value: { ...next },
    updatedAt: next.lastAttemptAt!,
  });
  return next;
}

export function emptyCipherStudyProgress() {
  return { ...EMPTY_PROGRESS };
}
