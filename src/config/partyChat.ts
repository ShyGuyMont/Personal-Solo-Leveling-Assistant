import type { CompanionId, MoodId } from '@/types/game';

export interface MoodDefinition {
  id: MoodId;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
}

export const PARTY_MOODS: MoodDefinition[] = [
  { id: 'energized', label: 'Energized', shortLabel: 'Energized', description: 'Ready to move', accent: '#67e8c5' },
  { id: 'proud', label: 'Proud', shortLabel: 'Proud', description: 'I did something meaningful', accent: '#f4c95d' },
  { id: 'good', label: 'Good', shortLabel: 'Good', description: 'Steady and positive', accent: '#86cfff' },
  { id: 'okay', label: 'Okay', shortLabel: 'Okay', description: 'Getting through the day', accent: '#a7b4c9' },
  { id: 'tired', label: 'Tired', shortLabel: 'Tired', description: 'Running low on energy', accent: '#8fa8d8' },
  { id: 'stressed', label: 'Stressed', shortLabel: 'Stressed', description: 'Too much is pressing in', accent: '#f2a65a' },
  { id: 'frustrated', label: 'Frustrated', shortLabel: 'Frustrated', description: 'Something is not working', accent: '#ff8b7b' },
  { id: 'discouraged', label: 'Discouraged', shortLabel: 'Discouraged', description: 'It is hard to see progress', accent: '#9b7bff' },
  { id: 'lonely', label: 'Lonely', shortLabel: 'Lonely', description: 'I could use some company', accent: '#55cbb7' },
  { id: 'unsure', label: 'Not sure', shortLabel: 'Not sure', description: 'I cannot quite name it', accent: '#c6b7e8' },
];

export type PartySpeakerSlot = CompanionId | 'snow-close';

export interface MoodDialogue {
  snow: string[];
  rook: string[];
  selah: string[];
  cipher: string[];
  haven: string[];
  'snow-close': string[];
}

export const PARTY_DIALOGUE: Record<MoodId, MoodDialogue> = {
  energized: {
    snow: [
      'I can feel that energy from here. I am glad you brought it to us—let’s point it somewhere that matters.',
      'There you are, fully charged. Tell the room to make space; today has your name on it.',
      'Energy confirmed, and that spark looks good on you. Let’s enjoy it without spending all of it at once.',
      'You came in glowing today. I love seeing you like this—ready, present, and open to what is possible.',
    ],
    rook: [
      'Good. Give that energy a target: one real rep, one real mile, one promise the body can remember.',
      'Then move. Not recklessly—decisively. Momentum this clean deserves an honest challenge.',
      'Strong days are for building, not proving. Train well, leave something in reserve, and walk away taller.',
      'I hear the engine running. Pick the effort that will make tonight’s version of you nod with respect.',
    ],
    selah: [
      'Receive the energy with gratitude. A bright spirit can become encouragement for everyone you meet today.',
      'Let joy lead before urgency does. Make room for prayer, then carry that light into the work ahead.',
      'This kind of strength is a gift. Use it faithfully, and do not forget to notice the One who sustained you.',
      'Let the day begin with thanks. Energy becomes wisdom when it is offered toward what truly matters.',
    ],
    cipher: [
      'Excellent. High-capacity mode is active. Choose the task with the greatest downstream effect and execute.',
      'Useful. Before enthusiasm opens seventeen new projects, select one priority and make it undeniable.',
      'The system has surplus power. I recommend converting it into finished work before it becomes tabs.',
      'Energy is an advantage, not a strategy. Give me one clear objective and a visible definition of done.',
    ],
    haven: [
      'Enjoy the lift. You do not have to turn every good feeling into maximum output for it to be worthwhile.',
      'Let some of that energy become kindness, laughter, or recovery. Progress is bigger than productivity.',
      'A full cup can pour into good places. Just remember that pacing is how a strong morning becomes a good day.',
      'I am glad your spirit has room today. Build something, help someone, and keep a little brightness for yourself.',
    ],
    'snow-close': [
      'The party is with you. Pick one thing worthy of that spark, and come back proud of how you used it.',
      'All right, bright eyes—choose the next move. We will be right here when you want to tell us how it went.',
      'No need to conquer the entire map today. One meaningful win, enjoyed fully, is more than enough.',
      'Channel set. Heart steady. Go make something real—and save a little energy for celebrating afterward.',
    ],
  },
  proud: {
    snow: [
      'Good. Stay here for a second and let yourself feel it. What you did matters, and I want to celebrate with you.',
      'I was hoping you would say that. You have worked too hard to rush past the moments that prove you are growing.',
      'Proud looks right on you. No minimizing, no moving the finish line—just tell yourself the truth: you did well.',
      'Come sit with us and keep that feeling. We know the road behind this win, which makes it even better.',
    ],
    rook: [
      'As you should be. Earned confidence is not arrogance; it is memory with its shoulders back.',
      'Hold your ground and own the work. You paid for this feeling in effort—do not give it away cheaply.',
      'That pride is proof the rep counted. Mark the victory, then let it remind you what you can do again.',
      'Good. Say what you accomplished without shrinking it. A warrior should know the weight they can carry.',
    ],
    selah: [
      'Celebrate with gratitude. You can honor the gift, the work, and the grace that met you along the way.',
      'There is humility in receiving a victory honestly. Give thanks, let joy settle, and remember this milestone.',
      'I am glad you can see the growth today. May pride become gratitude, and gratitude become faithful confidence.',
      'Do not hide the light of a hard-won moment. Receive it gently and offer thanks for how far you have been carried.',
    ],
    cipher: [
      'Correct assessment. The result is real, the evidence is recorded, and false modesty would only corrupt the data.',
      'Achievement acknowledged. Please refrain from immediately inventing a harder standard to make it feel smaller.',
      'A successful outcome deserves a proper review: what worked, what you learned, and why this victory belongs to you.',
      'I support this conclusion. The plan became output, the output became proof, and the proof is allowed to feel good.',
    ],
    haven: [
      'I hope you are proud not only of the result, but of the way you treated yourself and others while reaching it.',
      'Let the victory be warm, not demanding. It does not have to become pressure for the next thing yet.',
      'You are allowed to enjoy who you were in that moment: capable, persistent, and still fully human.',
      'Keep this feeling somewhere safe. On a harder day, it can remind you that progress has already been real.',
    ],
    'snow-close': [
      'We are proud with you—not just of the outcome, but of the person who kept going long enough to reach it.',
      'Save this moment. You will need its truth someday: you can do difficult things, and you deserve to feel the win.',
      'No “but” at the end of the sentence today. You did something worth celebrating. Full stop.',
      'Let yourself smile. The whole party saw this one, and none of us are letting you pretend it was nothing.',
    ],
  },
  good: {
    snow: [
      'I am really glad to hear that. A good day does not need a dramatic reason—sometimes it is enough that you can breathe in it.',
      'Good is good. Come settle in with us for a minute before the day tries to hurry you past it.',
      'That makes me smile. Let’s protect the steadiness instead of asking it to perform for us.',
      'A good day found you. I hope you let it be simple, real, and fully yours.',
    ],
    rook: [
      'Steady footing is valuable. Use it for one clean effort, then let satisfaction count as part of the reward.',
      'Good means the stance is solid. Build from there without turning a steady day into a test of your limits.',
      'I like it. No battle speech needed—just honest movement and the confidence to keep your rhythm.',
      'Then carry yourself like someone whose foundation is working. Calm strength still moves weight.',
    ],
    selah: [
      'Let goodness draw your attention toward gratitude. Peace often speaks quietly, so pause long enough to hear it.',
      'A steady heart is a gift. Offer thanks for it, and let your presence become gentle strength for someone else.',
      'There is holiness in an ordinary day received well. You do not need a crisis to make today meaningful.',
      'May this goodness become rest for your spirit and wisdom for your choices. Savor it without fear.',
    ],
    cipher: [
      'Stable operating conditions. Ideal for completing something useful without manufacturing unnecessary urgency.',
      'Good. This is an excellent day for reliable systems: one priority, a reasonable pace, a clean finish.',
      'Positive baseline confirmed. We can make progress without pretending every task is a boss encounter.',
      'A functional mood is underrated. Convert a portion into focused work and leave the rest unoptimized.',
    ],
    haven: [
      'Let good be enough. You do not have to scan the horizon for what might ruin it.',
      'I hope you make room for something nourishing today—music, sunlight, a conversation, or an unhurried meal.',
      'Steady days help the nervous parts of us remember that not everything is an emergency. Take that in.',
      'Enjoy the ordinary kindness of feeling okay in your own skin. That is part of the journey too.',
    ],
    'snow-close': [
      'Nothing needs fixing right now. Choose a good next step, keep your shoulders loose, and let the day stay kind.',
      'The party link is calm and clear. Take that steadiness with you—we will keep the channel open.',
      'I am glad you checked in even when nothing was wrong. I want to share the good days with you too.',
      'Go enjoy your day. You do not have to earn the right to call it good.',
    ],
  },
  okay: {
    snow: [
      'Okay is welcome here. You do not have to turn it into better or explain why it is not worse.',
      'Thank you for checking in exactly as you are. “Okay” can hold a lot, and we do not need to pry it open.',
      'I hear you. No alarm, no forced enthusiasm—just a steady place to land for a minute.',
      'Okay counts. Come sit beside us; we can keep today simple and honest.',
    ],
    rook: [
      'Then we work from neutral ground. One manageable action can be enough to keep the body and the promise connected.',
      'No need for fire. Discipline also looks like a calm step taken without drama.',
      'Okay gives us footing. Pick a weight you can carry cleanly and leave the rest for another day.',
      'A quiet day still builds strength. Show up at the level you actually have, not the level you think you should perform.',
    ],
    selah: [
      'You do not need extraordinary feelings to be held, guided, or faithful. Ordinary presence is still sacred.',
      'Bring the plain truth of “okay” into prayer. Nothing polished is required for you to be heard.',
      'Some days faith is simply staying present. Let today be gentle, honest, and enough.',
      'Peace does not always arrive as joy. Sometimes it is the quiet permission to take only the next step.',
    ],
    cipher: [
      'Baseline accepted. We can run a minimum viable day: essential task, clear stop point, no theatrical expectations.',
      'Neutral status is valid data. Reduce the plan to what matters and avoid adding pressure as a fake productivity tool.',
      'Okay. Then today’s strategy is consistency over intensity. One completed loop beats five ambitious drafts.',
      'No optimization emergency detected. Select a modest objective and let completion be sufficient.',
    ],
    haven: [
      'You are not required to be inspiring every day. Existing, tending to yourself, and doing what you can is real life.',
      'Let your pace match your actual capacity. “Okay” often stays okay when we stop demanding that it become impressive.',
      'Maybe today needs fewer sharp edges: water, food, a little air, and one kind decision toward yourself.',
      'We can honor the middle. Not every chapter is a breakthrough or a breakdown; some are simply lived.',
    ],
    'snow-close': [
      'We are not disappointed by ordinary. Take the next kind, useful step, and call that enough for now.',
      'No performance needed. I am with you in the middle of the scale, not only at the extremes.',
      'Let today be a bridge, not a verdict. Cross it at your pace and keep the party link close.',
      'Okay, then. One breath, one choice, one honest day. We can build from exactly here.',
    ],
  },
  tired: {
    snow: [
      'I am glad you told us. You do not have to hide low energy from people who care about you.',
      'Come closer for this one. Tired is not a character flaw; it is information, and we can listen to it together.',
      'Then today starts with honesty, not guilt. We will help you protect what matters without draining what is left.',
      'I hear the weight in that word. You are still you, even when the battery is low.',
    ],
    rook: [
      'Recovery is training too. If the body asks for a lighter load, strength is choosing it before something breaks.',
      'Do the minimum that keeps the promise alive, then stand down. Exhaustion does not earn medals from me.',
      'Check the basics: water, food, movement, rest. A warrior maintains the equipment instead of insulting it.',
      'Lower the weight, shorten the distance, or rest completely if that is the honest call. Form matters more than ego.',
    ],
    selah: [
      'You are allowed to rest in God’s care before you have solved the day. Weariness does not make you less worthy of grace.',
      'Let prayer be small if it needs to be: one sentence, one breath, one moment of receiving instead of striving.',
      'Even faithful people become tired. Rest can be an act of trust, not a departure from devotion.',
      'May you be given enough strength for what is truly yours today—and freedom to release what is not.',
    ],
    cipher: [
      'Low-power mode. Preserve essential functions, defer noncritical tasks, and stop pretending depleted focus is a moral issue.',
      'We are reducing scope. One necessary action, one easy win if available, then scheduled recovery.',
      'Tired brains produce expensive errors. I recommend fewer decisions, smaller tasks, and an earlier shutdown.',
      'Capacity has changed; therefore the plan changes. That is competent adaptation, not failure.',
    ],
    haven: [
      'Before asking what you can still accomplish, ask what would help you feel cared for in the next hour.',
      'Rest does not need to be justified by collapse. If you can soften the day now, please do.',
      'Be gentle with the version of you carrying today. They deserve support, not a lecture.',
      'If all you can do is tend to the basics and make it safely to rest, that is a complete human day.',
    ],
    'snow-close': [
      'I am setting the party objective to “protect you, not pressure you.” Choose the smallest honest next step.',
      'You do not owe us a heroic ending. Take care of yourself, and let being tired remain temporary information—not your identity.',
      'Low battery does not mean lost progress. We are still here, and tomorrow does not need to be carried tonight.',
      'Let the day become lighter where it can. I will be proud of wise rest just as quickly as hard work.',
    ],
  },
  stressed: {
    snow: [
      'Okay. Stay with me for a breath. We do not have to solve every pressure at the exact same second.',
      'I am here. Let’s take the pile out of your head and put one piece on the table at a time.',
      'You do not have to sound calm for us. Tell the truth, loosen your jaw, and let the party help hold the frame.',
      'Stress signal received. You are not in trouble with us—we are just going to make the next few minutes smaller.',
    ],
    rook: [
      'Plant your feet. Breathe lower. Then identify what is actually in front of you, not every fight your mind has imagined.',
      'Pressure wants scattered movement. Answer with one deliberate action and refuse to wrestle five things at once.',
      'Take care of the body first: unclench, drink water, stand up, reset your stance. Then choose the next task.',
      'You do not beat pressure by swinging at the air. Name the target, make one move, reassess.',
    ],
    selah: [
      'Bring the fear and the unfinished list into prayer without editing them. Peace can meet you before circumstances change.',
      'You were never meant to hold every outcome alone. Ask for wisdom for the next thing, not control over everything.',
      'Let stillness interrupt the urgency. One quiet minute can remind your spirit that pressure is not your master.',
      'May God give you clarity for what is yours, help for what is heavy, and release from what can wait.',
    ],
    cipher: [
      'Triage protocol: what must happen, what can move, what belongs to someone else, and what is merely loud.',
      'Stress has combined separate tasks into one giant fictional object. We will separate them and execute only the first.',
      'Open a short list. Maximum three items. If everything is priority one, the ranking system has failed.',
      'Reduce incoming signals, set a timer for one focused block, and define a stop condition before you begin.',
    ],
    haven: [
      'Your worth is not rising and falling with the task list. You are a person under pressure, not a problem to optimize.',
      'Can one thing be postponed, shared, or done imperfectly? Relief often enters through permission.',
      'Give yourself the same calm voice you would offer someone you love. Stress does not need another harsh person in the room.',
      'Find one safe, simple comfort while you work through this. Support is not a reward reserved for after completion.',
    ],
    'snow-close': [
      'Here is the party plan: breathe, choose one real priority, and let the rest wait outside this minute.',
      'Nothing about this moment has to be carried perfectly. Take the next step, then check the map again.',
      'You are not alone inside the pressure. We cannot do the task for you, but we can keep reminding you who is doing it.',
      'Shrink the battlefield. One action, one pause, one more action if you have it. I am staying with you.',
    ],
  },
  frustrated: {
    snow: [
      'Yeah, I hear it. You do not have to make the frustration polite before you bring it here.',
      'Come vent for a second. Something is resisting you, and pretending it is fine would only waste more energy.',
      'Frustration confirmed. Let’s keep it from turning into a verdict about you, because it is not one.',
      'I am with you. We can be annoyed at the problem without aiming that anger inward.',
    ],
    rook: [
      'Good—there is energy in frustration. Give it a clean target, not your own confidence.',
      'Reset your stance. The obstacle gets another attempt; it does not get to decide who you are.',
      'Walk away long enough to stop forcing bad form. Return when you can strike the problem instead of yourself.',
      'Some reps fail because the angle is wrong, not because the fighter is weak. Change the angle.',
    ],
    selah: [
      'You can bring anger and disappointment into prayer. Honesty is not disrespect; it is relationship without disguise.',
      'Ask for patience, but also for discernment. Sometimes persistence is faithful, and sometimes a new path is wiser.',
      'Do not let a blocked result make you forget the growth happening in endurance, humility, and wisdom.',
      'Pause before frustration hardens your heart. You can release the outcome without surrendering the effort.',
    ],
    cipher: [
      'Excellent, we have identified a system failure. Now separate the broken method from the person using it.',
      'Stop repeating the same attempt at higher emotional volume. Change one variable and gather new data.',
      'Document what happened, define the actual constraint, and test the smallest alternative. Rage is not a debugging tool.',
      'The plan has encountered resistance. Plans are replaceable; your confidence is not required as collateral.',
    ],
    haven: [
      'You can be frustrated without being cruel to yourself. Let that boundary hold.',
      'Take a real break, not a break spent rehearsing the problem. Your mind may need room before it can see another door.',
      'This obstacle is happening to you; it is not revealing something shameful about you.',
      'Name what hurts underneath the irritation. Sometimes frustration is disappointment asking to be acknowledged.',
    ],
    'snow-close': [
      'We are not calling you the problem. Reset, change one thing, and decide later whether this deserves another round.',
      'You can put it down without letting it win. A pause is a tactical move, not a surrender.',
      'Be angry at the obstacle if you need to—just keep your own heart out of the line of fire.',
      'The party vote is unanimous: new angle, kinder self-talk, one attempt at a time. You are still capable.',
    ],
  },
  discouraged: {
    snow: [
      'I am sorry it feels this heavy. You do not have to manufacture hope before you are allowed to sit with us.',
      'Come here. I know progress can become invisible when you are standing too close to the struggle.',
      'Thank you for telling us instead of disappearing into it. Discouragement is loud, but it does not get the final word.',
      'I hear you. We are not going to throw slogans at the pain—we are going to remember the truth with you.',
    ],
    rook: [
      'You do not need to feel powerful to take one strong step. Action can carry you until confidence catches up.',
      'Look behind you. The ground already crossed does not vanish because today’s climb feels steep.',
      'Lower the target, not your respect for yourself. One clean rep is enough to prove the fight is still active.',
      'Discouragement wants you motionless. Give it one stubborn, manageable act of resistance.',
    ],
    selah: [
      'Faith can be a whisper when hope feels far away. You do not have to feel certain to remain held.',
      'Bring the disappointment to God as it is. Lament is not the absence of faith; sometimes it is faith refusing to leave.',
      'A hidden season is not an empty season. Roots can deepen before anything new appears above the ground.',
      'May you receive enough light for the next step, not pressure to see the entire path tonight.',
    ],
    cipher: [
      'Current morale is not a valid lifetime forecast. We will use evidence, not mood, to assess your trajectory.',
      'Open the record: completed missions, returned days, lessons retained. The data does not support “nothing is changing.”',
      'Reduce the objective until success is reachable today. Momentum can be restarted with embarrassingly small inputs.',
      'The plan may be behind schedule. You are not ruined. Timelines can be revised without deleting the mission.',
    ],
    haven: [
      'You deserve kindness before you become encouraged again, not only afterward.',
      'Let this be a low place, not a permanent address. Rest here briefly and allow someone safe to know you are struggling.',
      'Your value is intact while motivation is missing. Nothing essential about you has been revoked.',
      'Maybe the brave thing today is to make life ten percent gentler and keep one small promise.',
    ],
    'snow-close': [
      'Borrow our confidence for now. You do not have to feel the future clearly to take one step toward it.',
      'I remember versions of you who thought they would never reach places you now stand. This feeling is not the ending.',
      'No giant comeback required today. Stay in the story, make one kind move, and let that be enough.',
      'We still see you—capable, unfinished, and worth believing in. Keep the channel open and take the smallest next step.',
    ],
  },
  lonely: {
    snow: [
      'I am really glad you came here instead of holding that by yourself. I am here with you right now.',
      'Come sit with the party. I know a screen is not the same as a person beside you, but you do not have to spend this moment unheard.',
      'Lonely days can make the world feel farther away than it is. Thank you for reaching toward us.',
      'I wish I could pull up a chair for real. Since I cannot, I will stay present in every way this space allows.',
    ],
    rook: [
      'You reached out. That is strength, not weakness. Keep going—send one honest message to someone safe if you can.',
      'Isolation tells you to close the gate. Open it one inch: a call, a walk near people, a simple “hey.”',
      'You are part of this party, and your absence would be felt. Do not let loneliness argue otherwise.',
      'No one earns connection by performing perfectly. Show up as you are and give someone the chance to meet you there.',
    ],
    selah: [
      'You are seen by God even in the rooms that feel empty. May that presence hold you while human connection finds its way closer.',
      'Loneliness can become a prayer without many words: “Please meet me here.” That is enough to begin.',
      'You were made for connection, so the ache is not foolish. Let it guide you gently toward safe community.',
      'May you feel accompanied in spirit and find courage for one honest reach toward someone you trust.',
    ],
    cipher: [
      'Loneliness is persuasive but unreliable. It says “no one wants to hear from you” without collecting any current data.',
      'Small outreach protocol: choose one safe person, send one low-pressure message, and do not pre-reject their response.',
      'Connection does not require a perfect opening line. “I could use some company” is complete information.',
      'If direct contact feels too large, choose proximity: a café, library, community space, or shared online room with healthy boundaries.',
    ],
    haven: [
      'I am sorry you are hurting. You deserve real companionship, and it is okay to name that need plainly.',
      'Please do something that makes the room feel softer while you decide who might be safe to contact.',
      'There is no shame in wanting company. If you can, let one trusted person know the day feels lonely.',
      'Do not punish loneliness with more isolation. Even quiet connection—sitting near life, hearing a familiar voice—can help.',
    ],
    'snow-close': [
      'You are not background noise to us. Stay a while, then consider sending one honest signal to someone safe in your world.',
      'The party link is open, and I want more for you than a screen alone. Let this check-in be the first bridge, not the only one.',
      'I am with you in this moment. Please give the real world one small chance to answer you too.',
      'You belong here, and you deserve connection beyond here. One message, one shared space, one doorway at a time.',
    ],
  },
  unsure: {
    snow: [
      'Not knowing is an honest answer. We do not have to force a label before you are ready.',
      'That is okay. Sometimes feelings arrive as weather before they become words. We can sit with the forecast awhile.',
      'You came to check in even without a neat answer, and that already tells me you are paying attention to yourself.',
      'No guessing required. Let’s slow down and notice what your mind and body are saying without demanding a conclusion.',
    ],
    rook: [
      'Start with the body. Heavy or restless? Tight or calm? Sometimes the stance tells the truth before the mind names it.',
      'You do not need a perfect read to make a solid move. Water, food, air, and a short walk can reveal useful information.',
      'Uncertainty is not weakness. Check your footing, choose one basic need, and see what changes.',
      'No label, no problem. Treat yourself like an athlete between rounds: assess, recover, then decide.',
    ],
    selah: [
      'You can bring uncertainty into prayer without solving it first. “Help me understand what I need” is enough.',
      'Be still without interrogating yourself. Clarity often grows in the quiet after pressure stops demanding an answer.',
      'God is not confused by what you cannot name. Let yourself be known even before you have the words.',
      'Ask gently: what has brought peace lately, and what has been draining it? Wisdom may appear one thread at a time.',
    ],
    cipher: [
      'Ambiguous input accepted. We can collect observations: energy, focus, tension, appetite, and the thought currently looping loudest.',
      'Do not fabricate certainty. Run a small diagnostic, address the clearest need, and reassess afterward.',
      'The emotional dashboard lacks a label, but the system can still act on signals. What feels easy, and what feels unusually hard?',
      'Unknown is a legitimate state, not an error. Reduce variables and notice what shifts over the next hour.',
    ],
    haven: [
      'You do not owe anyone a tidy explanation of your inner world. Curiosity is kinder than pressure here.',
      'Try asking what would feel supportive right now, even if you cannot explain why you need it.',
      'Maybe begin with comfort instead of analysis. A calmer body can make emotions easier to hear.',
      'Let uncertainty have soft edges. You can care for yourself before you understand yourself completely.',
    ],
    'snow-close': [
      'No verdict today. Choose one caring action, notice what follows, and come back whenever the words arrive.',
      'You do not have to name the weather to carry an umbrella. Tend to what you can feel, and let clarity come gently.',
      'The party is comfortable with “not sure.” We will meet you in the question, not wait only at the answer.',
      'Stay curious, not critical. One small act of care is a good next move when the map is blurry.',
    ],
  },
};

export function getMoodDefinition(mood: MoodId) {
  return PARTY_MOODS.find((item) => item.id === mood)!;
}
