export const APP_VERSION = '10.4.3';
export const DATABASE_SCHEMA_VERSION = 29;
export const SAVE_FORMAT_VERSION = 29;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'Version 10.4.3 · Chrono Lock',
    detail:
      'Calendar intelligence now speaks from the Hunter\'s real local schedule instead of mistaking an internal UTC storage timestamp for the displayed appointment time.',
    points: [
      'Every shared calendar record now carries an explicit local date, start time, end time, and complete human-readable label in the saved System timezone.',
      'Kairo, Snow, and Calendar Council are forbidden from reading the clock digits inside raw ISO timestamps as local time; those values remain exact storage instants only.',
      'Existing calendar records are not migrated or rewritten because their saved times were already correct—this patch fixes the council\'s interpretation and speech layer.',
      'A regression case now proves that 1:00 PM UTC storage for a New York appointment is reported as 9:00 AM local during daylight time, including the correct ten-minute duration.',
    ],
  },
  {
    title: 'Version 10.4.2 · Evidence Lens',
    detail:
      'Body Diagnostic evidence selected from the phone photo library now remains visibly inspectable before the Hunter authorizes its private analysis.',
    points: [
      'Temporary on-device photo preview URLs are now explicitly allowed by the appâ€™s image security policy, fixing black or broken physique and scale tiles without allowing outside image hosts.',
      'The underlying JPG, PNG, and WEBP files remain the diagnostic payload; preview URLs are never uploaded, retained in the campaign, or treated as proof of submission.',
      'Selected counters continue to mean loaded locally, while Evidence secured remains the only successful-submission state after the private diagnostic returns and the weekly record is saved.',
      'A regression test now protects the photo-library picker and the exact local-only preview allowance together.',
    ],
  },
  {
    title: 'Version 10.4.1 · Living Chemistry',
    detail:
      'Soulprint relationships now leave the Studio and become visible, situational chemistry whenever the right companions share a room.',
    points: [
      'The complete Soulprint Studio is now the primary performance designator for all twelve companions across solo chat, Command Link, Live Link, pivots, specialist rooms, and shared conversations; built-in descriptions only fill gaps.',
      'A relationship only plays when the subject naturally triggers it and all involved companions are visibly present; one-on-one rooms may reference an absent friend but can never impersonate them.',
      'Adding or relaying a companion now creates a visible entrance and two-sided exchange, while every multi-companion response gives the family room to challenge, refine, defend, tease, disagree, combine specialties, or genuinely change one anotherâ€™s minds.',
      'Quill now protects A.R.C. spoilers while Snow occasionally abuses her completely unofficial System administrator title to pry out one safe hint, preserving the Hunter as the only canon authority.',
      'Saffron now respects Snow without becoming subordinate, sometimes pushing past her seniority when kitchen conviction takes over while Snow answers with amused older-sister authority.',
      'Custom humor, care, challenge, casual behavior, conflict, bonds, and unwanted habits override generic performance and chemistry defaults without forcing the same joke into every turn or allowing banter to replace the Hunterâ€™s real answer.',
      'Shared-room and direct-room tests now protect Soulprint activation, real companion-to-companion interaction, participant filtering, specialist ownership, and the rule that absent companions never speak.',
      'Body Diagnostic physique angles now use the same normal phone photo-library picker as smart-scale screenshots, including every additional-angle control, so previously captured images can be submitted without reopening the camera.',
    ],
  },
  {
    title: 'Version 10.4.0 · Adaptive Pulse',
    detail:
      'The living System now senses the device beneath it, protecting phone temperature and battery life while preserving the Ascension Core, companion presence, and complete cinematic identity.',
    points: [
      'A new automatic performance engine distinguishes full-power computers, ordinary phones, and constrained devices without adding another setting or changing the Hunter’s selected interface style.',
      'The full-screen atmosphere now renders at a phone-appropriate frame rate, resolution, particle count, and glow budget instead of redrawing its most expensive effects at the display’s maximum refresh rate.',
      'Leaving the app immediately suspends every cinematic timeline and the atmosphere renderer; returning restores the living System without disturbing navigation, conversations, timers, or saved campaign state.',
      'Mobile transparency, background haze, and moving-filter work are reduced at the rendering layer while the Core keeps its dual reactor, chromatic shells, plasma arcs, energy wings, power spine, and visible secondary attunement color.',
      'The Core’s orbital particles now travel as synchronized fields on phones instead of maintaining dozens of separate twinkle timelines, and its membrane breathes as one organism rather than continuously reshaping every layer.',
      'Reduced Motion, Subtle intensity, Clean interface, desktop cinematics, AI voice, progression, XP, missions, and every private local record remain fully authoritative and unchanged.',
    ],
  },
  {
    title: 'Version 10.3.0 · Dual Resonance',
    detail:
      'Every Ascension Core now behaves like two living energies locked into one artifact, giving the secondary attunement color equal presence across motion, light, structure, and awakening.',
    points: [
      'The Core is no longer defined by stacked rings: a crystalline reactor body, expanding faceted armor, asymmetric energy wings, and a five-node power spine give it a living three-dimensional silhouette.',
      'A new dual reactor exposes distinct primary and secondary energy lobes around the central Class emblem, joined by a pulsing white-hot resonance bridge and bi-color nucleus.',
      'Three counter-rotating chromatic shells and six crossing plasma arcs now support the artifact as orbital machinery while both energies visibly circulate through its physical structure.',
      'Orbital particles, rising sparks, neural currents, field nodes, cage rings, satellite telemetry, the pedestal, and the readout now alternate between primary and secondary energy instead of favoring one color.',
      'Awakening accelerates the counter-current and forces a brighter dual-energy collision while the dormant, stirring, surging, and synchronized vitality phases still control overall intensity.',
      'Mobile sizing, Clean interface behavior, reduced-motion preferences, real charge progression, and every existing Core Attunement remain preserved.',
      'Dual Resonance is visual only and cannot alter XP, missions, Class gates, rewards, companion intelligence, or saved campaign history.',
    ],
  },
  {
    title: 'Version 10.2.0 · Core Attunement',
    detail:
      'The Ascension Core becomes a truly personal artifact: its complete energy identity can now be chosen independently from the System’s surrounding color protocol and safely carried inside the Hunter’s local save.',
    points: [
      'A new Core Attunement control offers Protocol Linked, Sovereign Mint, Void Violet, Solar Gold, Bloodfire, Frost Crystal, Verdant Life, Neon Pulse, and Prismatic identities.',
      'Each attunement recolors the complete artifact rather than one ring: heartbeat, particle orbits, rising motes, neural currents, organic membranes, cage geometry, readout, pedestal, telemetry, and awakening surge all inherit the chosen energy pair.',
      'Protocol Linked preserves the existing state-aware behavior and is automatically assigned to every established campaign, so updating cannot unexpectedly alter the Hunter’s Core.',
      'Prismatic is progression-reactive rather than a looping rainbow. Its primary and secondary energies blend across the spectrum according to real daily charge.',
      'Core Attunement previews update immediately inside Settings and persist only when the Hunter saves, matching the established appearance workflow and remaining fully portable in campaign exports.',
      'Attunements are presentation-only and never change Class, XP, synchronization, rewards, AI behavior, missions, or protected confirmation rules.',
    ],
  },
  {
    title: 'Version 10.1.0 · Living Spectrum',
    detail:
      'The Ascension Core develops a deeper living rhythm while the System opens four entirely new atmospheric identities, expanding personalization without disturbing the Hunter’s saved campaign or established visual settings.',
    points: [
      'The Core gains organic aura membranes, six neural energy paths, traveling thought currents, irregular intelligence surges, and four synchronization phases that change its visible rhythm as daily charge grows.',
      'Dormant no longer means dead: the Core breathes quietly at low charge, begins stirring after early momentum, surges beyond the day’s midpoint, and reaches a sustained living resonance at full synchronization.',
      'Verdant Nexus introduces void black, living jade, and ion-lime motes; Solar Warden surrounds obsidian surfaces with solar gold, white flame, and rising embers.',
      'Neon Revenant combines ink violet, shock pink, and ion-cyan crystals, while Phantom Steel creates a restrained graphite, silver, and spectral-blue command environment.',
      'All nine color protocols now retain distinct atmosphere profiles while sharing the complete System and Clean interfaces, realm navigation, companion presence, mobile layout, intensity controls, and reduced-motion protections.',
      'Color changes remain presentation-only: progression, missions, XP, companions, AI behavior, local saves, and every protected confirmation flow are unchanged.',
    ],
  },
  {
    title: 'Version 10.0.1 · Living Core',
    detail:
      'The Ascension Core no longer merely displays power—it behaves like a living System artifact whose orbit, pulse, and atmosphere respond to the Hunter’s real daily synchronization.',
    points: [
      'Three intersecting particle planes now orbit the suspended Class artifact at distinct angles and speeds, giving the Core a constant sense of dimensional motion rather than a single flat rotation.',
      'Energy motes rise through the chamber while a two-beat luminosity cycle gives the inner field a heartbeat-like rhythm, preserving visible life even before the first directive is complete.',
      'Particle and mote density now scale safely with real daily charge, so a synchronized day feels visibly more energized without changing rewards, XP, progression, or Class rules.',
      'Awakening the Core brightens and accelerates its living field, making the existing analysis interaction feel like an intentional surge rather than a simple panel toggle.',
      'Mobile layouts receive balanced orbit radii and controlled particle counts, while Clean Interface, subtle intensity, reduced-motion settings, and system-level motion preferences remain fully respected.',
    ],
  },
  {
    title: 'Version 10.0.0 · Sovereign Evolution',
    detail:
      'The System crosses into its next generation: the Ascension Core becomes a living progress instrument, the full interface gains a more dimensional and disciplined visual language, and every layer feels more responsive without crowding the Hunter’s screen.',
    points: [
      'The Ascension Core is rebuilt around dual live energy rings for daily synchronization and level progress, a rotating dimensional aperture, a suspended Class artifact, orbital telemetry, state-reactive illumination, and a projected energy pedestal.',
      'Touching or focusing the Core now awakens a compact Core Intelligence analysis with exact daily charge, level energy, cleared Class gates, streak data, and one context-aware route to the next meaningful action.',
      'Core Intelligence distinguishes active directives, full daily synchronization, advancement readiness, a quiet unassigned day, and stabilized World Class status without inventing rewards or changing progression rules.',
      'The Headquarters chamber, navigation glass, active realm controls, panels, section dividers, cards, buttons, and input focus states now share one stronger Sovereign dimensional hierarchy across every color protocol.',
      'Desktop depth remains responsive to pointer movement while the mobile Core receives its own balanced orbital layout, larger touch target, safe expansion panel, and fixed navigation treatment.',
      'Clean Interface, subtle intensity, reduced-motion preferences, keyboard focus, screen-reader state, offline progression, local saves, and every existing confirmation wall remain fully respected.',
    ],
  },
  {
    title: 'Version 9.6.0 · Living Initiative',
    detail:
      'The twelve companions now speak with more natural shared judgment: they silently understand local context, recognize ordinary intent across specialist lanes, and can offer the right coordinated next step without waiting for command syntax.',
    points: [
      'Soulprint Studio remains the personality director—humor, care, challenge, conflict, and party chemistry—while Living Intelligence now governs shared common sense, initiative, and operational coordination for all twelve companions.',
      'Kairo treats the saved timezone as silent context and uses familiar local dates and times without repeatedly announcing New York or Eastern time unless travel, daylight-saving ambiguity, or another timezone makes the label useful.',
      'Direct conversations no longer trap Kairo, Cassian, or Quill inside their specialist workrooms when the Hunter is simply talking or asking about another domain; they answer normally and relay only when a specialist or protected record truly needs to take over.',
      'Companions can notice a concrete next step from an observation, shorthand, or follow-up answer, offer it in their own voice, and carry the full brief into one visible Party Relay instead of requiring the Hunter to translate a natural request into System vocabulary.',
      'Party Relays can now bring a small coordinated team into the same conversation. A training concern can invite Kairo and Mira together while preserving the original companion, then add Snow automatically if Calendar Council is accepted.',
      'Training conversations treat soreness, tightness, mobility limits, and ordinary pain reports as self-reported context: the crew responds first, may offer a cautious Mira session, and escalates serious warning signs toward appropriate professional care rather than extra intensity.',
      'Initiative remains consent-based. Suggestions and relays never schedule, save, assign, complete, or award anything; the existing visible confirmation walls remain authoritative for every app change.',
    ],
  },
  {
    title: 'Version 9.5.0 · Earned Commitments',
    detail:
      'Calendar Council can now turn worthy specialist requests into protected time plus an XP-backed Companion Order, while the Training Hall can carry a weekly Body Diagnostic adjustment into a visible five-member council without replacing the core program.',
    points: [
      'The responsible specialist argues the purpose, Kairo verifies timing and recurrence, Snow applies the no-duplicate-reward rule, and the Hunter approves the final schedule card; no companion can silently add time or XP.',
      'Eligible commitments receive an immutable duration-based reward tier and observable completion checklist. Scheduling awards nothing—the linked Companion Order must be cleared before XP is applied, under the existing daily reward ceiling.',
      'Existing rewarded work such as Daily Missions, Training Hall sessions, Body Diagnostics, Kitchen Orders, Sanctuary assignments, and challenges cannot receive duplicate Calendar Council XP.',
      'Council-backed commitments display their reward and link directly to Mission Forge. Rescheduling returns to Kairo so the calendar and order stay synchronized, while cancellation retires the linked order without deleting its history.',
      'New Body Diagnostic reports include a structured weekly adjustment with Hunter-reported signals and up to three conservative support-session recommendations from Rook, Ember, and Mira.',
      'The Training Council asks how the Hunter feels now before bringing Kairo and Snow into scheduling. Pain or limitation reports trigger cautious support and appropriate warnings—not punishment, diagnosis, appearance-based shame, or forced intensity.',
      'Every domain companion can bring an evidence-grounded request to Calendar Council one item at a time, preserving clear ownership, visible discussion, and individual Hunter approval.',
    ],
  },
  {
    title: 'Version 9.4.0 · Calendar Council',
    detail:
      'The companions can now initiate transparent schedule coordination with their specialist, Kairo, and Snow in one continuous room while the Hunter remains the only person who can approve a calendar change.',
    points: [
      'Explicit scheduling requests automatically open a visible Calendar Council containing the responsible specialist, Kairo, and Snow without abandoning the current conversation or losing its history.',
      'The specialist explains what the time protects, Kairo verifies the exact date, time, recurrence, availability, and conflicts, and Snow checks the request against the Hunter’s stated intent before one final confirmation.',
      'Cassian can recommend budget reviews, the Training crew can recommend weekly Body Diagnostics, and every other domain companion can suggest one evidence-based calendar ritual without silently creating it or spamming the schedule.',
      'Incomplete scheduling requests remain inside Calendar Council for a single grouped follow-up, so natural replies such as “Sunday at 7 PM, every week” continue the same protected command instead of falling back to casual chat.',
      'Kairo remains the authoritative local calendar writer; Snow and the originating specialist can refine a proposal, but only the Hunter’s verified confirmation button can create, update, or cancel the record.',
      'Calendar previews now display the coordination chain—specialist to Kairo to Snow to Hunter—while linked realm assignments, missions, workouts, meals, Scripture sessions, and rewards remain unchanged until completed in their original systems.',
      'Soulprint delivery is regression-checked across the complete twelve-companion roster: direct links receive only their own Director’s Notes and shared rooms receive only the notes of companions visibly present.',
    ],
  },
  {
    title: 'Version 9.3.0 · Party Commons',
    detail:
      'Private companion links can now become living shared rooms without losing context, specialist relays happen visibly inside the same conversation, and every protected command lane remains operational wherever the responsible companion is present.',
    points: [
      'Party Commons keeps one continuous local conversation while the Hunter naturally adds, removes, or directly addresses companions by voice or text; the visible roster always shows who is currently in the room.',
      'Specialist pivots no longer open an isolated blank thread: the current companion introduces the receiving expert, carries the full brief forward, and lets the expert answer in the same shared history.',
      'AI Headquarters gains compact room controls for inviting and releasing companions, while Quick Link understands natural membership phrases such as “add Saffron,” “remove Quill,” “bring everyone,” and “keep only Snow and Cipher.”',
      'The A.R.C. spoiler link now opens a dedicated Snow-and-Quill Spoiler Room so Quill can ground the canon while Snow reacts as the Hunter’s ride-or-die fan without taking authorship away.',
      'Shared-room routing preserves missions, Party Operations, Training preparation, Kitchen coaching and recipes, Sanctuary work, Creator Forge, Reawakening campaigns, Ledger counsel, A.R.C. records, Calendar Command, navigation, and every visible confirmation wall.',
      'Only companions visibly present may speak or own a specialist proposal; an absent specialist can be invited through a transparent relay but cannot silently act from outside the room.',
    ],
  },
  {
    title: 'Version 9.2.0 · Sovereign Command Center',
    detail:
      'The System home becomes a focused command surface, the passive weekly recap becomes an actionable Strategy Room, and every normal mission receives a stronger permanent reward without a daily capacity gate.',
    points: [
      'The Ascension Core remains the visual heart of the System while one compact Command Center now surfaces the next useful action, prepared Party Operations, protected confirmations, active intelligence links, genuine companion signals, and every realm directory.',
      'The oversized Dimensional Route Map is replaced by a collapsible realm index, Party Pulse appears only when a specialist has a real signal, and Snow’s retired pre-AI Daily Command no longer interrupts the day or controls mission rewards.',
      'All normal missions permanently award double their configured account XP and 50% more configured stat XP; Perfect Day, Kitchen, Body Diagnostic, and multi-path Training rewards rise with them while Class gates preserve the designed World Class journey.',
      'The Weekly Strategy Room keeps the full twelve-companion evidence review, identifies the path to protect and the path to prioritize, and grants one protected weekly strategy reward only after the Hunter confirms the direction.',
      'Legacy Daily Command records remain readable in Archive Shield and finalize safely without stacking an obsolete multiplier over the new baseline.',
    ],
  },
  {
    title: 'Version 9.1.0 Â· Living Command Intelligence',
    detail:
      'Snow and the complete companion network understand a wider range of natural commands, preserve unfinished text transmissions across an app restart, and reject accidental language contamination before it reaches the Hunter.',
    points: [
      'Mission Forge now recognizes natural action language such as assign, forge, make, give, change, edit, rename, move, retire, archive, remove, delete, restore, reactivate, log, and clear first-person completion reports without weakening confirmation walls.',
      'Mission due dates and recurrence changes resolve through Companion Orders before generic calendar vocabulary, preventing Kairo from receiving an unrelated mission edit.',
      'Snowâ€™s coordination contract preserves cross-domain constraints, identifies the responsible companions, and uses the supported combined operation or one transparent next relay without pretending hidden conversations occurred.',
      'Quick Link and AI Headquarters save an owner-bound local recovery pointer before each text transmission; if the app is suspended or relaunched, a finished response returns to its original private conversation with any protected preview still awaiting confirmation.',
      'Recovered transmissions are deduplicated, expire with the temporary server result, and clear only after the written reply is safely stored on-device. Live microphone sessions remain intentionally foreground-only.',
      'An English-output guard removes accidental foreign-script fragments from titles, replies, summaries, handoffs, and previews while preserving translations the Hunter explicitly requests.',
    ],
  },
  {
    title: 'Version 9.0.1 · Quick Link Relay Stabilization',
    detail:
      'Specialist handoffs now cross directly from the current companion into the receiving expert’s conversation instead of being blocked by their own pending relay state.',
    points: [
      'Confirmed Party Relays bypass only the handoff they explicitly approve; mission, recipe, calendar, Creator Forge, and other mutation previews remain protected until separately confirmed or dismissed.',
      'A synchronous transmission lock prevents rapid taps, overlapping speech results, or delayed local preparation from opening duplicate intelligence requests.',
      'Expanded routing coverage verifies every companion name, Vesper’s Haven alias, Party Council addressing, ordinary follow-up continuity, and navigation phrases that must not hijack normal conversation.',
    ],
  },
  {
    title: 'Version 9.0.0 · Sovereign Agent Engine',
    detail:
      'The twelve companions gain a protected mission-authoring layer around the unchanged Daily Mission foundation, while Cassian receives a real balance and forecasting cockpit for private financial planning.',
    points: [
      'Companion Orders are persistent optional missions with a specialist owner, realm, threat tier, due date, recurrence, checklist, completion history, and same-day reward reversal; the original Daily Missions, rolls, Class gates, and configured rewards remain locked and authoritative.',
      'The Mission Forge assigns fixed reward tiers and a 150 XP daily Agent Mission ceiling, preventing an unlimited custom-mission loop while allowing meaningful companion-created side work to advance the campaign.',
      'Every Companion Order change is written to the local audit trail, retirement preserves history instead of deleting it, and unfinished checklist steps block an accidental reward claim.',
      'Cassian’s Treasury adds private manual account snapshots, known-net-worth calculation, editable balances, recurring-bill estimates, debt minimums, and a visible monthly obligation floor without connecting to a bank or pretending money moved.',
      'Companion-created missions and Treasury account records remain offline-first, private to the device, and included in Archive Shield Version 28 exports.',
    ],
  },
  {
    title: 'Version 8.2.0 · Sovereign Command Network',
    detail:
      'All twelve companions now operate as one coordinated command network: each specialist keeps honest domain authority, transparent relays preserve the Hunter’s intent, and deeper creative work can become a verified local action instead of ending as advice.',
    points: [
      'Every companion can recognize when another enabled specialist owns the requested work and prepare a one-tap Party Relay with the Hunter’s actual intent intact; Snow remains the coordinator without impersonating another companion’s records or authority.',
      'Vesper can now prepare an exact existing Creator Forge operation update—status, next action, and a dated note—as one persistent preview, then apply it only after the Hunter confirms and the local board save succeeds.',
      'Quill can turn an explicit Story Room conclusion into a grounded Canon Vault preview with source type, tags, and character links; brainstorming remains conversation until the Hunter intentionally asks to preserve it and confirms the record.',
      'Creator, A.R.C., Calendar, Kitchen, Ledger, Training, Sanctuary, and System context is routed only to the companions and questions that need it, reducing irrelevant data exposure and making specialist answers more precise.',
      'Calendar intelligence now follows realm-related scheduling requests from any companion channel, allowing a specialist to coordinate with Kairo without silently moving, creating, or completing anything.',
      'Online transmissions receive a private resumable link: switching to another phone app may pause the screen, but the secure response can finish server-side and return when The System becomes active again.',
      'Resumable results are owner-bound, temporary, automatically expire, and never store the full Hunter request in the transmission table; direct offline realms and all existing confirmation walls remain unchanged.',
    ],
  },
  {
    title: 'Version 8.1.1 · Verified Workrooms',
    detail:
      'Quill and Vesper now hold exact-record continuity across their major creative workrooms, so deep counsel begins from the dossier, canon source, or Creator Forge operation the Hunter actually named.',
    points: [
      'Quill now normalizes possessive names, pins exact character and source matches ahead of loose relevance, and carries the last named record into natural follow-up questions without allowing related dossiers to replace it.',
      'The A.R.C. context includes a compact Character Library and Canon Vault index, while Quill clearly treats Story Room as a conversation mode rather than a storage location.',
      'Every Character Library dossier gains a direct Review handoff and every Canon Vault record gains a direct Discuss handoff that names the exact primary source and forbids silent substitution.',
      'Vesper now keeps short answers inside an active Creator Forge workroom, pins an explicitly named older board operation into her context, and exposes a Workshop handoff on every production card without duplicating or moving it.',
    ],
  },
  {
    title: 'Version 8.1.0 · Living Voice Economy',
    detail:
      'The companions keep their complete written intelligence while long transmissions gain concise, personality-faithful spoken briefings that protect the Hunter’s premium voice allowance.',
    points: [
      'Every online companion reply now carries a dedicated audio-first briefing in the same structured intelligence response, avoiding a second summarization call, extra delay, or any change to the full written answer.',
      'Replies over 500 characters speak a natural one-to-three-sentence briefing by default in AI Headquarters and Quick Link; shorter conversations continue speaking in full.',
      'Manual Play full controls remain available on every summarized reply, while Party Council and automatic playback use the economical briefing route by default.',
      'Every finalized Cartesia casting, independent Cartesia speed, and complete OpenAI fallback Soulprint remains untouched and travels through Archive Shield exactly as before.',
      'The sensitive Integrity mission now uses discreet language throughout missions, Sanctuary guidance, AI responses, settings, archives, briefings, and older locally stored conversation displays without changing its stable legacy ID or historical rewards.',
    ],
  },
  {
    title: 'Version 8.0.0 · A.R.C. Archives',
    detail:
      'The complete A.R.C. character system joins The System as a private creative realm, while Quill brings source-grounded canon recall, continuity counsel, and unapologetic story-room energy to the party.',
    points: [
      'AI Headquarters and Quick Link now share one verified action channel: missions, Party Operations, recipes, Creator Forge entries, Reawakening campaigns, and Calendar changes stay as persistent previews until the Hunter confirms them and the real local record succeeds.',
      'Every action-capable companion follows the same honesty boundary in either command surface, so a conversational “I confirm” can never be mistaken for a saved, scheduled, completed, or synchronized result.',
      'Calendar Command can show or hide today’s Daily Missions as a read-only planning layer without creating duplicate events, awarding XP, or altering mission completion.',
      'Kairo, Snow, and each realm specialist can reserve a companion-linked time block together; the Calendar protects the time while the authoritative workout, recipe, study, content, lore, or ledger work still begins and completes inside its original realm.',
      "Kairo, The Timekeeper, becomes the twelfth companion and Snow's schedule keeper, bringing a private offline-first Calendar Command realm, grounded schedule briefings, conflict detection, recurring commitments, and full Soulprint, Voice Link, Quick Link, party, milestone, and backup support.",
      'Calendar changes prepared through Kairo or Snow remain visible previews until the Hunter confirms them; neither companion may silently add, move, complete, cancel, or overwrite a commitment.',
      'The intelligent calendar expands recurring events into a real agenda, detects overlapping commitments, surfaces the next arrival and protected focus windows, and keeps the complete schedule available offline in Archive Shield format 27.',
      'The original five-section Character Archives, printable profile, 0–1000 Graced stat engine, Starting and Ending Story Classes, transcendence rules, and all 152 Arts now run inside the compiled Dossier Forge without depending on nested host routes.',
      'Imported v4 and legacy JSON dossiers enter a searchable on-device Character Library; saving in the Forge synchronizes the record, and an existing character name updates instead of silently creating duplicates.',
      'The Canon Vault accepts modern Word (.docx), Text, Markdown, JSON, and pasted source records with explicit types, tags, and character references, while the Continuity Scanner flags gaps and collisions without rewriting canon.',
      'A portable Quill Knowledge Pack can carry up to 300 organized lore sources in one JSON file, making laptop-to-phone transfer possible without replacing missions, progression, settings, or any unrelated campaign data.',
      'Quill, The Storyspark, becomes the eleventh companion with a complete Soulprint, Quick Link and Voice Link access, support dialogue, party chemistry, progression reactions, Campfires, Councils, and milestone celebrations.',
      'A.R.C. retrieval is topic-gated and source-aware: only Quill—or Snow and the Party during an explicit A.R.C. conversation—receives compact relevant records, with established canon separated from inference and new ideas.',
      'Archive Shield format 25 validates and preserves Character Library and Canon Vault records alongside the full campaign, while imported lore remains private on this device until the Hunter intentionally asks for online counsel.',
      'Voice Forge can now cast companions from an optional Cartesia Sonic voice library while preserving their existing OpenAI voices as an automatic fallback; provider choice, voice IDs, and local allowance tracking travel safely in Archive Shield format 26.',
      'Voice Forge now presents separate Cartesia and OpenAI workbenches: Cartesia exposes only its real voice casting and independent speed, while every tuned OpenAI Soulprint remains untouched and ready for automatic fallback.',
      'Quick Link now opens adaptive specialist workrooms: short follow-ups stay attached to Vesper campaigns, Quill lore sessions, Saffron recipes, Cassian plans, Snow coordination, and Party Council, while focused schemas and larger response budgets prevent major work from being squeezed into casual-chat limits.',
      'Interrupted or malformed intelligence responses rebuild themselves once with additional room, refusals remain readable, and the Usage Ledger counts both attempts instead of hiding recovery cost; Reawakening campaigns may now match a focused one-to-twelve-week scope with up to twelve sequenced operations.',
    ],
  },
  {
    title: 'Version 7.8.0 · Body Diagnostic',
    detail:
      'The Training Hall gains a private weekly evidence review where Rook, Ember, and Mira turn physique photos and smart-scale screenshots into a disciplined, non-medical progress report.',
    points: [
      'A dedicated Body Diagnostic accepts up to three physique angles and one smart-scale screenshot, with optional Hunter context and goals for balance, recomposition, fat loss, muscle gain, performance, or mobility.',
      'Terra vision extracts readable scale values, separates visible observations from estimates, identifies data quality, compares against the prior text report, and returns priorities plus optional support work without inventing a diagnosis or exact body-fat reading from appearance.',
      'Rook, Ember, and Mira each deliver a distinct no-excuses response, and the wider companion intelligence now knows whether the weekly diagnostic is due so accountability can stay direct without body-shaming.',
      'Completing the optional diagnostic awards 150 account XP exactly once per configured System week; it never completes the Daily Workout mission or awards credit for suggested exercises.',
      'Submitted images exist only for the active request and are never written to IndexedDB, Archive Shield, conversation history, or the stored diagnostic record; only the report, source types, model usage, and reward proof remain on-device.',
      'Archive Shield Version 24 validates every nested diagnostic value, preserves portable reports, and rejects impossible records or image-like payload fields.',
    ],
  },
  {
    title: 'Version 7.7.1 · System Integrity Sweep',
    detail:
      'A full-system reliability pass makes Party Operations, mobile voice, Archive Shield, updates, and private AI boundaries match the behavior the interface promises.',
    points: [
      'The Daily Operations board now reconciles against the real Training, Kitchen, Sanctuary, and mission records, so completed, active, changed, and ready assignments never remain frozen in their original state.',
      'Snow can truly leave Training untouched during a multi-realm assembly, and already-completed work is acknowledged as complete instead of being described as newly rolled or prepared.',
      'Interrupted party preparation recovers into a visible, retryable partial briefing instead of leaving the System permanently stuck in an assembling state.',
      'Quick Link now starts microphone capture directly from the Hunter’s tap, preserves staged preparation across mode changes, and locks confirmation and dismissal against rapid duplicate execution.',
      'Archive Shield validates the nested contents of Party Operations records and safely upgrades staged Version 7.7 proposals without weakening save compatibility.',
      'Private AI and Studio mutations reject cross-site browser submissions more defensively, while current model rates, local usage estimates, offline authority, and confirmation gates remain intact.',
      'Update guidance now reflects the private Sites release channel, and stale release labels no longer point the Hunter toward the retired GitHub Pages path.',
    ],
  },
  {
    title: 'Version 7.7.0 · Party Operations',
    detail:
      'Snow and the specialists can now prepare the real daily realms together while every original roll, interactive screen, offline path, completion rule, and reward boundary remains authoritative.',
    points: [
      'Ask Snow to assemble the day and she first gathers the missing choices—Training path, food boundaries, and optional Sanctuary focus—before presenting one explicit permission to wake the party.',
      'A confirmed assembly uses the existing Training Hall, Kitchen, and Scripture Sanctuary engines, then preloads their real resumable sessions so the proper workout, recipe checklist, or guided study is waiting when its realm opens.',
      'Rook, Ember, Mira, Saffron, and Selah can prepare their own domains through direct Quick Link conversations, while every companion shares one persistent on-device operations record for the System day.',
      'Visible party coordination reports only assignments that actually reached local storage; incompatible active work is preserved and shown as a clear flag instead of being silently overwritten.',
      'Food constraints can send Saffron back to the current Kitchen Order; when it conflicts, she can forge a complete replacement recipe, save it to the Private Grimoire, and load its normal ingredient and cooking checklists.',
      'Preparation never checks a box, marks a mission complete, awards XP, records spending, or claims work on the Hunter’s behalf, and every prepared realm continues working offline after assembly.',
    ],
  },
  {
    title: 'Version 7.6.1 · Worthy Trials',
    detail:
      'Optional challenges now pay like genuine side campaigns, while World Class forecasts separate the designed two-year journey from a still-forming personal pace sample.',
    points: [
      'Every optional Weekly, Monthly, Boss, and Recovery challenge awards 50% more account XP and 50% more stat XP; mandatory Class Trial rewards remain unchanged.',
      'Existing active challenges receive the new rewards automatically because their authoritative templates refresh on launch, while already-claimed rewards remain safely unchanged.',
      'World Class answers now lead with the designed 620–725-day sustainable range and identify 570 days as the near-perfect theoretical floor before discussing personal pace.',
      'Personal forecasts disclose the exact finalized-day sample and label fewer than 21 days as an early baseline rather than projecting one starting week as destiny.',
      'The party still reports every hard Class gate and recent-pace calculation honestly, but it can no longer confuse a secondary extrapolation with the System’s intended progression curve.',
    ],
  },
  {
    title: 'Version 7.6.0 · Living Grimoire',
    detail:
      "Saffron's personal recipes become complete Kitchen Orders instead of static notes, joining her Daily Rotation and opening into the same guided cooking console as every canon meal.",
    points: [
      'Every confirmed Saffron creation now enters Daily Rotation automatically, while a visible per-recipe control can keep any personal meal saved without allowing it to appear as a surprise order.',
      'Cook with Saffron can launch any personal or canon Grimoire recipe as today’s active order, with a clear warning before replacing unfinished checklist progress.',
      'Personal orders inherit ingredient gathering checks, numbered method checks, on-device progress persistence, serving and effort review, completion reactions, weekly reward limits, and Kitchen history.',
      'A protected recipe snapshot travels with each personal order so its name, ingredients, method, safety guidance, and archive record survive even if the original Grimoire entry is later removed.',
      'The rotation counter now reflects the real combined pool of canon meals and enabled personal creations, while completed custom orders use the recipe’s true name in the XP ledger and AI System context.',
    ],
  },
  {
    title: 'Version 7.5.0 · Living Voice Ascension',
    detail:
      'Voice Forge III gives every companion a sharper vocal identity while Live Link turns a selected one-on-one channel into a natural, interruptible conversation instead of a chain of recordings.',
    points: [
      'Every Soulprint now includes vocal register, resonance, intonation, articulation, emotional range, and a grounded, balanced, or dynamic canon take so Snow, Ember, Saffron, and the full party separate more clearly in sound as well as personality.',
      'The native speech speed control is now driven directly by the Forge pace slider, while scene intelligence automatically shifts celebration, support, accountability, instruction, and strategy delivery without breaking character.',
      'A dual-take Casting Room lets the Hunter audition the same canon line as a restrained Grounded take or a vivid Dynamic take before choosing the saved performance.',
      'Live Link opens an optional one-on-one WebRTC conversation with natural turn detection, interruption, responsive audio, visible local transcripts, mute and end controls, and the current System context available to the selected companion.',
      'Command Link, Party Council, typed messages, confirmed app actions, and the complete offline campaign remain intact; Live Link cannot silently change campaign data and clearly hands actions back to the confirmation-gated Command Link.',
      'Realtime text and audio tokens are added to the local Usage Ledger with model-specific estimates while OpenAI remains the billing authority.',
    ],
  },
  {
    title: 'Version 7.4.0 · Creator Reawakening',
    detail:
      'Creator Forge becomes a historical intelligence chamber that helps Vesper understand what the channel has been, diagnose the quiet season, and build the next comeback arc with the Hunter in control.',
    points: [
      'The secure read-only Studio Link now synchronizes 28-day, 90-day, and 365-day channel signals plus a ranked one-year Content Vault without adding any Google permissions.',
      'History Lens lets the Hunter compare recent momentum against the deeper channel story while Vesper receives a compact evidence map of real windows and proven videos instead of guessing from one quiet month.',
      'The Reawakening Briefing turns upload cadence, active production, and historical standouts into an honest comeback diagnosis, one strategic focus, and one immediate physical move.',
      'A dedicated Reawakening Council opens Vesper with the live Studio evidence already in context and can prepare a complete two-to-four-week campaign for one visible confirmation before any project reaches the local board.',
      'The Idea Lab can hand any proven video directly to Vesper for a successor concept while historical insights remain on-device, travel with the full save, and never grant upload, edit, comment, or delete access.',
    ],
  },
  {
    title: 'Version 7.3.1 · Creator Route',
    detail:
      'Creator Forge becomes a primary daily destination while Status returns to the compact crown control in the top command row.',
    points: [
      'Creator Forge replaces Status in the persistent bottom navigation so channel signals, production operations, and Vesper are always one tap away.',
      'The crown returns as a compact top Status and Class-progression control that remains clear without overcrowding the mobile header.',
      'Every destination, progression record, Studio connection, and offline campaign behavior remains unchanged; this patch only improves navigation priority.',
    ],
  },
  {
    title: 'Version 7.3.0 · Studio Link',
    detail:
      'Creator Forge gains a private read-only YouTube Studio connection so Vesper can reason from fresh channel signals without receiving Google credentials or gaining control of the channel.',
    points: [
      'Secure Google authorization connects the signed-in Hunter to one YouTube channel with only channel-read and analytics-read permissions; uploads, edits, comments, deletions, and account management remain impossible.',
      'One-tap Studio synchronization captures the latest 28-day views, watch hours, average view duration, upload count, and current subscriber signal into the existing on-device Creator Forge history.',
      'Vesper can discuss the synchronized baseline alongside active projects, hooks, audience promises, publishing momentum, and weekly targets while clearly separating supplied facts from strategy hypotheses.',
      'Google refresh access is encrypted behind the private gateway, never enters the browser save or OpenAI context, and can be revoked with a visible Disconnect control while existing local snapshots remain yours.',
      'Manual entry and CSV import remain available for reach impressions, thumbnail click-through rate, historical backfill, or fully offline creator tracking.',
    ],
  },
  {
    title: 'Version 7.2.0 · Creator Awakening',
    detail:
      'Vesper takes the spotlight as a complete YouTube and content-creation specialist while Creator Forge turns audience strategy, channel signals, and production momentum into a living offline-first command realm.',
    points: [
      'Haven is completely reborn as Vesper, The Spotlight: a charismatic creator and streamer specialist with an original chibi portrait, electric-chartreuse identity, expressive voice canon, complete offline dialogue, and deeply grounded online intelligence.',
      'Creator Forge · The Greenroom adds a local production pipeline from idea through publish, a creator identity and upload target, channel momentum accountability, and an honest Vesper–Cipher partnership between audience instinct and execution systems.',
      'YouTube Studio snapshots can be entered manually or imported from a Studio CSV without storing a Google password; views, watch time, impressions, click-through rate, average view duration, uploads, and subscriber signals remain in the full campaign save.',
      'Vesper can reason from real Creator Forge projects and aggregate channel signals, then prepare a complete content operation for confirmation into the local board without inventing analytics or claiming a release already happened.',
      'Quick Link is now a real short conversation instead of a one-message transmission: unaddressed follow-ups stay with the active companion, the visible exchange remains intact, and Saffron can gather recipe details across multiple turns before preparing the Grimoire preview.',
    ],
  },
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
