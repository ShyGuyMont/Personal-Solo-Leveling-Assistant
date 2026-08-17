import type {
  AiConversationAudience,
  CompanionId,
  DailyMissionRecord,
  MissionDefinition,
} from '@/types/game';
import { missionAccountXp } from '@/game/rewards';
import type { AppRoutePath } from '@/routeModules';

const PARTY_NAMES = new Set(['everyone', 'everybody', 'party', 'council', 'all']);
const COMPANION_ALIASES: Record<string, CompanionId> = {
  snow: 'snow',
  rook: 'rook',
  selah: 'selah',
  cipher: 'cipher',
  haven: 'haven',
  vesper: 'haven',
  ember: 'ember',
  mira: 'mira',
  amara: 'amara',
  cassian: 'cassian',
  saffron: 'saffron',
  quill: 'quill',
  kairo: 'kairo',
};

export interface AddressedQuickLink {
  audience: AiConversationAudience;
  message: string;
  explicitlyAddressed: boolean;
  companionIds?: CompanionId[];
}

export interface PartyMembershipCommand {
  action: 'add' | 'remove' | 'only' | 'all';
  companionIds: CompanionId[];
}

export interface QuickNavigationCommand {
  route: AppRoutePath;
  label: string;
}

export type QuickLinkTransmissionIntent = 'message' | 'confirmed-handoff';

export interface QuickLinkTransmissionLock {
  current: boolean;
}

export function canBeginQuickLinkTransmission(
  pending: { hasCommand: boolean; hasHandoff: boolean },
  intent: QuickLinkTransmissionIntent = 'message',
) {
  if (pending.hasCommand) return false;
  return !pending.hasHandoff || intent === 'confirmed-handoff';
}

export function acquireQuickLinkTransmission(lock: QuickLinkTransmissionLock) {
  if (lock.current) return false;
  lock.current = true;
  return true;
}

export function releaseQuickLinkTransmission(lock: QuickLinkTransmissionLock) {
  lock.current = false;
}

export type QuickLinkActionKind =
  'complete_mission' | 'skip_mission' | 'fail_mission' | 'reopen_mission' | 'restore_mission';

export interface QuickLinkAction {
  actionId: string;
  kind: QuickLinkActionKind;
  missionId: string;
  missionName: string;
  label: string;
  description: string;
  impact: string;
  confirmation: string;
}

const ROUTES: Array<QuickNavigationCommand & { patterns: RegExp[] }> = [
  {
    route: '/cipher-library',
    label: 'Cipher Engineering Library',
    patterns: [
      /\bcipher(?:'s)? library\b/i,
      /\bengineering library\b/i,
      /\btechnical library\b/i,
      /\bengineering codex\b/i,
    ],
  },
  {
    route: '/system-debrief',
    label: 'System Evolution Council',
    patterns: [
      /\bsystem debrief\b/i,
      /\bevolution council\b/i,
      /\bself improvement report\b/i,
      /\bdevelopment report\b/i,
    ],
  },
  {
    route: '/calendar',
    label: 'Calendar Command',
    patterns: [/\bcalendar\b/i, /\bschedule\b/i, /\bagenda\b/i],
  },
  {
    route: '/training-hall',
    label: 'Training Hall',
    patterns: [/\btraining hall\b/i, /\bgym\b/i, /\btraining\b/i, /\bworkout\b/i],
  },
  {
    route: '/sanctuary',
    label: 'Scripture Sanctuary',
    patterns: [/\bscripture sanctuary\b/i, /\bsanctuary\b/i, /\bbible study\b/i],
  },
  { route: '/kitchen', label: 'Kitchen', patterns: [/\bkitchen\b/i, /\brecipes?\b/i] },
  {
    route: '/treasury',
    label: 'Treasury Command',
    patterns: [/\btreasury\b/i, /\bbudget\b/i, /\bfinances?\b/i],
  },
  {
    route: '/creator-forge',
    label: 'Creator Forge',
    patterns: [/\bcreator forge\b/i, /\bgreenroom\b/i, /\bcontent board\b/i, /\byoutube studio\b/i],
  },
  {
    route: '/arc-archives',
    label: 'A.R.C. Archives',
    patterns: [
      /\ba\.?r\.?c\.? archives?\b/i,
      /\bcharacter archives?\b/i,
      /\bdossier forge\b/i,
      /\barts codex\b/i,
    ],
  },
  { route: '/missions', label: 'Missions', patterns: [/\bmissions?\b/i, /\bquests?\b/i] },
  {
    route: '/status',
    label: 'Status',
    patterns: [/\bstatus\b/i, /\bmy stats?\b/i, /\bclass progress\b/i],
  },
  {
    route: '/challenges',
    label: 'Challenges',
    patterns: [/\bchallenges?\b/i, /\bboss challenges?\b/i],
  },
  {
    route: '/campaigns',
    label: 'Campaign Command',
    patterns: [/\bcampaigns?\b/i, /\bstory arcs?\b/i],
  },
  {
    route: '/archive',
    label: 'Archive',
    patterns: [/\barchive\b/i, /\bbackups?\b/i, /\bsave data\b/i],
  },
  {
    route: '/settings',
    label: 'Settings',
    patterns: [/\bsettings\b/i, /\bpreferences\b/i],
  },
  {
    route: '/update-center',
    label: 'Update Center',
    patterns: [/\bupdate center\b/i, /\bupdates?\b/i],
  },
  {
    route: '/headquarters',
    label: 'Headquarters',
    patterns: [/\bheadquarters\b/i, /\bai hq\b/i, /\bparty hq\b/i],
  },
  {
    route: '/',
    label: 'System Home',
    patterns: [/\bsystem home\b/i, /\bhome screen\b/i, /\bdashboard\b/i, /^home$/i],
  },
];

const NAVIGATION_INTENT =
  /\b(?:take|bring|send|lead|navigate)\s+me\b|\b(?:open|enter|visit|show me|pull up|go to|head to|switch to)\b/i;

const CALENDAR_CHANGE_INTENT =
  /\b(?:add|create|schedule|book|put|block|reserve|set\s+(?:up|aside)|move|change|update|reschedule|cancel|remove|delete|remind)\b/i;
const CALENDAR_SUBJECT =
  /\b(?:calendar|schedule|agenda|appointment|meeting|event|reminder|time\s+block|deadline|check[ -]?in|review\s+session|recurring)\b/i;
const CALENDAR_TIME =
  /\b(?:today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|daily|weekly|monthly|every\s+(?:day|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:this|next)\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|at\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?|on\s+(?:the\s+)?\d{1,2}(?:st|nd|rd|th)?)\b/i;
const CALENDAR_READ_INTENT =
  /^\s*(?:what(?:'s|\s+is|\s+does)|how(?:'s|\s+is)|when\s+is|do\s+i\s+have)\b/i;

export function isCalendarCouncilRequest(message: string) {
  const normalized = message.trim();
  if (CALENDAR_READ_INTENT.test(normalized)) return false;
  return (
    Boolean(normalized) &&
    CALENDAR_CHANGE_INTENT.test(normalized) &&
    (CALENDAR_SUBJECT.test(normalized) || CALENDAR_TIME.test(normalized))
  );
}

export function parseQuickLinkAddress(
  input: string,
  fallback: AiConversationAudience = 'snow',
): AddressedQuickLink {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^\s*(?:hey\s+)?([a-z]+)(?:\s+(?:and|&|plus)\s+([a-z]+))?\s*[,.:!-]?\s*(.*)$/i,
  );
  if (!match) return { audience: fallback, message: trimmed, explicitlyAddressed: false };

  const first = match[1].toLowerCase();
  const second = match[2]?.toLowerCase();
  if (first === 'all' && !/^\s*(?:hey\s+)?all\s*[,.:!-]/i.test(trimmed)) {
    return { audience: fallback, message: trimmed, explicitlyAddressed: false };
  }
  const firstCompanion = COMPANION_ALIASES[first];
  const secondCompanion = second ? COMPANION_ALIASES[second] : undefined;
  const isCompanion = Boolean(firstCompanion);
  const isParty = PARTY_NAMES.has(first) || Boolean(secondCompanion);
  if (!isCompanion && !isParty) {
    return { audience: fallback, message: trimmed, explicitlyAddressed: false };
  }

  return {
    audience: isParty ? 'party' : firstCompanion,
    message: match[3].trim() || trimmed,
    explicitlyAddressed: true,
    ...(secondCompanion
      ? { companionIds: [firstCompanion, secondCompanion].filter(Boolean) as CompanionId[] }
      : {}),
  };
}

function companionIdsNamedIn(value: string) {
  const normalized = value.toLowerCase();
  const ids: CompanionId[] = [];
  for (const [alias, companionId] of Object.entries(COMPANION_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, 'i').test(normalized) && !ids.includes(companionId)) {
      ids.push(companionId);
    }
  }
  return ids;
}

export function parsePartyMembershipCommand(message: string): PartyMembershipCommand | undefined {
  const normalized = message.trim();
  if (!normalized) return undefined;
  if (
    /\b(?:bring|add|invite|call|loop|pull)\b.{0,32}\b(?:everyone|everybody|the\s+(?:whole\s+)?party)\b|\b(?:everyone|everybody)\b.{0,24}\b(?:join|in(?:to)?\s+(?:the\s+)?chat)\b/i.test(
      normalized,
    )
  ) {
    return { action: 'all', companionIds: [] };
  }

  const companionIds = companionIdsNamedIn(normalized);
  if (!companionIds.length) return undefined;
  if (
    /\b(?:everyone|everybody|all(?:\s+of\s+you)?)\b.{0,28}\b(?:out|leave|go)\b.{0,20}\bexcept\b|\b(?:keep|leave)\b.{0,16}\bonly\b/i.test(
      normalized,
    )
  ) {
    return { action: 'only', companionIds };
  }
  if (
    /\b(?:remove|dismiss|drop|release)\b|\bsend\b.{0,32}\b(?:out|away)\b|\b(?:leave|exit)\b.{0,24}\b(?:chat|conversation|commons|council)\b/i.test(
      normalized,
    )
  ) {
    return { action: 'remove', companionIds };
  }
  if (
    /\b(?:add|bring|invite|call|loop|pull)\b.{0,48}\b(?:chat|conversation|commons|council|in|here|join)?\b|\b(?:join|bring)\b.{0,32}\b(?:us|chat|conversation)\b/i.test(
      normalized,
    )
  ) {
    return { action: 'add', companionIds };
  }
  return undefined;
}

export function parseQuickNavigationCommand(message: string): QuickNavigationCommand | undefined {
  if (!NAVIGATION_INTENT.test(message)) return undefined;
  const matched = ROUTES.find((candidate) =>
    candidate.patterns.some((pattern) => pattern.test(message)),
  );
  return matched ? { route: matched.route, label: matched.label } : undefined;
}

export function navigationAcknowledgement(companionId: CompanionId, destination: string) {
  const acknowledgements: Record<CompanionId, string> = {
    kairo: `${destination}. The route is clear; opening it now.`,
    snow: `${destination}. Yeah, I’ve got you—opening it now.`,
    rook: `${destination}. Good. We’re moving.`,
    selah: `${destination}. I’ll meet you there.`,
    cipher: `${destination} located. Routing you there now.`,
    haven: `${destination}? Oh, we are moving. Opening the channel now.`,
    ember: `${destination}. Finally. Move.`,
    mira: `${destination}. Easy transition. I’m taking you there now.`,
    amara: `${destination}. Come on, we’ll head there together.`,
    cassian: `${destination}. Opening the correct command channel now.`,
    saffron: `${destination}. Yes, yes—come on. I’m opening it.`,
    quill: `${destination}? Oh, that is absolutely my door. Opening the archive now!`,
  };
  return acknowledgements[companionId];
}

export function buildQuickLinkActionCatalog(
  missions: MissionDefinition[],
  records: DailyMissionRecord[],
): QuickLinkAction[] {
  const missionById = new Map(
    missions
      .filter((mission) => mission.enabled && !mission.archived)
      .map((mission) => [mission.id, mission]),
  );
  const actions: QuickLinkAction[] = [];

  for (const record of records) {
    const mission = missionById.get(record.missionId);
    if (!mission) continue;
    const prefix = `mission:${mission.id}`;

    if (record.status === 'pending') {
      if (mission.method === 'toggle' && mission.id !== 'workout' && mission.id !== 'bible') {
        actions.push({
          actionId: `${prefix}:complete`,
          kind: 'complete_mission',
          missionId: mission.id,
          missionName: mission.name,
          label: `Complete ${mission.name}`,
          description: `Record ${mission.name} as completed today.`,
          impact: `Awards ${missionAccountXp(mission)} account XP plus its amplified stat rewards.`,
          confirmation: `Confirm that ${mission.name} is honestly complete.`,
        });
      }
      actions.push(
        {
          actionId: `${prefix}:skip`,
          kind: 'skip_mission',
          missionId: mission.id,
          missionName: mission.name,
          label: `Skip ${mission.name}`,
          description: `Record ${mission.name} as skipped today.`,
          impact:
            'No completion rewards are granted. The status remains visible in the daily record.',
          confirmation: `Confirm that ${mission.name} should be marked skipped.`,
        },
        {
          actionId: `${prefix}:fail`,
          kind: 'fail_mission',
          missionId: mission.id,
          missionName: mission.name,
          label: `Fail ${mission.name}`,
          description: `Record ${mission.name} as failed today.`,
          impact:
            'No completion rewards are granted. The failure remains visible in the daily record.',
          confirmation: `Confirm that ${mission.name} should be marked failed.`,
        },
      );
    } else if (record.status === 'completed') {
      actions.push({
        actionId: `${prefix}:reopen`,
        kind: 'reopen_mission',
        missionId: mission.id,
        missionName: mission.name,
        label: `Reopen ${mission.name}`,
        description: `Return ${mission.name} to pending.`,
        impact: 'Reverses the mission XP and stat rewards that were previously granted.',
        confirmation: `Confirm that ${mission.name} should be reopened and its rewards reversed.`,
      });
    } else {
      actions.push({
        actionId: `${prefix}:restore`,
        kind: 'restore_mission',
        missionId: mission.id,
        missionName: mission.name,
        label: `Restore ${mission.name}`,
        description: `Return ${mission.name} from ${record.status} to pending.`,
        impact: 'The mission becomes available again today. No rewards are granted by this change.',
        confirmation: `Confirm that ${mission.name} should return to pending.`,
      });
    }
  }

  return actions;
}

export function commandSuccessAcknowledgement(companionId: CompanionId, action: QuickLinkAction) {
  const acknowledgements: Record<CompanionId, string> = {
    kairo: `${action.missionName} is synchronized. Confirmed record, exact time, no hidden edits.`,
    snow: `${action.missionName} is updated. Clean, confirmed, and actually in the record now.`,
    rook: `${action.missionName} updated. That one is real now—not talk.`,
    selah: `${action.missionName} has been updated. Honest record, clear next step.`,
    cipher: `${action.missionName} synchronized. The local record now reflects your confirmation.`,
    haven: `${action.missionName} is updated. No hidden changes—only what you confirmed.`,
    ember: `${action.missionName} updated. Good. The System heard you.`,
    mira: `${action.missionName} is updated. One deliberate change, fully settled.`,
    amara: `${action.missionName} is updated. Your word, your record, your decision.`,
    cassian: `${action.missionName} updated. Confirmed entry; no mystery math.`,
    saffron: `${action.missionName} updated! Finally—an order actually confirmed before somebody touched the ledger.`,
    quill: `${action.missionName} updated. Confirmed canon for today’s record—no stealth revisions, no ambiguity.`,
  };
  return acknowledgements[companionId];
}
