import { BALANCE } from '@/config/balance';
import { db } from '@/db/database';
import { putLevelHistory } from '@/game/engine';
import { applyAccountXp } from '@/game/xp';
import type {
  BodyDiagnosticAssessment,
  BodyDiagnosticGoal,
  BodyDiagnosticRecord,
  BodyDiagnosticSourceKind,
  LocalDateKey,
} from '@/types/game';
import { addDays, daysBetween, startOfWeek } from '@/utils/date';
import { stableId } from '@/utils/id';

export interface BodyDiagnosticData {
  weekStart: LocalDateKey;
  weekEnd: LocalDateKey;
  nextEligibleDate: LocalDateKey;
  daysRemaining: number;
  current?: BodyDiagnosticRecord;
  previous?: BodyDiagnosticRecord;
  history: BodyDiagnosticRecord[];
  weeklyXp: number;
}

export async function getBodyDiagnosticData(date: LocalDateKey): Promise<BodyDiagnosticData> {
  const settings = await db.settings.get('primary');
  const weekStart = startOfWeek(date, settings?.weekStartsOn ?? 1);
  const weekEnd = addDays(weekStart, 6);
  const history = await db.bodyDiagnostics.orderBy('completedAt').reverse().limit(12).toArray();
  const current = history.find((record) => record.weekStart === weekStart);
  const previous = history.find((record) => record.weekStart < weekStart);
  return {
    weekStart,
    weekEnd,
    nextEligibleDate: addDays(weekEnd, 1),
    daysRemaining: Math.max(0, daysBetween(date, weekEnd)),
    current,
    previous,
    history,
    weeklyXp: BALANCE.bodyDiagnostic.weeklyAccountXp,
  };
}

export async function completeBodyDiagnostic(input: {
  date: LocalDateKey;
  goal: BodyDiagnosticGoal;
  hunterContext?: string;
  sourceKinds: BodyDiagnosticSourceKind[];
  assessment: BodyDiagnosticAssessment;
  model: string;
  usage: BodyDiagnosticRecord['usage'];
}) {
  const data = await getBodyDiagnosticData(input.date);
  if (data.current) {
    return { record: data.current, awardedXp: 0, levelsGained: 0, alreadyCompleted: true };
  }

  const id = stableId('body-diagnostic', data.weekStart);
  const rewardId = stableId(id, 'weekly-reward');
  const now = new Date().toISOString();
  let awardedXp = 0;
  let levelsGained = 0;
  let saved: BodyDiagnosticRecord | undefined;

  await db.transaction(
    'rw',
    [db.bodyDiagnostics, db.progression, db.xpTransactions, db.levelHistory, db.progressionEvents],
    async () => {
      const existing = await db.bodyDiagnostics.get(id);
      if (existing) {
        saved = existing;
        return;
      }

      const progression = await db.progression.get('primary');
      if (!progression) throw new Error('Account progression is unavailable.');
      const rewardAlreadyExists = Boolean(await db.xpTransactions.get(rewardId));
      if (!rewardAlreadyExists) {
        awardedXp = BALANCE.bodyDiagnostic.weeklyAccountXp;
        const applied = applyAccountXp(progression.totalXp, awardedXp);
        levelsGained = applied.levelsGained;
        await db.progression.put({
          ...progression,
          ...applied,
          lastLevelUpAt: levelsGained ? now : progression.lastLevelUpAt,
          recentLevelUp: progression.recentLevelUp || levelsGained > 0,
        });
        await db.xpTransactions.put({
          id: rewardId,
          kind: 'body-diagnostic',
          amount: awardedXp,
          date: input.date,
          timestamp: now,
          sourceId: id,
          note: 'Weekly Body Diagnostic cleared',
        });
        await putLevelHistory(
          { ...progression, ...applied },
          progression.level,
          input.date,
          id,
          now,
        );
      }

      saved = {
        id,
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        date: input.date,
        goal: input.goal,
        hunterContext: input.hunterContext?.trim().slice(0, 800) || undefined,
        sourceKinds: input.sourceKinds.slice(0, 4),
        assessment: input.assessment,
        model: input.model,
        usage: input.usage,
        rewardApplied: !rewardAlreadyExists,
        rewardXp: rewardAlreadyExists ? 0 : BALANCE.bodyDiagnostic.weeklyAccountXp,
        completedAt: now,
      };
      await db.bodyDiagnostics.put(saved);
    },
  );

  if (!saved) throw new Error('The Body Diagnostic could not be secured.');
  return { record: saved, awardedXp, levelsGained, alreadyCompleted: false };
}
