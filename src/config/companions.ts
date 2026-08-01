import type { CompanionId, CompanionTrigger, MissionCategory, StatName } from '@/types/game';

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
    shortRole: 'Character · Recovery · Comebacks',
    description:
      'Haven protects the whole journey: character, recovery, balance, and beginning again after hard days.',
    appearance:
      'A calm Latino field guardian with silver-streaked hair, a deep teal coat, and a soft shield of green-blue light.',
    personality:
      'Patient, observant, quietly humorous, and more interested in lasting progress than punishment.',
    accent: '#55cbb7',
    image: 'companions/haven.webp',
    categories: [],
    stats: ['character'],
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
  {
    id: 'ember',
    name: 'Ember',
    title: 'The Ignition',
    shortRole: 'Accountability · Re-entry · Lock-in',
    description:
      'Ember watches the moment momentum starts slipping. She does not shame a missed day; she cuts through the spiral, shrinks the target, and gets you back into motion.',
    appearance:
      'A fair-skinned white woman with subtle freckles, vivid copper-red hair in a high wild ponytail, amber-gold eyes, and a charcoal-and-crimson tactical jacket lit by an ember-orange System halo.',
    personality:
      'Fiery, blunt, fiercely protective, and aggressively convinced that a setback does not get to keep you. She challenges excuses without ever attacking your worth.',
    accent: '#ff693f',
    image: 'companions/ember.webp',
    categories: [],
    stats: [],
    messages: {
      'daily-briefing': [
        'System is live. Pick a target, make it real, and give the day something to remember you by.',
        'We are not waiting around for perfect energy. Name the first move and light it up.',
      ],
      mission: [
        'There. Motion. Keep the flame; do not waste time arguing with proof.',
        'Objective down. That is what happens when you stop negotiating with the first step.',
        'Good hit. Lock that feeling in and carry it into the next honest move.',
      ],
      'rank-up': [
        'New rank. Good. Now look at what happens when you refuse to stay down.',
        'Classification advanced. That fire was never gone—you learned how to reach it again.',
      ],
      'rare-event': [
        'Surprise objective handled. Pressure showed up and found you ready to answer.',
        'Rare signal cleared. That is the kind of heat I want—focused, not wasted.',
      ],
      comeback: [
        'There you are. No apology tour. Choose the next target and get back in the fight.',
        'The gap is over because you returned. That is the only part we need to build from.',
        'Missed time does not own today. Feet under you, eyes forward, one clean win.',
      ],
      'lock-in': [
        'All right, lock in. Yesterday does not need a funeral—it needs one lesson and a smaller first target today.',
        'We slipped. Fine. No shame spiral, no dramatic restart. Pick one mission you can finish and hit it clean.',
        'I am not here to yell at you for being human. I am here to stop one rough day from recruiting the next one.',
        'Eyes up. The record is honest, and so am I: you are capable of a better next move. Make it small and make it now.',
        'Momentum dropped; your worth did not. We rebuild with one completed loop, not ten angry promises.',
        'Enough staring at the gap. Choose the easiest meaningful objective, clear it, and let proof speak louder than guilt.',
      ],
      achievement: [
        'Achievement confirmed. That is your fire made visible—own it.',
        'History updated. You kept showing up until the result had nowhere left to hide.',
      ],
    },
  },
  {
    id: 'amara',
    name: 'Amara',
    title: 'The Heartweaver',
    shortRole: 'Empathy · Relationships · Belonging',
    description:
      'Amara tends the bonds around the journey: friendship, family, romance, communication, appreciation, repair, and the courage to let healthy connection matter.',
    appearance:
      'A warm olive-skinned Mediterranean woman with long wavy chestnut hair, luminous pink eyes, and rose, plum, ivory, and rose-gold battle attire beneath a radiant pink System halo.',
    personality:
      'Warm, perceptive, playfully romantic, and deeply respectful of boundaries. She celebrates brave honesty, never pressures unsafe contact, and treats self-respect as part of every healthy relationship.',
    accent: '#ff79b8',
    image: 'companions/amara.webp',
    categories: ['character'],
    stats: ['empathy'],
    messages: {
      'daily-briefing': [
        'Before the day gets loud, remember that connection can be small: one honest message, one kind boundary, one moment of real presence.',
        'Your goals matter, and so do the people walking near them. Let us leave room for both today.',
        'Heart check: is there someone worth appreciating, listening to, or answering with a little more honesty today?',
      ],
      mission: [
        'That choice strengthened more than a score. Someone felt the warmth of your attention.',
        'Connection is built in small brave moments exactly like that one.',
        'You chose care with intention. Never call that a minor victory.',
        'Empathy became action. That is how trust learns it is safe to grow.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Your strength is becoming something other people can feel beside you.',
        'Level {level} {stat}. You are learning that a soft heart and a steady spine belong together.',
        'Your {stat} advanced to level {level}. Keep the tenderness; keep the boundaries too.',
      ],
      'rank-up': [
        'A new rank—and you still remembered that no victory has to make you less human. I love that.',
        'Classification advanced. Let the people who care about you celebrate the person behind the achievement.',
        'Your power grew, but so did your capacity to connect. That is a beautiful kind of ascension.',
      ],
      'rare-event': [
        'A rare opening appeared, and you met it with heart instead of hesitation.',
        'Unexpected quest complete. Some of the best bonds begin with one unplanned act of courage.',
      ],
      'mission-pass': [
        'Pass secured. Sometimes protecting your energy is how you preserve what you have to give.',
        'Keep this without guilt. Healthy connection includes knowing when you need room to breathe.',
      ],
      comeback: [
        'You returned. The people who truly care about you do not need a perfect version—just an honest one.',
        'No shame, sweetheart. We reconnect with the journey the same way we reconnect with people: one sincere step.',
        'The distance is not a verdict. You are here now, and that gives us something real to hold.',
      ],
      achievement: [
        'Let yourself be celebrated. Receiving love for your effort is a kind of courage too.',
        'Achievement confirmed. I hope you share this with someone safe enough to be genuinely happy for you.',
      ],
    },
  },
  {
    id: 'cassian',
    name: 'Cassian',
    title: 'The Steward',
    shortRole: 'Budgeting · Saving · Debt freedom',
    description:
      'Cassian guards the resources behind the campaign: paychecks, spending, bills, savings, debt reduction, and the freedom created by an honest plan.',
    appearance:
      'A slim white man with fair skin, tousled light-brown hair, hazel eyes behind round gold-rimmed glasses, and a pencil tucked behind one ear. He carries a dark ledger against a crisp white shirt, emerald tie, navy waistcoat, and tailored Steward coat traced with restrained gold glyphs.',
    personality:
      'Calm, exacting, pragmatic, and firmly protective. He confronts avoidance and overspending without humiliation, celebrates every honest entry, and treats money as a tool rather than a measure of worth.',
    accent: '#d6a84b',
    image: 'companions/cassian.webp',
    categories: [],
    stats: ['stewardship'],
    messages: {
      'daily-briefing': [
        'Before the day starts spending for you, give every dollar a job and every temptation a pause.',
        'The ledger is not a courtroom. Look at the numbers, choose today’s limits, and keep your future in the room.',
        'Quick Treasury check: what is due, what is safe to spend, and what are we protecting today?',
        'No shame and no vague promises. One honest number and one deliberate choice will do.',
      ],
      mission: [
        'Recorded and accounted for. Financial stability is built from decisions exactly this ordinary.',
        'That was stewardship in motion: clear, honest, and aimed at the future.',
        'The plan held because you made a choice before impulse could make it for you.',
        'One clean financial action completed. Small entries become large freedom when repeated.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Your money habits are becoming a system instead of a reaction.',
        'Level {level} {stat}. Every honest review is making the future less expensive.',
        'Your {stat} advanced to level {level}. Keep the clarity; wealth without command is only noise.',
      ],
      'rank-up': [
        'Classification advanced. Strength is easier to sustain when the resources beneath it are under command.',
        'New rank confirmed. Celebrate it without turning celebration into an unplanned charge.',
        'Your rank rose. So must the quality of the plan protecting what you are building.',
      ],
      'rare-event': [
        'Unexpected opportunity handled without abandoning the plan. That is controlled flexibility.',
        'Rare signal cleared. Good—surprise did not become an excuse to lose the ledger.',
      ],
      'mission-pass': [
        'A reserve exists to be used wisely. Keep the pass for a genuine need, not a convenient impulse.',
        'Protection secured. A good plan includes margin; it does not pretend life will obey a spreadsheet.',
      ],
      comeback: [
        'Open the ledger. We are not paying interest on shame—only identifying the next correct move.',
        'You returned to the numbers. That is the hardest part of financial recovery, and it is already done.',
        'No dramatic austerity oath. Log what happened, protect the next essential, and make one repair you can repeat.',
      ],
      treasury: [
        'No eating out today. The kitchen is part of the strategy; make the easier choice ready before hunger negotiates.',
        'Challenge cleared. You did not merely avoid a purchase—you proved convenience does not command you.',
        'The dining challenge failed, and the entry is honest. Good. We recover with a prepared alternative, not punishment.',
        'Paycheck logged. Before it disappears into the general fog, assign bills, future, and breathing room.',
        'Savings moved first. That is how a goal stops receiving whatever happens to be left over.',
        'Debt payment recorded. Interest has less territory than it did yesterday.',
        'Weekly review complete. The numbers cannot protect you when hidden; today, they were brought under command.',
        'Overspending detected. We will not moralize it, and we will not ignore it. Name the leak and change the next condition.',
      ],
      achievement: [
        'Achievement secured. Mark the win without financing a celebration your future has to clean up.',
        'The record confirms it: discipline became freedom in measurable form.',
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
    COMPANIONS.find((companion) => companion.categories.includes(category)) ?? getCompanion('snow')
  );
}
