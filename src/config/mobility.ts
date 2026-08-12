import type {
  MobilityDiscipline,
  MobilityMoodId,
  MobilityMovementAssignment,
  MobilityMovementKind,
} from '@/types/game';

export interface MobilityMoodDefinition {
  id: MobilityMoodId;
  name: string;
  state: string;
  message: string;
  movementCount: 6 | 7 | 8;
  estimatedMinutes: 14 | 18 | 22;
  intensityIndex: 0 | 1 | 2;
  weights: Record<MobilityDiscipline, number>;
}

export interface MobilityDisciplineDefinition {
  id: MobilityDiscipline;
  name: string;
  subtitle: string;
}

interface MobilityMovementDefinition {
  id: string;
  name: string;
  kind: MobilityMovementKind;
  disciplines: MobilityDiscipline[];
  prescriptions: [string, string, string];
  instructions: string[];
  breathingCue: string;
  safetyCue?: string;
}

export const MOBILITY_DISCIPLINES: MobilityDisciplineDefinition[] = [
  {
    id: 'mobility',
    name: 'Mobility Reset',
    subtitle: 'Controlled joint motion, gentle stretching, and usable range.',
  },
  {
    id: 'yoga',
    name: 'Violet Yoga Flow',
    subtitle: 'Breath-led positions, balance, and calm transitions.',
  },
  {
    id: 'pilates',
    name: 'Stillpoint Pilates',
    subtitle: 'Precise control, posture, and low-impact core endurance.',
  },
];

export const MOBILITY_MOODS: MobilityMoodDefinition[] = [
  {
    id: 'still-waters',
    name: 'Still Waters',
    state: 'Soft voice · patient holds · nervous system first',
    message:
      'Today we make space. Nothing is forced, nothing is rushed, and every breath gets a vote.',
    movementCount: 6,
    estimatedMinutes: 14,
    intensityIndex: 0,
    weights: { mobility: 5, yoga: 3, pilates: 2 },
  },
  {
    id: 'open-sky',
    name: 'Open Sky',
    state: 'Playful focus · flowing range · steady control',
    message:
      'You have room to explore today. We will move with curiosity, keep the breath smooth, and leave lighter than we arrived.',
    movementCount: 7,
    estimatedMinutes: 18,
    intensityIndex: 1,
    weights: { mobility: 3, yoga: 5, pilates: 3 },
  },
  {
    id: 'quiet-fire',
    name: 'Quiet Fire',
    state: 'Calm eyes · longer work · precise core command',
    message:
      'Peace is not passivity. We hold the shape, control the center, and breathe until tension learns it is not in charge.',
    movementCount: 8,
    estimatedMinutes: 22,
    intensityIndex: 2,
    weights: { mobility: 2, yoga: 3, pilates: 6 },
  },
];

const MOVEMENTS: MobilityMovementDefinition[] = [
  {
    id: 'ninety-ninety-breathing',
    name: '90/90 Breathing Reset',
    kind: 'breath',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['5 slow breaths', '6 slow breaths', '8 slow breaths'],
    instructions: [
      'Lie on your back with lower legs resting on a chair so hips and knees are near 90 degrees.',
      'Let the ribs soften down as you exhale; keep the neck, jaw, and shoulders relaxed.',
    ],
    breathingCue: 'Inhale through the nose for 4 counts; exhale gently for 6 counts.',
  },
  {
    id: 'crocodile-breathing',
    name: 'Crocodile Breathing',
    kind: 'breath',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['5 slow breaths', '6 slow breaths', '8 slow breaths'],
    instructions: [
      'Lie face-down with your forehead resting on stacked hands and legs comfortable.',
      'Let the abdomen press gently into the floor as the breath widens the low ribs.',
    ],
    breathingCue: 'Breathe low and wide; make every exhale longer than the inhale.',
  },
  {
    id: 'box-breathing',
    name: 'Seated Box Breathing',
    kind: 'breath',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: [
      '4 rounds · 3 counts each',
      '5 rounds · 4 counts each',
      '6 rounds · 4 counts each',
    ],
    instructions: [
      'Sit tall but not rigid, with hands resting loosely on your thighs.',
      'Inhale, hold softly, exhale, and pause for the same count without straining.',
    ],
    breathingCue: 'Keep the breath quiet. Shorten the count immediately if you feel air hunger.',
  },
  {
    id: 'supine-rest-breath',
    name: 'Supine Closing Breath',
    kind: 'breath',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['60 seconds', '90 seconds', '2 minutes'],
    instructions: [
      'Lie on your back with knees bent or legs supported—choose the position that feels easiest.',
      'Release effort from the face, hands, stomach, and hips one area at a time.',
    ],
    breathingCue: 'Allow the breath to return to normal; do not force depth or pace.',
  },
  {
    id: 'cat-cow',
    name: 'Cat–Cow Spinal Wave',
    kind: 'mobility',
    disciplines: ['mobility', 'yoga'],
    prescriptions: ['5 slow cycles', '7 slow cycles', '9 slow cycles'],
    instructions: [
      'Start on hands and knees with wrists under shoulders and knees under hips.',
      'Round the spine gently, then reverse the curve from tailbone through the chest.',
    ],
    breathingCue: 'Exhale while rounding; inhale while opening the chest.',
    safetyCue: 'Move only through a comfortable range; do not throw the head backward.',
  },
  {
    id: 'thread-the-needle',
    name: 'Thread the Needle',
    kind: 'mobility',
    disciplines: ['mobility', 'yoga'],
    prescriptions: ['4 reps each side', '5 reps each side', '6 reps each side'],
    instructions: [
      'From hands and knees, slide one arm beneath the other with the palm facing up.',
      'Let the upper back rotate while the hips remain mostly over the knees, then return.',
    ],
    breathingCue: 'Exhale into the rotation; inhale as you return to center.',
  },
  {
    id: 'ninety-ninety-switches',
    name: '90/90 Hip Switches',
    kind: 'mobility',
    disciplines: ['mobility', 'pilates'],
    prescriptions: ['5 controlled switches', '7 controlled switches', '9 controlled switches'],
    instructions: [
      'Sit with knees bent and feet wider than hip width, using hands behind you if needed.',
      'Lower both knees to one side, return through center, and change sides without rushing.',
    ],
    breathingCue: 'Exhale as the knees lower; inhale through center.',
    safetyCue: 'Keep the range smaller if either knee feels pinched.',
  },
  {
    id: 'half-kneeling-hip-flexor',
    name: 'Half-Kneeling Hip Flexor',
    kind: 'mobility',
    disciplines: ['mobility', 'yoga'],
    prescriptions: ['20 seconds each side', '30 seconds each side', '40 seconds each side'],
    instructions: [
      'Kneel with one foot forward and pad the down knee.',
      'Gently tuck the pelvis, squeeze the back-side glute, and shift forward a few inches.',
    ],
    breathingCue: 'Use slow breaths and soften slightly deeper only on the exhale.',
    safetyCue: 'You should feel the front of the hip—not pressure in the low back or knee.',
  },
  {
    id: 'open-book',
    name: 'Open Book Rotation',
    kind: 'mobility',
    disciplines: ['mobility', 'yoga'],
    prescriptions: ['4 reps each side', '6 reps each side', '8 reps each side'],
    instructions: [
      'Lie on your side with hips and knees bent, arms extended together in front.',
      'Sweep the top arm open while keeping the knees stacked, then return slowly.',
    ],
    breathingCue: 'Exhale as the chest opens; inhale as the hands meet again.',
  },
  {
    id: 'ankle-rocks',
    name: 'Knee-to-Wall Ankle Rocks',
    kind: 'mobility',
    disciplines: ['mobility'],
    prescriptions: ['6 reps each side', '8 reps each side', '10 reps each side'],
    instructions: [
      'Face a wall in a short split stance with the front heel planted.',
      'Guide the front knee toward the wall over the middle toes, then return.',
    ],
    breathingCue: 'Breathe normally and keep every repetition smooth.',
    safetyCue: 'Shorten the range if the heel lifts or the ankle pinches.',
  },
  {
    id: 'downward-dog-pedal',
    name: 'Downward Dog Pedal',
    kind: 'yoga',
    disciplines: ['yoga'],
    prescriptions: ['30 seconds', '40 seconds', '50 seconds'],
    instructions: [
      'From hands and knees, lift the hips up and back with knees comfortably bent.',
      'Alternate bending one knee while lengthening the opposite heel toward the floor.',
    ],
    breathingCue:
      'Keep a steady nasal breath; make the movement smaller if breath becomes strained.',
    safetyCue: 'Press evenly through the hands and stop if wrists or shoulders hurt.',
  },
  {
    id: 'low-lunge',
    name: 'Low Lunge',
    kind: 'yoga',
    disciplines: ['yoga'],
    prescriptions: ['20 seconds each side', '30 seconds each side', '40 seconds each side'],
    instructions: [
      'Step one foot between the hands and lower the back knee onto padding.',
      'Lift the chest and let the hips travel forward only as far as control remains.',
    ],
    breathingCue: 'Inhale tall; exhale and release unnecessary tension around the hips.',
  },
  {
    id: 'half-split',
    name: 'Half Split',
    kind: 'yoga',
    disciplines: ['yoga'],
    prescriptions: ['20 seconds each side', '30 seconds each side', '40 seconds each side'],
    instructions: [
      'From a low lunge, shift the hips back and straighten the front leg only comfortably.',
      'Keep the spine long and hinge forward from the hips instead of rounding deeply.',
    ],
    breathingCue: 'Inhale to lengthen; exhale to soften without bouncing.',
  },
  {
    id: 'sphinx',
    name: 'Sphinx Pose',
    kind: 'yoga',
    disciplines: ['yoga'],
    prescriptions: ['20 seconds', '30 seconds', '45 seconds'],
    instructions: [
      'Lie on your stomach and place forearms on the floor with elbows near the shoulders.',
      'Press the forearms down, lengthen the crown forward, and keep the glutes relaxed.',
    ],
    breathingCue: 'Breathe into the front and sides of the ribs.',
    safetyCue: 'Lower immediately if you feel pinching or pain in the low back.',
  },
  {
    id: 'supine-twist',
    name: 'Supine Spinal Twist',
    kind: 'yoga',
    disciplines: ['yoga', 'mobility'],
    prescriptions: ['25 seconds each side', '35 seconds each side', '45 seconds each side'],
    instructions: [
      'Lie on your back, draw one knee in, and guide it gently across the body.',
      'Keep both shoulders heavy and support the knee with a pillow if it hangs in space.',
    ],
    breathingCue: 'Let each exhale soften the ribs and waist; never force the knee downward.',
  },
  {
    id: 'pelvic-curl',
    name: 'Pilates Pelvic Curl',
    kind: 'pilates',
    disciplines: ['pilates'],
    prescriptions: ['6 slow reps', '8 slow reps', '10 slow reps'],
    instructions: [
      'Lie on your back with knees bent, feet planted, and arms relaxed.',
      'Tuck the pelvis and peel the spine up one segment at a time, then lower slowly.',
    ],
    breathingCue: 'Exhale to roll up; inhale at the top; exhale while lowering.',
  },
  {
    id: 'pilates-clamshell',
    name: 'Pilates Clamshell',
    kind: 'pilates',
    disciplines: ['pilates'],
    prescriptions: ['8 reps each side', '10 reps each side', '12 reps each side'],
    instructions: [
      'Lie on your side with hips and knees bent, heels together, and pelvis stacked.',
      'Open the top knee without rolling the waist or pelvis backward, then lower slowly.',
    ],
    breathingCue: 'Exhale to open; inhale to return with control.',
  },
  {
    id: 'single-leg-stretch',
    name: 'Modified Single-Leg Stretch',
    kind: 'pilates',
    disciplines: ['pilates'],
    prescriptions: ['5 reps each side', '7 reps each side', '9 reps each side'],
    instructions: [
      'Lie on your back with both knees bent above the hips and head resting down.',
      'Extend one heel forward while the other knee stays bent, then switch without arching.',
    ],
    breathingCue: 'Exhale through each switch and keep the ribs heavy.',
    safetyCue: 'Keep the extending foot higher or tap the heel down if the low back lifts.',
  },
  {
    id: 'swimming-prep',
    name: 'Pilates Swimming Prep',
    kind: 'pilates',
    disciplines: ['pilates'],
    prescriptions: ['5 reps each side', '7 reps each side', '9 reps each side'],
    instructions: [
      'Lie face-down with forehead supported and arms reaching forward.',
      'Lift one arm and the opposite leg slightly, lengthening more than lifting, then switch.',
    ],
    breathingCue: 'Exhale during each lift; keep the breath calm and the neck long.',
    safetyCue: 'Stop if the low back compresses; make the lift smaller or use bird dog instead.',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    kind: 'core',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['5 reps each side', '7 reps each side', '9 reps each side'],
    instructions: [
      'Lie on your back with knees above hips and arms pointing upward.',
      'Slowly reach opposite arm and leg away while keeping the ribs down, then return and switch.',
    ],
    breathingCue: 'Exhale through the reach; inhale as you return.',
    safetyCue: 'Shorten the reach or tap one heel down if the low back starts lifting.',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    kind: 'core',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['5 reps each side', '7 reps each side', '9 reps each side'],
    instructions: [
      'From hands and knees, brace gently and reach one arm and the opposite leg long.',
      'Pause without rotating the hips, return under control, and switch sides.',
    ],
    breathingCue: 'Exhale as you reach; inhale as you return.',
  },
  {
    id: 'forearm-plank',
    name: 'Forearm Plank',
    kind: 'core',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['20 seconds', '30 seconds', '40 seconds'],
    instructions: [
      'Place forearms down and extend the legs, or keep both knees on the floor.',
      'Push the floor away, keep a straight line from head through hips, and avoid holding the breath.',
    ],
    breathingCue: 'Use quiet, continuous breaths; end the set when the shape or breath breaks.',
  },
  {
    id: 'side-plank-knees',
    name: 'Kneeling Side Plank',
    kind: 'core',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['15 seconds each side', '25 seconds each side', '35 seconds each side'],
    instructions: [
      'Lie on your side, prop onto one forearm, bend the knees, and stack the shoulders.',
      'Lift the hips so shoulders, hips, and knees form a line; lower before form twists.',
    ],
    breathingCue: 'Keep breathing behind the brace; do not clench the jaw.',
    safetyCue: 'Stop if the supporting shoulder feels pinched or unstable.',
  },
  {
    id: 'glute-bridge-march',
    name: 'Bridge March',
    kind: 'core',
    disciplines: ['mobility', 'yoga', 'pilates'],
    prescriptions: ['4 lifts each side', '6 lifts each side', '8 lifts each side'],
    instructions: [
      'Lie on your back, lift into a comfortable bridge, and keep the pelvis level.',
      'Float one foot only an inch or two, replace it quietly, and switch sides.',
    ],
    breathingCue: 'Exhale with each foot lift; inhale as it returns.',
    safetyCue: 'Use a regular glute bridge if marching causes hamstring cramps or hip dropping.',
  },
];

function weightedDiscipline(mood: MobilityMoodDefinition, random: () => number) {
  const weighted = MOBILITY_DISCIPLINES.map((discipline) => ({
    id: discipline.id,
    weight: mood.weights[discipline.id],
  }));
  let cursor = random() * weighted.reduce((sum, entry) => sum + entry.weight, 0);
  for (const entry of weighted) {
    cursor -= entry.weight;
    if (cursor < 0) return entry.id;
  }
  return weighted.at(-1)!.id;
}

function takeRandom<T>(items: T[], count: number, random: () => number) {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length && picked.length < count) {
    picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
  }
  return picked;
}

function assignMovement(
  movement: MobilityMovementDefinition,
  intensityIndex: 0 | 1 | 2,
): MobilityMovementAssignment {
  return {
    id: movement.id,
    name: movement.name,
    kind: movement.kind,
    prescription: movement.prescriptions[intensityIndex],
    instructions: movement.instructions,
    breathingCue: movement.breathingCue,
    safetyCue: movement.safetyCue,
  };
}

export function generateMobilityProtocol(random = Math.random) {
  const mood = MOBILITY_MOODS[Math.floor(random() * MOBILITY_MOODS.length)];
  const discipline = weightedDiscipline(mood, random);
  const breathPool = MOVEMENTS.filter((movement) => movement.kind === 'breath');
  const opening = takeRandom(breathPool.slice(0, 3), 1, random);
  const closing = MOVEMENTS.filter((movement) => movement.id === 'supine-rest-breath');
  const core = takeRandom(
    MOVEMENTS.filter((movement) => movement.kind === 'core'),
    2,
    random,
  );
  const primaryCount = mood.movementCount - opening.length - closing.length - core.length;
  const primary = takeRandom(
    MOVEMENTS.filter(
      (movement) =>
        movement.kind !== 'breath' &&
        movement.kind !== 'core' &&
        movement.disciplines.includes(discipline),
    ),
    primaryCount,
    random,
  );
  const movements = [...opening, ...primary, ...core, ...closing].map((movement) =>
    assignMovement(movement, mood.intensityIndex),
  );
  return {
    mood,
    discipline,
    movements,
    estimatedMinutes: mood.estimatedMinutes,
  };
}

export function getMobilityMood(id: MobilityMoodId) {
  return MOBILITY_MOODS.find((mood) => mood.id === id)!;
}

export function getMobilityDiscipline(id: MobilityDiscipline) {
  return MOBILITY_DISCIPLINES.find((discipline) => discipline.id === id)!;
}
