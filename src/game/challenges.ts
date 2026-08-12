import { getChallengeTemplate } from '@/config/challenges';
import { addDays, dateRange, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from '@/utils/date';
import type {
  ChallengeProgress,
  ChallengeTemplate,
  DailyMissionRecord,
  DailyReview,
  LocalDateKey,
  MissionDefinition,
} from '@/types/game';

function completed(records: DailyMissionRecord[]) {
  return records.filter((record) => record.status === 'completed');
}

export function calculateChallengeCurrent(
  challenge: ChallengeTemplate,
  records: DailyMissionRecord[],
  reviews: DailyReview[],
  missions: MissionDefinition[],
) {
  const windowRecords = records;
  const done = completed(windowRecords);
  const requirement = challenge.requirement;
  switch (requirement.metric) {
    case 'mission-count':
      return done.filter(
        (record) =>
          !requirement.missionIds?.length || requirement.missionIds.includes(record.missionId),
      ).length;
    case 'category-count': {
      const missionIds = new Set(
        missions
          .filter((mission) => mission.category === requirement.category)
          .map((mission) => mission.id),
      );
      return done.filter((record) => missionIds.has(record.missionId)).length;
    }
    case 'completion-rate': {
      const active = windowRecords.filter((record) => record.status !== 'skipped');
      return active.length ? Math.round((done.length / active.length) * 100) : 0;
    }
    case 'perfect-days':
      return reviews.filter((review) => review.perfectDay || review.protectedPerfectDay).length;
    case 'paired-days': {
      const ids = requirement.missionIds ?? [];
      return dateRange(
        windowRecords[0]?.date ?? ('1970-01-01' as LocalDateKey),
        windowRecords.at(-1)?.date ?? ('1970-01-01' as LocalDateKey),
      ).filter((date) => {
        const dayIds = new Set(
          done.filter((record) => record.date === date).map((record) => record.missionId),
        );
        if (ids.length === 2) return ids.every((id) => dayIds.has(id));
        const hasFaith = dayIds.has('prayer') || dayIds.has('bible');
        const hasPhysical = dayIds.has('movement') || dayIds.has('workout');
        return hasFaith && hasPhysical;
      }).length;
    }
    case 'recovery':
      return reviews.some((review, index) => {
        const previous = reviews[index - 1];
        return previous && previous.completionRate < 1 && review.perfectDay;
      })
        ? 1
        : 0;
    case 'balanced-thresholds': {
      const threshold = requirement.secondaryTarget ?? 1;
      if (requirement.groups?.length) {
        return requirement.groups.filter(
          (group) =>
            done.filter((record) => group.missionIds.includes(record.missionId)).length >=
            group.target,
        ).length;
      }
      if (requirement.missionIds?.length) {
        return requirement.missionIds.filter(
          (id) => done.filter((record) => record.missionId === id).length >= threshold,
        ).length;
      }
      const categories = ['faith', 'discipline', 'physical', 'creator', 'character'] as const;
      return categories.filter((category) => {
        const ids = new Set(
          missions.filter((mission) => mission.category === category).map((mission) => mission.id),
        );
        return done.filter((record) => ids.has(record.missionId)).length >= threshold;
      }).length;
    }
    case 'trial-days':
      return reviews.filter(
        (review) =>
          review.perfectDay ||
          review.protectedPerfectDay ||
          review.completionRate >= (requirement.minimumRate ?? 1),
      ).length;
    default:
      return 0;
  }
}

export function challengeWindow(
  kind: ChallengeTemplate['kind'],
  systemDate: LocalDateKey,
  weekStartsOn: number,
  durationDays: number,
) {
  if (kind === 'weekly') {
    return {
      start: startOfWeek(systemDate, weekStartsOn),
      end: endOfWeek(systemDate, weekStartsOn),
    };
  }
  if (kind === 'monthly') {
    return { start: startOfMonth(systemDate), end: endOfMonth(systemDate) };
  }
  return { start: systemDate, end: addDays(systemDate, durationDays - 1) };
}

export function chooseRotatingChallenge(
  templates: ChallengeTemplate[],
  key: string,
  recentTemplateIds: string[],
  difficultyCeiling: ChallengeTemplate['difficulty'] = 'III',
) {
  const tier = Number.parseInt(difficultyCeiling, 10);
  const eligible = templates.filter(
    (item) => !recentTemplateIds.includes(item.id) && Number.parseInt(item.difficulty, 10) <= tier,
  );
  const pool = eligible.length ? eligible : templates;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length];
}

export function createChallengeProgress(
  template: ChallengeTemplate,
  systemDate: LocalDateKey,
  weekStartsOn: number,
  status: ChallengeProgress['status'] = 'active',
): ChallengeProgress {
  const window = challengeWindow(template.kind, systemDate, weekStartsOn, template.durationDays);
  return {
    id: `${template.kind}:${window.start}:${template.id}`,
    templateId: template.id,
    kind: template.kind,
    startedAt: window.start,
    endsAt: window.end,
    status,
    current: 0,
    target: template.requirement.target,
    milestoneReached: 0,
    protectedExceptionsUsed: 0,
    rewardApplied: false,
  };
}

export function challengeRatio(progress: ChallengeProgress) {
  return Math.min(1, progress.current / Math.max(progress.target, 1));
}

export function hydrateChallenge(progress: ChallengeProgress) {
  return { progress, template: getChallengeTemplate(progress.templateId) };
}
