import type { CompanionId, MoodId } from '@/types/game';

export interface MoodDefinition {
  id: MoodId;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
}

export const PARTY_MOODS: MoodDefinition[] = [
  {
    id: 'energized',
    label: 'Energized',
    shortLabel: 'Energized',
    description: 'Ready to move',
    accent: '#67e8c5',
  },
  {
    id: 'proud',
    label: 'Proud',
    shortLabel: 'Proud',
    description: 'I did something meaningful',
    accent: '#f4c95d',
  },
  {
    id: 'good',
    label: 'Good',
    shortLabel: 'Good',
    description: 'Steady and positive',
    accent: '#86cfff',
  },
  {
    id: 'okay',
    label: 'Okay',
    shortLabel: 'Okay',
    description: 'Getting through the day',
    accent: '#a7b4c9',
  },
  {
    id: 'tired',
    label: 'Tired',
    shortLabel: 'Tired',
    description: 'Running low on energy',
    accent: '#8fa8d8',
  },
  {
    id: 'stressed',
    label: 'Stressed',
    shortLabel: 'Stressed',
    description: 'Too much is pressing in',
    accent: '#f2a65a',
  },
  {
    id: 'frustrated',
    label: 'Frustrated',
    shortLabel: 'Frustrated',
    description: 'Something is not working',
    accent: '#ff8b7b',
  },
  {
    id: 'discouraged',
    label: 'Discouraged',
    shortLabel: 'Discouraged',
    description: 'It is hard to see progress',
    accent: '#9b7bff',
  },
  {
    id: 'lonely',
    label: 'Lonely',
    shortLabel: 'Lonely',
    description: 'I could use some company',
    accent: '#55cbb7',
  },
  {
    id: 'unsure',
    label: 'Not sure',
    shortLabel: 'Not sure',
    description: 'I cannot quite name it',
    accent: '#c6b7e8',
  },
];

export type PartySpeakerSlot = CompanionId | 'snow-close';

export interface MoodDialogue {
  snow: string[];
  rook: string[];
  selah: string[];
  cipher: string[];
  haven: string[];
  ember: string[];
  mira: string[];
  amara: string[];
  cassian: string[];
  saffron: string[];
  'snow-close': string[];
}

const BASE_PARTY_DIALOGUE: Record<MoodId, Omit<MoodDialogue, 'mira' | 'cassian' | 'saffron'>> = {
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
    ember: [
      'Yes. That is fuel. Pick one target before the spark scatters and make the first hit count.',
      'I like this energy. Give it a finish line, hit it hard, and keep enough fire to enjoy the win afterward.',
      'Good—power is online. No twenty-target rampage; choose the mission that matters and burn clean through it.',
      'You came in blazing. Aim it with purpose, finish something real, and let the proof glow for a while.',
    ],
    amara: [
      'That glow reaches people. Spend a little of it on someone you love, and keep enough to enjoy your own company too.',
      'You feel open today—I adore that. Choose one brave connection and let your enthusiasm become genuine presence.',
      'Bright energy makes room for play. Send the message, share the idea, or plan something that gives a good bond new life.',
      'Use the spark beautifully: one honest compliment, one warm invitation, or one conversation where you truly listen.',
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
    ember: [
      'Good. Say it with your whole chest: you earned this. No shrinking the victory to make anyone comfortable.',
      'That pride is backed by evidence. Hold your head up and let the win belong to you before we move again.',
      'Finally, an accurate reading. You fought for this result, so stop trying to hand the credit to luck.',
      'I saw the work underneath it. Celebrate loud enough that the version of you who struggled can hear it.',
    ],
    amara: [
      'Let the people who love you see this victory. You do not have to make yourself smaller to stay lovable.',
      'Pride with an open heart is gorgeous. Name what you did, receive the celebration, and do not apologize for shining.',
      'I hope someone safe gets to cheer for you—but even before they do, let your own heart say, “I did well.”',
      'This is worth sharing. Not to prove your value, but because joy becomes warmer when it has somewhere honest to land.',
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
    ember: [
      'Steady flame. I respect it. Use the calm to finish one clean objective without manufacturing a crisis.',
      'Good days do not need chaos to feel important. Make one strong move, then actually enjoy being all right.',
      'System is stable and so are you. That is plenty of power for one honest win and a life outside the checklist.',
      'No emergency, no dramatic speech—just useful energy and a target worth completing. Beautiful.',
    ],
    amara: [
      'A steady heart is a lovely place to meet someone from. Notice who makes today feel warmer and let them know.',
      'Good days deserve connection too, not only rescue calls. Share a laugh, answer a message, or offer your full attention.',
      'I love this calm on you. Leave room for one small moment of affection, appreciation, or uncomplicated company.',
      'Let the ordinary goodness travel: tell someone what you value about them, then let the moment remain simple.',
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
    ember: [
      'Okay is workable. Pick one thing small enough to finish and let completion pull the day forward.',
      'No need to feel legendary. Give me one honest objective, one clean attempt, and no insults aimed at yourself.',
      'Middle gear still moves the machine. Lower the target if needed, but keep one promise in play.',
      'We are not chasing fireworks today. One steady flame, one useful action, then we reassess.',
    ],
    amara: [
      'Okay is enough for connection. You can send a simple “thinking of you” without turning it into a performance.',
      'You do not have to be fascinating to be worth company. Bring the honest middle of your day to someone safe.',
      'Neutral days still hold tiny bonds: a reply, a smile, a shared meal, a boundary expressed kindly.',
      'Let one relationship receive a little care today, even if that care is simply being present without fixing anything.',
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
    ember: [
      'Low fuel means a smaller fire, not self-destruction. Handle one essential thing and protect the recovery window.',
      'Do not spend the last ten percent attacking yourself for lacking ninety. Choose one clean move and shut down wisely.',
      'Tired is a condition, not a confession. Reduce the load, keep the mission honest, and get yourself to real rest.',
      'I will lock you in without burning you out: one priority, no extra guilt, and an earlier finish line.',
    ],
    amara: [
      'Low energy is not a debt you owe anyone. Tell safe people what you can give, and let honest boundaries protect the bond.',
      'You are still lovable when you are tired. A short reply, a rain check, or asking for help can all be acts of connection.',
      'Please do not perform brightness for people who care about you. Let one trusted person meet the real capacity you have.',
      'Rest can protect relationships from resentment. Say what you need gently, then allow yourself to receive care too.',
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
    ember: [
      'Stop letting every alarm speak at once. Choose the actual fire, close the other doors, and handle one thing.',
      'Pressure wants panic. Give it precision instead: one target, one timer, one decision about what can wait.',
      'Lock in does not mean carry everything. It means refuse to waste strength fighting five battles at the same time.',
      'We are cutting the noise now. Name the next physical action and hit only that until the room gets quieter.',
    ],
    amara: [
      'Pressure can make every request feel personal. Pause before answering, and give yourself permission to say “not yet.”',
      'If someone safe can share the weight, let them. Being supported does not make you a burden; it makes the bond mutual.',
      'Choose one honest sentence: “I am overwhelmed,” “I need time,” or “Can you help?” Clarity is kindness under stress.',
      'Protect your heart from snapping shut. A boundary can be warm, direct, and strong enough to give you breathing room.',
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
    ember: [
      'Good—there is energy in that frustration. Point it at a changed method, not at your own throat.',
      'Stop headbutting the same wall. Step back, change the angle, and spend that fire on the next useful attempt.',
      'You are allowed to be mad. You are not allowed to turn one blocked result into evidence that you are broken.',
      'Reset your stance. The obstacle gets a new strategy; you get respect while you build it.',
    ],
    amara: [
      'Before the frustration speaks for you, decide what you actually need the other person to understand.',
      'You can be angry and still communicate with care. Take space first if that is what keeps the bond—and you—safe.',
      'Do not confuse swallowing your feelings with kindness. Honest words delivered without cruelty are part of healthy love.',
      'If this involves someone else, aim for repair rather than victory. And if contact is unsafe, distance is a valid boundary.',
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
    ember: [
      'I am not asking you to feel hopeful first. I am asking for one stubborn act that proves the story is still moving.',
      'Discouragement can ride in the back seat. It does not get the wheel. Pick the smallest meaningful target and turn it over.',
      'No fake hype. The road is hard and you are still here. Give me one clean move we can build the comeback around.',
      'Borrow my fire. Lower the objective, keep your self-respect, and finish one thing before the feeling votes again.',
    ],
    amara: [
      'Discouragement makes love feel conditional. It is not. You do not need a better week before you deserve tenderness.',
      'Let someone safe know you could use encouragement. Asking directly gives real care a doorway to find you.',
      'Your struggle does not make you difficult to love. Share one honest piece with a person who has earned your trust.',
      'If reaching outward is too much, practice connection inward: speak to yourself like someone whose heart is worth protecting.',
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
    ember: [
      'Loneliness does not get to convince you that reaching out is weakness. Send one honest signal to someone safe.',
      'I am in your corner, fiercely. And I want a real person in your world to get the chance to stand there too.',
      'No disappearing act. Open one door—a message, a call, a room with people—and let connection answer for itself.',
      'You matter too much to let isolation make every decision tonight. Choose one safe human bridge and cross one inch.',
    ],
    amara: [
      'That ache means connection matters to you; it does not mean you are unwanted. Choose one safe person and offer a simple opening.',
      'I am so glad you came. Please remember: a missed reply or busy person is not a verdict on your lovability.',
      'You deserve reciprocal connection, not just any attention. Reach toward someone kind, or toward a space where belonging can grow safely.',
      'No perfect message needed. “I have been feeling lonely—do you have room to talk?” is brave, clear, and enough.',
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
    ember: [
      'Fine, no label. We can still move: water, air, food, one small task, then check the signal again.',
      'Unknown does not mean helpless. Run one gentle test, watch what changes, and refuse to invent a verdict.',
      'You do not need perfect clarity to protect the next hour. Choose the most basic useful move and make it.',
      'No interrogation. Tend to one clear need, gather new information, and let the answer arrive after the pressure drops.',
    ],
    amara: [
      'Ask your heart gently: do I want closeness, space, reassurance, play, or to feel understood? Any answer is allowed.',
      'You can delay a relationship decision until the feeling becomes clearer. Uncertainty deserves time, not pressure.',
      'Notice whose presence makes you feel more like yourself. That can be useful information even before you have a label.',
      'If you cannot name the emotion, name the need. A safe person can respond to “I could use company” without a full explanation.',
    ],
    'snow-close': [
      'No verdict today. Choose one caring action, notice what follows, and come back whenever the words arrive.',
      'You do not have to name the weather to carry an umbrella. Tend to what you can feel, and let clarity come gently.',
      'The party is comfortable with “not sure.” We will meet you in the question, not wait only at the answer.',
      'Stay curious, not critical. One small act of care is a good next move when the map is blurry.',
    ],
  },
};

const CASSIAN_PARTY_DIALOGUE: Record<MoodId, string[]> = {
  energized: [
    'Excellent. Give the energy a budget as well as a target: one priority, one sensible limit, and enough reserve to enjoy the day.',
    'Your reserves are high. Let us turn that into a prepared meal, one clear money action, and momentum you can still feel tonight.',
    'The treasury likes days like this. Handle one task you have been avoiding, then use the remaining energy without spending it recklessly.',
    'Power is available. Direct some toward tomorrow: check the ledger, prepare what prevents an impulse order, and then go live fully.',
  ],
  proud: [
    'Put this in the record without discounting it. Responsible choices deserve to feel good, not merely disappear into the next obligation.',
    'That pride is earned. You made a choice your future can stand on, and today you are allowed to notice the weight of it.',
    'A sound decision is more than a number—it is evidence that you can trust yourself with what comes next.',
    'Well managed. Celebrate the discipline and the life it protects; stewardship without humanity is only accounting.',
  ],
  good: [
    'Steady is valuable. A calm day is an ideal time for one small review before urgency gets a vote.',
    'Good. Keep the ledger light today: record what matters, prepare one meal, and leave room for a life beyond optimization.',
    'Nothing needs rescuing. That means we can strengthen the reserve with one quiet, deliberate choice.',
    'A stable day compounds. Protect it with a simple plan and enjoy the fact that not every chapter must be dramatic.',
  ],
  okay: [
    'Okay is enough information. Protect the essentials, avoid a decision made from fatigue, and let today remain manageable.',
    'We do not need an extraordinary result. One logged expense and one prepared option will keep the system honest.',
    'Hold the middle. No punishment budget, no careless escape—just the next sensible choice.',
    'A neutral day can still serve the future. Keep the plan small enough that you will actually follow it.',
  ],
  tired: [
    'Fatigue makes convenience expensive. Lower the barrier now: choose the easiest food already available and postpone nonessential purchases.',
    'No complex budget decisions tonight. Protect the basics, record what happened, and review with a rested mind.',
    'Your energy is low, not your character. Use preparation instead of willpower and choose the gentlest affordable option.',
    'A tired brain deserves a short protocol: eat what is ready, close the shopping apps, and get some rest.',
  ],
  stressed: [
    'Stress wants immediate relief and sends tomorrow the invoice. Pause, breathe, and delay any purchase that is not truly urgent.',
    'The numbers can wait ten minutes. Settle first, then separate the actual problem from the purchase promising to distract you.',
    'We will not shame-spend or shame-save. Protect essentials, choose one controllable action, and leave the rest for the weekly table.',
    'Pressure narrows the map. Open it again: what is due, what can wait, and what decision requires a calmer mind?',
  ],
  frustrated: [
    'A broken plan is data, not betrayal. Name what failed, change the setup, and stop charging interest on the mistake with self-contempt.',
    'Do not make an expensive decision just to feel powerful for five minutes. Take command by changing one condition instead.',
    'Good—frustration has identified friction. Let us redesign the system so tomorrow requires less heroism.',
    'The ledger does not argue. Record the truth, extract the lesson, and make the next choice cleaner.',
  ],
  discouraged: [
    'Small balances still move. One home meal, one recorded expense, or five dollars protected is proof that the direction has changed.',
    'Do not compare the first brick to the finished fortress. Margin is built in choices that look ordinary while they are happening.',
    'The current number is a location, not an identity. We only need the next honest action from here.',
    'I am not asking for a miracle payment. I am asking you not to abandon the person the plan is meant to protect.',
  ],
  lonely: [
    'Loneliness can disguise itself as a delivery cart. Before ordering, choose contact: message someone safe, join the party, or eat with a familiar voice nearby.',
    'You deserve comfort. Let us find one that does not leave tomorrow carrying both the loneliness and the receipt.',
    'A purchase cannot keep you company. Reach toward a person, a place of belonging, or the party before reaching for checkout.',
    'The treasury is not more important than your heart. We protect both by naming what you actually need.',
  ],
  unsure: [
    'When the signal is unclear, delay the irreversible choice. Record what you know and let uncertainty remain inexpensive.',
    'Use a simple test: is it needed now, planned for, and still right after a pause? If not, save the decision for later.',
    'No verdict required. Protect the essentials, avoid impulse, and gather better information.',
    'Ambiguity is not an emergency. A twenty-four-hour pause is often the most profitable action available.',
  ],
};

const SAFFRON_PARTY_DIALOGUE: Record<MoodId, string[]> = {
  energized: [
    'Good! Use some of that energy before it escapes: choose dinner, prepare two extra portions, and make tomorrow easier.',
    'High flame, excellent. We train, we cook, and we leave enough in the tank to enjoy what we made.',
    'You look ready to conquer something. I nominate the recipe that keeps frightening you away from the stove.',
    'Energy like this deserves a proper plate. Give me one bold flavor and one useful preparation for tomorrow.',
  ],
  proud: [
    'You should be proud! Do not shrink it. I am already planning a meal dramatic enough to match the evidence.',
    'There it is—that look belongs to someone who kept a promise. Sit with it while the potatoes crisp.',
    'Victory acknowledged! We celebrate with flavor, leftovers, and absolutely no guilt about enjoying either.',
    'Tell the truth: you did well. Good. Now say it again while I protect the celebration from becoming takeout debt.',
  ],
  good: [
    'Good is wonderful. It means dinner can be simple, deliberate, and eaten without fighting the whole day first.',
    'Steady mood, steady flame. Let us make one reliable meal and enjoy the absence of catastrophe.',
    'Nothing needs rescuing, so we can prepare instead. Future-you is getting leftovers whether he appreciates me or not.',
    'A calm day is perfect for learning what seasoning actually does. No, "some" is not a measurement!',
  ],
  okay: [
    'Okay can cook. Choose the easiest complete meal, use frozen vegetables if needed, and call ordinary success enough.',
    'We are not chasing brilliance tonight. Protein, vegetables, potatoes or rice, and the dignity of being fed.',
    'Hold the middle. No punishment salad and no delivery spiral—just food you can make with the energy you have.',
    'An average day still deserves dinner. I will lower the complexity, not the standard of care.',
  ],
  tired: [
    'Then we make the easiest recipe in the book. Frozen vegetables are heroes, microwave rice is legal, and I will hear no snobbery.',
    'Tired is when preparation earns its crown. Use the leftovers first; that is what they fought for.',
    'No heroic cooking. One pan, short steps, early bedtime. I can be intense and reasonable at the same time!',
    'Feed the fatigue before it starts ordering expensive comfort. Simple food now, softer evening after.',
  ],
  stressed: [
    'Before stress turns into checkout, drink water and name what food is already available. We solve the actual need first.',
    'Keep the knife work simple and the heat moderate. Dinner is allowed to calm the room instead of testing you.',
    'Stress wants everything now. The Kitchen wants one step at a time: pan, protein, vegetable, breathe.',
    'Do not confuse emotional urgency with culinary urgency. We can make something warm without making the night louder.',
  ],
  frustrated: [
    'Good, point the heat somewhere useful—but not at yourself and not at the smoke alarm. What condition can we change?',
    'If the recipe failed, we adjust it. If the day failed, we feed you anyway. Neither requires a character trial.',
    'Frustration is data wearing armor. Was it time, ingredients, skill, or energy? Name the enemy before swinging.',
    'You may be angry. You may not declare the entire Kitchen cursed because one potato took too long.',
  ],
  discouraged: [
    'Listen to me: one meal made at home is not small. It is proof that care can exist even when confidence is quiet.',
    'The physique, savings, and habits are all built in meals too ordinary to look heroic. Make one of those today.',
    'You do not need to love cooking yet. You only need one recipe that makes the next choice less difficult.',
    'No measuring your whole future against tonight. Feed the person in front of me; tomorrow can build from there.',
  ],
  lonely: [
    'Loneliness is hungry for company, not merely food. Cook with the party open, message someone safe, and let the meal hold both needs gently.',
    'A delivery driver cannot fix an empty room. Make something comforting, then reach toward a voice that knows your name.',
    'You are not cooking alone. I am right here being unreasonable about seasoning, and the whole party is staying for dinner.',
    'Choose a meal that feels warm and familiar, then invite connection in whatever safe form is available tonight.',
  ],
  unsure: [
    'When you cannot name the feeling, name the meal: warm or fresh, crunchy or soft, quick or worth waiting for.',
    'No perfect answer required. Pick a familiar protein, your favorite potato, and one vegetable. Clarity may arrive after dinner.',
    'Uncertainty does not mean emergency takeout. Use the simplest known recipe and let your body settle.',
    'We can stay curious. Cook something repeatable, notice how you feel afterward, and keep the useful evidence.',
  ],
};

const MIRA_PARTY_DIALOGUE: Record<MoodId, string[]> = {
  energized: [
    'I can feel the current moving. Give some of it to strength, and save some for a slow stretch afterward so the body can keep the range it earns.',
    'Beautiful energy. Keep the breath quieter than the ambition and you will be able to use all of it well.',
    'The body is ready to explore. Use the range you can control today, not the range excitement tries to borrow from tomorrow.',
    'Open Sky mood confirmed. Move boldly, land softly, and leave enough calm to enjoy the power afterward.',
  ],
  proud: [
    'Let the pride open your posture instead of making you brace for the next demand. You earned room to receive this.',
    'One slow inhale. One longer exhale. There—now the victory belongs to your body too.',
    'Your shoulders do not have to carry the achievement like armor. Let them soften; the proof remains.',
    'I see the pride trying not to take up space. Breathe wider. This moment can hold all of it.',
  ],
  good: [
    'Steady feels spacious. This is a lovely day for an Open Sky flow and enough core work to make Mira quietly smug.',
    'Good is not a waiting room. Enjoy the ease, move through a comfortable range, and let ordinary wellbeing count.',
    'A calm system learns beautifully. This is the kind of day when a patient hold becomes new range before you notice.',
    'Good. Keep some softness around it. We do not need tension to prevent a pleasant day from escaping.',
  ],
  okay: [
    'Okay can be held gently. Unclench the jaw, lower the shoulders, and give the next moment one unhurried breath.',
    'We do not need to transform the day. A few controlled movements can simply make it easier to inhabit.',
    'The middle is a real place to stand. Find your feet, lengthen the exhale, and let okay remain enough for now.',
    'No diagnosis, no grand correction. We notice, we breathe, and we make one small area feel less crowded.',
  ],
  tired: [
    'Then the protocol becomes softer. Supported positions, shorter holds, long exhales—rest and mobility are allowed to cooperate.',
    'Fatigue does not need to be stretched aggressively. We make space, keep the core work kind, and stop before depletion becomes proof.',
    'Use the floor, the wall, and every support available. Tired bodies deserve intelligent movement, not a performance.',
    'Still Waters today. If the breath becomes work, the position becomes easier. That is the rule.',
  ],
  stressed: [
    'Before solving anything, make the exhale longer than the inhale. The plan will still exist when your nervous system is no longer shouting.',
    'Stress has tightened the room. We can widen it one rib, one hip, and one patient breath at a time.',
    'Press both feet down. Name five things you can see. Now let the shoulders discover they are not responsible for the entire future.',
    'We are not forcing calm. We are giving it conditions where it might safely return.',
  ],
  frustrated: [
    'Do not force the range because the day refused to cooperate. Control is the answer here, not punishment.',
    'Let the movement be precise enough to hold the frustration without becoming another fight.',
    'Quiet Fire can use this energy. Slow core work, honest range, and absolutely no yanking on a tense joint.',
    'Frustration wants speed. I want control. Let us see which one leaves you feeling more powerful.',
  ],
  discouraged: [
    'Some progress is simply the place that no longer hurts to reach. Quiet changes still belong in your story.',
    'We will choose one shape you can control and one breath you can finish. Confidence can return through the body too.',
    'Do not measure the whole path from the tightest moment. Bodies change through patient evidence, not verdicts.',
    'Let today’s win be small enough to believe: one position felt safer, one exhale became easier, one promise remained.',
  ],
  lonely: [
    'Stay with us while you breathe. A quiet room does not have to mean you are carrying the feeling alone.',
    'Put one hand over the ribs and let the breath meet it. The party is here; you do not need to perform for our company.',
    'We can stretch together without filling every silence. Presence does not become less real because it is gentle.',
    'Let the floor hold some of your weight and let the party hold some of the evening. You are not outside the circle.',
  ],
  unsure: [
    'Curiosity is enough. Notice what feels tight, what feels easy, and what changes after three slow breaths—no verdict required.',
    'When the feeling has no name, let the body speak in smaller signals. We can listen without forcing an answer.',
    'Choose the most comfortable starting position and gather information. Uncertainty becomes less sharp when it does not have to defend itself.',
    'We can stay between answers. Move gently, breathe normally, and notice which direction creates a little more room.',
  ],
};

export const PARTY_DIALOGUE = Object.fromEntries(
  PARTY_MOODS.map(({ id }) => [
    id,
    {
      ...BASE_PARTY_DIALOGUE[id],
      mira: MIRA_PARTY_DIALOGUE[id],
      cassian: CASSIAN_PARTY_DIALOGUE[id],
      saffron: SAFFRON_PARTY_DIALOGUE[id],
    },
  ]),
) as Record<MoodId, MoodDialogue>;

export function getMoodDefinition(mood: MoodId) {
  return PARTY_MOODS.find((item) => item.id === mood)!;
}
