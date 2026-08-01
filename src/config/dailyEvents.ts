import type { ChallengeCategory, CompanionId, StatReward } from '@/types/game';

export interface EmergencyQuestTemplate {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  accountXp: number;
  statRewards: StatReward[];
  companionId: CompanionId;
}

export const EMERGENCY_QUESTS: EmergencyQuestTemplate[] = [
  {
    id: 'iron-circuit',
    title: 'Iron Circuit',
    description:
      'Complete 20 minutes of intentional training or movement beyond your normal daily mission.',
    category: 'physical',
    accountXp: 120,
    statRewards: [
      { stat: 'strength', xp: 30 },
      { stat: 'endurance', xp: 24 },
      { stat: 'vitality', xp: 18 },
    ],
    companionId: 'rook',
  },
  {
    id: 'quiet-altar',
    title: 'Quiet Altar',
    description:
      'Give 15 additional uninterrupted minutes to prayer, Scripture, or written reflection.',
    category: 'faith',
    accountXp: 115,
    statRewards: [
      { stat: 'faith', xp: 32 },
      { stat: 'wisdom', xp: 24 },
    ],
    companionId: 'selah',
  },
  {
    id: 'zero-drift',
    title: 'Zero Drift Protocol',
    description:
      'Complete one focused 45-minute block with distractions removed and the objective defined first.',
    category: 'discipline',
    accountXp: 125,
    statRewards: [
      { stat: 'discipline', xp: 30 },
      { stat: 'willpower', xp: 24 },
      { stat: 'focus', xp: 18 },
    ],
    companionId: 'cipher',
  },
  {
    id: 'bonus-chapter',
    title: 'Bonus Chapter',
    description:
      'Move YouTube or ARC forward with one concrete deliverable beyond today’s planned creator work.',
    category: 'creator',
    accountXp: 130,
    statRewards: [
      { stat: 'creativity', xp: 30 },
      { stat: 'focus', xp: 22 },
      { stat: 'discipline', xp: 18 },
    ],
    companionId: 'cipher',
  },
  {
    id: 'unseen-good',
    title: 'The Unseen Good',
    description:
      'Do one helpful or generous thing that does not require recognition, credit, or repayment.',
    category: 'character',
    accountXp: 110,
    statRewards: [
      { stat: 'character', xp: 30 },
      { stat: 'empathy', xp: 28 },
    ],
    companionId: 'haven',
  },
  {
    id: 'tomorrow-advantage',
    title: 'Tomorrow’s Advantage',
    description:
      'Spend 20 focused minutes preparing your environment and first objective for tomorrow.',
    category: 'balanced',
    accountXp: 105,
    statRewards: [
      { stat: 'discipline', xp: 20 },
      { stat: 'wisdom', xp: 18 },
      { stat: 'character', xp: 16 },
    ],
    companionId: 'haven',
  },
];

export const DAILY_EVENT_ODDS = {
  emergencyQuest: 0.07,
  missionPass: 0.05,
} as const;

export function getEmergencyQuest(id?: string) {
  return EMERGENCY_QUESTS.find((quest) => quest.id === id);
}

