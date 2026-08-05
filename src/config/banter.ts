import type { CompanionId, MissionCategory } from '@/types/game';

export interface BanterExchange {
  id: string;
  messages: Array<{ companionId: CompanionId; message: string }>;
}

const BASE_PARTY_BANTER: Record<MissionCategory, BanterExchange[]> = {
  physical: [
    {
      id: 'physical-proof',
      messages: [
        {
          companionId: 'rook',
          message: 'There. Physical proof that showing up beats waiting for ideal conditions.',
        },
        {
          companionId: 'cipher',
          message: 'I have logged this rare occasion where your enthusiasm and the data agree.',
        },
      ],
    },
    {
      id: 'physical-recovery',
      messages: [
        {
          companionId: 'rook',
          message: 'Good work. Now recover like someone who intends to be strong again tomorrow.',
        },
        {
          companionId: 'haven',
          message:
            'I was about to say the same thing, only with fewer orders and considerably more water.',
        },
      ],
    },
    {
      id: 'physical-snow',
      messages: [
        {
          companionId: 'snow',
          message: 'Rook has been trying not to look proud for the last thirty seconds.',
        },
        { companionId: 'rook', message: 'I am succeeding. Also: excellent work.' },
      ],
    },
    {
      id: 'physical-ignition',
      messages: [
        {
          companionId: 'ember',
          message: 'That is a clean hit. Tell me you felt the hesitation lose its grip.',
        },
        {
          companionId: 'rook',
          message: 'It did. Now we recover properly and make the next answer just as strong.',
        },
      ],
    },
    {
      id: 'physical-heart',
      messages: [
        {
          companionId: 'amara',
          message:
            'That effort was for you, but I hope you feel how it expands what you can bring to the people you love.',
        },
        {
          companionId: 'rook',
          message: 'A stronger foundation supports more than the person standing on it. Agreed.',
        },
      ],
    },
  ],
  faith: [
    {
      id: 'faith-quiet',
      messages: [
        {
          companionId: 'selah',
          message: 'Quiet faithfulness leaves a deeper mark than noise ever could.',
        },
        { companionId: 'snow', message: 'And it still deserves to be noticed. We noticed.' },
      ],
    },
    {
      id: 'faith-roots',
      messages: [
        { companionId: 'selah', message: 'Roots first. Fruit follows in its proper season.' },
        {
          companionId: 'cipher',
          message: 'An annoyingly elegant system with no useful shortcut. I approve.',
        },
      ],
    },
    {
      id: 'faith-rest',
      messages: [
        {
          companionId: 'haven',
          message: 'That choice made room inside the day instead of taking more from it.',
        },
        {
          companionId: 'selah',
          message: 'Yes. Some disciplines restore the person who practices them.',
        },
      ],
    },
    {
      id: 'faith-return',
      messages: [
        {
          companionId: 'selah',
          message: 'Every honest return is welcome, no matter how long the silence before it.',
        },
        {
          companionId: 'ember',
          message: 'Good. Grace opened the door; you still chose to walk through it.',
        },
      ],
    },
    {
      id: 'faith-love',
      messages: [
        {
          companionId: 'selah',
          message: 'Faith becomes visible in the way we love: with truth, patience, and wisdom.',
        },
        {
          companionId: 'amara',
          message: 'And with boundaries strong enough to keep that love honest. Beautifully said.',
        },
      ],
    },
  ],
  discipline: [
    {
      id: 'discipline-execution',
      messages: [
        {
          companionId: 'cipher',
          message: 'Plan converted into action. My favorite kind of translation.',
        },
        {
          companionId: 'rook',
          message: 'You make it sound clinical. I call it answering the bell.',
        },
      ],
    },
    {
      id: 'discipline-repeat',
      messages: [
        {
          companionId: 'cipher',
          message: 'Repeatable process detected. We may be dealing with actual discipline.',
        },
        {
          companionId: 'snow',
          message: 'Careful, Cipher. That almost sounded like uncomplicated praise.',
        },
      ],
    },
    {
      id: 'discipline-balance',
      messages: [
        { companionId: 'rook', message: 'Objective handled. What is next?' },
        {
          companionId: 'haven',
          message: 'A breath. The answer is a breath, and then we can discuss what is next.',
        },
      ],
    },
    {
      id: 'discipline-lock-in',
      messages: [
        {
          companionId: 'ember',
          message: 'No speech, no spiral—target chosen and objective handled.',
        },
        {
          companionId: 'cipher',
          message: 'A brutally concise process description. I have no corrections.',
        },
      ],
    },
    {
      id: 'discipline-connection',
      messages: [
        {
          companionId: 'amara',
          message:
            'Discipline protected time for what matters. That includes the people who matter.',
        },
        {
          companionId: 'cipher',
          message:
            'Correct. Neglected relationships are a predictable systems failure, not an unavoidable surprise.',
        },
      ],
    },
  ],
  creator: [
    {
      id: 'creator-real',
      messages: [
        {
          companionId: 'cipher',
          message: 'The idea is no longer trapped in your head. Statistically, that is enormous.',
        },
        {
          companionId: 'snow',
          message: 'Emotionally, too. You made part of your world real today.',
        },
      ],
    },
    {
      id: 'creator-rough',
      messages: [
        {
          companionId: 'cipher',
          message: 'A rough version exists. Perfection has officially lost its veto power.',
        },
        {
          companionId: 'rook',
          message: 'Good. Something real can be strengthened. An untouched idea cannot.',
        },
      ],
    },
    {
      id: 'creator-arc',
      messages: [
        { companionId: 'snow', message: 'Another piece of the vision crossed over into reality.' },
        {
          companionId: 'cipher',
          message: 'I have already updated the plan to account for your increasing competence.',
        },
      ],
    },
    {
      id: 'creator-finished',
      messages: [
        {
          companionId: 'ember',
          message: 'Something real exists now. Perfection can complain from outside the room.',
        },
        {
          companionId: 'cipher',
          message: 'Agreed. Finished output remains statistically difficult to argue with.',
        },
      ],
    },
    {
      id: 'creator-shared',
      messages: [
        {
          companionId: 'cipher',
          message:
            'Creation complete. Distribution and feedback are now statistically permissible.',
        },
        {
          companionId: 'amara',
          message:
            'He means it is safe to let someone see your heart in the work. I mean it more beautifully.',
        },
      ],
    },
  ],
  character: [
    {
      id: 'character-strength',
      messages: [
        {
          companionId: 'haven',
          message: 'That choice made someone’s world a little safer or kinder.',
        },
        { companionId: 'rook', message: 'Then it counts as strength. No debate required.' },
      ],
    },
    {
      id: 'character-unseen',
      messages: [
        {
          companionId: 'haven',
          message: 'The best parts of character often grow when nobody applauds.',
        },
        { companionId: 'snow', message: 'Good thing the party was paying attention.' },
      ],
    },
    {
      id: 'character-ripple',
      messages: [
        {
          companionId: 'selah',
          message: 'Goodness offered freely tends to travel farther than we can see.',
        },
        {
          companionId: 'haven',
          message: 'And today, the first part of that journey began with you.',
        },
      ],
    },
    {
      id: 'character-fire',
      messages: [
        {
          companionId: 'haven',
          message: 'Strength is most trustworthy when it leaves someone safer.',
        },
        {
          companionId: 'ember',
          message: 'Then that was strength. Fierce, useful, and aimed exactly where it belonged.',
        },
      ],
    },
    {
      id: 'character-heartweaver',
      messages: [
        {
          companionId: 'amara',
          message:
            'Care with boundaries, honesty without cruelty, courage without performance—that is relationship strength.',
        },
        {
          companionId: 'haven',
          message:
            'And the kind of strength that leaves both people more whole. Welcome to the watch, Heartweaver.',
        },
      ],
    },
  ],
};

const CASSIAN_BANTER: Record<MissionCategory, BanterExchange> = {
  physical: {
    id: 'physical-stewardship',
    messages: [
      {
        companionId: 'cassian',
        message:
          'Health is an asset that pays returns no account can replace. That effort was sound stewardship.',
      },
      { companionId: 'rook', message: 'Agreed. Stronger body, stronger options. Keep investing.' },
    ],
  },
  faith: {
    id: 'faith-stewardship',
    messages: [
      {
        companionId: 'selah',
        message:
          'Stewardship begins with remembering that provision is gift before it is possession.',
      },
      {
        companionId: 'cassian',
        message: 'And gratitude gives the ledger direction. Received, protected, shared wisely.',
      },
    ],
  },
  discipline: {
    id: 'discipline-stewardship',
    messages: [
      {
        companionId: 'cassian',
        message:
          'Discipline just prevented tomorrow from paying for today. The return is already accruing.',
      },
      {
        companionId: 'cipher',
        message: 'A financially literate way to say the operator followed the plan. I approve.',
      },
    ],
  },
  creator: {
    id: 'creator-stewardship',
    messages: [
      {
        companionId: 'cipher',
        message: 'Output shipped. Potential value has become an actual asset.',
      },
      {
        companionId: 'cassian',
        message: 'Then protect the craft, track the cost, and let the work earn room to grow.',
      },
    ],
  },
  character: {
    id: 'character-stewardship',
    messages: [
      {
        companionId: 'amara',
        message: 'Generosity is beautiful when it does not require abandoning yourself.',
      },
      {
        companionId: 'cassian',
        message:
          'Exactly. A sustainable yes and an honest no both protect the people the resource is meant to serve.',
      },
    ],
  },
};

const SAFFRON_BANTER: Record<MissionCategory, BanterExchange> = {
  physical: {
    id: 'physical-provision',
    messages: [
      { companionId: 'rook', message: 'The work is recorded. Now recovery has the floor.' },
      {
        companionId: 'saffron',
        message:
          'Correct! Water first, then food worthy of those working sets. Nobody escapes unfed.',
      },
    ],
  },
  faith: {
    id: 'faith-table',
    messages: [
      {
        companionId: 'selah',
        message: 'Receive provision with gratitude and make room at the table for peace.',
      },
      {
        companionId: 'saffron',
        message:
          'Gratitude, good seasoning, and enough to share. Finally, a protocol I can support without revisions.',
      },
    ],
  },
  discipline: {
    id: 'discipline-prepared',
    messages: [
      { companionId: 'cipher', message: 'The planned action defeated the impulse. Efficient.' },
      {
        companionId: 'saffron',
        message:
          'Because the better choice was ready before hunger started negotiating. Preparation wins!',
      },
    ],
  },
  creator: {
    id: 'creator-fed',
    messages: [
      {
        companionId: 'saffron',
        message: 'Good work. Now eat before inspiration becomes dizziness and bad decisions.',
      },
      { companionId: 'cipher', message: 'A blunt but operationally sound production note.' },
    ],
  },
  character: {
    id: 'character-table',
    messages: [
      {
        companionId: 'amara',
        message: 'Care can look like making sure someone feels welcome at the table.',
      },
      {
        companionId: 'saffron',
        message:
          'Exactly. Feed people, respect boundaries, and never make them earn the last potato.',
      },
    ],
  },
};

export const PARTY_BANTER = Object.fromEntries(
  Object.entries(BASE_PARTY_BANTER).map(([category, exchanges]) => [
    category,
    [
      ...exchanges,
      CASSIAN_BANTER[category as MissionCategory],
      SAFFRON_BANTER[category as MissionCategory],
    ],
  ]),
) as Record<MissionCategory, BanterExchange[]>;
