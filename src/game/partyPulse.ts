import { getCompanionForStat } from '@/config/companions';
import type {
  CompanionId,
  DailyMissionRecord,
  MissionDefinition,
  StatName,
  StatProgress,
} from '@/types/game';
import { STAT_LABELS } from '@/utils/format';

export type PartyPulseSeverity = 'watch' | 'warning' | 'critical';

export interface PartyPulseSignal {
  id: string;
  companionId: CompanionId;
  stat: StatName;
  severity: PartyPulseSeverity;
  title: string;
  message: string;
  reason: string;
  actionPath: string;
  actionLabel: string;
  neglectedDays: number;
  momentum: number;
  relatedStatCount: number;
}

const STAT_ACTIONS: Record<StatName, { path: string; label: string }> = {
  faith: { path: '/sanctuary', label: 'Enter the Sanctuary' },
  strength: { path: '/training-hall', label: 'Open the Training Hall' },
  endurance: { path: '/training-hall', label: 'Open the Training Hall' },
  discipline: { path: '/missions', label: 'Choose one directive' },
  willpower: { path: '/missions', label: 'Choose one directive' },
  wisdom: { path: '/sanctuary', label: 'Enter the Sanctuary' },
  creativity: { path: '/creator-forge', label: 'Open Creator Forge' },
  focus: { path: '/missions', label: 'Choose one directive' },
  vitality: { path: '/training-hall', label: 'Open the Training Hall' },
  character: { path: '/missions', label: 'Choose one good action' },
  empathy: { path: '/missions', label: 'Choose one connection action' },
  stewardship: { path: '/treasury', label: 'Open Treasury Command' },
};

export function selectReentryMission(missions: MissionDefinition[], records: DailyMissionRecord[]) {
  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));
  const methodWeight = (method: MissionDefinition['method']) => (method === 'toggle' ? 0 : 1);

  return records
    .filter((record) => record.status === 'pending')
    .map((record) => missionMap.get(record.missionId))
    .filter(
      (mission): mission is MissionDefinition =>
        Boolean(mission) && mission?.method !== 'day-boundary',
    )
    .sort(
      (a, b) => methodWeight(a.method) - methodWeight(b.method) || a.accountXp - b.accountXp,
    )[0];
}

function severityFor(stat: StatProgress): PartyPulseSeverity {
  if (stat.neglectedDays >= 5 || stat.momentum <= 20) return 'critical';
  if (stat.neglectedDays >= 3 || stat.momentum <= 35) return 'warning';
  return 'watch';
}

function needsAttention(stat: StatProgress) {
  return (
    stat.neglectedDays >= 2 ||
    (stat.neglectedDays >= 1 && stat.trend === 'declining' && stat.momentum <= 40)
  );
}

function specialistMessage(companionId: CompanionId, label: string, relatedCount: number) {
  const others =
    relatedCount > 1
      ? ` I see the other ${relatedCount - 1} signal${relatedCount > 2 ? 's' : ''}, too.`
      : '';
  const messages: Partial<Record<CompanionId, string>> = {
    rook: `${label} is losing ground. No punishment, no heroic comeback workout—give me one honest physical win and reestablish the line.${others}`,
    selah: `${label} has gone quiet. Do not answer that with shame; return to what is true, make a little room, and let one faithful step be enough.${others}`,
    cipher: `${label} is now a measurable execution gap. Fascinating. Choose the smallest useful action, finish it, and deprive the excuse of further funding.${others}`,
    haven: `${label} has gone off-air. No fake rebrand, no thirty-tab research spiral—open Creator Forge, move one real operation, and make the signal argue with the silence.${others}`,
    amara: `${label} is asking for a little more presence. One sincere message, one kind boundary, or one moment of listening can reopen the path.${others}`,
    cassian: `${label} is drifting. Open the record, name the next obligation, and give one resource a purpose. Clarity first; guilt contributes nothing.${others}`,
  };
  return (
    messages[companionId] ??
    `${label} needs one honest return. Start small and let proof rebuild the signal.${others}`
  );
}

function compareSignals(a: PartyPulseSignal, b: PartyPulseSignal) {
  const severity = { watch: 1, warning: 2, critical: 3 } as const;
  return (
    severity[b.severity] - severity[a.severity] ||
    b.neglectedDays - a.neglectedDays ||
    a.momentum - b.momentum ||
    a.stat.localeCompare(b.stat)
  );
}

export function getPartyPulseSignals(
  stats: StatProgress[],
  enabledCompanionIds: CompanionId[],
): PartyPulseSignal[] {
  const enabled = new Set(enabledCompanionIds);
  const attention = stats.filter(needsAttention);
  const grouped = new Map<CompanionId, StatProgress[]>();

  for (const stat of attention) {
    const companionId = getCompanionForStat(stat.id).id;
    if (!enabled.has(companionId)) continue;
    grouped.set(companionId, [...(grouped.get(companionId) ?? []), stat]);
  }

  const signals: PartyPulseSignal[] = [];
  for (const [companionId, relatedStats] of grouped) {
    const ordered = [...relatedStats].sort(
      (a, b) => b.neglectedDays - a.neglectedDays || a.momentum - b.momentum,
    );
    const primary = ordered[0];
    const label = STAT_LABELS[primary.id];
    const action = STAT_ACTIONS[primary.id];
    signals.push({
      id: `party-pulse:${companionId}:${primary.id}`,
      companionId,
      stat: primary.id,
      severity: severityFor(primary),
      title: `${label} needs a return`,
      message: specialistMessage(companionId, label, relatedStats.length),
      reason: `${label} has gone ${primary.neglectedDays} finalized day${primary.neglectedDays === 1 ? '' : 's'} without a supporting win; momentum is ${primary.momentum}%.`,
      actionPath: action.path,
      actionLabel: action.label,
      neglectedDays: primary.neglectedDays,
      momentum: primary.momentum,
      relatedStatCount: relatedStats.length,
    });
  }

  signals.sort(compareSignals);

  if (attention.length >= 4 && enabled.has('ember')) {
    const primary = [...attention].sort(
      (a, b) => b.neglectedDays - a.neglectedDays || a.momentum - b.momentum,
    )[0];
    signals.splice(Math.min(1, signals.length), 0, {
      id: 'party-pulse:ember:reentry',
      companionId: 'ember',
      stat: primary.id,
      severity: attention.length >= 7 ? 'critical' : 'warning',
      title: 'Re-entry signal detected',
      message:
        'Several paths are slipping, so we are not launching a dramatic life overhaul. Pick the easiest meaningful objective, clear it clean, and make the spiral argue with evidence.',
      reason: `${attention.length} related stats have crossed the Party Pulse attention line. This signal changes no score or reward.`,
      actionPath: '/missions',
      actionLabel: 'Choose the easiest win',
      neglectedDays: primary.neglectedDays,
      momentum: primary.momentum,
      relatedStatCount: attention.length,
    });
  }

  if (attention.length >= 7 && enabled.has('snow')) {
    signals.push({
      id: 'party-pulse:snow:whole-journey',
      companionId: 'snow',
      stat: attention[0].id,
      severity: 'critical',
      title: 'Whole-party support available',
      message:
        'A lot of the board is asking for attention, but you are not the board. We can choose one place to begin, protect your capacity, and let the rest wait its turn.',
      reason: `${attention.length} stats are asking for support. Snow is widening the response, not increasing the pressure.`,
      actionPath: '/party-chat?tab=support',
      actionLabel: 'Open direct support',
      neglectedDays: Math.max(...attention.map((stat) => stat.neglectedDays)),
      momentum: Math.min(...attention.map((stat) => stat.momentum)),
      relatedStatCount: attention.length,
    });
  }

  return signals;
}
