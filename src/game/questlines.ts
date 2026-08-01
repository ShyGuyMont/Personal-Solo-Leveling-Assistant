import { getQuestline } from '@/config/questlines';
import { db } from '@/db/database';
import { putLevelHistory } from '@/game/engine';
import { applyAccountXp } from '@/game/xp';
import { getSystemDateKey } from '@/utils/date';
import { stableId } from '@/utils/id';
import type {
  CompanionQuestProgress,
  LocalDateKey,
  QuestChapterDefinition,
  QuestObjectiveDefinition,
} from '@/types/game';

export interface QuestObjectiveState {
  definition: QuestObjectiveDefinition;
  current: number;
  completed: boolean;
  manualRecord?: CompanionQuestProgress['objectiveRecords'][number];
}

export interface QuestProgressView {
  progress: CompanionQuestProgress;
  chapter?: QuestChapterDefinition;
  objectives: QuestObjectiveState[];
  canCompleteChapter: boolean;
}

function systemDateFromSettings(): Promise<LocalDateKey> {
  return db.settings
    .get('primary')
    .then((settings) =>
      settings
        ? getSystemDateKey(new Date(), settings.resetTime, settings.timeZone)
        : (new Date().toISOString().slice(0, 10) as LocalDateKey),
    );
}

async function currentForObjective(
  objective: QuestObjectiveDefinition,
  progress: CompanionQuestProgress,
) {
  const manualRecord = progress.objectiveRecords.find(
    (record) => record.objectiveId === objective.id,
  );
  if (objective.metric === 'manual') return manualRecord ? 1 : 0;

  const baseline = progress.objectiveProgress?.[objective.id] ?? 0;
  if (progress.status === 'paused') return baseline;

  const since = progress.chapterStartedAt;
  if (objective.metric === 'party-check-ins') {
    return baseline + (await db.partyCheckIns.filter((item) => item.createdAt >= since).count());
  }
  if (objective.metric === 'arc-milestones') {
    return (
      baseline +
      (await db.arcMilestones
        .filter((item) => Boolean(item.completedAt && item.completedAt >= since))
        .count())
    );
  }

  if (objective.metric === 'daily-reviews' || objective.metric === 'perfect-days') {
    const reviews = await db.dailyReviews
      .filter(
        (review) =>
          review.status === 'finalized' &&
          Boolean(review.finalizedAt && review.finalizedAt >= since),
      )
      .toArray();
    return (
      baseline +
      (objective.metric === 'perfect-days'
        ? reviews.filter((review) => review.perfectDay).length
        : reviews.length)
    );
  }

  if (objective.metric === 'treasury-weekly-reviews') {
    return (
      baseline +
      (await db.treasuryWeeks
        .filter(
          (week) =>
            week.status === 'reviewed' && Boolean(week.reviewedAt && week.reviewedAt >= since),
        )
        .count())
    );
  }
  if (objective.metric === 'no-eating-out-wins') {
    return (
      baseline +
      (await db.treasuryChallenges
        .filter(
          (challenge) =>
            challenge.status === 'passed' &&
            Boolean(challenge.resolvedAt && challenge.resolvedAt >= since),
        )
        .count())
    );
  }
  const treasuryKind = {
    'treasury-income': 'income',
    'treasury-expenses': 'expense',
    'treasury-bills-paid': 'bill-payment',
    'treasury-debt-payments': 'debt-payment',
    'treasury-savings': 'savings',
  } as const;
  if (objective.metric in treasuryKind) {
    const kind = treasuryKind[objective.metric as keyof typeof treasuryKind];
    return (
      baseline +
      (await db.treasuryTransactions
        .filter((transaction) => transaction.kind === kind && transaction.createdAt >= since)
        .count())
    );
  }

  const [records, missions] = await Promise.all([
    db.dailyMissions
      .filter(
        (record) =>
          record.status === 'completed' &&
          Boolean(record.completedAt && record.completedAt >= since),
      )
      .toArray(),
    db.missions.toArray(),
  ]);
  const categoryByMission = new Map(missions.map((mission) => [mission.id, mission.category]));
  const filtered = records.filter((record) => {
    if (objective.missionIds?.length && !objective.missionIds.includes(record.missionId)) {
      return false;
    }
    if (objective.category && categoryByMission.get(record.missionId) !== objective.category) {
      return false;
    }
    return true;
  });
  if (objective.metric === 'completed-days') {
    return baseline + new Set(filtered.map((record) => record.date)).size;
  }
  return baseline + filtered.length;
}

export async function getQuestProgressView(
  progress: CompanionQuestProgress,
): Promise<QuestProgressView> {
  const definition = getQuestline(progress.questlineId);
  const chapter = definition?.chapters[progress.currentChapterIndex];
  if (!chapter) return { progress, chapter, objectives: [], canCompleteChapter: false };
  const objectives = await Promise.all(
    chapter.objectives.map(async (objective) => {
      const current = await currentForObjective(objective, progress);
      return {
        definition: objective,
        current: Math.min(current, objective.target),
        completed: current >= objective.target,
        manualRecord: progress.objectiveRecords.find(
          (record) => record.objectiveId === objective.id,
        ),
      };
    }),
  );
  return {
    progress,
    chapter,
    objectives,
    canCompleteChapter: objectives.length > 0 && objectives.every((item) => item.completed),
  };
}

export async function getAllQuestProgress() {
  return db.companionQuestProgress.toArray();
}

async function getActivePauseSnapshots(exceptId: string) {
  const active = (
    await db.companionQuestProgress.where('status').equals('active').toArray()
  ).filter((item) => item.id !== exceptId);
  return Promise.all(
    active.map(async (item) => {
      const view = await getQuestProgressView(item);
      return {
        id: item.id,
        objectiveProgress: Object.fromEntries(
          view.objectives.map((objective) => [objective.definition.id, objective.current]),
        ),
      };
    }),
  );
}

export async function startQuestline(questlineId: string) {
  const questline = getQuestline(questlineId);
  if (!questline) throw new Error('That companion questline could not be found.');
  const now = new Date().toISOString();
  const id = questline.id;
  const existing = await db.companionQuestProgress.get(id);
  if (existing?.status === 'completed' || existing?.status === 'active') return existing;
  const pauseSnapshots = await getActivePauseSnapshots(id);
  await db.transaction('rw', db.companionQuestProgress, async () => {
    await Promise.all(
      pauseSnapshots.map((item) =>
        db.companionQuestProgress.update(item.id, {
          status: 'paused',
          pausedAt: now,
          chapterStartedAt: now,
          objectiveProgress: item.objectiveProgress,
        }),
      ),
    );
    if (existing) {
      await db.companionQuestProgress.update(id, {
        status: 'active',
        chapterStartedAt: now,
        pausedAt: undefined,
      });
    } else {
      await db.companionQuestProgress.put({
        id,
        questlineId,
        companionId: questline.companionId,
        status: 'active',
        currentChapterIndex: 0,
        startedAt: now,
        chapterStartedAt: now,
        objectiveRecords: [],
        completedChapterIds: [],
        objectiveProgress: {},
      });
    }
  });
  return db.companionQuestProgress.get(id);
}

export async function pauseQuestline(id: string) {
  const progress = await db.companionQuestProgress.get(id);
  if (!progress || progress.status !== 'active') return;
  const view = await getQuestProgressView(progress);
  const now = new Date().toISOString();
  await db.companionQuestProgress.update(id, {
    status: 'paused',
    pausedAt: now,
    chapterStartedAt: now,
    objectiveProgress: Object.fromEntries(
      view.objectives.map((objective) => [objective.definition.id, objective.current]),
    ),
  });
}

export async function resumeQuestline(id: string) {
  const progress = await db.companionQuestProgress.get(id);
  if (!progress || progress.status === 'completed') return progress;
  const now = new Date().toISOString();
  const pauseSnapshots = await getActivePauseSnapshots(id);
  await db.transaction('rw', db.companionQuestProgress, async () => {
    await Promise.all(
      pauseSnapshots.map((item) =>
        db.companionQuestProgress.update(item.id, {
          status: 'paused',
          pausedAt: now,
          chapterStartedAt: now,
          objectiveProgress: item.objectiveProgress,
        }),
      ),
    );
    await db.companionQuestProgress.update(id, {
      status: 'active',
      chapterStartedAt: now,
      pausedAt: undefined,
    });
  });
  return db.companionQuestProgress.get(id);
}

export async function completeManualQuestObjective(
  progressId: string,
  objectiveId: string,
  note: string,
) {
  const progress = await db.companionQuestProgress.get(progressId);
  if (!progress) throw new Error('Quest progress could not be found.');
  if (progress.status !== 'active')
    throw new Error('Resume this questline before completing its chapter.');
  const questline = getQuestline(progress.questlineId);
  const chapter = questline?.chapters[progress.currentChapterIndex];
  const objective = chapter?.objectives.find((item) => item.id === objectiveId);
  if (!objective || objective.metric !== 'manual') {
    throw new Error('That reflection is not available in the current chapter.');
  }
  const record = { objectiveId, completedAt: new Date().toISOString(), note: note.trim() };
  await db.companionQuestProgress.update(progressId, {
    objectiveRecords: [
      ...progress.objectiveRecords.filter((item) => item.objectiveId !== objectiveId),
      record,
    ],
  });
}

export async function reopenManualQuestObjective(progressId: string, objectiveId: string) {
  const progress = await db.companionQuestProgress.get(progressId);
  if (!progress) return;
  await db.companionQuestProgress.update(progressId, {
    objectiveRecords: progress.objectiveRecords.filter((item) => item.objectiveId !== objectiveId),
  });
}

export async function completeQuestChapter(progressId: string) {
  const progress = await db.companionQuestProgress.get(progressId);
  if (!progress) throw new Error('Quest progress could not be found.');
  if (progress.status !== 'active')
    throw new Error('Resume this questline before completing its chapter.');
  const questline = getQuestline(progress.questlineId);
  const chapter = questline?.chapters[progress.currentChapterIndex];
  if (!questline || !chapter) throw new Error('The current chapter could not be found.');
  if (progress.completedChapterIds.includes(chapter.id)) return progress;
  const view = await getQuestProgressView(progress);
  if (!view.canCompleteChapter) throw new Error('Complete every chapter objective first.');

  const rewardId = stableId('companion-quest', progress.id, chapter.id);
  const now = new Date().toISOString();
  const systemDate = await systemDateFromSettings();
  const finalChapter = progress.currentChapterIndex === questline.chapters.length - 1;
  await db.transaction(
    'rw',
    [
      db.companionQuestProgress,
      db.progression,
      db.xpTransactions,
      db.levelHistory,
      db.progressionEvents,
      db.titles,
      db.auditEntries,
    ],
    async () => {
      if (!(await db.xpTransactions.get(rewardId))) {
        const progression = await db.progression.get('primary');
        if (!progression) throw new Error('Progression data is unavailable.');
        const next = applyAccountXp(progression.totalXp, chapter.rewardXp);
        const nextProgression = {
          ...progression,
          ...next,
          lastLevelUpAt: next.level > progression.level ? now : progression.lastLevelUpAt,
          recentLevelUp: next.level > progression.level,
        };
        await db.progression.put(nextProgression);
        await db.xpTransactions.put({
          id: rewardId,
          kind: 'companion-quest',
          amount: chapter.rewardXp,
          date: systemDate,
          timestamp: now,
          sourceId: chapter.id,
          note: `${questline.title}: ${chapter.title}`,
        });
        await putLevelHistory(nextProgression, progression.level, systemDate, rewardId, now);
      }

      const nextCompleted = [...progress.completedChapterIds, chapter.id];
      await db.companionQuestProgress.put({
        ...progress,
        status: finalChapter ? 'completed' : progress.status,
        currentChapterIndex: finalChapter
          ? progress.currentChapterIndex
          : progress.currentChapterIndex + 1,
        chapterStartedAt: now,
        completedAt: finalChapter ? now : undefined,
        completedChapterIds: nextCompleted,
        objectiveProgress: {},
      });

      if (finalChapter && !(await db.titles.get(questline.completionTitleId))) {
        await db.titles.put({
          id: questline.completionTitleId,
          titleId: questline.completionTitleId,
          unlockedAt: now,
          sourceId: rewardId,
        });
      }
      await db.progressionEvents.put({
        id: stableId('progression-event', 'questline', chapter.id),
        kind: 'questline',
        createdAt: now,
        headline: finalChapter
          ? `${questline.title.toUpperCase()} COMPLETE`
          : `CHAPTER ${chapter.number} COMPLETE`,
        detail: finalChapter
          ? `${questline.title} has been completed. A unique title has been unlocked.`
          : `${chapter.title} cleared. ${chapter.rewardXp} XP secured.`,
        acknowledged: false,
      });
      await db.auditEntries.put({
        id: stableId('audit', 'questline', chapter.id),
        timestamp: now,
        action: 'companion-quest-chapter-completed',
        targetId: chapter.id,
        note: `${questline.title}: chapter ${chapter.number} completed.`,
      });
    },
  );
  return db.companionQuestProgress.get(progressId);
}
