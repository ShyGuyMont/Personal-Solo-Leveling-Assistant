import type { Rank } from '@/types/game';
import { formatClassName } from '@/utils/format';

export interface AscensionCoreInput {
  dailyCompleted: number;
  dailyTotal: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  currentStreak: number;
  nextClass?: Rank;
  qualifiedForNextClass: boolean;
  clearedClassGates: number;
  totalClassGates: number;
}

export interface AscensionCoreProjection {
  state: 'awaiting' | 'active' | 'synchronized' | 'advancement-ready' | 'world-class';
  dailyCharge: number;
  levelCharge: number;
  headline: string;
  detail: string;
  actionLabel: string;
  href: '/missions' | '/status';
  gateDisplay: string;
}

export interface AscensionCoreVitality {
  particlesPerOrbit: number;
  sparkParticles: number;
  phase: 'dormant' | 'stirring' | 'surging' | 'synchronized';
}

function percent(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
}

export function buildAscensionCoreVitality(dailyCharge: number): AscensionCoreVitality {
  const normalizedCharge = Number.isFinite(dailyCharge)
    ? Math.min(100, Math.max(0, dailyCharge))
    : 0;

  return {
    particlesPerOrbit: 5 + Math.round(normalizedCharge / 20),
    sparkParticles: 10 + Math.round(normalizedCharge / 10),
    phase:
      normalizedCharge >= 100
        ? 'synchronized'
        : normalizedCharge >= 65
          ? 'surging'
          : normalizedCharge >= 25
            ? 'stirring'
            : 'dormant',
  };
}

export function buildAscensionCoreProjection(input: AscensionCoreInput): AscensionCoreProjection {
  const dailyCharge = percent(input.dailyCompleted, input.dailyTotal);
  const levelCharge = percent(input.currentLevelXp, input.xpToNextLevel);
  const gateDisplay = input.nextClass
    ? `${Math.min(input.clearedClassGates, input.totalClassGates)}/${input.totalClassGates}`
    : 'MAX';

  if (!input.nextClass) {
    return {
      state: 'world-class',
      dailyCharge,
      levelCharge,
      headline: 'World Class core stabilized',
      detail:
        'Final classification is held. The Core now measures the strength of the life built beyond the last gate.',
      actionLabel: 'Open full status',
      href: '/status',
      gateDisplay,
    };
  }

  if (input.qualifiedForNextClass) {
    return {
      state: 'advancement-ready',
      dailyCharge,
      levelCharge,
      headline: `${formatClassName(input.nextClass)} advancement signal detected`,
      detail:
        'The required gates are aligned. Enter the advancement interface to inspect the Class Trial and ascend when ready.',
      actionLabel: 'Enter advancement',
      href: '/status',
      gateDisplay,
    };
  }

  const remaining = Math.max(0, input.dailyTotal - input.dailyCompleted);
  if (input.dailyTotal > 0 && remaining === 0) {
    return {
      state: 'synchronized',
      dailyCharge,
      levelCharge,
      headline: 'Daily core fully synchronized',
      detail: `Every available directive is answered. Your ${input.currentStreak}-day cleared-day streak is feeding the long-range Class path.`,
      actionLabel: 'Inspect Class path',
      href: '/status',
      gateDisplay,
    };
  }

  if (remaining > 0) {
    return {
      state: 'active',
      dailyCharge,
      levelCharge,
      headline: `${remaining} directive${remaining === 1 ? '' : 's'} from full synchronization`,
      detail:
        'The Core is already converting completed work into momentum. Answer the next directive to increase today’s charge.',
      actionLabel: 'Continue directives',
      href: '/missions',
      gateDisplay,
    };
  }

  return {
    state: 'awaiting',
    dailyCharge,
    levelCharge,
    headline: 'Ascension Core awaiting directives',
    detail:
      'The daily field is quiet, but your permanent level and Class progress remain protected.',
    actionLabel: 'Inspect Class path',
    href: '/status',
    gateDisplay,
  };
}
