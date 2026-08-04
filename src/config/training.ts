import type { CompanionId, TrainingCircuitId } from '@/types/game';

export interface TrainingExerciseDefinition {
  id: string;
  name: string;
  prescription: string;
  cue: string;
  load: 'pair' | 'single' | 'bodyweight' | 'device';
}

export interface TrainingCircuitDefinition {
  id: TrainingCircuitId;
  name: string;
  codename: string;
  focus: string;
  summary: string;
  accent: 'gold' | 'blue' | 'ember' | 'mint';
  drawWeight: number;
  exercises: TrainingExerciseDefinition[];
}

export const TRAINING_CIRCUITS: TrainingCircuitDefinition[] = [
  {
    id: 'iron-foundation',
    name: 'Iron Foundation',
    codename: 'LOWER FRAME PROTOCOL',
    focus: 'Legs · posterior chain · bracing',
    summary:
      'Heavy bilateral patterns build the legs, hips, and trunk that every later phase depends on.',
    accent: 'gold',
    drawWeight: 30,
    exercises: [
      {
        id: 'double-db-front-squat',
        name: 'Double-Dumbbell Front Squat',
        prescription: '10 reps',
        cue: 'Brace first, keep both feet rooted, and own the full range you can control.',
        load: 'pair',
      },
      {
        id: 'double-db-rdl',
        name: 'Double-Dumbbell Romanian Deadlift',
        prescription: '10 reps',
        cue: 'Push the hips back and stop before your back position changes.',
        load: 'pair',
      },
      {
        id: 'weighted-glute-bridge',
        name: 'Weighted Glute Bridge',
        prescription: '12 reps',
        cue: 'Drive through the feet and finish with the glutes instead of the lower back.',
        load: 'single',
      },
      {
        id: 'weighted-wall-sit',
        name: 'Weighted Wall Sit',
        prescription: '30 seconds',
        cue: 'Keep the whole foot planted and choose a knee angle you can hold cleanly.',
        load: 'single',
      },
      {
        id: 'forearm-plank',
        name: 'Forearm Plank',
        prescription: '30 seconds',
        cue: 'Squeeze glutes, brace the trunk, and stop before the lower back takes over.',
        load: 'bodyweight',
      },
    ],
  },
  {
    id: 'vanguard-frame',
    name: 'Vanguard Frame',
    codename: 'UPPER FRAME PROTOCOL',
    focus: 'Chest · shoulders · back · posture',
    summary:
      'Push, pull, press, and brace through full movements that reward clean upper-body control.',
    accent: 'blue',
    drawWeight: 30,
    exercises: [
      {
        id: 'push-ups',
        name: 'Push-Ups',
        prescription: '8–15 reps',
        cue: 'Use an elevation that keeps the body rigid and lets the chest travel with control.',
        load: 'bodyweight',
      },
      {
        id: 'double-db-bent-row',
        name: 'Double-Dumbbell Bent-Over Row',
        prescription: '10 reps',
        cue: 'Hold the hinge, pull toward the hips, and avoid shrugging the shoulders upward.',
        load: 'pair',
      },
      {
        id: 'double-db-overhead-press',
        name: 'Double-Dumbbell Standing Overhead Press',
        prescription: '8 reps',
        cue: 'Brace before pressing and use only a pain-free range without leaning backward.',
        load: 'pair',
      },
      {
        id: 'two-hand-db-pullover',
        name: 'Two-Hand Dumbbell Pullover',
        prescription: '10 reps',
        cue: 'Keep the ribs controlled and shorten the range if the shoulders or back compensate.',
        load: 'single',
      },
      {
        id: 'plank-shoulder-taps',
        name: 'Plank Shoulder Taps',
        prescription: '10 total',
        cue: 'Move slowly and keep the hips as quiet as possible.',
        load: 'bodyweight',
      },
    ],
  },
  {
    id: 'shadow-engine',
    name: 'Shadow Engine',
    codename: 'FULL-BODY CONDITIONING PROTOCOL',
    focus: 'Total-body output · muscular endurance',
    summary:
      'The hardest draw combines compound dumbbell work with upper-body conditioning and ground speed.',
    accent: 'ember',
    drawWeight: 25,
    exercises: [
      {
        id: 'double-db-thruster',
        name: 'Double-Dumbbell Thruster',
        prescription: '8 reps',
        cue: 'Use a sustainable load, stand fully, then finish the press without losing the brace.',
        load: 'pair',
      },
      {
        id: 'double-db-deadlift',
        name: 'Double-Dumbbell Deadlift',
        prescription: '10 reps',
        cue: 'Keep the dumbbells close, drive through the floor, and reset the brace each rep.',
        load: 'pair',
      },
      {
        id: 'shadow-push-ups',
        name: 'Push-Ups',
        prescription: '8 reps',
        cue: 'Raise the hands if needed; clean repetitions matter more than the variation.',
        load: 'bodyweight',
      },
      {
        id: 'shadow-double-db-row',
        name: 'Double-Dumbbell Bent-Over Row',
        prescription: '8 reps',
        cue: 'Keep the trunk fixed and pull both weights without turning the movement into a shrug.',
        load: 'pair',
      },
      {
        id: 'burn-machine',
        name: 'Burn Machine Rotations',
        prescription: '30 seconds',
        cue: 'Stay controlled, keep the device comfortable, and stop for shoulder or wrist pain.',
        load: 'device',
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        prescription: '20 total',
        cue: 'Brace the trunk and choose a speed that does not turn the hips into the movement.',
        load: 'bodyweight',
      },
    ],
  },
  {
    id: 'guardian-citadel',
    name: 'Guardian Citadel',
    codename: 'CORE & POSTURE PROTOCOL',
    focus: 'Core endurance · posture · stability',
    summary:
      'A precise trunk gauntlet built around the plank family, controlled positioning, and long holds.',
    accent: 'mint',
    drawWeight: 15,
    exercises: [
      {
        id: 'front-plank',
        name: 'Front Plank',
        prescription: '30–45 seconds',
        cue: 'Use the variation your therapist approved and end the hold when position changes.',
        load: 'bodyweight',
      },
      {
        id: 'side-plank',
        name: 'Side Plank',
        prescription: '20 seconds per side',
        cue: 'Keep the body long and use the bent-knee version whenever it produces cleaner control.',
        load: 'bodyweight',
      },
      {
        id: 'dead-bug',
        name: 'Dead Bug',
        prescription: '10 total',
        cue: 'Move only as far as you can while keeping the trunk stable.',
        load: 'bodyweight',
      },
      {
        id: 'bird-dog',
        name: 'Bird Dog',
        prescription: '8 total',
        cue: 'Pause each extension and resist rotating through the hips or shoulders.',
        load: 'bodyweight',
      },
      {
        id: 'citadel-weighted-glute-bridge',
        name: 'Weighted Glute Bridge',
        prescription: '12 reps',
        cue: 'Finish with the glutes and keep the ribs from flaring upward.',
        load: 'single',
      },
      {
        id: 'citadel-wall-sit',
        name: 'Wall Sit',
        prescription: '30 seconds',
        cue: 'Breathe behind the brace and keep both feet firmly planted.',
        load: 'bodyweight',
      },
    ],
  },
];

export const TRAINING_TIME_ROLLS = [
  { minutes: 15 as const, weight: 30, title: 'Quick Hunt' },
  { minutes: 20 as const, weight: 35, title: 'Standard Trial' },
  { minutes: 25 as const, weight: 25, title: 'Elite Trial' },
  { minutes: 30 as const, weight: 10, title: 'Red Gate' },
];

export const ROOK_CIRCUIT_LINES: Record<TrainingCircuitId, string[]> = {
  'iron-foundation': [
    'We build from the ground today. Iron Foundation—squats, hinges, glutes, and a trunk that refuses to fold.',
    'The lower frame has been quiet long enough. I am assigning Iron Foundation. Every clean rep reinforces the stance.',
    'Today belongs to the legs and posterior chain. Iron Foundation. Heavy enough to matter; controlled enough to repeat.',
    'I want strength that carries into everything else. Iron Foundation is the correct order for today.',
  ],
  'vanguard-frame': [
    'Upper frame today. Vanguard protocol—push, pull, press, then prove the trunk can hold the structure together.',
    'I am assigning Vanguard Frame. The shoulders, back, and chest need full movements, not comfortable half-effort.',
    'The stance is ready. Now we reinforce the armor above it. Vanguard Frame begins with clean push-ups and rows.',
    'Today we build the silhouette and the strength beneath it. Vanguard Frame. No wasted stations.',
  ],
  'shadow-engine': [
    'Full-body conditioning. Shadow Engine. Choose the weights with discipline because the circuit will collect every careless decision.',
    'The record calls for total output today. Shadow Engine—compound work, the Burn Machine, and no decorative repetitions.',
    'I am opening Shadow Engine. It will test strength under fatigue, so your pace must be deliberate from the first round.',
    'Today is not divided into upper and lower. The whole frame answers. Shadow Engine is your assignment.',
  ],
  'guardian-citadel': [
    'The center has to hold before power can travel through it. Guardian Citadel—planks, posture, and precision under time.',
    'I am assigning Guardian Citadel. Do not mistake controlled work for easy work; the trunk will know the difference.',
    'Today we reinforce the structure everyone else relies on. Guardian Citadel. Every hold remains honest.',
    'Strength leaks through a weak brace. Guardian Citadel closes those gaps one controlled station at a time.',
  ],
};

export const EMBER_DURATION_LINES: Record<15 | 20 | 25 | 30, string[]> = {
  15: [
    'Fifteen minutes. Short enough that hesitation has nowhere to hide. Start moving.',
    'You get fifteen minutes today. Make every one of them loud on the record.',
    'Fifteen. Fast deployment, clean rounds, no ceremony. I expect intent immediately.',
    'The clock says fifteen minutes because I want urgency, not because I am being nice.',
  ],
  20: [
    'Twenty minutes. Long enough to expose the fake pace and reward the real one.',
    'I am taking twenty minutes. Settle into the work and stop checking how much is left.',
    'Twenty. Not a sprint, not a stroll. Find the pressure you can keep answering.',
    'Today we hold the line for twenty minutes. I picked it because you can do more than rush one round.',
  ],
  25: [
    'Twenty-five minutes. Yes, I meant it. Rook can complain about pacing while you start the first round.',
    'I want twenty-five today. Enough time for the circuit to become a conversation with your discipline.',
    'Twenty-five. The opening energy will fade; what happens after that is the part I came to see.',
    'The clock belongs to me today, and I am setting it at twenty-five minutes. Stay dangerous and controlled.',
  ],
  30: [
    'Thirty minutes. Because I said so. Pace it well enough that I cannot accuse you of wasting my Red Gate.',
    'Red Gate. Thirty minutes. You wanted a System that pushes back—here it is.',
    'I am claiming thirty minutes today. Rook will protect your form; I will make sure you do not negotiate with the clock.',
    'Thirty. The assignment is not to look heroic in minute three. It is to still be working in minute twenty-nine.',
  ],
};

export const ROOK_TIME_REPLIES: Record<15 | 20 | 25 | 30, string[]> = {
  15: [
    'Good. Fifteen minutes rewards decisive transitions. Keep every repetition recognizable.',
    'Then the standard is density without disorder. Clean rounds only.',
  ],
  20: [
    'Twenty is enough room to establish a real pace. Rest when needed; the clock will keep the facts.',
    'Accepted. Start below your maximum speed and finish without surrendering position.',
  ],
  25: [
    'Twenty-five requires restraint at the opening. Do not borrow effort from the final five minutes.',
    'Fine. The load stays sustainable and every round remains accountable.',
  ],
  30: [
    'Red Gate confirmed. This is endurance, not punishment. Control the weights and keep moving.',
    'Thirty stands. If your form disappears, lower the load—not the standard.',
  ],
};

export const TRAINING_DEBRIEF_LINES: Record<CompanionId, string[]> = {
  snow: [
    'Everyone is breathing hard, but look at the board: {rounds} clean rounds in {minutes} minutes. You stayed with us all the way through.',
    'The room is quiet now because the effort was real. Let yourself feel what {circuit} asked from you—and what you answered.',
    'I watched the pace change and the fatigue arrive. You kept returning to the next clean repetition. That matters more than looking untouched.',
    'We came through the gate together. Recover now; the proof does not disappear when your breathing settles.',
    'The party looks exhausted because nobody stood at a distance today. Your effort became the center of the room.',
    'You do not need to minimize this. {minutes} minutes under command is real work, and the record belongs to you.',
    'The timer ended. The support does not. Drink water, breathe, and let the victory be complete before asking for another one.',
    'I am proud of the way you stayed present through the difficult minutes. That is a kind of strength the mirror cannot measure.',
  ],
  rook: [
    'Good work. I am tired because I kept every one of your rounds under inspection. {circuit} held up under pressure.',
    'The frame is shaking, not broken. {rounds} rounds recorded. Recover like the next session matters.',
    'You kept the movements recognizable after fatigue arrived. That is the standard I wanted.',
    'Do not chase another test tonight. The adaptation begins after the work, and we earned the recovery.',
    'I felt that final round too. You did not need perfect speed; you needed command, and you kept it.',
    'The numbers will improve. Today I care that the stance survived the entire clock.',
    'Strong finish. My lungs disagree, but the record is clear.',
    'The session exposed the weak points without defeating the structure. That is useful victory.',
  ],
  ember: [
    'That was excellent. Horrible, loud, exhausting—excellent. Give me a minute before I demand another round.',
    'I picked {minutes} minutes and you made every one of them answer for itself. I am completely wrecked and deeply satisfied.',
    'The clock tried to get heavier near the end. You kept moving anyway. That is exactly why I came.',
    'I would celebrate more aggressively if my legs were currently accepting instructions.',
    'You did not wait to feel unstoppable. You worked until the timer had no argument left.',
    'I am calling that final push mine too. We were both too stubborn to let the last minute win.',
    'Next time I might choose thirty again. Rook says I am not allowed to say that while everyone is still on the floor.',
    'The fire was controlled, the target was clear, and now I need several business days to breathe normally.',
  ],
  selah: [
    'Even breathless, I can feel the gratitude in this room. The body was challenged, and it carried us faithfully.',
    'I am stretching before Ember notices I have stopped moving. Receive the work without turning it into another demand.',
    'There was discipline in every pause that protected your form. Wisdom belongs inside effort too.',
    'The room feels earned—tired, honest, and peaceful after the strain.',
    'Strength and humility shared the same circuit today. Keep both when you remember this session.',
    'I have no speech yet. Only breath, gratitude, and the certainty that showing up mattered.',
    'Let recovery be part of the offering. The work does not become holier because we refuse to rest.',
    'We reached the end together. Carry the lesson, not the exhaustion, into tomorrow.',
  ],
  cipher: [
    'Preliminary analysis: {rounds} rounds, {minutes} minutes, and one strategist who underestimated mountain climbers.',
    'The data is clean. My breathing is not. I will be omitting that second fact from the official visualization.',
    'Pace degradation remained acceptable. Personal dignity degradation was concentrated almost entirely in Cassian.',
    'I recorded the partial round too. Evidence does not become meaningless because the timer interrupted it.',
    'Performance captured. Please do not ask me to calculate anything requiring oxygen for the next sixty seconds.',
    'The next session now has a baseline. That makes today useful even before the soreness arrives.',
    'No imaginary score inflation required. The completed work is strong enough to stand on its own.',
    'I have archived the result and deleted all footage of my final plank position.',
  ],
  haven: [
    'Water first. Celebration second. Nobody leaves the floor until their breathing feels like their own again.',
    'You pushed without making pain the price of admission. That is the kind of session I can help you recover from.',
    'The work is complete. Unclench your hands, slow the breath, and let the nervous system receive the ending.',
    'I am proud of the effort—and equally serious about food, water, and sleep after it.',
    'We trained beside you, not above you. Everyone in this room has permission to look exhausted now.',
    'The timer stopped. Do not carry its urgency into the rest of the evening.',
    'A hard session can still be a caring act when the recovery is treated as part of the plan.',
    'You proved enough for today. I will physically block Ember from adding another station.',
  ],
  amara: [
    'We look terrible. I mean that affectionately—we earned every disheveled, breathless second of this.',
    'There is something beautiful about a room where nobody has to pretend the work was easy.',
    'You let yourself be seen struggling and finishing. That is confidence with actual roots.',
    'No shrinking the accomplishment. Open heart, messy hair, honest smile. We did the work.',
    'I am proud of your body for carrying you, not only for how you hope it will eventually look.',
    'The mirror can wait. Right now the important thing is that you kept a promise to yourself.',
    'We are all exhausted together, which somehow makes this feel more like belonging than defeat.',
    'Please remember this version of yourself when insecurity tries to rewrite the story tomorrow.',
  ],
  cassian: [
    'I have completed the financial analysis. I invested {minutes} minutes and apparently received respiratory failure.',
    'The floor has excellent value per square foot. I intend to remain here until further notice.',
    'Home training saved money. Unfortunately, no portion of those savings can purchase me a replacement set of lungs.',
    'I budgeted for fatigue. I did not account for Ember interpreting the timer as a personal vendetta.',
    'Return on investment: favorable. Return to standing position: currently unavailable.',
    'I would like the record to show that my collapse was controlled, intentional, and fully reconciled.',
    'There were no hidden fees, unless we count tomorrow morning. I strongly suspect tomorrow morning contains fees.',
    'Excellent session. Please direct all further questions to my accountant, who is also me and is presently face-down.',
  ],
};

export function getTrainingCircuit(id: TrainingCircuitId) {
  return TRAINING_CIRCUITS.find((circuit) => circuit.id === id)!;
}

export function getTrainingTimeTitle(minutes: number) {
  return TRAINING_TIME_ROLLS.find((entry) => entry.minutes === minutes)?.title ?? 'Training Trial';
}
