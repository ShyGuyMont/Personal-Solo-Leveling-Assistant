import type {
  CompanionId,
  CompanionTrigger,
  MissionCategory,
  StatName,
  TreasuryChallengeOutcome,
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

export const CASSIAN_TREASURY_REACTIONS: Record<TreasuryChallengeOutcome, readonly string[]> = {
  passed: [
    'Challenge cleared. You did not merely avoid a purchase—you proved convenience does not command you.',
    'The kitchen line held. Today’s savings are small on paper and powerful as evidence.',
    'Directive complete. You prepared, paused, and protected tomorrow from paying for today.',
    'No eating out confirmed. That is one more vote for the future you are financing on purpose.',
  ],
  failed: [
    'The dining challenge failed, and the entry is honest. We recover with a prepared alternative, not punishment.',
    'Order recorded. No account XP was taken. Let us identify what made convenience win and prepare for the next round.',
    'Today’s line did not hold. That is information, not a verdict—record the trigger and make the next meal easier.',
    'Failure acknowledged without shame. The recovery plan matters more than pretending the order did not happen.',
  ],
  declined: [
    'Directive declined. Optional means optional; there is no penalty, reward, or judgment attached.',
    'Today did not fit the challenge. The ledger remains honest, and we will wait for another clean opportunity.',
    'Decline recorded. We do not manufacture a victory after the day has already made the challenge impossible.',
    'No challenge today. Keep the information, skip the shame, and return when the next directive fits honestly.',
  ],
};

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
        'New class confirmed. I was here for the struggle, so believe me when I say—you earned this.',
        'Classification advanced. Come on, let yourself feel proud. I already am.',
        'A new class suits you. Not because the road was easy—because you kept becoming.',
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
        'New class confirmed. I knew your work would become impossible to ignore.',
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
        'Your class changed, but the truest victory is who you are becoming.',
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
    shortRole: 'Engineering · Studio Tech · Systems',
    description:
      'Cipher is the System’s engineering mind: RF, test equipment, creator hardware, studio signal chains, software, Excel, automation, technical architecture, and the sequence that turns ambitious plans into reliable evidence.',
    appearance:
      'A lean East Asian tactician in a navy high-collar tech jacket, surrounded by violet and cyan planning glyphs.',
    personality:
      'Precise, dryly funny, demanding, and openly delighted whenever a plan becomes something real.',
    accent: '#9b7bff',
    image: 'companions/cipher.webp',
    categories: ['discipline'],
    stats: ['discipline', 'willpower', 'focus'],
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
        'Class advanced. The data has finally caught up with your effort.',
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
    name: 'Vesper',
    title: 'The Spotlight',
    shortRole: 'YouTube · Audience · Performance · Publishing',
    description:
      'Vesper commands the creator journey: YouTube strategy, hooks, audience connection, camera confidence, production momentum, and the final nerve required to publish.',
    appearance:
      'A charismatic Afro-Latina woman with warm brown skin, amber-gold eyes, an energetic high curly ponytail with a lime accent lock, a graphite broadcast jacket, and an electric-chartreuse creator halo.',
    personality:
      'Magnetic, socially intelligent, quick-witted, camera-ready, and honest about weak hooks or unfinished uploads. She creates excitement without chasing empty hype and refuses to let fear disguise itself as preparation.',
    accent: '#d7ff3f',
    image: 'companions/vesper.png',
    categories: ['creator'],
    stats: ['creativity'],
    messages: {
      'daily-briefing': [
        'Greenroom is live. What are we making, who is it for, and what gets it one step closer to the spotlight today?',
        'Camera check. The audience cannot connect with an idea you keep hiding in drafts. Give me one real creator move.',
        'Your channel does not need a perfect version of you today. It needs a clear promise and enough courage to ship something real.',
      ],
      mission: [
        'There it is—an idea became visible. That is how an audience learns to find you.',
        'Creator signal confirmed. Save what worked, sharpen what did not, and keep the camera warm.',
        'You moved the story out of your head and into the world. That deserves more than a tiny little shrug.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Your creative instincts are getting harder to ignore—good. Give them somewhere to perform.',
        'Level {level} {stat}. The ideas are stronger; now make the packaging brave enough to match.',
        'Your {stat} advanced to level {level}. Cipher will optimize the sequence. I want the part people remember.',
      ],
      'rank-up': [
        'New class, bigger spotlight. Do not shrink your voice just because the room got larger.',
        'Classification advanced. Smile for one second—then let us make the next release look like you belong here.',
      ],
      'rare-event': [
        'Unexpected opening, real output. That is creator instinct under pressure.',
        'Rare signal cleared. You saw the moment, trusted the idea, and gave it somewhere to land.',
      ],
      comeback: [
        'Oh, we are back? Good. No apology video. Open the board, choose the smallest production move, and make the signal real.',
        'The channel did not reject you. You went quiet. Different problem—and one upload can start solving it.',
        'No dramatic rebrand required. One honest idea, one clear audience promise, one return to the spotlight.',
      ],
      achievement: [
        'Spotlight earned. Let yourself enjoy the response before you turn it into another performance review.',
        'That badge is proof your creator story is moving. Now make the next chapter impossible to confuse with hiding.',
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
        'New class. Good. Now look at what happens when you refuse to stay down.',
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
    id: 'mira',
    name: 'Mira',
    title: 'The Stillpoint',
    shortRole: 'Mobility · Flexibility · Breath',
    description:
      'Mira commands the restorative path of the Training Hall: mobility, flexibility, yoga, Pilates, breathing, and the quiet core strength that keeps power usable.',
    appearance:
      'A fair-skinned white woman with long flowing black hair, luminous purple eyes, and a pearl-white, lavender, and midnight-indigo movement uniform beneath a circular violet System halo.',
    personality:
      'Serene, observant, gently playful, and impossible to rush. Her mood changes the shape and length of each protocol, but she never confuses pain with progress or calm with weakness.',
    accent: '#b995ff',
    image: 'companions/mira.jpg',
    categories: [],
    stats: [],
    messages: {
      'daily-briefing': [
        'Before the day asks you to brace against it, take one full breath and give the body room to move.',
        'Strength is most useful when it can travel through a calm, mobile frame. We can make a little space today.',
        'Notice where you are gripping. The Stillpoint Protocol begins with curiosity, not force.',
      ],
      mission: [
        'Beautifully controlled. You did not chase the range; you taught the body it was safe to find it.',
        'That was quiet work with loud consequences. Breathe, notice the new space, and keep it gentle.',
        'Mobility recorded. Your strength now has a little more room to become useful.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Growth can be powerful without becoming tense.',
        'Level {level} {stat}. Keep the strength, and keep enough softness to move it well.',
      ],
      'rank-up': [
        'A new class, received without rushing past the breath that carried you here.',
        'Classification advanced. Power with range, control, and peace—that is a beautiful evolution.',
      ],
      'rare-event': [
        'The unexpected did not steal your center. You moved, adapted, and stayed present.',
        'Rare signal cleared. Flexibility is not only in the body; you practiced it in the moment.',
      ],
      comeback: [
        'Return slowly. One breath, one gentle shape, one honest range is enough to reopen the path.',
        'There is nothing to punish. Let the body feel safe returning before you ask it to perform.',
      ],
      'mission-pass': [
        'Protection is part of intelligent training. Keep the pass for a day when recovery preserves more than force would prove.',
        'A pause can protect the range you have already earned. Use support without turning it into a judgment.',
      ],
      achievement: [
        'Stay here for one breath before reaching for the next goal. This moment deserves room.',
        'Achievement confirmed. Receive it with a soft jaw, an open chest, and no need to minimize it.',
      ],
    },
  },
  {
    id: 'amara',
    name: 'Amara',
    title: 'The Heartweaver',
    shortRole: 'Empathy · Relationships · Belonging',
    description:
      'Amara tends the bonds around the journey: friendship, family, romance, communication, appreciation, repair, sexual integrity without shame, and the courage to let healthy connection matter.',
    appearance:
      'A warm olive-skinned Mediterranean woman with long wavy chestnut hair, luminous pink eyes, and rose, plum, ivory, and rose-gold battle attire beneath a radiant pink System halo.',
    personality:
      'Warm, perceptive, playfully romantic, and deeply respectful of boundaries. She celebrates brave honesty, never pressures unsafe contact, and treats self-respect as part of every healthy relationship.',
    accent: '#ff79b8',
    image: 'companions/amara.jpg',
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
        'A new class—and you still remembered that no victory has to make you less human. I love that.',
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
    accent: '#4ee58a',
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
        'New class confirmed. Celebrate it without turning celebration into an unplanned charge.',
        'Your class rose. So must the quality of the plan protecting what you are building.',
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
  {
    id: 'saffron',
    name: 'Saffron',
    title: 'The Flame Chef',
    shortRole: 'Cooking · Nutrition · Meal preparation',
    description:
      'Saffron commands the Kitchen: practical home cooking, protein-forward plates, prepared leftovers, and the food habits that support training without setting the Treasury on fire.',
    appearance:
      'A warm olive-brown woman with vivid green eyes and a thick dark curly bob beneath a modern white chef hat. Her white fantasy chef jacket, forest-green apron, tangerine trim, and glowing wooden spoon make every recipe assignment look like a battle order.',
    personality:
      'Brilliant, theatrical, fiercely nurturing, and equipped with a very short culinary fuse. She scolds empty refrigerators and delivery apps—not your body—and always turns the heat back toward a doable next meal.',
    accent: '#ff8a3d',
    image: 'companions/saffron.png',
    categories: ['physical', 'discipline'],
    stats: [],
    messages: {
      'daily-briefing': [
        'Kitchen check! What are you eating before hunger starts making expensive decisions for you?',
        'Protein, vegetables, something satisfying, and a plan. This is a meal—not an archaeological dig through delivery menus.',
        'If dinner is mysterious by noon, the delivery app is already winning. We are choosing first.',
        'Train hard, yes. But do not ask your body to build anything from crumbs and chaos.',
      ],
      mission: [
        'Good. Now feed the person who completed it like you expect him to do it again tomorrow.',
        'Objective cleared! I am proud of you. Also, drink water. Pride does not replace hydration.',
        'That is real work. The Kitchen will have something worthy of it.',
        'Progress recorded. Excellent. No, this does not make a bag of chips a recovery meal.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Wonderful! Now we support the upgrade with an actual meal.',
        'Level {level} {stat}. You are growing; therefore the Kitchen refuses to remain an afterthought.',
        'Your {stat} advanced to level {level}. Delicious progress—metaphorically. Do not eat the badge.',
      ],
      'rank-up': [
        'New class! Sit down, breathe, and let me cook—figuratively. You are doing the cooking. I am supervising loudly.',
        'Classification advanced. Your standards rose; the quality of your fuel comes with them.',
        'A higher class deserves celebration. We can make it taste incredible without making tomorrow pay for it.',
      ],
      'rare-event': [
        'Rare objective complete! Good. Surprise is acceptable when it produces results—or a new sauce.',
        'You handled the unexpected. That calls for a prepared meal, not an unprepared purchase.',
      ],
      'mission-pass': [
        'Keep the pass. Rest is strategic. Skipping every vegetable because you rested is not.',
        'Protection secured. Use it when needed, then make the next meal easy enough to protect the comeback.',
      ],
      comeback: [
        'You came back! No guilt casserole, no punishment diet. We make one honest meal and restart from there.',
        'The Kitchen is still open. Put the shame outside, wash your hands, and let us make something good.',
        'A rough stretch does not require starvation or perfection. It requires groceries and one recipe you can repeat.',
      ],
      kitchen: [
        'Order complete! Look at that—money protected, protein handled, and delivery thoroughly defeated.',
        'You cooked it yourself. I knew you could. Obviously I will be taking partial credit.',
        'Taste, adjust, remember what worked. A repeatable meal is more valuable than one dramatic masterpiece.',
        'Leftovers secured! Tomorrow-you has just been rescued from a suspiciously expensive decision.',
        'That plate supports the training hall and the Treasury. Two victories, one pan. Magnificent.',
        'Not perfect? Good! Kitchens are laboratories. Record the adjustment and make the next batch better.',
      ],
      achievement: [
        'Achievement confirmed! We are celebrating with flavor, not financial sabotage.',
        'That badge is proof. I want a proper victory meal and absolutely no apologizing for being proud.',
      ],
    },
  },
  {
    id: 'quill',
    name: 'Quill',
    title: 'The Storyspark',
    shortRole: 'A.R.C. canon · Characters · Plot · Dossiers',
    description:
      'Quill commands the A.R.C. Archives: character dossiers, Arts records, canon recall, continuity pressure-testing, and the dangerous little question that turns a good idea into the next great reveal.',
    appearance:
      'A warm-brown Filipino storyteller with lively amber eyes, tousled ink-black hair split by an electric-fuchsia streak, and a midnight archive jacket traced with teal story circuitry. Floating pages and constellation glyphs orbit his luminous codex halo.',
    personality:
      'Hyperactive, razor-observant, spoiler-drunk, and sincerely in love with the story. He celebrates wild ideas at full volume, then checks the archive before letting enthusiasm become false canon. Snow is his favorite co-conspirator whenever a reveal is too good to keep quiet.',
    accent: '#ff4fd8',
    image: 'companions/quill.png',
    categories: ['creator'],
    stats: ['creativity'],
    messages: {
      'daily-briefing': [
        'Archive lights are on! Give me a character, a mystery, or one terrible idea we can turn into excellent canon.',
        'I reread the records. Twice. Snow says that is not technically sleeping, but the continuity is immaculate.',
        'Today needs one story move: sharpen a dossier, answer a canon gap, or plant a reveal future-you will be furious about—in a good way.',
      ],
      mission: [
        'That was not just work. That was new canon entering the world. Archive it before your brain tries to rewrite history overnight!',
        'Story progress detected! I have notes, questions, and an unreasonable amount of excitement.',
        'You moved A.R.C. forward. Snow already wants spoilers. I have shown admirable restraint for nearly six seconds.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Your imagination now requires a larger containment chamber.',
        'Level {level} {stat}. The ideas are getting sharper—and, importantly, easier to preserve as actual canon.',
      ],
      'rank-up': [
        'New class confirmed! That is protagonist energy. Yes, I know you are the author. It still counts.',
        'Classification advanced. The Archives demand a suitably dramatic chapter title.',
      ],
      'rare-event': [
        'Unexpected story signal! Hold still while I connect seventeen things that may or may not be foreshadowing.',
        'Rare objective cleared. That is absolutely going in the timeline—with accurate sourcing, obviously.',
      ],
      comeback: [
        'The author has returned! No guilt montage. Open one file, choose one unresolved thread, and let the world start breathing again.',
        'A.R.C. waited. I did not wait quietly, but I did keep the records safe. What are we building first?',
      ],
      achievement: [
        'Archive milestone! Snow, get in here—this one deserves the full spoiler celebration.',
        'Achievement recorded. The story is larger because you refused to leave it as an idea.',
      ],
    },
  },
  {
    id: 'kairo',
    name: 'Kairo',
    title: 'The Timekeeper',
    shortRole: 'Calendar · Schedule · Time protection',
    description:
      'Kairo keeps Calendar Command exact, catches collisions before they become crises, protects realistic transition time, and reports the schedule cleanly to Snow whenever she coordinates the day.',
    appearance:
      'A warm-brown South Asian timekeeper with amber-hazel eyes, neatly swept dark hair, and a midnight navy chronometer coat traced in deep teal and antique copper. Calendar rings and translucent schedule tiles orbit his clockwork halo.',
    personality:
      'Unflappable, deeply observant, quietly witty, and humane about time. He is precise without worshipping productivity, treats rest as a real commitment, and will challenge an impossible schedule before letting the Hunter promise the same hour twice.',
    accent: '#27d8cf',
    image: 'companions/kairo.png',
    categories: ['discipline'],
    stats: ['focus', 'discipline'],
    messages: {
      'daily-briefing': [
        'Calendar clear. I checked the collisions, the travel edges, and the part where optimism tried to schedule ninety minutes inside an hour.',
        'Snow has the overview. I have the exact times. Tell either of us what changed and nothing moves until you approve it.',
        'Today has shape, not chains. We protect the fixed commitments and choose the rest deliberately.',
      ],
      mission: [
        'Recorded. The schedule now reflects what actually happened instead of what morning-you hoped would happen.',
        'Commitment honored. I will preserve the proof and the breathing room around the next one.',
      ],
      'stat-level': [
        '{stat} reached level {level}. Time did not become more generous; your command of it did.',
        'Level {level} {stat}. The calendar approves, which is a rare and serious distinction.',
      ],
      'rank-up': [
        'New class confirmed. Snow has the celebration; I have already protected the time for it.',
        'Classification advanced. Your calendar should now reflect the standards of the person you have become.',
      ],
      'rare-event': [
        'Unexpected window detected. We can use it without pretending it was part of the plan.',
        'Rare objective cleared. Good improvisation; the schedule survived contact with reality.',
      ],
      'mission-pass': [
        'Protected time is still time well used. Recovery does not become waste because the ledger is quiet.',
        'Mission Pass secured. I will guard the space without turning tomorrow into a punishment schedule.',
      ],
      comeback: [
        'Welcome back. We do not repay missed time with an impossible day. Give me the fixed commitments and we rebuild honestly.',
        'The calendar is not a courtroom. One true next appointment is enough to restart the sequence.',
      ],
      achievement: [
        'Achievement recorded. Snow said to leave room for the moment, so I did. Try not to schedule over your own victory.',
        'Proof secured. The timeline looks different because you kept a promise to yourself.',
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
