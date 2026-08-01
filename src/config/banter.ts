import type { CompanionId, MissionCategory } from '@/types/game';

export interface BanterExchange {
  id: string;
  messages: Array<{ companionId: CompanionId; message: string }>;
}

export const PARTY_BANTER: Record<MissionCategory, BanterExchange[]> = {
  physical: [
    {
      id: 'physical-proof',
      messages: [
        { companionId: 'rook', message: 'There. Physical proof that showing up beats waiting for ideal conditions.' },
        { companionId: 'cipher', message: 'I have logged this rare occasion where your enthusiasm and the data agree.' },
      ],
    },
    {
      id: 'physical-recovery',
      messages: [
        { companionId: 'rook', message: 'Good work. Now recover like someone who intends to be strong again tomorrow.' },
        { companionId: 'haven', message: 'I was about to say the same thing, only with fewer orders and considerably more water.' },
      ],
    },
    {
      id: 'physical-snow',
      messages: [
        { companionId: 'snow', message: 'Rook has been trying not to look proud for the last thirty seconds.' },
        { companionId: 'rook', message: 'I am succeeding. Also: excellent work.' },
      ],
    },
    {
      id: 'physical-ignition',
      messages: [
        { companionId: 'ember', message: 'That is a clean hit. Tell me you felt the hesitation lose its grip.' },
        { companionId: 'rook', message: 'It did. Now we recover properly and make the next answer just as strong.' },
      ],
    },
  ],
  faith: [
    {
      id: 'faith-quiet',
      messages: [
        { companionId: 'selah', message: 'Quiet faithfulness leaves a deeper mark than noise ever could.' },
        { companionId: 'snow', message: 'And it still deserves to be noticed. We noticed.' },
      ],
    },
    {
      id: 'faith-roots',
      messages: [
        { companionId: 'selah', message: 'Roots first. Fruit follows in its proper season.' },
        { companionId: 'cipher', message: 'An annoyingly elegant system with no useful shortcut. I approve.' },
      ],
    },
    {
      id: 'faith-rest',
      messages: [
        { companionId: 'haven', message: 'That choice made room inside the day instead of taking more from it.' },
        { companionId: 'selah', message: 'Yes. Some disciplines restore the person who practices them.' },
      ],
    },
    {
      id: 'faith-return',
      messages: [
        { companionId: 'selah', message: 'Every honest return is welcome, no matter how long the silence before it.' },
        { companionId: 'ember', message: 'Good. Grace opened the door; you still chose to walk through it.' },
      ],
    },
  ],
  discipline: [
    {
      id: 'discipline-execution',
      messages: [
        { companionId: 'cipher', message: 'Plan converted into action. My favorite kind of translation.' },
        { companionId: 'rook', message: 'You make it sound clinical. I call it answering the bell.' },
      ],
    },
    {
      id: 'discipline-repeat',
      messages: [
        { companionId: 'cipher', message: 'Repeatable process detected. We may be dealing with actual discipline.' },
        { companionId: 'snow', message: 'Careful, Cipher. That almost sounded like uncomplicated praise.' },
      ],
    },
    {
      id: 'discipline-balance',
      messages: [
        { companionId: 'rook', message: 'Objective handled. What is next?' },
        { companionId: 'haven', message: 'A breath. The answer is a breath, and then we can discuss what is next.' },
      ],
    },
    {
      id: 'discipline-lock-in',
      messages: [
        { companionId: 'ember', message: 'No speech, no spiral—target chosen and objective handled.' },
        { companionId: 'cipher', message: 'A brutally concise process description. I have no corrections.' },
      ],
    },
  ],
  creator: [
    {
      id: 'creator-real',
      messages: [
        { companionId: 'cipher', message: 'The idea is no longer trapped in your head. Statistically, that is enormous.' },
        { companionId: 'snow', message: 'Emotionally, too. You made part of your world real today.' },
      ],
    },
    {
      id: 'creator-rough',
      messages: [
        { companionId: 'cipher', message: 'A rough version exists. Perfection has officially lost its veto power.' },
        { companionId: 'rook', message: 'Good. Something real can be strengthened. An untouched idea cannot.' },
      ],
    },
    {
      id: 'creator-arc',
      messages: [
        { companionId: 'snow', message: 'Another piece of the vision crossed over into reality.' },
        { companionId: 'cipher', message: 'I have already updated the plan to account for your increasing competence.' },
      ],
    },
    {
      id: 'creator-finished',
      messages: [
        { companionId: 'ember', message: 'Something real exists now. Perfection can complain from outside the room.' },
        { companionId: 'cipher', message: 'Agreed. Finished output remains statistically difficult to argue with.' },
      ],
    },
  ],
  character: [
    {
      id: 'character-strength',
      messages: [
        { companionId: 'haven', message: 'That choice made someone’s world a little safer or kinder.' },
        { companionId: 'rook', message: 'Then it counts as strength. No debate required.' },
      ],
    },
    {
      id: 'character-unseen',
      messages: [
        { companionId: 'haven', message: 'The best parts of character often grow when nobody applauds.' },
        { companionId: 'snow', message: 'Good thing the party was paying attention.' },
      ],
    },
    {
      id: 'character-ripple',
      messages: [
        { companionId: 'selah', message: 'Goodness offered freely tends to travel farther than we can see.' },
        { companionId: 'haven', message: 'And today, the first part of that journey began with you.' },
      ],
    },
    {
      id: 'character-fire',
      messages: [
        { companionId: 'haven', message: 'Strength is most trustworthy when it leaves someone safer.' },
        { companionId: 'ember', message: 'Then that was strength. Fierce, useful, and aimed exactly where it belonged.' },
      ],
    },
  ],
};
