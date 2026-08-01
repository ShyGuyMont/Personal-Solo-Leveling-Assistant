import type {
  CompanionId,
  CompanionTrigger,
  MissionCategory,
  StatName,
} from '@/types/game';

export interface CompanionDefinition {
  id: CompanionId;
  name: string;
  title: string;
  shortRole: string;
  description: string;
  appearance: string;
  personality: string;
  accent: string;
  image: string;
  primary?: boolean;
  categories: MissionCategory[];
  stats: StatName[];
  messages: Partial<Record<CompanionTrigger, string[]>>;
}

export const COMPANIONS: CompanionDefinition[] = [
  {
    id: 'snow',
    name: 'Snow',
    title: 'The Constant',
    shortRole: 'Daily support · Your whole journey',
    description:
      'Snow stays beside the entire campaign: the daily check-in, the hard seasons, the major victories, and every moment when you need someone firmly in your corner.',
    appearance:
      'An Asian woman with long flowing black hair, a pearl-white and midnight-navy support jacket, an ice-blue crystal clasp, and a luminous silver-blue System halo.',
    personality:
      'Loyal, emotionally intelligent, playfully encouraging, and steady under pressure. She remembers the struggle behind each victory and never lets you reduce yourself to one bad day.',
    accent: '#86cfff',
    image: 'companions/snow.webp',
    primary: true,
    categories: [],
    stats: [],
    messages: {
      'daily-briefing': [
        'I’m here. Whatever today looks like, we’ll take it one honest step at a time.',
        'New day, same team. You don’t have to carry the whole journey at once.',
        'System link confirmed. I saved you a seat beside me—let’s see what today becomes.',
        'No grand speech required. Show up as you are, and we’ll build from there.',
      ],
      mission: [
        'There it is—the part where intention became proof. I’m proud of you.',
        'One more promise kept. I know what it took to make that look simple.',
        'Progress confirmed. And yes, I noticed how hard you fought for that one.',
      ],
      'stat-level': [
        '{stat} reached level {level}. I’ve watched the work behind that number, and I’m proud of all of it.',
        'Level {level} {stat}. Look how far the version of you who started has carried us.',
      ],
      'rank-up': [
        'New rank confirmed. I was here for the struggle, so believe me when I say—you earned this.',
        'Classification advanced. Come on, let yourself feel proud. I already am.',
        'A new rank suits you. Not because the road was easy—because you kept becoming.',
      ],
      'rare-event': [
        'Rare signal cleared. Of course you found a way to turn surprise into progress.',
        'That wasn’t on the schedule, but neither is most of your best growth.',
      ],
      'mission-pass': [
        'Pass secured. Keep it for the day when protecting your momentum matters more than proving a point.',
        'I’ve got the pass. Using support wisely is part of becoming stronger, too.',
      ],
      comeback: [
        'Hey. You came back. Nothing before this moment gets to take that victory away.',
        'I’m still here, and so are you. That means the story is still moving.',
      ],
      achievement: [
        'Achievement confirmed. I know the story behind that badge—and it deserves to be celebrated.',
        'You did it. Don’t rush past this one; I want you to remember how it feels.',
      ],
    },
  },
  {
    id: 'rook',
    name: 'Rook',
    title: 'The Vanguard',
    shortRole: 'Strength · Endurance · Vitality',
    description:
      'Rook watches the physical path: training, movement, stamina, and the choice to keep going.',
    appearance:
      'A broad-shouldered Black warrior in graphite tactical armor, traced with amber energy and a weathered gold mantle.',
    personality:
      'Bold, competitive, protective, and incapable of pretending that your hard work was luck.',
    accent: '#f2a65a',
    image: 'companions/rook.webp',
    categories: ['physical'],
    stats: ['strength', 'endurance', 'vitality'],
    messages: {
      mission: [
        'Good. The body remembers every promise you keep.',
        'You showed up. That matters more than perfect conditions.',
        'Another honest rep. Another piece of proof.',
      ],
      'stat-level': [
        '{stat} reached level {level}. That was earned, not given.',
        'Level {level} {stat}. You are becoming harder to stop.',
        'Your {stat} advanced to level {level}. Stand tall and remember what built it.',
      ],
      'rank-up': [
        'New rank confirmed. I knew your work would become impossible to ignore.',
        'Classification advanced. Enjoy the moment—then we build again.',
      ],
      'rare-event': [
        'Emergency quest cleared. That is how you answer a challenge.',
        'The System asked for more. You had more to give.',
      ],
    },
  },
  {
    id: 'selah',
    name: 'Selah',
    title: 'The Beacon',
    shortRole: 'Faith · Wisdom · Spiritual consistency',
    description:
      'Selah guards the inner path: prayer, Scripture, wisdom, and choosing faithfulness when no one sees it.',
    appearance:
      'A serene Black woman with long braids, an ivory-and-navy mantle, and a sun-gold geometric halo of light.',
    personality:
      'Warm, grounded, discerning, and gentle without ever mistaking gentleness for weakness.',
    accent: '#f4c95d',
    image: 'companions/selah.webp',
    categories: ['faith'],
    stats: ['faith', 'wisdom'],
    messages: {
      mission: [
        'Quiet faithfulness is still faithfulness. I saw this step.',
        'You made room for what matters. Carry that peace forward.',
        'A steady spirit is built in moments exactly like this one.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Growth is taking root beneath the surface.',
        'Level {level} {stat}. Keep returning to the source of your strength.',
        'Your {stat} has deepened to level {level}. Let it shape the next choice, too.',
      ],
      'rank-up': [
        'Your rank changed, but the truest victory is who you are becoming.',
        'A new classification. Receive it with gratitude, then continue faithfully.',
      ],
      'rare-event': [
        'The rare call was answered. May the extra time bear good fruit.',
        'You chose depth when the day offered an opening. Well done.',
      ],
      comeback: [
        'Returning is not failure. Returning is faith in motion.',
        'You are here again. Grace makes room for the next faithful step.',
      ],
    },
  },
  {
    id: 'cipher',
    name: 'Cipher',
    title: 'The Strategist',
    shortRole: 'Discipline · Focus · YouTube · ARC',
    description:
      'Cipher tracks execution: discipline, focus, creative output, YouTube, and the expanding ARC universe.',
    appearance:
      'A lean East Asian tactician in a navy high-collar tech jacket, surrounded by violet and cyan planning glyphs.',
    personality:
      'Precise, dryly funny, demanding, and openly delighted whenever a plan becomes something real.',
    accent: '#9b7bff',
    image: 'companions/cipher.webp',
    categories: ['discipline', 'creator'],
    stats: ['discipline', 'willpower', 'focus', 'creativity'],
    messages: {
      mission: [
        'Plan converted into output. That is the part most people never reach.',
        'Useful work detected. I will resist saying “I told you so.” For now.',
        'You moved the project forward. Momentum prefers evidence.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Your operating system is improving.',
        'Level {level} {stat}. The pattern is becoming reliable.',
        'Your {stat} advanced to level {level}. Keep the process; discard the excuses.',
      ],
      'rank-up': [
        'Rank advanced. The data has finally caught up with your effort.',
        'New classification confirmed. Our next plan can be more ambitious.',
      ],
      'rare-event': [
        'Rare objective complete. Excellent deviation from the baseline.',
        'Emergency quest resolved. Unexpected opportunity, measurable result.',
      ],
    },
  },
  {
    id: 'haven',
    name: 'Haven',
    title: 'The Guardian',
    shortRole: 'Character · Empathy · Recovery · Comebacks',
    description:
      'Haven protects the whole journey: character, empathy, recovery, balance, and beginning again after hard days.',
    appearance:
      'A calm Latino field guardian with silver-streaked hair, a deep teal coat, and a soft shield of green-blue light.',
    personality:
      'Patient, observant, quietly humorous, and more interested in lasting progress than punishment.',
    accent: '#55cbb7',
    image: 'companions/haven.webp',
    categories: ['character'],
    stats: ['character', 'empathy'],
    messages: {
      mission: [
        'Strength that makes room for others is worth keeping.',
        'That choice added something good to the world. Do not minimize it.',
        'Character grows when the decision costs something. Well done.',
      ],
      'stat-level': [
        '{stat} reached level {level}. The person behind the progress is growing too.',
        'Level {level} {stat}. This is the kind of strength people can feel around you.',
        'Your {stat} advanced to level {level}. Quiet growth is still real growth.',
      ],
      'rank-up': [
        'A higher rank is good. Reaching it without abandoning yourself is better.',
        'Classification advanced. I am proud of the way you kept your humanity with you.',
      ],
      'rare-event': [
        'Rare objective complete. You made extra room for tomorrow.',
        'The opportunity appeared, and you met it without losing your balance.',
      ],
      'mission-pass': [
        'The pass is secured. Use it for wisdom, not avoidance.',
        'Recovery is part of progression. Keep this for a day that truly needs it.',
      ],
      comeback: [
        'You came back. That is enough to begin rebuilding momentum.',
        'No lecture. No shame. Just the next honest step—and you took it.',
      ],
    },
  },
];

export function getCompanion(id: CompanionId) {
  return COMPANIONS.find((companion) => companion.id === id)!;
}

export function getCompanionImage(image: string) {
  return `${import.meta.env.BASE_URL}${image}`;
}

export function getCompanionForStat(stat: StatName) {
  return COMPANIONS.find((companion) => companion.stats.includes(stat)) ?? getCompanion('snow');
}

export function getCompanionForCategory(category: MissionCategory) {
  return (
    COMPANIONS.find((companion) => companion.categories.includes(category)) ??
    getCompanion('snow')
  );
}
