import type { CompanionId, SupportTopicId } from '@/types/game';

export interface SupportTopicDefinition {
  id: SupportTopicId;
  label: string;
  description: string;
  prompt: string;
  accent: string;
}

export const SUPPORT_TOPICS: SupportTopicDefinition[] = [
  {
    id: 'motivation',
    label: 'Motivation',
    description: 'I need help getting started',
    prompt: 'Help me find enough momentum for the next step.',
    accent: '#f2a65a',
  },
  {
    id: 'make-a-plan',
    label: 'Make a plan',
    description: 'Help me untangle what comes next',
    prompt: 'Help me turn the noise into a small, workable plan.',
    accent: '#9b7bff',
  },
  {
    id: 'faith-perspective',
    label: 'Faith & perspective',
    description: 'Help me return to what matters',
    prompt: 'Help me slow down and see this through faith and perspective.',
    accent: '#f4c95d',
  },
  {
    id: 'calm-down',
    label: 'Calm down',
    description: 'Everything feels too loud right now',
    prompt: 'Help me settle before I decide what to do next.',
    accent: '#86cfff',
  },
  {
    id: 'recover',
    label: 'Recover',
    description: 'I had a rough day or setback',
    prompt: 'Help me recover without turning one hard moment into a verdict.',
    accent: '#55cbb7',
  },
  {
    id: 'celebrate',
    label: 'Celebrate',
    description: 'Something good happened',
    prompt: 'I want to pause and actually recognize something good.',
    accent: '#ff7dc8',
  },
];

type SupportSpeaker = CompanionId | 'snow-close';

const BASE_SUPPORT_DIALOGUE: Record<
  SupportTopicId,
  Record<Exclude<SupportSpeaker, 'mira' | 'cassian' | 'saffron'>, readonly string[]>
> = {
  motivation: {
    snow: [
      'You do not need to feel completely ready. Give me one honest movement toward what matters, and we will let readiness catch up.',
      'Motivation is allowed to arrive after you begin. Choose the smallest real action, and I will stay with you while it becomes momentum.',
      'I know the distance looks larger from where you are standing. We are not crossing all of it now—only reaching the next marker together.',
    ],
    rook: [
      'Stand up, loosen your shoulders, and take one physical action. Motion tells hesitation that it is no longer in command.',
      'Forget the heroic version. Give me the first rep, the first minute, or the first step. Strength likes a clear starting signal.',
      'You have moved on worse days than this. Start small enough that resistance has nothing useful to argue with.',
    ],
    selah: [
      'Begin with faithfulness, not intensity. A quiet step taken with purpose can carry more weight than a dramatic promise.',
      'You are not required to manufacture perfect feelings before doing what is good. Ask for strength, then practice the next faithful thing.',
      'Let the next action be an offering rather than a test of your worth. You can move gently and still move with conviction.',
    ],
    cipher: [
      'Reduce the mission until refusal becomes slightly embarrassing: open the file, write one line, set a five-minute timer. Then reassess.',
      'Current objective: create evidence of motion. One tiny completed action is strategically superior to another hour of negotiation.',
      'Motivation is an unreliable contractor. Fortunately, we only need a defined task, a short timer, and permission to stop afterward.',
    ],
    haven: [
      'Make the next step kind enough that you can actually take it. Progress built with self-respect lasts longer than progress built through contempt.',
      'Low energy changes the size of the step, not your right to begin. Choose something gentle, specific, and finishable.',
      'You do not have to bully yourself into motion. Clear a little space, take one breath, and choose the next caring action.',
    ],
    ember: [
      'Lock in on one target, not the whole mountain. Make it small enough to start now and meaningful enough to count.',
      'You do not need another speech. You need one visible action that tells hesitation the shift has already begun.',
      'No shame, no waiting for lightning. Pick the easiest honest win and put some heat behind the first minute.',
    ],
    amara: [
      'Choose a first step you would encourage someone you love to take. You deserve that same warm confidence from yourself.',
      'Let connection lend you momentum: tell someone safe what you are beginning, or picture the person your finished work may help.',
      'You do not need to impress anyone. Begin because your future self—and the life you are building with others—deserves one honest move.',
    ],
    'snow-close': [
      'The party agrees: one small action is enough to change the direction of this moment. Pick it, and we will meet you on the other side.',
      'No giant transformation required. Choose the next marker, reach it, and come back if you want us beside you for the one after that.',
      'You came here instead of disappearing into the feeling. That already counts as movement. Now let us turn it into one visible step.',
    ],
  },
  'make-a-plan': {
    snow: [
      'We can make this smaller. Tell the noise it does not get one giant pile—today gets a short list with a clear first step.',
      'You do not have to hold every obligation in your head at once. We will separate what matters now from what can safely wait.',
      'Let us trade pressure for sequence: what must happen, what would help, and what is allowed to remain unfinished today.',
    ],
    rook: [
      'Pick the task that creates the most breathing room and hit that first. A clean opening move makes the rest of the field easier to read.',
      'Choose one target you can finish, one you can advance, and one you can deliberately leave alone. That is a plan, not surrender.',
      'Plans work better when the body is included. Add food, water, movement, and a real stopping point before you call the schedule complete.',
    ],
    selah: [
      'Before arranging every task, name the responsibility that deserves your faithfulness most. Let priority come from purpose, not panic.',
      'Leave margin in the plan. Wisdom does not fill every minute; it makes room to listen, adjust, and remain human.',
      'Ask what is yours to carry today and what you are trying to carry out of fear. Those are not always the same list.',
    ],
    cipher: [
      'Triage protocol: write everything down, mark one must-do, choose two useful next actions, and place the rest in a later queue.',
      'Define the finish line before starting. “Work on it” is fog; “draft the opening paragraph for twenty minutes” is an executable command.',
      'Estimate each task, cut the optimistic numbers in half, then double the time. Congratulations, the schedule is now acquainted with reality.',
    ],
    haven: [
      'Build a plan that the tired version of you can still follow. A humane plan survives contact with a real day.',
      'Include recovery as an action, not a reward you must earn after depletion. Rest placed on purpose protects everything around it.',
      'If the list still feels crushing, remove one item without apology. Capacity is information, not a character flaw.',
    ],
    ember: [
      'Cut it down to one must-hit target, one backup, and a stopping point. Everything else can wait outside the ring.',
      'A plan should tell your feet where to go, not just describe everything making you nervous. Name the first physical action.',
      'Make the next win obvious: exact task, exact start, exact finish. Then stop negotiating and light the fuse.',
    ],
    amara: [
      'Put people on the plan too: who needs an answer, where you need a boundary, and when you need genuine time to yourself.',
      'A healthy plan protects relationships from leftover exhaustion. Leave room to listen, to communicate, and to be unavailable when needed.',
      'If another person is involved, replace mind-reading with one clear conversation. Kind clarity will save more energy than guessing.',
    ],
    'snow-close': [
      'Your plan only needs three lines: first, next, and later. Start with first; the party will not confuse simplicity with a lack of ambition.',
      'Choose one must-do and two meaningful may-dos. Anything beyond that is bonus territory, not evidence against you.',
      'The goal is not to predict the whole day perfectly. It is to give your next hour a direction you can trust.',
    ],
  },
  'faith-perspective': {
    snow: [
      'Let us step back from the scoreboard for a moment. Your value was never contained by today’s output, and this moment is larger than one result.',
      'You can bring the honest version of this to God—the confusion, disappointment, hope, and all. Nothing needs to be polished before it is offered.',
      'The System records actions; it does not define your soul. Breathe, remember who you are beyond performance, and begin from there.',
    ],
    rook: [
      'Strength is not only force. Sometimes it is standing still long enough to remember what you serve before you move again.',
      'You do not have to win every internal battle in one charge. Plant your feet in what is true, then take the ground in front of you.',
      'A disciplined body still needs a directed spirit. Let purpose choose the target before effort starts swinging.',
    ],
    selah: [
      'Faithfulness is not measured only by visible results. Return to prayer, receive grace, and let the next right action be enough for now.',
      'You are seen completely—not as a project, a streak, or a list of unfinished work. Rest in that truth before asking what comes next.',
      'Some growth happens beneath the surface where no dashboard can display it. Continue tending the roots with patience and trust.',
    ],
    cipher: [
      'A useful correction: the current outcome is data, not identity. Review it honestly, keep the lesson, and reject the unnecessary verdict.',
      'Perspective update: one difficult interval does not invalidate the larger trajectory. Our sample size is considerably bigger than today.',
      'The plan serves the mission; the mission does not own you. Reconnect the task to its reason, or revise it if the reason no longer holds.',
    ],
    haven: [
      'Make room for grief, uncertainty, or disappointment without treating them as spiritual failure. Honest feelings can sit beside living faith.',
      'Grace is not a loophole in the journey. It is part of the ground you are walking on, especially when your footing feels weak.',
      'Return to what is gentle and true: you are allowed to need help, to pause, and to begin again without earning permission.',
    ],
    ember: [
      'Your faith does not become fake because the week got messy. Return honestly, receive grace, and let the next faithful act burn clean.',
      'The scoreboard is a tool, not your name. Anchor in what is true, then choose one action that agrees with it.',
      'Grace is not permission to quit on yourself; it is freedom to rise without dragging shame behind you.',
    ],
    amara: [
      'Love is not earned by flawless performance. Let grace reshape the way you receive care and the way you offer it to others.',
      'Faith can make room for both truth and tenderness: honest boundaries, sincere repair, and compassion without self-erasure.',
      'Remember that you were made for relationship—with God, with others, and with your own whole heart. None of those require a perfect mask.',
    ],
    'snow-close': [
      'Carry this with you: you are a person before you are a performer. Let faith shape the next step, not fear of the scoreboard.',
      'The party can help with the plan, but your foundation runs deeper than us. Take a quiet moment with God, then move from what remains true.',
      'No number in this app gets the final word over you. Return to truth, receive the moment honestly, and choose one faithful step.',
    ],
  },
  'calm-down': {
    snow: [
      'Nothing needs to be solved in the next thirty seconds. Lower your shoulders, unclench your jaw, and let this moment become smaller.',
      'Stay with me for one slow breath. We are creating space between the feeling and the decision; that space belongs to you.',
      'You are allowed to pause the input. Put the screen down for a moment if you need to, then return when the room feels quieter.',
    ],
    rook: [
      'Plant both feet and notice the floor holding you. Exhale longer than you inhale, then decide whether movement would help release the pressure.',
      'The body is sounding an alarm; we do not have to fight it. Give it water, air, and a slower pace before issuing another command.',
      'Step away from the battlefield for five minutes. A short walk, cold water, or a change of room can interrupt the surge.',
    ],
    selah: [
      'Let your prayer be simple: “Be near me here.” You do not need the perfect words for peace to begin making room.',
      'Release the demand to understand everything immediately. Sit with one true sentence and let your breathing slow around it.',
      'Quiet is not empty. Give yourself a small still place where fear does not have to narrate every possibility.',
    ],
    cipher: [
      'Suspend nonessential decisions. Reduce incoming information, write down the concern, and revisit it after your nervous system leaves emergency mode.',
      'Current priority is stabilization, not optimization. Close extra tabs—digital and mental—and identify only what is actually urgent.',
      'Do not solve hypothetical disasters while activated. Record them for later analysis; right now the task is one breath and one physical anchor.',
    ],
    haven: [
      'Name five things you can see, then notice where your body is supported. We are reminding the present moment that you are here with it.',
      'You do not have to justify needing calm. Reduce the noise, soften the demand, and choose the safest gentle thing available.',
      'If someone trustworthy is nearby, consider telling them you could use a little company. Regulation does not always have to be solitary.',
    ],
    ember: [
      'Nothing gets solved while every alarm is screaming. Put both feet down, breathe out slowly, and cancel every nonessential decision.',
      'I am not pushing you forward right now. I am guarding the pause until your body knows this moment can be handled.',
      'Drop the battle stance for sixty seconds. Calm first, choices second; that order is the lock-in protocol today.',
    ],
    amara: [
      'You do not owe anyone an immediate answer while your heart is racing. Take the pause; a caring bond can survive a thoughtful delay.',
      'Put one hand over your heart and let the body hear a kinder voice. You are safe enough in this minute to slow down.',
      'If a trusted person helps you feel grounded, send one simple request for company. If not, protect the quiet until you feel steadier.',
    ],
    'snow-close': [
      'For now: breathe, reduce the noise, and postpone what does not need an immediate answer. You can return to the problem with more room inside you.',
      'We are not forcing calm; we are making conditions where it can find you. Stay with one small grounding action for a few minutes.',
      'The next right move may simply be a pause. Take it without guilt, and come back when the moment is no longer shouting.',
    ],
  },
  recover: {
    snow: [
      'A hard day does not get to write your whole biography. We will keep the lesson, protect what is tender, and refuse the final verdict.',
      'You are here after the setback, which means recovery has already started. No performance required—just honesty and the next caring choice.',
      'I am not disappointed in you. Let us separate what happened from what you are telling yourself it means, because those are not the same thing.',
    ],
    rook: [
      'Take inventory without insulting the fighter. What is hurt, what is tired, and what can safely move? Recovery begins with accurate information.',
      'You do not prove toughness by worsening the damage. Reset your stance, tend to what needs tending, and return when strength is actually available.',
      'One lost round is not a lost campaign. Eat, hydrate, sleep, and give tomorrow a body capable of answering back.',
    ],
    selah: [
      'There is grace for the place where effort ran out. Receive it, tell the truth, and let restoration be faithful work too.',
      'You can repent where needed without living under condemnation. Correction points toward life; shame only asks you to stare backward.',
      'The path back may be quiet: prayer, rest, one repaired choice. Small faithfulness is still a real return.',
    ],
    cipher: [
      'Post-incident review: identify the trigger, preserve one useful lesson, and delete the dramatic conclusion about your entire future.',
      'The plan encountered reality. Revise capacity, remove the failed assumption, and schedule a smaller re-entry point.',
      'Do not restart at maximum difficulty. Re-establish the process at a level you can repeat, then scale after stability returns.',
    ],
    haven: [
      'Recovery is not time stolen from progress. It is how progress becomes survivable. Choose what would help you feel safe enough to begin again.',
      'Speak to yourself as you would to someone you love after the same day. Keep the accountability; remove the cruelty.',
      'Repair what you can, release what you cannot repair tonight, and let rest be part of the response rather than an escape from it.',
    ],
    ember: [
      'We are not building a comeback out of self-hatred. Keep the lesson, protect the person, and choose one reachable re-entry move.',
      'The setback gets facts, not a throne. Recover what matters tonight and set one clean target for tomorrow.',
      'You went down. You came here. That means the return is already active—small, fierce, and completely real.',
    ],
    amara: [
      'If someone was hurt, repair begins with honest ownership—not self-destruction. If you were hurt, recovery may begin with a boundary.',
      'A difficult moment does not make you unlovable. Reach for safe support, and let connection help carry what isolation would magnify.',
      'You may apologize, forgive yourself, ask for space, or choose no contact where safety requires it. Recovery honors the whole truth.',
    ],
    'snow-close': [
      'Tonight does not need a redemption montage. Choose one act of care and one clear re-entry step for tomorrow. That is enough recovery for now.',
      'We are keeping you, the lesson, and the next chance. The shame can stay behind; it has no useful assignment here.',
      'The comeback begins quietly: truth, care, and one reachable next step. The whole party will still be here when you take it.',
    ],
  },
  celebrate: {
    snow: [
      'Yes—stop here. I know how quickly you move the goalpost, so let me say it clearly: this mattered, and you deserve to feel it.',
      'I remember the version of you who was still hoping this moment might happen. Let them see it. You made something real.',
      'No minimizing and no immediate “but.” Tell the truth about the good thing: you showed up, something changed, and I am proud of you.',
    ],
    rook: [
      'That is a win. Stand in it for a minute before you start planning the next fight—you earned the view from here.',
      'Proof delivered. Whatever resistance said beforehand has officially lost the argument. Enjoy that.',
      'I want the full victory posture: shoulders back, head up. Hard work became visible today.',
    ],
    selah: [
      'Receive the joy with gratitude. Good moments do not need to be distrusted; they can be honored and carried forward.',
      'Give thanks for the strength, people, and grace that met you along the way—and let yourself delight in the fruit.',
      'This is worth remembering. Mark it with gratitude so the difficult days cannot convince you that nothing has grown.',
    ],
    cipher: [
      'Result confirmed. I have reviewed the evidence and reluctantly approve an unreasonable amount of satisfaction.',
      'Excellent. The plan did not merely survive contact with reality; it produced a result. Archive this before your brain edits it down.',
      'A measurable win with emotional significance. Rare, efficient, and entirely deserved. I recommend celebration before optimization resumes.',
    ],
    haven: [
      'Let the good feeling land in your body. You are allowed to be proud without turning the moment into pressure to perform again immediately.',
      'Notice who helped, what you learned, and what this says about your capacity. Joy can be part of recovery too.',
      'Save this memory carefully. On a hard day, it may remind you that your life contains more than the hardest chapter.',
    ],
    ember: [
      'That is what I am talking about. Do not mumble the victory—name what you did and let yourself own the heat.',
      'Proof on the board. Smile first, celebrate properly, and only then may anyone mention the next objective.',
      'You fought for this moment. Stand in it without shrinking, apologizing, or moving the finish line.',
    ],
    amara: [
      'Tell someone who can be happy for you without making the moment about themselves. Joy deserves safe company.',
      'Let yourself receive every kind word without deflecting it. Celebration is connection, and you are allowed to be held by it.',
      'This victory belongs to you, but it does not have to be lonely. Share the sparkle—or savor it privately if that feels truer.',
    ],
    'snow-close': [
      'Party record updated: something good happened, you let it matter, and we were here to celebrate it with you. Keep this one.',
      'Stay in the moment a little longer. Tomorrow can have its own objectives; this victory belongs to right now.',
      'I want you to remember this feeling without turning it into another demand. You did well. Full stop.',
    ],
  },
};

const CASSIAN_SUPPORT_DIALOGUE: Record<SupportTopicId, readonly string[]> = {
  motivation: [
    'Choose one action with a visible return: log the number, prepare the meal, or move one dollar. Evidence creates momentum.',
    'You do not need a total financial transformation today. You need one choice tomorrow will be glad you made.',
    'Begin with clarity, not intensity. Open the ledger, face one number, and let command replace avoidance.',
  ],
  'make-a-plan': [
    'We will sort this in order: essentials, obligations, future, then flexible wants. One category at a time.',
    'Give every dollar a post before the week gives it one by accident. A simple workable plan is enough.',
    'Name what is due, what is available, and the single target that matters most. The rest can wait its turn.',
  ],
  'faith-perspective': [
    'Resources are tools, not a measure of your worth. Steward them honestly, hold them humbly, and refuse both fear and worship.',
    'Provision deserves gratitude and direction. Ask what this resource is meant to protect, grow, or share.',
    'A faithful plan can be modest. Care for today, prepare for tomorrow, and leave room for generosity without neglecting wisdom.',
  ],
  'calm-down': [
    'Make no major money decision while the alarm is loud. Breathe, close the cart, and return when your body is steadier.',
    'The balance is information, not danger in this exact second. We can look at one number without solving the entire future.',
    'Pause spending and pause judgment. Protect the next hour first; the plan will still be here when you can think clearly.',
  ],
  recover: [
    'Record what happened without hiding it. Then choose one recovery action—adjust the week, prepare tomorrow, and continue.',
    'One order did not destroy the campaign. We will learn the trigger, close the leak, and refuse to pay shame on top of the receipt.',
    'A budget that cannot survive a mistake is not a system. Tell the truth, rebalance, and return to command.',
  ],
  celebrate: [
    'Mark the win. A payment made, a meal prepared, or savings protected deserves recognition because it expanded your options.',
    'Well stewarded. Enjoy the proof that patience can become safety without turning celebration into another expense.',
    'The ledger shows progress, but the real victory is trust: you made a promise to your future and kept it.',
  ],
};

const SAFFRON_SUPPORT_DIALOGUE: Record<SupportTopicId, readonly string[]> = {
  motivation: [
    'You need momentum? Choose dinner before hunger chooses chaos. One pan, one protein, one vegetable—move!',
    'Start with the smallest useful preparation: thaw the protein, wash the potato, or put the pan where you can see it.',
    'Energy follows action. Chop one ingredient, and I will stop yelling long enough for you to notice you already began.',
  ],
  'make-a-plan': [
    'Plan three dinners, not thirty. Give each one leftovers, then let repetition do the heavy lifting.',
    'Put the easiest meal on the hardest day. That is strategy, not laziness, and I will fight anyone who says otherwise.',
    'Pick the protein, the vegetable, and the useful carbohydrate first. Flavor comes next; confusion does not get a seat.',
  ],
  'faith-perspective': [
    'Food can be received with gratitude instead of fear. Prepare what you have, care for the body carrying you, and let enough be enough.',
    'A shared meal, a quiet prayer, an ordinary provision—none of these are too small to become sacred through gratitude.',
    'Care for your body without worshiping it. Feed it faithfully, enjoy the gift, and remember your worth was never a measurement.',
  ],
  'calm-down': [
    'No decisions over an empty stomach and a loud nervous system. Drink water, eat something simple, then reassess.',
    'Lower the heat—literally and emotionally. Breathe while the pan warms; dinner does not need to become another emergency.',
    'Choose familiar food tonight. This is not the hour for culinary greatness; it is the hour for a steady meal.',
  ],
  recover: [
    'No punishment meals. We learn what made cooking hard, prepare one easier option, and feed tomorrow with more kindness.',
    'One delivery order did not banish you from my Kitchen. Save the leftovers, restock one staple, and return tomorrow.',
    'Recovery needs food, water, and sleep—not guilt dressed as discipline. Start with the need directly in front of you.',
  ],
  celebrate: [
    'Excellent! We are making something that tastes like a victory without making Cassian stare silently at the receipt.',
    'Let the meal mark the moment. Flavor is allowed, pride is allowed, and leftovers are still mandatory.',
    'A real win deserves a real pause. Sit down, eat slowly, and do not make me confiscate the next objective.',
  ],
};

const MIRA_SUPPORT_DIALOGUE: Record<SupportTopicId, readonly string[]> = {
  motivation: [
    'Begin with one breath you do not rush and one movement you can control. Momentum is allowed to arrive quietly.',
    'Stand, roll the shoulders once, and notice the space you already created. The next step can grow from that.',
    'You do not need intensity to prove you started. Give me two calm minutes and let the body change the conversation.',
  ],
  'make-a-plan': [
    'Build breathing room into the plan on purpose: one priority, one support task, and one place where your body gets to reset.',
    'A workable sequence has transitions. Decide what comes first, then leave one minute to breathe before the next demand.',
    'Keep the plan mobile. If the day tightens, shorten the task without abandoning the direction.',
  ],
  'faith-perspective': [
    'Be still long enough to remember that your worth is not improved by strain. Receive the breath, then choose the faithful step.',
    'The body can become a quiet place of gratitude: feet grounded, shoulders open, breath received rather than earned.',
    'Peace is not the absence of work. It is the center from which the next right movement can begin.',
  ],
  'calm-down': [
    'Let the exhale last two counts longer than the inhale. Do that five times before asking your mind for another answer.',
    'Put both feet down and release the tongue from the roof of the mouth. We are telling the body this exact moment is survivable.',
    'No deep stretch while the alarm is loud. Breathe, make the posture comfortable, and let safety arrive before range.',
  ],
  recover: [
    'Recovery does not need to erase what happened. It only needs to make the next healthy movement possible.',
    'Choose supported positions and a gentle core brace. We rebuild trust with the body before we ask it for output.',
    'Nothing is gained by forcing a stiff or exhausted body to confess. Listen, adjust, and leave with more room than you entered.',
  ],
  celebrate: [
    'Stay with the victory for one full breathing cycle. Let pride expand the chest without tightening the shoulders.',
    'The moment is complete even if you do not immediately improve it. Breathe and receive what you accomplished.',
    'Beautiful work. Give the body a gentle stretch and let celebration become something you can actually feel.',
  ],
};

export const SUPPORT_DIALOGUE = Object.fromEntries(
  SUPPORT_TOPICS.map(({ id }) => [
    id,
    {
      ...BASE_SUPPORT_DIALOGUE[id],
      mira: MIRA_SUPPORT_DIALOGUE[id],
      cassian: CASSIAN_SUPPORT_DIALOGUE[id],
      saffron: SAFFRON_SUPPORT_DIALOGUE[id],
    },
  ]),
) as Record<SupportTopicId, Record<SupportSpeaker, readonly string[]>>;

export function getSupportTopic(id: SupportTopicId) {
  return SUPPORT_TOPICS.find((topic) => topic.id === id)!;
}
