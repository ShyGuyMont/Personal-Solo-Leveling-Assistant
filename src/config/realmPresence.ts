import type { SystemRealm } from '@/game/systemExperience';

interface RealmPresence {
  signal: string;
  message: string;
  actionLabel: string;
  actionPath: string;
}

export const REALM_PRESENCE: Record<SystemRealm, RealmPresence> = {
  system: {
    signal: 'Constant link established',
    message:
      'I am here. We do not need to conquer the entire day at once—only choose the next honest move.',
    actionLabel: 'Open Party Channel',
    actionPath: '/party-chat',
  },
  training: {
    signal: 'Vanguard channel locked',
    message:
      'The Hall is listening. Choose the deployment that fits the body you brought today, then make it count.',
    actionLabel: 'Enter Training Hall',
    actionPath: '/training-hall',
  },
  sanctuary: {
    signal: 'Beacon channel illuminated',
    message:
      'Bring the unedited version of what you are carrying. We can meet it with truth, patience, and prayer.',
    actionLabel: 'Enter Sanctuary',
    actionPath: '/sanctuary',
  },
  kitchen: {
    signal: 'Flame channel preheated',
    message:
      'Before hunger starts issuing terrible commands, let us put something real, satisfying, and repeatable on the table.',
    actionLabel: 'Open Provision Command',
    actionPath: '/kitchen',
  },
  treasury: {
    signal: 'Steward channel secured',
    message:
      'The ledger is information, not judgment. One honest number gives us something solid to command.',
    actionLabel: 'Open the Ledger',
    actionPath: '/treasury',
  },
  creator: {
    signal: 'Spotlight channel live',
    message:
      'Greenroom is open. Give me the audience, the promise, and the smallest production move that makes this idea visible.',
    actionLabel: 'Open Creator Forge',
    actionPath: '/creator-forge',
  },
  party: {
    signal: 'All companion links available',
    message:
      'This is the room where you do not have to perform strength. Check in honestly, and let the party meet you there.',
    actionLabel: 'Begin Check-In',
    actionPath: '/party-chat',
  },
  campaign: {
    signal: 'Strategist channel synchronized',
    message:
      'A distant objective becomes real when it has a next milestone. Let us convert the signal into movement.',
    actionLabel: 'Open Campaign Command',
    actionPath: '/campaigns',
  },
  archive: {
    signal: 'Constant archive link secured',
    message:
      'The record is here to reveal your path, not trap you inside yesterday. Study it, then return to the present.',
    actionLabel: 'Review the Archive',
    actionPath: '/archive',
  },
  progression: {
    signal: 'Ascension channel resonating',
    message:
      'The numbers are evidence, not your worth. We honor the growth they reveal and keep becoming beyond them.',
    actionLabel: 'View Ascension Path',
    actionPath: '/status',
  },
};
