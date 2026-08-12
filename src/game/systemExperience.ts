import type { CompanionId, SystemState } from '@/types/game';

export type SystemRealm =
  | 'system'
  | 'training'
  | 'sanctuary'
  | 'kitchen'
  | 'treasury'
  | 'creator'
  | 'party'
  | 'campaign'
  | 'archive'
  | 'progression';

export type SystemCycle = 'dawn' | 'day' | 'dusk' | 'night';

export interface SystemStateInput {
  online: boolean;
  recoveryActive: boolean;
  trialActive: boolean;
  classQualified: boolean;
  recentAscension: boolean;
  xpMultiplier: number;
}

export const REALM_LABELS: Record<SystemRealm, string> = {
  system: 'System Headquarters',
  training: 'Training Hall',
  sanctuary: 'Scripture Sanctuary',
  kitchen: 'Provision Command',
  treasury: 'Treasury Command',
  creator: 'Creator Forge',
  party: 'Party Headquarters',
  campaign: 'Campaign Command',
  archive: 'Memory Archive',
  progression: 'Ascension Chamber',
};

export const REALM_COMPANIONS: Record<SystemRealm, CompanionId> = {
  system: 'snow',
  training: 'rook',
  sanctuary: 'selah',
  kitchen: 'saffron',
  treasury: 'cassian',
  creator: 'haven',
  party: 'snow',
  campaign: 'cipher',
  archive: 'snow',
  progression: 'snow',
};

export function getSystemRealm(path: string): SystemRealm {
  if (path.startsWith('/training-hall')) return 'training';
  if (path.startsWith('/sanctuary')) return 'sanctuary';
  if (path.startsWith('/kitchen')) return 'kitchen';
  if (path.startsWith('/treasury')) return 'treasury';
  if (path.startsWith('/creator-forge')) return 'creator';
  if (path.startsWith('/headquarters') || path.startsWith('/party-chat')) return 'party';
  if (path.startsWith('/campaigns')) return 'campaign';
  if (path.startsWith('/archive')) return 'archive';
  if (path.startsWith('/status') || path.startsWith('/challenges')) return 'progression';
  return 'system';
}

export function getSystemCycle(hour: number): SystemCycle {
  if (hour >= 5 && hour < 12) return 'dawn';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

export function getLiveSystemState(input: SystemStateInput): SystemState {
  if (!input.online) return 'offline';
  if (input.recoveryActive) return 'recovery';
  if (input.trialActive) return 'trial';
  if (input.classQualified) return 'rank-qualified';
  if (input.recentAscension) return 'ascending';
  if (input.xpMultiplier === 0.9) return 'warning';
  if (input.xpMultiplier < 0.9) return 'stagnant';
  return 'stable';
}

export function formatSystemState(state: SystemState) {
  const labels: Record<SystemState, string> = {
    initializing: 'Initializing',
    stable: 'System stable',
    ascending: 'Ascension active',
    warning: 'Attention required',
    stagnant: 'Momentum weakened',
    recovery: 'Recovery protocol',
    trial: 'Class Trial active',
    'rank-qualified': 'Class advancement ready',
    offline: 'Local offline link',
  };
  return labels[state];
}
