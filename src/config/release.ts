export const APP_VERSION = '7.1.0';
export const DATABASE_SCHEMA_VERSION = 18;
export const SAVE_FORMAT_VERSION = 18;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'Version 7.1.0 · Command Ascension',
    detail:
      'The party evolves from conversation into a specialist command intelligence with controlled actions, deeper live context, and a new Sovereign reasoning tier.',
    points: [
      'Quick Link now preserves recent conversation continuity, understands direct mission commands, and presents every campaign-changing action in a confirmation-gated Command Deck before touching local data.',
      'Saffron can explain today’s Kitchen Order step by step or design a complete personal recipe; confirmed creations are stored in her on-device Private Grimoire and remain fully removable.',
      'Selah receives compact Sanctuary context for grounded Scripture guidance, while Rook, Mira, Cipher, and Snow can reason from relevant live Training, Campaign, and cross-System signals.',
      'Cassian Ledger Counsel is separately opt-in and transmits only calculated totals and targets—never merchant labels, transaction notes, bill names, debt names, or the full ledger.',
      'The intelligence router now uses Luna for fast conversation, Terra for deeper counsel, and Sol only for explicit sovereign analysis, with the selected model and usage recorded in the local ledger.',
    ],
  },
  {
    title: 'Version 7.0.1 · Quick Link Stabilization',
    detail:
      'Quick Link now behaves like a true mobile command sheet while the complete AI Headquarters remains one tap away beside it.',
    points: [
      'AI HQ and Quick Link are separate controls in the top command bar, preserving the full conversation chamber alongside the instant voice channel.',
      'The Quick Link sheet is mounted above the entire interface with safe-area spacing, contained touch scrolling, a persistent close control, and a fully reachable microphone on iPhone.',
      'Microphone capture begins directly from the Hunter’s tap instead of waiting on a network readiness check, and the listening state clearly explains how to finish and send the transmission.',
    ],
  },
  {
    title: 'Version 7.0.0 · Awakened Intelligence',
    detail:
      'The party becomes a voice-first command intelligence with real progression awareness, adaptive reasoning, and Hunter-directed personalities.',
    points: [
      'Companion Quick Link turns the top command control into a one-touch voice channel: address any companion or the full party by name, receive an immediate voiced answer, and keep the complete exchange in local Headquarters history.',
      'Spoken System navigation works naturally—commands such as “Snow, take me to the Training Hall” route locally without spending a text-intelligence call, while typed Quick Link remains available as a stable fallback.',
      'The intelligence engine now selects fast Luna responses for ordinary direct conversation and stronger Terra counsel for Party Council, Class forecasts, planning, comparison, and progression analysis.',
      'Every companion can be personally directed in Soulprint Studio through editable humor, accountability, care, off-duty personality, disagreement, party bonds, and never-break-character notes without weakening canon identity or safety boundaries.',
      'Companions now understand the full Class roadmap, remaining World Class gates, lifetime progression, recent thirty-day pace, challenges, training, Kitchen, Sanctuary, and stat momentum instead of answering from level alone.',
      'The local usage ledger now identifies every model and separates input, cached input, output, and reasoning tokens; current OpenAI rates drive app estimates while the OpenAI dashboard remains the authoritative bill.',
    ],
  },
  {
    title: 'Version 6.7.2 · Living Performance',
    detail:
      'Voice Forge II turns every companion from a selected speaker into a directed performance with audible pace, accent, cadence, texture, and human timing.',
    points: [
      'All ten canon Soulprints are re-directed as distinct people: Snow sounds like the Hunter’s relaxed ride-or-die sister, Ember carries controlled protective heat, Saffron becomes affectionate pressure in a bottle, and every other companion gains equally specific delivery boundaries.',
      'Pace now spans 0.75x–1.65x with a visible words-per-minute target, while delivery style, cadence, vocal texture, human feel, and pause control shape each generated take alongside warmth, energy, and expression.',
      'Regional accents are sent as clearly perceptible but natural directions, and every Forge setting is included in both the secure speech request and preview identity so changed controls cannot replay a mismatched cached performance.',
      'The natural-conversation engine actively resists generic assistant, commercial, audiobook, meditation, repeated-melody, over-enunciated, and dead-air delivery while preserving each companion’s emotional coherence.',
      'Existing Soulprints and full-campaign saves upgrade safely with their previous base voice, accent, and tuning intact while the new performance controls inherit the companion’s canon defaults.',
    ],
  },
  {
    title: 'Version 6.7.1 · Voice Channel Stabilization',
    detail:
      'Companion voices and classic System tones now share one mobile-safe speaker channel instead of depending on fragile delayed browser playback.',
    points: [
      'Voice Link now decodes phone-friendly WAV audio through a reusable playback engine, resolving the unsupported-operation failure seen on mobile installs.',
      'A free Test speaker control plays three rising System tones before any paid voice preview, making sound permissions and device volume easy to verify.',
      'The first tap safely primes the audio channel, paused councils resume from the correct position, and ordinary mission, warning, and ascension tones use the same reliable output path.',
    ],
  },
  {
    title: 'Version 6.7.0 · Voice Link',
    detail:
      'The ten living Soulprints can now listen, speak, perform a full Party Council, and show the Hunter exactly how this System is using the online link.',
    points: [
      'Tap-to-record speech is securely transcribed into the normal editable composer, so the Hunter always reviews the words before choosing to send them.',
      'Every companion receives a distinct canon voice, audition line, performance direction, pace, warmth, energy, and expression profile; Voice Forge can adjust the base voice and accent or restore the original Soulprint at any time.',
      'Direct replies and full Party Council exchanges can be voiced in sequence with replay, pause, skip, stop, manual playback, or optional automatic playback while all text remains visible.',
      'A local usage ledger shows session, daily, and monthly app-only call, token, speech, and transcription estimates with a configurable warning line; OpenAI remains the authoritative billing source.',
      'Voice output is separately opt-in with a clear AI-generated-voice disclosure, credentials remain behind the private gateway, and the complete offline campaign continues working without the voice layer.',
    ],
  },
  {
    title: 'Version 6.6.1 · Command Link',
    detail:
      'AI Headquarters is now a permanent one-tap destination without crowding the primary navigation.',
    points: [
      'The redundant Class crown in the top command bar is replaced by a clearly labeled AI HQ link that jumps directly into the intelligent conversation chamber from every section of the app.',
      'The shortcut keeps a visible live-link signal, highlights while Headquarters is active, and remains readable on mobile instead of adding a ninth destination to the full bottom bar.',
      'Status remains one tap away in the primary navigation, while current Class information continues to appear throughout the System dashboard and progression views.',
    ],
  },
  {
    title: 'Version 6.6.0 · Living Bonds',
    detail:
      'Soulprint II gives every companion a sharper inner life, stronger relationships, and a private memory system the Hunter controls.',
    points: [
      'Snow now leads like an unforgettable ride-or-die sister: laid-back, wise, quietly in command, and never required to announce that the room follows her.',
      'Ember directs her hard-edged aggression at obstacles and excuses instead of the Hunter, while Saffron becomes concentrated culinary pressure whose loudest moments still land as practical care.',
      'All ten companions gain deeper emotional posture, humor, conflict style, affection style, and relationship-specific chemistry so Party Council can feel like people who genuinely know one another.',
      'Bond Memory is an optional local ledger: Headquarters may suggest a durable preference, goal, boundary, background fact, or commitment, but nothing crosses conversations until the Hunter approves it.',
      'Approved memories can be reviewed or forgotten at any time, travel with the full-campaign save, and are injected only in a small relevant slice; pending suggestions and the complete ledger never leave the device.',
    ],
  },
  {
    title: 'Version 6.5.0 · Companion Soulprint',
    detail:
      'Every online companion gains a complete intelligence identity designed for natural conversation now and individual performance later.',
    points: [
      'Snow, Rook, Selah, Cipher, Haven, Ember, Mira, Amara, Cassian, and Saffron now carry distinct worldviews, speech rhythms, response methods, protective boundaries, specialist instincts, and future voice-performance directions.',
      'Direct channels preserve one companion without generic assistant bleed, while Party Council selects two to four relevant personalities, gives each a different conversational role, rotates casual participation, and permits respectful disagreement and natural banter.',
      'Simple questions receive direct answers before personality flavor; longer conversations use recent thread history without inventing memories, repeating advice, or claiming access beyond the supplied campaign signal.',
      'The compact online context now includes starting focus and recovery state so companions can respond more appropriately without transmitting notes, journals, Treasury amounts, the save file, or conversations outside the active thread.',
      'Soulprint identity guidance is centralized behind the private gateway and versioned so a future voice layer can preserve the same cadence, warmth, intensity, and interpersonal chemistry.',
    ],
  },
  {
    title: 'Version 6.4.2 · Steady Focus',
    detail:
      'Mobile typing now holds the System interface steady when the software keyboard enters or leaves the field.',
    points: [
      'Editable controls use an iPhone-safe focus size on touch devices, preventing Safari from automatically magnifying the interface when the keyboard opens.',
      'The AI Headquarters composer gains a stable touch layout that resists accidental field resizing and keeps the conversation chamber anchored during input.',
      'Normal user-controlled pinch zoom remains available for accessibility while the app avoids the automatic focus zoom that could interrupt an active companion request.',
    ],
  },
  {
    title: 'Version 6.4.1 · Stable Link',
    detail:
      'AI Headquarters now keeps mobile conversations anchored inside the chamber instead of moving the entire System interface.',
    points: [
      'New messages and companion replies scroll only the conversation viewport, preventing the full page from jumping when the iPhone keyboard opens or closes.',
      'The chamber now contains momentum scrolling and overscroll inside the message stream while preserving the established smooth animation and Reduced Motion setting.',
      'A stable small-screen message viewport protects the fixed command bar and surrounding interface from mobile browser viewport changes without altering AI behavior, history, or campaign data.',
    ],
  },
  {
    title: 'Version 6.4.0 · Awakened Link',
    detail:
      'Headquarters gains a secure online intelligence channel while the complete campaign remains offline-first and locally owned.',
    points: [
      'The new AI Headquarters channel can open a private conversation with the full party or any individual companion, with each response preserving that companion’s established role and personality.',
      'Online mode is explicit and reversible: only the message, recent conversation context, and a compact progress signal are sent when the Hunter chooses to activate the link.',
      'OpenAI credentials remain behind the private Sites gateway and are never stored in browser code, local campaign data, exported saves, or conversation history.',
      'AI conversations are stored on-device, included in full-campaign exports, and remain readable offline after they have been received.',
      'Connection readiness, offline fallback, retry guidance, limited party responses, and concise context keep the experience resilient and cost-conscious.',
    ],
  },
  {
    title: 'Version 6.3.0 · Stillpoint Protocol',
    detail:
      'Mira joins the Training Hall with guided mobility, yoga, Pilates, breathing, and a full multi-path deployment ladder.',
    points: [
      'Mira, The Stillpoint, becomes the Hall’s third commander with an original portrait, a distinct calm voice, and full companion presence across support, celebrations, recaps, and council scenes.',
      'Recovery Protocol is rebuilt as a guided movement session: Mira’s randomized mood chooses the discipline, exact sequence, hold lengths, repetitions, and session size while every roll includes breathing and core work.',
      'Every assigned movement includes beginner-readable setup, breathing guidance, safety cues, and saved completion checks so an interrupted protocol can be resumed honestly.',
      'Distinct Home, Gym, Conditioning, and Recovery clears can now stack Double, Triple, and Full Spectrum Ascension Surges; Daily Workout mission credit remains strictly once per day.',
      'The Integrity Protocol confirmation sheet now uses a compact single-column layout instead of leaving a large empty field around the pass/fail controls.',
    ],
  },
  {
    title: 'Version 6.2.0 · System Transcendence',
    detail:
      'The dimensional System becomes a responsive world of living portals, projected command layers, and theme-aware atmosphere.',
    points: [
      'Winter Crown joins the color protocols with a bright snow-white, glacial-blue, and sovereign-navy command environment that remains fully compatible with System and Clean presentation.',
      'A lightweight adaptive particle field gives every protocol its own atmosphere—energy motes, rising embers, ice crystals, or drifting snow—while pausing off-screen and honoring Subtle and Reduced Motion.',
      'Realm routes are now miniature dimensional windows with rotating horizon rings and layered vistas that react to System depth without changing navigation or touch targets.',
      'The Ascension Core grows into a volumetric power artifact whose illuminated charge field directly reflects daily completion, with projected charge telemetry and expanded energy architecture.',
      'Projected command typography, breakout companion portraits, reactive lighting, and transformed Class-advancement space extend the cinematic language across the app without sacrificing mobile clarity.',
    ],
  },
  {
    title: 'Version 6.1.0 · System Depth Engine',
    detail:
      'The complete living System now occupies dimensional space while preserving its speed, clarity, and accessibility controls.',
    points: [
      'Command panels gain layered elevation, realm-colored edge lighting, dimensional typography, and tactile controls without changing their established layout or purpose.',
      'Pointer-capable devices receive restrained live perspective and surface lighting, while touch devices use lightweight floating layers and immediate physical feedback.',
      'The Ascension Core is rebuilt as a suspended Class artifact with an energy field, rotating dimensional cage, orbiting signal nodes, and a projected advancement readout.',
      'Standard and Intense modes scale the depth experience, while Subtle, Clean, Reduced Motion, and device motion preferences remain authoritative.',
      'Navigation now keeps the System shell visible, prepares primary realms ahead of travel, and avoids duplicate resume work so the richer presentation remains responsive.',
    ],
  },
  {
    title: 'Version 6.0.2 · Party Pulse',
    detail:
      'Companions now notice neglected paths in character, section exits are clearer, and Saffron gains six new orders.',
    points: [
      'Party Pulse watches finalized stat neglect without creating a penalty: the matching specialist responds in their own voice, explains the signal, and offers one direct route back into motion.',
      'Quiet, Balanced, Talkative, Off, Reduced Motion, and individual companion controls remain authoritative; a broader slip can call Ember into a shame-free re-entry signal while Snow protects the whole journey.',
      'Long Training Hall and Scripture Sanctuary flows now keep an explicit route back to their own command screen, while the complete section audit confirms persistent tabs, close controls, and return routes everywhere else.',
      'Saffron’s grimoire expands from twelve to eighteen no-bean, no-pea recipes with new fish, turkey, chicken, beef, shrimp, egg, freezer, safety, substitution, and leftover guidance.',
    ],
  },
  {
    title: 'Version 6.0.1 · System Optimization',
    detail: 'The living interface is steadier on mobile and gains two complete color protocols.',
    points: [
      'The bottom command bar is now isolated from the scrolling app canvas and anchored directly to the mobile viewport, preventing it from drifting into the middle of the screen.',
      'Blood Moon adds an obsidian, crimson, and antique-gold command atmosphere; Frostbound adds midnight, glacial blue, and silver-violet energy.',
      'Touch interactions, reduced-motion behavior, mobile atmosphere layers, and fixed interface compositing are tightened without changing campaign data or progression rules.',
    ],
  },
  {
    title: 'The Living Headquarters',
    detail: 'The dashboard is now the command chamber at the center of the entire campaign.',
    points: [
      'A central Ascension Core, current Class signal, live Snow transmission, level path, daily completion, streak, and System state now share one responsive command stage.',
      'The former destination stack is now an eight-realm tactical map with live Training, Sanctuary, Kitchen, Treasury, Party, Campaign, progression, and Archive signals.',
      'The Headquarters reacts to Class readiness, active trials, recovery, momentum, offline use, and recent ascension instead of remaining visually static.',
    ],
  },
  {
    title: 'A System That Stays Alive',
    detail: 'Essential campaign awareness now follows the player between every destination.',
    points: [
      'A persistent live HUD shows System condition, daily synchronization, the next pending directive, current level, and connected realm without hiding routine controls.',
      'The global atmosphere changes with the player’s local dawn, day, dusk, or night and carries a separate signal for trials, recovery, stagnation, and advancement readiness.',
      'System and Clean interface styles remain complete experiences, and saved Reduced Motion now directly suppresses portal travel and ambient animation.',
    ],
  },
  {
    title: 'Companions Beyond Cards',
    detail: 'The companion responsible for each realm now remains visibly connected to the player.',
    points: [
      'Snow, Rook, Selah, Saffron, Cassian, Cipher, and Haven automatically establish the appropriate companion link as the player moves through their realms.',
      'The expandable transmission carries authored, purpose-specific guidance and a direct action without changing XP, decisions, or saved campaign data.',
      'Companion frequency and individual companion controls are still honored; muting the party or a specialist removes their persistent presence cleanly.',
    ],
  },
  {
    title: 'Dimensional Travel & Ascension',
    detail:
      'Important movement and breakthroughs now feel like events instead of ordinary page changes.',
    points: [
      'Every major route opens through a short realm-colored portal sequence that yields immediately to the destination and never blocks input afterward.',
      'Class advancement overlays now awaken a Class-colored Ascension Gate and present the new emblem as a genuine chapter transition.',
      'Subtle, Standard, and Intense immersion settings control the experience, while Clean mode and Reduced Motion remove cinematic layers.',
    ],
  },
  {
    title: 'The Complete Class System',
    detail: 'F-Class through World Class now has one consistent identity across the entire app.',
    points: [
      'The dashboard, live HUD, Status record, tactical map, Class Trials, celebrations, achievements, history, help, and companion dialogue share the same classification language.',
      'Every Class carries a distinct visual energy signature, with advancement readiness surfaced as a live System condition.',
      'No database migration is required. The established progression engine, offline behavior, privacy model, and every existing save remain fully compatible.',
    ],
  },
];
