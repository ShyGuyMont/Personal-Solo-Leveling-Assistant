import type {
  CompanionQuestlineDefinition,
  MissionCategory,
  QuestObjectiveDefinition,
  QuestObjectiveMetric,
} from '@/types/game';

function manual(
  id: string,
  title: string,
  description: string,
  reflectionPrompt: string,
): QuestObjectiveDefinition {
  return { id, title, description, metric: 'manual', target: 1, reflectionPrompt };
}

function tracked(
  id: string,
  title: string,
  description: string,
  metric: Exclude<QuestObjectiveMetric, 'manual'>,
  target: number,
  category?: MissionCategory,
  missionIds?: string[],
): QuestObjectiveDefinition {
  return { id, title, description, metric, target, category, missionIds };
}

export const COMPANION_QUESTLINES: CompanionQuestlineDefinition[] = [
  {
    id: 'snow-the-one-who-stayed',
    companionId: 'snow',
    title: 'The One Who Stayed',
    subtitle:
      'A five-chapter story of trust, memory, and allowing support to become part of strength.',
    premise:
      'Snow has watched every version of the campaign. This questline is not about becoming dependent on her; it is about recognizing the support that helped you survive, learning to speak honestly, and becoming someone who can stay for yourself too.',
    completionTitleId: 'snows-constant',
    chapters: [
      {
        id: 'snow-1-open-channel',
        number: 1,
        title: 'Open Channel',
        rewardXp: 100,
        intro:
          'Snow asks for something smaller than a promise: show up honestly enough for the party to meet the day you are actually having.',
        completionMessage:
          '“You did not perform for me. You let me meet the real day. That is where trust begins.” — Snow',
        objectives: [
          tracked(
            'snow-1-checkins',
            'Let yourself be known',
            'Complete two Party Chat emotional check-ins.',
            'party-check-ins',
            2,
          ),
          tracked(
            'snow-1-days',
            'Stay in the record',
            'Finalize two Daily Reviews without needing either day to be perfect.',
            'daily-reviews',
            2,
          ),
          manual(
            'snow-1-truth',
            'Name the truth',
            'Write one honest sentence about what kind of support helps you most.',
            'What do you wish a steady supporter understood about you?',
          ),
        ],
      },
      {
        id: 'snow-2-proof-of-return',
        number: 2,
        title: 'Proof of Return',
        rewardXp: 140,
        intro:
          'Snow reveals that the moments she remembers most are not flawless streaks. They are the times you returned while afraid the gap had disqualified you.',
        completionMessage:
          '“Every return taught me the same thing: your story keeps opening doors after shame says they are locked.” — Snow',
        objectives: [
          tracked(
            'snow-2-missions',
            'Three fresh signals',
            'Complete three missions of any category.',
            'mission-count',
            3,
          ),
          tracked(
            'snow-2-days',
            'Two-day bridge',
            'Record mission completion on two separate days.',
            'completed-days',
            2,
          ),
          manual(
            'snow-2-return',
            'Write the return line',
            'Create a sentence you want Snow to remind you of after a lapse.',
            'What words would help you return without shame?',
          ),
        ],
      },
      {
        id: 'snow-3-memory-vault',
        number: 3,
        title: 'Memory Vault',
        rewardXp: 180,
        intro:
          'The System records numbers. Snow asks you to record meaning: a victory, a hard lesson, and evidence that an older fear did not predict the ending.',
        completionMessage:
          '“The record is safer when it holds the whole truth—not only what hurt, but what you survived and became.” — Snow',
        objectives: [
          tracked(
            'snow-3-reviews',
            'Three honest chapters',
            'Finalize three Daily Reviews.',
            'daily-reviews',
            3,
          ),
          tracked(
            'snow-3-perfect',
            'Seal one bright day',
            'Complete one Perfect Day during this chapter.',
            'perfect-days',
            1,
          ),
          manual(
            'snow-3-memory',
            'Archive a victory',
            'Describe one past victory you are prone to minimizing.',
            'What happened, what did it cost, and why does it still matter?',
          ),
        ],
      },
      {
        id: 'snow-4-mutual-promise',
        number: 4,
        title: 'The Mutual Promise',
        rewardXp: 220,
        intro:
          'Snow refuses a one-sided vow. She will remain steady, but you must practice becoming a safe and dependable companion to yourself.',
        completionMessage:
          '“I will stay. And now I know you are learning to stay for yourself too.” — Snow',
        objectives: [
          tracked(
            'snow-4-missions',
            'Keep five promises',
            'Complete five missions of any category.',
            'mission-count',
            5,
          ),
          tracked(
            'snow-4-checkins',
            'Use the open channel',
            'Complete three Party Chat check-ins.',
            'party-check-ins',
            3,
          ),
          manual(
            'snow-4-promise',
            'Promise without pressure',
            'Write one realistic promise you can keep to yourself next week.',
            'What can you promise that remains kind on a hard day?',
          ),
        ],
      },
      {
        id: 'snow-5-constant',
        number: 5,
        title: 'Constant, Not Alone',
        rewardXp: 300,
        intro:
          'At the final threshold, Snow explains that her constancy was never meant to replace your strength. It was meant to keep you company while you recognized it.',
        completionMessage:
          '“You were never powerful because you needed no one. You became powerful by learning what support could protect—and what you could protect in return.” — Snow',
        objectives: [
          tracked(
            'snow-5-days',
            'A week with the signal',
            'Record completion on five separate days.',
            'completed-days',
            5,
          ),
          tracked(
            'snow-5-missions',
            'Whole-journey proof',
            'Complete seven missions of any category.',
            'mission-count',
            7,
          ),
          manual(
            'snow-5-letter',
            'Message to the one who stayed',
            'Write a short closing message to Snow—or to the part of you that kept returning.',
            'What do you want the constant beside you to know?',
          ),
        ],
      },
    ],
  },
  {
    id: 'rook-tempered-foundation',
    companionId: 'rook',
    title: 'Tempered Foundation',
    subtitle:
      'Build physical trust through honest effort, recovery, and strength that can be sustained.',
    premise:
      'Rook is not interested in punishment disguised as training. His campaign teaches you to hear the body, build proof through repetition, and treat recovery as part of the same disciplined foundation.',
    completionTitleId: 'tempered-foundation',
    chapters: [
      {
        id: 'rook-1-stance',
        number: 1,
        title: 'Find Your Stance',
        rewardXp: 100,
        intro:
          'Before adding weight, Rook checks the ground beneath you: capacity, safety, and the smallest movement you can repeat honestly.',
        completionMessage:
          '“A real stance does not look impressive. It holds when the pressure arrives.” — Rook',
        objectives: [
          tracked(
            'rook-1-physical',
            'Answer the body',
            'Complete two Physical missions.',
            'category-count',
            2,
            'physical',
          ),
          tracked(
            'rook-1-days',
            'Move on two days',
            'Record mission completion on two separate days.',
            'completed-days',
            2,
          ),
          manual(
            'rook-1-baseline',
            'Respect the baseline',
            'Describe what safe, sustainable physical progress means for you right now.',
            'What can your body reliably give without punishment?',
          ),
        ],
      },
      {
        id: 'rook-2-repeatable-force',
        number: 2,
        title: 'Repeatable Force',
        rewardXp: 140,
        intro:
          'Rook challenges the fantasy of one heroic session. Strength becomes useful when the process can answer the bell again.',
        completionMessage:
          '“One hard effort can impress you. Repeated honest effort can change you.” — Rook',
        objectives: [
          tracked(
            'rook-2-physical',
            'Four honest efforts',
            'Complete four Physical missions.',
            'category-count',
            4,
            'physical',
          ),
          tracked(
            'rook-2-days',
            'Three-day foundation',
            'Record completion on three separate days.',
            'completed-days',
            3,
          ),
          manual(
            'rook-2-recovery',
            'Write the recovery order',
            'Choose one recovery habit to pair with physical effort.',
            'How will you help the body recover after it answers you?',
          ),
        ],
      },
      {
        id: 'rook-3-pressure',
        number: 3,
        title: 'Under Pressure',
        rewardXp: 180,
        intro:
          'The Vanguard teaches that adaptation is not retreat. A changed body, schedule, or energy level calls for a changed plan—not contempt.',
        completionMessage:
          '“You adjusted without surrendering. That is battlefield intelligence.” — Rook',
        objectives: [
          tracked(
            'rook-3-physical',
            'Move with reality',
            'Complete five Physical missions.',
            'category-count',
            5,
            'physical',
          ),
          tracked(
            'rook-3-reviews',
            'Study the field',
            'Finalize three Daily Reviews.',
            'daily-reviews',
            3,
          ),
          manual(
            'rook-3-adapt',
            'Name an adaptation',
            'Document one way you safely reduced, replaced, or redirected an effort.',
            'What did you change so the mission could remain honest?',
          ),
        ],
      },
      {
        id: 'rook-4-carry-more',
        number: 4,
        title: 'Strength That Carries',
        rewardXp: 220,
        intro:
          'Rook admits that his idea of strength changed: power matters most when it helps you protect a life, a future, or another person without destroying yourself.',
        completionMessage:
          '“The strongest foundation is not a monument. It is something worth living on.” — Rook',
        objectives: [
          tracked(
            'rook-4-physical',
            'Six foundation marks',
            'Complete six Physical missions.',
            'category-count',
            6,
            'physical',
          ),
          tracked(
            'rook-4-character',
            'Strength with humanity',
            'Complete two Character missions.',
            'category-count',
            2,
            'character',
          ),
          manual(
            'rook-4-purpose',
            'Name what strength serves',
            'Connect physical growth to something larger than appearance or punishment.',
            'Who or what becomes better supported as you grow stronger?',
          ),
        ],
      },
      {
        id: 'rook-5-tempered',
        number: 5,
        title: 'Tempered, Not Hardened',
        rewardXp: 300,
        intro:
          'At the forge’s final chamber, Rook asks for durable proof: effort, recovery, and respect held in the same hand.',
        completionMessage:
          '“You did not harden into someone who ignores pain. You tempered into someone who can hear it and still choose courage.” — Rook',
        objectives: [
          tracked(
            'rook-5-physical',
            'Complete the forge',
            'Complete eight Physical missions.',
            'category-count',
            8,
            'physical',
          ),
          tracked(
            'rook-5-days',
            'Five grounded days',
            'Record completion on five separate days.',
            'completed-days',
            5,
          ),
          manual(
            'rook-5-code',
            'Write your training code',
            'Write three rules for effort, safety, and recovery.',
            'What standards will protect your foundation after this quest ends?',
          ),
        ],
      },
    ],
  },
  {
    id: 'selah-rooted-in-light',
    companionId: 'selah',
    title: 'Rooted in Light',
    subtitle: 'A quiet pilgrimage through faithfulness, wisdom, grace, and lived conviction.',
    premise:
      'Selah guides a quest that cannot be speed-run. It rewards return rather than spiritual performance and asks how faith can shape attention, decisions, recovery, and love in ordinary life.',
    completionTitleId: 'rooted-light',
    chapters: [
      {
        id: 'selah-1-stillness',
        number: 1,
        title: 'The Quiet Gate',
        rewardXp: 100,
        intro:
          'Selah begins without spectacle. Make a little room for stillness and return without judging how dramatic the moment felt.',
        completionMessage:
          '“The gate was never locked. You only needed enough quiet to notice it.” — Selah',
        objectives: [
          tracked(
            'selah-1-faith',
            'Return twice',
            'Complete two Faith missions.',
            'category-count',
            2,
            'faith',
          ),
          tracked(
            'selah-1-days',
            'Two faithful days',
            'Record mission completion on two separate days.',
            'completed-days',
            2,
          ),
          manual(
            'selah-1-prayer',
            'Name the honest prayer',
            'Write one unpolished sentence you can bring to God.',
            'What is true in your spirit before you try to make it sound right?',
          ),
        ],
      },
      {
        id: 'selah-2-roots',
        number: 2,
        title: 'Roots Before Fruit',
        rewardXp: 140,
        intro:
          'Visible outcomes are not the only evidence of growth. Selah asks you to tend practices whose deepest work may remain hidden for a while.',
        completionMessage:
          '“Not every root announces itself. Continue tending what gives life beneath the surface.” — Selah',
        objectives: [
          tracked(
            'selah-2-faith',
            'Tend four roots',
            'Complete four Faith missions.',
            'category-count',
            4,
            'faith',
          ),
          tracked(
            'selah-2-reviews',
            'Observe without condemning',
            'Finalize two Daily Reviews.',
            'daily-reviews',
            2,
          ),
          manual(
            'selah-2-root',
            'Identify a hidden root',
            'Describe one inner change that matters even if no dashboard can measure it.',
            'What may be growing beneath visible results?',
          ),
        ],
      },
      {
        id: 'selah-3-wisdom-in-motion',
        number: 3,
        title: 'Wisdom in Motion',
        rewardXp: 180,
        intro:
          'The Beacon turns reflection outward. Wisdom becomes lived when it changes a choice, a boundary, a response, or an act of care.',
        completionMessage:
          '“Truth became more than something you knew. It became a way you moved.” — Selah',
        objectives: [
          tracked(
            'selah-3-faith',
            'Practice what steadies you',
            'Complete five Faith missions.',
            'category-count',
            5,
            'faith',
          ),
          tracked(
            'selah-3-character',
            'Let faith become care',
            'Complete two Character missions.',
            'category-count',
            2,
            'character',
          ),
          manual(
            'selah-3-choice',
            'Record a wiser choice',
            'Describe one decision changed by prayer, Scripture, counsel, or reflection.',
            'What truth shaped the way you responded?',
          ),
        ],
      },
      {
        id: 'selah-4-grace',
        number: 4,
        title: 'Grace Without Escape',
        rewardXp: 220,
        intro:
          'Selah separates grace from avoidance. Grace removes condemnation so that honest repair and faithful return become possible.',
        completionMessage:
          '“Grace did not ask you to pretend. It gave you somewhere safe enough to tell the truth and rise.” — Selah',
        objectives: [
          tracked(
            'selah-4-faith',
            'Six returns',
            'Complete six Faith missions.',
            'category-count',
            6,
            'faith',
          ),
          tracked(
            'selah-4-days',
            'Four recorded days',
            'Record completion on four separate days.',
            'completed-days',
            4,
          ),
          manual(
            'selah-4-grace',
            'Practice accountable grace',
            'Write one correction you can make without shaming yourself.',
            'What needs truth, what needs grace, and what is the next faithful repair?',
          ),
        ],
      },
      {
        id: 'selah-5-beacon',
        number: 5,
        title: 'Carry the Light',
        rewardXp: 300,
        intro:
          'The pilgrimage closes by turning the light outward—not through performance, but through a life made a little more faithful, wise, and generous.',
        completionMessage:
          '“A beacon does not chase every traveler. It remains rooted, visible, and faithful to the light it was given.” — Selah',
        objectives: [
          tracked(
            'selah-5-faith',
            'Complete the pilgrimage',
            'Complete eight Faith missions.',
            'category-count',
            8,
            'faith',
          ),
          tracked(
            'selah-5-perfect',
            'One integrated day',
            'Complete one Perfect Day during this chapter.',
            'perfect-days',
            1,
          ),
          manual(
            'selah-5-rule',
            'Write a gentle rule of life',
            'Choose three small rhythms that keep faith connected to ordinary life.',
            'What practices help you remain rooted without turning devotion into performance?',
          ),
        ],
      },
    ],
  },
  {
    id: 'cipher-signal-to-reality',
    companionId: 'cipher',
    title: 'Signal to Reality',
    subtitle:
      'Turn intention into finished output through scope, systems, focus, and deliberate release.',
    premise:
      'Cipher believes an idea deserves the chance to become real. His questline targets YouTube, ARC, discipline, and creative execution while defending the operator from endless planning and perfectionism.',
    completionTitleId: 'signal-made-real',
    chapters: [
      {
        id: 'cipher-1-define',
        number: 1,
        title: 'Define the Signal',
        rewardXp: 100,
        intro:
          'Cipher refuses to optimize a fog. Choose what you are making, why it matters, and what “done for now” visibly means.',
        completionMessage:
          '“The signal is clear enough to execute. Further theorizing would now be suspicious.” — Cipher',
        objectives: [
          tracked(
            'cipher-1-creator',
            'Create two outputs',
            'Complete two Creator missions.',
            'category-count',
            2,
            'creator',
          ),
          tracked(
            'cipher-1-discipline',
            'Hold one process line',
            'Complete one Discipline mission.',
            'category-count',
            1,
            'discipline',
          ),
          manual(
            'cipher-1-definition',
            'Define done',
            'Write a visible finish line for one current YouTube, ARC, or creative objective.',
            'What exact artifact or action will prove this task is complete?',
          ),
        ],
      },
      {
        id: 'cipher-2-minimum-viable',
        number: 2,
        title: 'Minimum Viable Momentum',
        rewardXp: 140,
        intro:
          'The Strategist attacks perfectionism with a smaller weapon: a version real enough to inspect, improve, and release.',
        completionMessage:
          '“An imperfect artifact now exists. Perfection has lost its veto power.” — Cipher',
        objectives: [
          tracked(
            'cipher-2-creator',
            'Make four things real',
            'Complete four Creator missions.',
            'category-count',
            4,
            'creator',
          ),
          tracked(
            'cipher-2-days',
            'Create across three days',
            'Record completion on three separate days.',
            'completed-days',
            3,
          ),
          manual(
            'cipher-2-rough',
            'Ship a rough form',
            'Name one draft, cut, outline, post, or scene you allowed to exist before it felt perfect.',
            'What did releasing the rough form teach you?',
          ),
        ],
      },
      {
        id: 'cipher-3-focus-engine',
        number: 3,
        title: 'The Focus Engine',
        rewardXp: 180,
        intro:
          'Focus is not intensity held forever. Cipher designs an engine with fewer decisions, shorter starts, and a reliable shutdown.',
        completionMessage:
          '“The operator no longer depends entirely on mood. This is an alarming improvement.” — Cipher',
        objectives: [
          tracked(
            'cipher-3-discipline',
            'Run the protocol',
            'Complete four Discipline missions.',
            'category-count',
            4,
            'discipline',
          ),
          tracked(
            'cipher-3-creator',
            'Convert focus to output',
            'Complete four Creator missions.',
            'category-count',
            4,
            'creator',
          ),
          manual(
            'cipher-3-system',
            'Document the engine',
            'Write a three-step start ritual and a clear stopping rule.',
            'What makes focused work easier to begin and safer to end?',
          ),
        ],
      },
      {
        id: 'cipher-4-resistance',
        number: 4,
        title: 'Resistance Analysis',
        rewardXp: 220,
        intro:
          'Cipher treats repeated avoidance as design feedback. The objective is not self-accusation; it is identifying friction and changing one variable.',
        completionMessage:
          '“You debugged the process without declaring the operator defective. Efficient and humane.” — Cipher',
        objectives: [
          tracked(
            'cipher-4-output',
            'Six execution marks',
            'Complete six Creator missions.',
            'category-count',
            6,
            'creator',
          ),
          tracked(
            'cipher-4-reviews',
            'Collect operating data',
            'Finalize three Daily Reviews.',
            'daily-reviews',
            3,
          ),
          manual(
            'cipher-4-friction',
            'Remove one friction point',
            'Document one repeated obstacle and the concrete change you tested.',
            'What variable did you change instead of simply trying harder?',
          ),
        ],
      },
      {
        id: 'cipher-5-transmission',
        number: 5,
        title: 'Transmission Complete',
        rewardXp: 300,
        intro:
          'The final chapter asks for output that leaves the private planning chamber. A signal becomes meaningful when it reaches reality.',
        completionMessage:
          '“Transmission confirmed. The world now contains something that previously existed only in you.” — Cipher',
        objectives: [
          tracked(
            'cipher-5-creator',
            'Finish the transmission',
            'Complete eight Creator missions.',
            'category-count',
            8,
            'creator',
          ),
          tracked(
            'cipher-5-discipline',
            'Protect the channel',
            'Complete four Discipline missions.',
            'category-count',
            4,
            'discipline',
          ),
          manual(
            'cipher-5-release',
            'Release something real',
            'Record what you published, shared, completed, or delivered.',
            'What crossed from private intention into the world?',
          ),
        ],
      },
    ],
  },
  {
    id: 'haven-spotlight-protocol',
    companionId: 'haven',
    title: 'Spotlight Protocol',
    subtitle:
      'Build a creator identity, earn camera nerve, understand the audience, and establish a publishing rhythm that survives real life.',
    premise:
      'Vesper refuses to let the Hunter’s creator journey remain an imaginary future. Her questline turns ideas into audience promises, rough takes, production systems, and releases that teach the next move.',
    completionTitleId: 'guardian-of-the-whole',
    chapters: [
      {
        id: 'haven-1-safe-ground',
        number: 1,
        title: 'Claim the Channel',
        rewardXp: 100,
        intro:
          'Vesper starts with the reason anybody should stop scrolling: who you serve, what you promise, and what only your voice can bring.',
        completionMessage:
          '“There you are. Not a future creator—a creator with a signal strong enough to name.” — Vesper',
        objectives: [
          tracked(
            'haven-1-character',
            'Create two signals',
            'Complete two Creator missions.',
            'category-count',
            2,
            'creator',
          ),
          tracked(
            'haven-1-reviews',
            'Study two real days',
            'Finalize two Daily Reviews to reveal when creator work fits honestly.',
            'daily-reviews',
            2,
          ),
          manual(
            'haven-1-ground',
            'Write the audience promise',
            'Name who your content is for and what they should reliably receive from you.',
            'Who are you speaking to, and what becomes better after they watch?',
          ),
        ],
      },
      {
        id: 'haven-2-humane-accountability',
        number: 2,
        title: 'The Hook Lab',
        rewardXp: 140,
        intro:
          'A strong idea still needs an opening. Vesper trains curiosity, clarity, tension, and the first seconds that earn attention honestly.',
        completionMessage:
          '“Now that hook opens a door instead of politely standing near one. Much better.” — Vesper',
        objectives: [
          tracked(
            'haven-2-character',
            'Build four creator proofs',
            'Complete four Creator missions.',
            'category-count',
            4,
            'creator',
          ),
          tracked(
            'haven-2-days',
            'Test across three days',
            'Record creator progress on three separate days.',
            'completed-days',
            3,
          ),
          manual(
            'haven-2-review',
            'Run the three-hook test',
            'Write three different openings for one content idea and choose the strongest.',
            'Which hook creates the clearest curiosity without lying to the audience?',
          ),
        ],
      },
      {
        id: 'haven-3-boundaries',
        number: 3,
        title: 'Camera Nerve',
        rewardXp: 180,
        intro:
          'Vesper puts confidence in its proper place: not a feeling you wait for, but a skill built through honest imperfect reps.',
        completionMessage:
          '“The camera did not need a flawless performance. It needed you to stay in the frame long enough to become real.” — Vesper',
        objectives: [
          tracked(
            'haven-3-character',
            'Take five creator reps',
            'Complete five Creator missions.',
            'category-count',
            5,
            'creator',
          ),
          tracked(
            'haven-3-checkins',
            'Use the room',
            'Complete two Party Chat check-ins instead of building in total isolation.',
            'party-check-ins',
            2,
          ),
          manual(
            'haven-3-boundary',
            'Keep the rough take',
            'Record what you learned from an imperfect take, draft, or creator experiment.',
            'What became possible after you stopped requiring the first version to look finished?',
          ),
        ],
      },
      {
        id: 'haven-4-reentry',
        number: 4,
        title: 'Production Rhythm',
        rewardXp: 220,
        intro:
          'Charisma cannot rescue a chaotic pipeline forever. Vesper and Cipher build a rhythm from idea to publish with clear handoffs and low-energy options.',
        completionMessage:
          '“The spotlight has a schedule now. Terrifyingly responsible. Cipher is thrilled.” — Vesper',
        objectives: [
          tracked(
            'haven-4-missions',
            'Run six creator operations',
            'Complete six Creator missions.',
            'category-count',
            6,
            'creator',
          ),
          tracked(
            'haven-4-days',
            'Build across four days',
            'Record creator progress on four separate days.',
            'completed-days',
            4,
          ),
          manual(
            'haven-4-plan',
            'Map the pipeline',
            'Define your idea, script, record, edit, package, and publish handoffs plus one low-energy creator task.',
            'What next action keeps every stage from becoming a hiding place?',
          ),
        ],
      },
      {
        id: 'haven-5-whole',
        number: 5,
        title: 'Spotlight Transmission',
        rewardXp: 300,
        intro:
          'The final chapter belongs to the public signal: a real release, an honest review of the response, and a next move informed by evidence rather than fear.',
        completionMessage:
          '“Transmission live. The audience can finally meet the creator I have been yelling about.” — Vesper',
        objectives: [
          tracked(
            'haven-5-character',
            'Complete the season',
            'Complete eight Creator missions.',
            'category-count',
            8,
            'creator',
          ),
          tracked(
            'haven-5-days',
            'Protect the production system',
            'Complete four Discipline missions.',
            'category-count',
            4,
            'discipline',
          ),
          manual(
            'haven-5-charter',
            'Release and review',
            'Record what you published or showcased, what the audience taught you, and the next experiment.',
            'What crossed into the world, what evidence mattered, and what will you test next?',
          ),
        ],
      },
    ],
  },
  {
    id: 'ember-reignite-protocol',
    companionId: 'ember',
    title: 'Reignite Protocol',
    subtitle:
      'Build a reliable return before the next hard season—not because failure is required, but because resilience can be trained.',
    premise:
      'Ember never asks you to manufacture a setback. Her quest creates an ignition sequence you can use after hesitation, exhaustion, missed time, or any moment when momentum needs a clean first spark.',
    completionTitleId: 'reignited',
    chapters: [
      {
        id: 'ember-1-spark',
        number: 1,
        title: 'Find the Spark',
        rewardXp: 100,
        intro:
          'Ember asks for the smallest meaningful action that can turn thought into motion before resistance forms a committee.',
        completionMessage:
          '“There. Not a bonfire—a spark. Everything alive starts smaller than the story told later.” — Ember',
        objectives: [
          tracked(
            'ember-1-missions',
            'Three ignition hits',
            'Complete three missions of any category.',
            'mission-count',
            3,
          ),
          tracked(
            'ember-1-days',
            'Spark twice',
            'Record completion on two separate days.',
            'completed-days',
            2,
          ),
          manual(
            'ember-1-target',
            'Name the easiest honest win',
            'Define one tiny mission you can use to begin on a resistant day.',
            'What can you finish before your excuses fully wake up?',
          ),
        ],
      },
      {
        id: 'ember-2-cut-the-spiral',
        number: 2,
        title: 'Cut the Spiral',
        rewardXp: 140,
        intro:
          'The Ignition identifies the difference between useful correction and the shame spiral that wastes tomorrow’s fuel.',
        completionMessage:
          '“We kept the lesson and threw the weapon away. That is how a comeback keeps its fire clean.” — Ember',
        objectives: [
          tracked(
            'ember-2-missions',
            'Four clean moves',
            'Complete four missions of any category.',
            'mission-count',
            4,
          ),
          tracked(
            'ember-2-reviews',
            'Face the record twice',
            'Finalize two Daily Reviews.',
            'daily-reviews',
            2,
          ),
          manual(
            'ember-2-script',
            'Write the anti-spiral order',
            'Create a three-sentence response for the moment you start attacking yourself.',
            'What truth, action, and permission will interrupt the spiral?',
          ),
        ],
      },
      {
        id: 'ember-3-first-minute',
        number: 3,
        title: 'The First-Minute Rule',
        rewardXp: 180,
        intro:
          'Ember trains the opening minute: a physical action, a reduced target, and no waiting for emotional certainty.',
        completionMessage:
          '“The first minute stopped being a debate. That changes more campaigns than motivation ever will.” — Ember',
        objectives: [
          tracked(
            'ember-3-discipline',
            'Practice four starts',
            'Complete four Discipline missions.',
            'category-count',
            4,
            'discipline',
          ),
          tracked(
            'ember-3-days',
            'Start across three days',
            'Record completion on three separate days.',
            'completed-days',
            3,
          ),
          manual(
            'ember-3-ritual',
            'Build the first minute',
            'Write the exact first physical action for a recurring mission.',
            'What can your hands or feet do before the mind begins negotiating?',
          ),
        ],
      },
      {
        id: 'ember-4-controlled-fire',
        number: 4,
        title: 'Controlled Fire',
        rewardXp: 220,
        intro:
          'Intensity can ignite or consume. Ember teaches a flame with a target, a stopping point, and enough fuel left for tomorrow.',
        completionMessage:
          '“You aimed the fire and kept yourself out of it. That is power under command.” — Ember',
        objectives: [
          tracked(
            'ember-4-missions',
            'Six focused hits',
            'Complete six missions of any category.',
            'mission-count',
            6,
          ),
          tracked(
            'ember-4-perfect',
            'Seal one aligned day',
            'Complete one Perfect Day during this chapter.',
            'perfect-days',
            1,
          ),
          manual(
            'ember-4-stop',
            'Choose the shutdown signal',
            'Define when strong effort is complete enough to stop.',
            'What boundary keeps intensity from becoming burnout?',
          ),
        ],
      },
      {
        id: 'ember-5-reignite',
        number: 5,
        title: 'Reignite at Will',
        rewardXp: 300,
        intro:
          'The final protocol is prepared before crisis: a compact sequence that survives low motivation and keeps dignity intact.',
        completionMessage:
          '“You do not need to fear losing momentum now. You know where the spark lives—and you know how to reach it without burning yourself down.” — Ember',
        objectives: [
          tracked(
            'ember-5-missions',
            'Complete the protocol',
            'Complete eight missions of any category.',
            'mission-count',
            8,
          ),
          tracked(
            'ember-5-days',
            'Five proof days',
            'Record completion on five separate days.',
            'completed-days',
            5,
          ),
          manual(
            'ember-5-card',
            'Write your Reignite card',
            'Record your trigger, first action, minimum win, and recovery step.',
            'What is your complete no-shame return sequence?',
          ),
        ],
      },
    ],
  },
  {
    id: 'amara-courage-to-connect',
    companionId: 'amara',
    title: 'The Courage to Connect',
    subtitle:
      'Practice reciprocal love, honest communication, safe boundaries, repair, and belonging without self-abandonment.',
    premise:
      'Amara’s quest includes friendship, family, romance, community, and your relationship with yourself. No objective requires contact with an unsafe person; a protected boundary, private reflection, or connection with someone trustworthy always counts.',
    completionTitleId: 'heartwoven',
    chapters: [
      {
        id: 'amara-1-heart-map',
        number: 1,
        title: 'The Heart Map',
        rewardXp: 100,
        intro:
          'Amara begins by mapping where you feel safe, seen, energized, drained, and most like yourself—without forcing any relationship into a simple label.',
        completionMessage:
          '“A heart map is not a judgment. It is permission to notice where your life becomes more honest.” — Amara',
        objectives: [
          tracked(
            'amara-1-character',
            'Practice two acts of care',
            'Complete two Character missions.',
            'category-count',
            2,
            'character',
          ),
          tracked(
            'amara-1-checkins',
            'Name how you feel',
            'Complete two Party Chat check-ins.',
            'party-check-ins',
            2,
          ),
          manual(
            'amara-1-map',
            'Map one safe bond',
            'Reflect on one person or community where you can be more fully yourself.',
            'What makes this connection feel safe, reciprocal, or life-giving?',
          ),
        ],
      },
      {
        id: 'amara-2-brave-signal',
        number: 2,
        title: 'Send the Brave Signal',
        rewardXp: 140,
        intro:
          'Connection often begins before certainty. Amara asks for a small, low-pressure signal toward someone safe—or an honest signal inward if reaching outward is not right.',
        completionMessage:
          '“You did not demand an outcome. You simply let truth cross the distance.” — Amara',
        objectives: [
          tracked(
            'amara-2-character',
            'Three connecting choices',
            'Complete three Character missions.',
            'category-count',
            3,
            'character',
          ),
          tracked(
            'amara-2-days',
            'Keep the heart path open',
            'Record completion on three separate days.',
            'completed-days',
            3,
          ),
          manual(
            'amara-2-signal',
            'Record a sincere reach',
            'Send or prepare one safe check-in, appreciation, invitation, or request for support.',
            'What signal did you choose, and how did you protect it from pressure?',
          ),
        ],
      },
      {
        id: 'amara-3-boundary',
        number: 3,
        title: 'The Loving Boundary',
        rewardXp: 180,
        intro:
          'Amara rejects the idea that love requires endless access. A healthy boundary protects dignity, consent, energy, and the possibility of honest closeness.',
        completionMessage:
          '“Your no did not cancel your tenderness. It gave your yes somewhere trustworthy to live.” — Amara',
        objectives: [
          tracked(
            'amara-3-character',
            'Four whole-hearted actions',
            'Complete four Character missions.',
            'category-count',
            4,
            'character',
          ),
          tracked(
            'amara-3-reviews',
            'Notice the effect',
            'Finalize two Daily Reviews.',
            'daily-reviews',
            2,
          ),
          manual(
            'amara-3-boundary',
            'Practice a safe boundary',
            'Write, rehearse, or communicate one clear limit. No unsafe contact is required.',
            'What does the boundary protect, and how can it remain both kind and firm?',
          ),
        ],
      },
      {
        id: 'amara-4-repair-receive',
        number: 4,
        title: 'Repair and Receive',
        rewardXp: 220,
        intro:
          'Relationship courage includes owning impact, asking for what you need, receiving care without deflection, and knowing when repair is not safe or mutual.',
        completionMessage:
          '“You learned that repair is not self-erasure. It is truth moving toward wholeness where wholeness is possible.” — Amara',
        objectives: [
          tracked(
            'amara-4-character',
            'Six empathy actions',
            'Complete six Character missions.',
            'category-count',
            6,
            'character',
          ),
          tracked(
            'amara-4-checkins',
            'Practice being received',
            'Complete three Party Chat check-ins.',
            'party-check-ins',
            3,
          ),
          manual(
            'amara-4-repair',
            'Choose repair or protection',
            'Reflect on one apology, appreciation, request, forgiveness boundary, or decision not to re-enter unsafe contact.',
            'What response honored both truth and safety?',
          ),
        ],
      },
      {
        id: 'amara-5-belonging',
        number: 5,
        title: 'Belonging Without Disappearing',
        rewardXp: 300,
        intro:
          'The final weaving joins love and selfhood. Amara asks you to build connection where you can remain visible rather than performing for permission to stay.',
        completionMessage:
          '“You did not earn belonging by disappearing. You arrived with a heart, a voice, and boundaries—and let healthy love meet all three.” — Amara',
        objectives: [
          tracked(
            'amara-5-character',
            'Complete the heart path',
            'Complete eight Character missions.',
            'category-count',
            8,
            'character',
          ),
          tracked(
            'amara-5-days',
            'Five connected days',
            'Record completion on five separate days.',
            'completed-days',
            5,
          ),
          manual(
            'amara-5-covenant',
            'Write the connection covenant',
            'Choose three standards for safe, reciprocal, honest relationships.',
            'What will you offer, what will you receive, and what will you no longer abandon in yourself?',
          ),
        ],
      },
    ],
  },
  {
    id: 'cassian-the-keepers-ledger',
    companionId: 'cassian',
    title: "The Keeper's Ledger",
    subtitle:
      'A five-chapter campaign for clarity, margin, recovery, and money that serves the life you are building.',
    premise:
      'Cassian does not measure your worth in dollars. He teaches you to replace avoidance with a clear record, give every resource a purpose, recover from overspending without shame, and build enough margin that money becomes a tool instead of a threat.',
    completionTitleId: 'keeper-of-margin',
    chapters: [
      {
        id: 'cassian-1-open-the-ledger',
        number: 1,
        title: 'Open the Ledger',
        rewardXp: 100,
        intro:
          'Cassian begins with visibility. No judgment, no dramatic vow—only an honest record of what arrived, what left, and what matters.',
        completionMessage:
          '“Clarity is not a sentence. It is a lantern. Now we can see the road.” — Cassian',
        objectives: [
          tracked(
            'cassian-1-income',
            'Record the supply line',
            'Log one paycheck or other source of income in the Treasury.',
            'treasury-income',
            1,
          ),
          tracked(
            'cassian-1-expenses',
            'Name where it went',
            'Log three expenses without judging yourself for any of them.',
            'treasury-expenses',
            3,
          ),
          manual(
            'cassian-1-purpose',
            'Name the purpose',
            'Write one sentence about what you want money to make possible.',
            'What kind of safety, freedom, generosity, or future are you trying to build?',
          ),
        ],
      },
      {
        id: 'cassian-2-every-dollar-a-post',
        number: 2,
        title: 'Every Dollar a Post',
        rewardXp: 140,
        intro:
          'A budget is not a cage. Cassian frames it as a command map: needs protected first, the future funded next, and enjoyment chosen on purpose.',
        completionMessage:
          '“The plan did not take your freedom. It told your freedom where to stand.” — Cassian',
        objectives: [
          tracked(
            'cassian-2-review',
            'Issue the weekly orders',
            'Complete one Treasury Weekly Review.',
            'treasury-weekly-reviews',
            1,
          ),
          tracked(
            'cassian-2-bills',
            'Protect the essentials',
            'Record two bill payments.',
            'treasury-bills-paid',
            2,
          ),
          manual(
            'cassian-2-priorities',
            'Set the order',
            'Choose your top three money priorities for this season.',
            'What must be protected first, what future deserves funding, and where can you leave room to live?',
          ),
        ],
      },
      {
        id: 'cassian-3-close-the-leaks',
        number: 3,
        title: 'Close the Leaks',
        rewardXp: 180,
        intro:
          'Cassian turns attention toward impulse spending—not as a character flaw, but as a pattern that can be interrupted with preparation and friction.',
        completionMessage:
          '“You did not win by never wanting the easy option. You won by preparing a better one.” — Cassian',
        objectives: [
          tracked(
            'cassian-3-no-eating-out',
            'Hold the kitchen line',
            'Complete three No Eating Out challenges.',
            'no-eating-out-wins',
            3,
          ),
          tracked(
            'cassian-3-expenses',
            'Keep the record honest',
            'Log five expenses while this chapter is active.',
            'treasury-expenses',
            5,
          ),
          manual(
            'cassian-3-friction',
            'Build the countermeasure',
            'Create one practical barrier between an impulse and an order.',
            'Will you prep food, delete an app, set a waiting rule, carry a snack, or use another defense?',
          ),
        ],
      },
      {
        id: 'cassian-4-reduce-the-weight',
        number: 4,
        title: 'Reduce the Weight',
        rewardXp: 220,
        intro:
          'Debt and savings are both about tomorrow. Cassian asks you to reduce one burden and strengthen one shield—with a no-debt path for anyone already clear.',
        completionMessage:
          '“Whether you lowered a balance or raised a shield, you made tomorrow lighter.” — Cassian',
        objectives: [
          tracked(
            'cassian-4-savings',
            'Strengthen the reserve',
            'Record two savings contributions.',
            'treasury-savings',
            2,
          ),
          tracked(
            'cassian-4-reviews',
            'Hold the strategy table',
            'Complete two Treasury Weekly Reviews.',
            'treasury-weekly-reviews',
            2,
          ),
          manual(
            'cassian-4-plan',
            'Choose the next target',
            'Write your next debt-payment or savings milestone. If you have no debt, name what your reserve is protecting.',
            'What single target will make the next month measurably safer?',
          ),
        ],
      },
      {
        id: 'cassian-5-freedom-under-command',
        number: 5,
        title: 'Freedom Under Command',
        rewardXp: 300,
        intro:
          'The final chapter is not about perfect spending. It is about a repeatable system: review, choose, recover, and keep building margin.',
        completionMessage:
          '“The ledger is yours now. Not a record of restriction—a record that you learned to command your resources without letting them command you.” — Cassian',
        objectives: [
          tracked(
            'cassian-5-reviews',
            'Keep the weekly council',
            'Complete two more Treasury Weekly Reviews.',
            'treasury-weekly-reviews',
            2,
          ),
          tracked(
            'cassian-5-wins',
            'Prove the new pattern',
            'Complete five No Eating Out challenges.',
            'no-eating-out-wins',
            5,
          ),
          manual(
            'cassian-5-charter',
            'Write the stewardship charter',
            'Create three rules that protect both your future and your humanity.',
            'What will you review, what will you prioritize, and how will you recover when a week goes off plan?',
          ),
        ],
      },
    ],
  },
  {
    id: 'saffron-the-fire-we-feed',
    companionId: 'saffron',
    title: 'The Fire We Feed',
    subtitle:
      'A five-chapter campaign for confidence in the Kitchen, meals that support training, and preparation strong enough to defeat convenience.',
    premise:
      'Saffron believes cooking is not a performance. It is command over the moment hunger becomes urgent: a skill that can nourish the body, protect the Treasury, and make tomorrow kinder. Beneath all the shouting, she wants you to trust that you can care for yourself with your own hands.',
    completionTitleId: 'keeper-of-the-hearth',
    chapters: [
      {
        id: 'saffron-1-light-the-stove',
        number: 1,
        title: 'Light the Stove',
        rewardXp: 100,
        intro:
          'Saffron starts with proof, not culinary ambition. One completed recipe is enough to turn the Kitchen from a threat into a place where you have already succeeded.',
        completionMessage:
          '“You see? The stove was never judging you. That was my job—and I judge this beginning excellent.” — Saffron',
        objectives: [
          tracked(
            'saffron-1-order',
            'Cook the first order',
            'Complete one assigned Kitchen Order.',
            'kitchen-orders',
            1,
          ),
          tracked(
            'saffron-1-line',
            'Defeat convenience once',
            'Complete one No Eating Out challenge.',
            'no-eating-out-wins',
            1,
          ),
          manual(
            'saffron-1-reason',
            'Name what dinner protects',
            'Write why cooking matters to the life you are building.',
            'Is this about strength, savings, confidence, health, tomorrow’s lunch, or something more personal?',
          ),
        ],
      },
      {
        id: 'saffron-2-build-the-plate',
        number: 2,
        title: 'Build the Plate',
        rewardXp: 140,
        intro:
          'Recipes become less intimidating when their structure becomes visible: a protein anchor, vegetables, useful energy, and enough flavor to want the meal again.',
        completionMessage:
          '“Now you are not merely following steps. You can see why the plate works. Dangerous! You may become competent.” — Saffron',
        objectives: [
          tracked(
            'saffron-2-orders',
            'Repeat the structure',
            'Complete two Kitchen Orders.',
            'kitchen-orders',
            2,
          ),
          manual(
            'saffron-2-formula',
            'Write your plate formula',
            'Choose one favorite protein, vegetable, and carbohydrate combination.',
            'What simple combination would still sound good on a tired evening?',
          ),
          manual(
            'saffron-2-flavor',
            'Claim a flavor profile',
            'Record one seasoning, sauce, or flavor combination you genuinely enjoy.',
            'What makes a home-cooked meal feel like something you want rather than something you tolerate?',
          ),
        ],
      },
      {
        id: 'saffron-3-defeat-delivery',
        number: 3,
        title: 'Defeat Delivery',
        rewardXp: 180,
        intro:
          'The enemy is often not hunger but urgency. Saffron asks you to make the home option visible, fast, and ready before a difficult evening begins.',
        completionMessage:
          '“Convenience arrived at the gate and found dinner already waiting. That is not willpower. That is preparation.” — Saffron',
        objectives: [
          tracked(
            'saffron-3-orders',
            'Hold the Kitchen line',
            'Complete three Kitchen Orders.',
            'kitchen-orders',
            3,
          ),
          tracked(
            'saffron-3-wins',
            'Close the delivery portal',
            'Complete two No Eating Out challenges.',
            'no-eating-out-wins',
            2,
          ),
          manual(
            'saffron-3-emergency',
            'Build an emergency meal',
            'Define one meal you can assemble in fifteen minutes or less.',
            'Which freezer, pantry, or refrigerator ingredients make ordering out less urgent?',
          ),
        ],
      },
      {
        id: 'saffron-4-leftover-arsenal',
        number: 4,
        title: 'The Leftover Arsenal',
        rewardXp: 220,
        intro:
          'A meal becomes a system when it protects more than tonight. Saffron turns extra portions into tomorrow’s lunch, recovery fuel, and saved money.',
        completionMessage:
          '“One fire, several meals. That is Kitchen magic, except it is mostly containers and refusing to forget them.” — Saffron',
        objectives: [
          tracked(
            'saffron-4-orders',
            'Stock the arsenal',
            'Complete three Kitchen Orders.',
            'kitchen-orders',
            3,
          ),
          tracked(
            'saffron-4-training',
            'Feed the frame',
            'Complete three Physical missions.',
            'category-count',
            3,
            'physical',
          ),
          manual(
            'saffron-4-leftovers',
            'Write the leftover rule',
            'Choose when you will portion and use leftovers.',
            'What simple rule prevents cooked food from disappearing behind the groceries?',
          ),
        ],
      },
      {
        id: 'saffron-5-hearth-under-command',
        number: 5,
        title: 'Hearth Under Command',
        rewardXp: 300,
        intro:
          'The final chapter is not a perfect diet. It is ownership: recipes you can repeat, recovery after an unplanned order, and a Kitchen that belongs in the life you are building.',
        completionMessage:
          '“The fire answers to you now. Feed your strength, protect your future, and never again tell me you cannot cook.” — Saffron',
        objectives: [
          tracked(
            'saffron-5-orders',
            'Prove the pattern',
            'Complete five Kitchen Orders.',
            'kitchen-orders',
            5,
          ),
          tracked(
            'saffron-5-wins',
            'Keep the line',
            'Complete three No Eating Out challenges.',
            'no-eating-out-wins',
            3,
          ),
          manual(
            'saffron-5-charter',
            'Write the Kitchen charter',
            'Record three rules that make home cooking easier to repeat.',
            'What will always be stocked, when will you decide dinner, and how will you recover after ordering out?',
          ),
        ],
      },
    ],
  },
];

export function getQuestline(id: string) {
  return COMPANION_QUESTLINES.find((questline) => questline.id === id);
}

export function getCompanionQuestline(companionId: string) {
  return COMPANION_QUESTLINES.find((questline) => questline.companionId === companionId);
}
