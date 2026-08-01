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

export const SUPPORT_DIALOGUE: Record<
  SupportTopicId,
  Record<SupportSpeaker, readonly string[]>
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
    'snow-close': [
      'Party record updated: something good happened, you let it matter, and we were here to celebrate it with you. Keep this one.',
      'Stay in the moment a little longer. Tomorrow can have its own objectives; this victory belongs to right now.',
      'I want you to remember this feeling without turning it into another demand. You did well. Full stop.',
    ],
  },
};

export function getSupportTopic(id: SupportTopicId) {
  return SUPPORT_TOPICS.find((topic) => topic.id === id)!;
}
