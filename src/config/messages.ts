import type { SystemState } from '@/types/game';

type MessageContext = {
  hour: number;
  streak: number;
  yesterdayRate: number;
  recentMisses: number;
  perfectDays: number;
  recentLevelUp: boolean;
  recentRankUp: boolean;
  challengeRate: number;
  state: SystemState;
};

const MORNING = [
  'Today’s objectives have been issued.',
  'A new cycle has opened. Begin deliberately.',
  'Morning conditions are favorable for decisive action.',
  'The first choice of the day shapes every choice after it.',
  'Your path is quiet. Your next action does not need to be.',
  'The day is unclaimed. Establish momentum.',
  'Small victories are now available.',
  'A clean beginning requires only one completed objective.',
];

const AFTERNOON = [
  'Your trajectory remains stable. Continue.',
  'The cycle is in progress. Reassess and advance.',
  'Unused time remains. Convert it into progress.',
  'Momentum favors the next deliberate action.',
  'One completed objective can alter the rest of the day.',
  'Progress has been detected. Maintain direction.',
  'The middle of the day reveals the strength of the plan.',
  'Objectives remain within reach.',
];

const EVENING = [
  'The current cycle is nearing closure.',
  'Finish with intention. Tomorrow will inherit tonight’s choices.',
  'Unresolved objectives remain actionable.',
  'A strong close can redefine an uneven day.',
  'Review the field. Complete what still matters.',
  'The final hours reward clarity.',
  'Do not confuse a late start with a lost day.',
  'The system remains open. Advancement is still possible.',
];

const STREAK = [
  'Consistency has begun to compound.',
  'Your repeated action is becoming part of your identity.',
  'The chain is strong because each link was chosen.',
  'Your recent consistency has altered projected outcomes.',
  'Momentum is no longer theoretical.',
  'Repetition has opened a more efficient path.',
  'The pattern is holding. Protect it without fearing it.',
];

const RECOVERY = [
  'An incomplete day does not define the campaign.',
  'Growth has resumed.',
  'Recovery protocol is active. Choose the smallest useful step.',
  'The path remains open.',
  'Return is itself a form of strength.',
  'No prior failure can complete today’s mission for you.',
  'Rebuild gently. Stability comes before intensity.',
  'One honest action is enough to restart momentum.',
  'A lapse is data, not destiny.',
  'The system has recalibrated. Begin again.',
];

const PERFECT = [
  'Full synchronization achieved.',
  'Every active objective was answered.',
  'A complete day has strengthened the foundation.',
  'Perfect execution recorded. Remain grounded.',
  'The day has been sealed without omission.',
  'Total completion is rare because it is earned.',
];

const LEVEL = [
  'Your capacity has expanded.',
  'A new account threshold has been crossed.',
  'Accumulated effort has produced measurable advancement.',
  'Level advancement confirmed. Continue building the person behind the number.',
];

const RANK = [
  'Your classification has changed.',
  'Class advancement confirmed. New standards now apply.',
  'The system recognizes sustained growth.',
  'A monumental threshold has been crossed.',
];

const CHALLENGE = [
  'The active challenge is approaching resolution.',
  'Challenge progress is ahead of projection.',
  'Higher-order objectives are responding to your consistency.',
  'The campaign remains viable. Protect the remaining window.',
];

const GENERAL = [
  'Discipline is built where enthusiasm ends.',
  'Potential without action produces no advancement.',
  'Quiet progress remains progress.',
  'Action clarifies what intention cannot.',
  'Your future record is being written by ordinary choices.',
  'Effort does not need an audience to matter.',
  'The objective is growth, not performance.',
  'Consistency creates options that motivation cannot.',
  'A measured pace can still produce extraordinary distance.',
  'You are not behind. You are at the next decision.',
];

export const SYSTEM_MESSAGE_COUNT =
  MORNING.length +
  AFTERNOON.length +
  EVENING.length +
  STREAK.length +
  RECOVERY.length +
  PERFECT.length +
  LEVEL.length +
  RANK.length +
  CHALLENGE.length +
  GENERAL.length;

function deterministicPick(items: string[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

export function chooseSystemMessage(context: MessageContext, daySeed: number): string {
  if (context.recentRankUp) return deterministicPick(RANK, daySeed);
  if (context.recentLevelUp) return deterministicPick(LEVEL, daySeed);
  if (context.state === 'recovery' || context.recentMisses >= 3) {
    return deterministicPick(RECOVERY, daySeed);
  }
  if (context.yesterdayRate === 1 && context.perfectDays > 0) {
    return deterministicPick(PERFECT, daySeed);
  }
  if (context.challengeRate >= 0.75) return deterministicPick(CHALLENGE, daySeed);
  if (context.streak >= 4) return deterministicPick(STREAK, daySeed);
  if (context.hour < 12) return deterministicPick(MORNING, daySeed);
  if (context.hour < 18) return deterministicPick(AFTERNOON, daySeed);
  if (context.hour < 23) return deterministicPick(EVENING, daySeed);
  return deterministicPick(GENERAL, daySeed);
}
