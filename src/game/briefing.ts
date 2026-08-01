import { db } from '@/db/database';
import type {
  DailyCapacity,
  DailyCommandBriefing,
  LocalDateKey,
  MissionDefinition,
} from '@/types/game';

const SNOW_BRIEFINGS: Record<DailyCapacity, string[]> = {
  low: [
    'Low capacity acknowledged. We are protecting the day with one meaningful priority and one gentle support option—no guilt for leaving the bonus empty.',
    'Today does not need maximum output. Let us secure one honest win, keep the rest flexible, and treat recovery as strategy.',
    'Low-power command accepted. The mission is continuity, not punishment: one main target, one kind backup, and permission to stop.',
  ],
  steady: [
    'Steady capacity confirmed. One main quest gets your clearest attention; the support quest keeps the rest of the campaign connected.',
    'We have enough room for focused progress without turning the day into a siege. Clear the main quest, then reassess honestly.',
    'Balanced operating conditions. I chose a priority, a supporting win, and one optional bonus that remains optional in every sense.',
  ],
  high: [
    'High capacity confirmed. We can press the main objective, reinforce another path, and hold one bonus in reserve—without spending tomorrow’s energy.',
    'The signal is strong today. Aim it rather than scattering it: main quest first, support quest second, bonus only while the work remains clean.',
    'Surplus energy detected. Let us turn it into finished proof and still leave enough of you for life beyond the dashboard.',
  ],
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function chooseSnowMessage(capacity: DailyCapacity, date: LocalDateKey) {
  const pool = SNOW_BRIEFINGS[capacity];
  return pool[hash(`${date}:${capacity}`) % pool.length];
}

function rankMissions(missions: MissionDefinition[], capacity: DailyCapacity) {
  return missions.slice().sort((a, b) => {
    if (capacity === 'low') {
      const recovery = Number(b.recoveryEligible) - Number(a.recoveryEligible);
      if (recovery) return recovery;
      return a.accountXp - b.accountXp;
    }
    if (capacity === 'high') return b.accountXp - a.accountXp;
    const core = Number(b.isCore) - Number(a.isCore);
    return core || b.accountXp - a.accountXp;
  });
}

export async function suggestDailyBriefing(date: LocalDateKey, capacity: DailyCapacity) {
  const [missions, records, settings] = await Promise.all([
    db.missions.filter((mission) => mission.enabled && !mission.archived).toArray(),
    db.dailyMissions.where('date').equals(date).toArray(),
    db.settings.get('primary'),
  ]);
  const unavailable = new Set(
    records
      .filter((record) => ['completed', 'excused', 'skipped'].includes(record.status))
      .map((record) => record.missionId),
  );
  const candidates = rankMissions(
    missions.filter(
      (mission) =>
        !unavailable.has(mission.id) &&
        !(
          settings?.recoveryMode.active &&
          settings.recoveryMode.disabledMissionIds.includes(mission.id)
        ),
    ),
    capacity,
  );
  const main = candidates[0];
  const support =
    candidates.find((mission) => mission.category !== main?.category) ?? candidates[1];
  const bonus = candidates.find((mission) => mission.id !== main?.id && mission.id !== support?.id);
  return {
    mainMissionId: main?.id,
    supportMissionId: support?.id,
    bonusMissionId: capacity === 'low' ? undefined : bonus?.id,
  };
}

export async function saveDailyBriefing(input: {
  date: LocalDateKey;
  capacity: DailyCapacity;
  mainMissionId?: string;
  supportMissionId?: string;
  bonusMissionId?: string;
}) {
  const now = new Date().toISOString();
  const previous = await db.dailyBriefings.get(input.date);
  const briefing: DailyCommandBriefing = {
    id: input.date,
    date: input.date,
    capacity: input.capacity,
    status: 'planned',
    mainMissionId: input.mainMissionId,
    supportMissionId: input.supportMissionId,
    bonusMissionId: input.capacity === 'low' ? undefined : input.bonusMissionId,
    snowMessage: chooseSnowMessage(input.capacity, input.date),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  await db.dailyBriefings.put(briefing);
  return briefing;
}

export async function createSuggestedDailyBriefing(date: LocalDateKey, capacity: DailyCapacity) {
  return saveDailyBriefing({ date, capacity, ...(await suggestDailyBriefing(date, capacity)) });
}

export async function skipDailyBriefing(date: LocalDateKey) {
  const now = new Date().toISOString();
  const previous = await db.dailyBriefings.get(date);
  const briefing: DailyCommandBriefing = {
    id: date,
    date,
    capacity: previous?.capacity ?? 'steady',
    status: 'skipped',
    snowMessage:
      'Briefing skipped. No penalty, no hidden score change. The channel stays open if you want to plan later.',
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  await db.dailyBriefings.put(briefing);
  return briefing;
}

export async function reopenDailyBriefing(date: LocalDateKey) {
  await db.dailyBriefings.delete(date);
}
