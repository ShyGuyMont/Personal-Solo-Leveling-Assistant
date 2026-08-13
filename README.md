# The System

The System is a private, phone-first, offline progression RPG. The player is the real user: daily missions build account XP, stats, streaks, challenge progress, levels, achievements, cosmetics, and long-term Class qualification.

The design, writing, interface, icons, animations, and generated tones are original. No franchise art, logos, dialogue, interface assets, or sound recordings are included.

## Included

- Six default missions across Faith, Discipline, Physical, Creator, and Character
- Custom and template missions, weekday schedules, optional completion types, notes, and stable history IDs
- Daily Review, idempotent rewards, current-day undo, Perfect and Protected Perfect Days, humane momentum/decay, and Recovery Mode
- System and Clean interface styles, five complete color protocols from Abyss to Winter Crown, and selectable visual intensity
- Eleven original chibi companion characters with daily greetings, stat-specific encouragement, shame-free accountability, occasional two-character banter, cinematic milestone celebrations, adjustable frequency, and individual mute controls
- A private Party Channel with ten-mood Check-Ins, six Direct Support topics, whole-party or one-to-one responses, history-aware dialogue rotation, and locally saved conversations that never affect XP or streaks
- Full Party Headquarters with the complete roster, support shortcuts, saved-message counts, Ember's Lock-In Protocol, Amara's Heartweaver Protocol, permanent Weekly Campfires, Monthly Councils, and an opt-in AI conversation chamber
- Secure online AI conversations with the full party or any individual companion, local-only conversation history, compact progress context, and an immediate offline fallback
- Weekly Campfire Recaps generated once per completed week from finalized mission data, with an in-character review from every companion and no hidden rewards or penalties
- Monthly Councils generated after a completed month with fact-aware commentary from all eleven companions, permanent history, and an optional next-month intention
- Snow's optional Daily Command Briefing with Low, Steady, and High capacity planning, broad completion targets, and transparent 1×–2.5× scheduled-mission XP outcomes
- Rook, Ember, and Mira’s Training Hall with four home circuits, four structured progressive gym sessions, Conditioning, guided randomized mobility/yoga/Pilates protocols, a three-tier multi-path reward ladder, a full-party post-workout scene, and a private weekly Body Diagnostic
- Saffron’s Kitchen with eighteen rotating no-bean, no-pea recipes, guided ingredients and steps, substitutions, food-safety and leftover guidance, three rewarded weekly orders, and permanent cooking history
- Snow and Selah’s Scripture Sanctuary with 96 rotating passage paths, twelve emotional and spiritual concerns, guided reflection, deeper prayer structure, private history, and unlimited no-XP Stronghold support
- User-authored Campaign Arcs with purpose, companion guidance, optional target dates, milestones, pause/resume, completion, and archive states
- Nine extensive Companion Questlines: 45 authored chapters, 135 tracked or reflective objectives, no failure timers, fixed chapter rewards, and nine unique legendary completion titles
- Treasury Command with paycheck and expense logging, bills, credit-card and other debt tracking, savings goals, amount masking, weekly plans and reviews, and Archive Shield protection
- Cassian's 75%-chance No Eating Out directive with explicit bonus XP, Stewardship growth, no core-XP loss on failure, and a practical recovery debrief
- Words to Carry favorites for saving companion messages from Check-Ins, Direct Support, banter, milestones, and ordinary reactions
- A Snow-guided About & Help screen available from every page, with plain-language navigation, rules, privacy guidance, and a three-step starting path
- One saved rare-event roll per System day: optional Emergency Quests and claimable Mission Passes without refresh rerolls
- F-Class through World Class qualifications and seven saved Class Trials
- 30+ weekly, 20+ monthly, six Boss, and ten supportive Recovery challenges
- 40+ titles, 50 achievements, 12 cosmetics, and full progression overlays
- Archive calendar, transparent weekly/monthly reports, history, stat analysis, and deterministic focus suggestions
- Versioned IndexedDB storage, repository/service boundaries, migrations, immutable reward transactions, and audit entries
- Archive Shield save preview/import with a 32 MB limit, schema and value validation, unsafe-key rejection, SHA-256 integrity verification, atomic replacement, and five rolling recovery snapshots
- Privacy Screen, sensitive-mission alias, global recovery screen, reduced motion, optional generated tones, and honest notification limitations
- Installable iPhone PWA with safe-area support, offline caching, code-split screens, user-controlled update prompts, and a dedicated Update Center

The complete progression system works offline and stores campaign data locally. The optional AI
Headquarters channel uses the private Sites sign-in and a server-side OpenAI connection; it sends
only the message, limited recent chat context, and a compact progress signal when the user presses
Send. There is no analytics, advertising, or tracking.

## Version 8.0.0 · A.R.C. Archives

Version 8 brings the original A.R.C. Character Archives into The System as a complete creative
realm. The full five-section dossier builder, live printable profile, 0–1000 Graced stat engine,
Starting and Ending Story Classes, World and Domain Transcendence rules, and all 152 Arts remain
available through the embedded Dossier Forge. Saving JSON in the Forge also synchronizes the
character into a searchable on-device Character Library; existing names update instead of creating
silent duplicate records.

The new Canon Vault accepts local Text, Markdown, JSON, and pasted source records with types, tags,
and character references. Quill retrieves only the records relevant to the current question, names
the local dossier or canon source behind established facts, and separates confirmed canon from
inference and new ideas. A non-destructive Continuity Scanner flags structural gaps, duplicate
identities, and canon records that reference characters without dossiers. It never rewrites A.R.C.
automatically. Imported dossiers and canon sources stay in IndexedDB and are included in Archive
Shield format 25.

**Quill, The Storyspark** is the eleventh companion: a hyperactive Filipino lore specialist for
A.R.C. canon, character dossiers, Arts, plot architecture, continuity, and worldbuilding. He is
available in Quick Link, Voice Link, Party Check-Ins, Direct Support, Campfires, Councils, and
milestone celebrations. Snow joins A.R.C. conversations as an enthusiastic spoiler fan, while the
Hunter remains the sole authority who can approve or file canon.

## Version 7.8.0 · Body Diagnostic

The Training Hall now runs one optional Body Diagnostic per configured System week. The Hunter may
submit up to three physique angles, one smart-scale screenshot, or any smaller combination; choose
a current goal, add relevant context, and receive a structured Terra vision report from Rook,
Ember, and Mira. The report distinguishes visible observations from transcribed scale estimates,
labels evidence confidence, compares against the prior stored report when available, and produces
specific Training Hall priorities plus optional support work. It does not diagnose health
conditions or infer an exact body-fat percentage from appearance.

Clearing the weekly diagnostic awards 150 account XP exactly once. It does not complete the Daily
Workout mission, and its optional exercises do not grant mission credit. The party’s compact AI
context knows whether the diagnostic is due and can hold the Hunter firmly accountable without
body-shaming. Submitted images are sent only when the Hunter explicitly consents, are never written
to the local database or Archive Shield save, and are released after the active request; the
on-device record retains only the text report, source types, usage, and reward proof.

## Version 6.4.0 · Awakened Link

Version 6.4 opens the first secure intelligence channel in Headquarters. The Hunter can speak with
the full party or call any enabled companion directly, while the established personalities remain
distinct and the offline System remains authoritative. Party conversations intentionally call only
the companions relevant to the moment instead of making all eleven answer every message.

Online mode is explicit and reversible. The OpenAI credential stays behind the private Sites
gateway, API requests are not stored by the app server, and the browser receives no secret. Only
the Hunter's message, up to sixteen recent chat messages, and a compact Class, level, mission, and
stat signal are transmitted. Notes, journals, Treasury amounts, and the full save remain local.
Completed AI conversations are stored on-device, included in Archive Shield exports, and readable
offline. Readiness checks, usage-limit guidance, and failure-safe local saving keep a broken or
unconfigured online link from affecting the campaign.

## Version 7.3.0 · Studio Link

Creator Forge can now connect directly to the Hunter's YouTube Studio channel through a private,
read-only Google authorization. A secure sync captures the current subscriber signal and the latest
28 days of views, watch time, average view duration, and upload pace into the existing on-device
Creator Forge history. Vesper can discuss those supplied numbers alongside active projects and
publishing targets without inventing analytics or claiming access to the complete Studio account.

The Google refresh credential is encrypted behind the private Sites gateway. It never enters the
browser save, Archive Shield export, or Vesper/OpenAI context. The requested permissions cannot
upload, edit, delete, comment, or manage the channel, and a visible disconnect action revokes the
link while preserving already-synchronized local snapshots. Manual entry and CSV import remain
available for reach impressions, thumbnail click-through rate, and fully offline tracking.

## Version 7.3.1 · Creator Route

Creator Forge now occupies the persistent Creator slot in the bottom navigation, making Vesper,
channel signals, and the production pipeline one tap away. Status remains fully available through
the restored crown control in the top command row, preserving Class progression without spending a
primary daily-navigation slot. This is a navigation-only update and changes no campaign data.

## Version 7.4.0 · Creator Reawakening

Creator Forge now sees the channel as a story instead of a single quiet month. The secure read-only
Studio Link synchronizes 28-day, 90-day, and 365-day analytics windows plus a ranked one-year
Content Vault of proven videos. History Lens lets the Hunter move between those horizons, and
Vesper receives the same compact evidence map whenever she is invited into an online creator
conversation. No new Google permissions are requested.

Vesper's Reawakening Briefing diagnoses whether the channel is dormant, returning, or active;
separates real evidence from strategy hypotheses; and names one immediate physical move. A
dedicated Reawakening Council can prepare a complete two-to-four-week campaign with two to eight
sequenced releases. The entire campaign appears as a preview and reaches the local Creator Forge
board only after one explicit confirmation. Every proven video can also open the Idea Lab for a
fresh successor concept without treating the old title as a template.

Historical video insights remain on-device, travel in Archive Shield saves, and never grant upload,
edit, comment, delete, or account-management access. Google credentials remain encrypted behind
the private gateway and never enter the browser save or OpenAI context.

## Version 7.7.1 · System Integrity Sweep

The full System has been audited across progression, Party Operations, AI commands, persistence,
mobile interaction, update behavior, and private server boundaries. The Daily Operations board now
reconciles with the actual Training, Kitchen, Sanctuary, and mission records instead of preserving a
stale preparation snapshot. Completed work is identified honestly, interrupted preparation recovers
cleanly, and Snow can assemble only the realms the Hunter requests—including leaving Training
untouched.

Quick Link preserves mobile microphone activation from the original tap, prevents rapid duplicate
operation execution, and keeps staged permission visible across mode changes. Archive Shield now
validates nested Party Operations data and migrates earlier Version 7.7 proposals safely. Private AI
write endpoints reject cross-site browser submissions more defensively, while the original offline
campaign, explicit confirmations, reward boundaries, and local data ownership remain unchanged.

## Version 7.7.0 · Party Operations

Snow and the specialist companions can now prepare the actual daily realms together without replacing the System's original rituals or granting themselves completion authority.

- **Ask before waking the party:** Snow gathers Training location, food boundaries, and an optional Sanctuary mode and concern across a continuing Quick Link conversation, then shows one clear preparation confirmation.
- **Real section preloading:** A confirmed operation uses the existing Training Hall, Kitchen, and Sanctuary engines. Opening a realm later resumes the exact assigned workout, cooking checklist, or Scripture session that the party prepared.
- **Shared daily state:** Snow, Rook, Ember, Mira, Saffron, and Selah operate from one durable on-device daily record, so a direct specialist request and a later Snow briefing cannot quietly create conflicting versions of the day.
- **Visible coordination:** The confirmed assembly appears as a genuine party exchange and a dashboard operations board with direct Begin, Cook, and Enter controls. Companions report only preparation that actually succeeded.
- **Responsive Kitchen orders:** Saffron can check a confirmed food boundary against the rolled meal and, when needed, forge a complete replacement that enters the Private Grimoire and opens in the normal ingredient-and-step console.
- **Authority stays with the Hunter:** Operations may prepare and navigate, but never claim completion, check a box, award XP, record spending, replace incompatible active work, or alter the campaign without the required confirmation.
- **Offline foundation preserved:** Once prepared, every realm remains available through its original offline-first interaction and completion flow.

## Version 7.6.1 · Worthy Trials

Weekly, Monthly, Boss, and Recovery challenges are optional side campaigns, so their account and
stat rewards now receive a full 50% increase. Class Trials remain unchanged because they are
mandatory progression gates. Active optional challenges inherit the increased reward before they
are claimed; rewards already claimed are never rewritten or duplicated.

World Class forecasts now lead with the progression model the System was actually balanced around:
a sustainable 620–725-day path at roughly 75–90% consistency, with 570 days identified only as a
near-perfect theoretical floor. The party still shows the Hunter’s real recent pace, but it must
name the finalized-day sample and treat fewer than 21 days as an early baseline rather than a
reliable five-year prediction.

## Version 7.6.0 · Living Grimoire

Saffron’s Private Grimoire is now part of the working Kitchen instead of a static recipe shelf.
Every confirmed personal creation joins Daily Rotation by default, with an individual control to
keep it saved but out of surprise assignments. **Cook with Saffron** can turn any personal or canon
recipe into today’s guided Kitchen Order, including ingredient gathering checks, numbered method
checks, saved progress, serving and effort review, completion reactions, weekly reward limits, and
the normal Provision Archive.

Each personal order carries a protected recipe snapshot so its instructions and history remain
readable even if the source entry is later removed from the Grimoire. The Kitchen’s visible
rotation count, XP ledger notes, archives, and AI context all understand the combined canon and
personal recipe pool.

## Version 7.5.0 · Living Voice Ascension

Voice Forge III gives all eleven companion Soulprints a deeper vocal fingerprint: register,
resonance, intonation, articulation, emotional range, and a grounded, balanced, or dynamic acting
take now join the established base voice, accent, cadence, texture, warmth, and energy controls.
The pace slider also drives the speech model's native speed control, and the Casting Room can
compare restrained and vivid auditions of the same canon line before saving a performance.

Quick Link now contains both the established confirmation-gated Command Link and an optional Live
Link. Live Link opens a private one-on-one WebRTC conversation with semantic turn-taking,
interruptible companion speech, visible on-device transcripts, mute and end controls, the selected
companion's complete Soulprint, and the current compact System context. It cannot silently change
campaign records; app actions remain in Command Link, party conversations remain available, and
the entire offline campaign continues without AI. Realtime text and audio tokens are recorded in
the local Usage Ledger with model-specific estimates.

## Version 6.3.0 · Stillpoint Protocol

Version 6.3 welcomes **Mira, The Stillpoint**, as the Training Hall’s third commander. Recovery is
now a saved guided discipline instead of a free-text log: Mira’s randomized mood chooses Mobility,
Yoga, or Pilates, the number of movements, exact hold lengths or repetitions, and the overall
session length. Every protocol includes breathing and core work, beginner-readable setup,
movement-by-movement completion checks, and clear safety cues.

Training paths can now stack honestly. The first completed Home, Gym, Conditioning, or Stillpoint
path clears Daily Workout once. A second distinct path unlocks the +150 XP Double Deployment surge,
a third adds a +200 XP Triple Deployment surge, and clearing all four adds a +250 XP Full Spectrum
surge. Every tier is idempotent, optional, and never multiplied by Daily Command. The Integrity
Protocol confirmation sheet is also compacted to remove the oversized empty field around its
pass/fail controls.

## Version 6.2.0 · System Transcendence

Version 6.2 transforms the dimensional interface into a responsive world. **Winter Crown** joins
the color protocols as a bright snow-white, glacial-blue, and sovereign-navy environment with
frosted glass, clear dark text, and its own drifting snowfall. Every other protocol gains an
equally distinct lightweight atmosphere: Abyss and Daybreak carry energy motes, Blood Moon raises
embers, and Frostbound suspends ice crystals.

The tactical route map now opens through miniature dimensional windows with layered horizons,
rotating gate architecture, and realm-colored depth. The Ascension Core has become a larger
volumetric artifact whose energy field and projected telemetry directly reflect the current day's
completion. Projected command typography, breakout companion portraits, reactive lighting, and a
more dramatic Class-advancement space carry the same cinematic language through the complete app.

The atmosphere pauses when the app is not visible, uses a capped mobile particle budget, and is
fully suppressed by Subtle, Clean, Reduced Motion, and device motion preferences. Navigation,
progression, saved data, and every established feature remain unchanged.

## Version 6.1.0 · System Depth Engine

Version 6.1 turns the living interface into a coherent dimensional space. Command panels now carry
layered elevation and realm-colored edge lighting, major headings have restrained physical depth,
and controls respond like tactile System hardware without changing the app's established layout.

Pointer-capable devices gain efficient live perspective and surface lighting. Touch devices retain
the same visual hierarchy through lightweight floating layers and immediate press feedback. The
Ascension Core is now a suspended Class artifact with an energy field, rotating dimensional cage,
orbiting signal nodes, and projected advancement readout. Standard and Intense modes scale the
experience, while Subtle, Clean, Reduced Motion, and device motion preferences remain authoritative.

The visual expansion ships alongside a responsiveness pass: primary sections prepare before travel,
the command shell remains visible while a destination opens, resume refreshes are deduplicated, and
mobile compositing remains deliberately limited.

## Version 6.0.2 · Party Pulse

Version 6.0.2 makes the party more observant without making the System harsher. **Party Pulse**
looks only at the app’s existing finalized stat-neglect and momentum record. Once a path crosses a
humane attention threshold, its specialist speaks in their own voice and offers one useful route
back: Rook handles the physical path, Selah the spiritual path, Cipher execution and creative work,
Vesper creativity, Amara empathy and character, and Cassian stewardship. If several paths slip together, Ember can
open a small-target re-entry signal and Snow can widen the support response. These pulses award no
XP, remove no XP, create no failure, and continue to honor Off, Quiet, Balanced, Talkative,
individual companion controls, and Reduced Motion.
Recovery Mode holds attention signals entirely and lets Snow reinforce recovery instead of treating
protected capacity as neglect.

The section-navigation audit also gives long Training Hall and Scripture Sanctuary flows an obvious
route back to their own command screen. Sections whose tabs, selectors, modal close controls, or
existing return actions stay visible keep those established controls. Saffron’s Kitchen expands
from twelve to **eighteen** recipes with Blackened Cod Rice Bowls, Turkey Burgers & Smoky Potato
Wedges, Creamy Chicken & Spinach Pasta, Ginger Beef, Egg & Vegetable Rice, Garlic Shrimp & Tomato
Orzo, and freezer-ready Egg, Turkey Sausage & Potato Breakfast Burritos.

## Version 6.0.1 · System Optimization

Version 6.0.1 hardens the living interface for everyday mobile use. The bottom command bar is
isolated from the scrolling app canvas and anchored directly to the viewport, preventing it from
drifting into the middle of the screen. Touch-only devices no longer retain desktop hover movement,
mobile atmosphere work is reduced outside Intense mode, and the saved Reduced Motion preference
also suppresses page and companion transitions.

Two new appearance protocols join Abyss and Daybreak: **Blood Moon** combines obsidian, crimson,
and antique gold; **Frostbound** combines midnight blue, glacial cyan, and silver violet. Every
protocol works with System or Clean presentation and changes no progression, missions, or saved
campaign data.

## Version 6.0 · System Ascension

Version 6.0 turns the assistant from a themed tracker into a **living System**. Headquarters is now
a responsive command chamber built around a central Ascension Core, the player’s Class and level,
a live Snow transmission, daily synchronization, current System condition, and an eight-realm
tactical route map. The chamber visibly responds to Class readiness, active trials, recovery,
momentum, offline use, recent breakthroughs, and the player’s local time of day.

A persistent live HUD carries the next directive, daily completion, current level, connected realm,
and System condition between destinations. Moving into Training, Sanctuary, Kitchen, Treasury,
Party, Campaign, Archive, or progression opens a short realm-colored dimensional transition. The
specialist responsible for that space establishes an expandable companion transmission with
authored guidance and a direct route action, so companions feel present beyond static roster cards.

Class advancement is now staged as a true Ascension event with a Class-colored gate and emblem.
Abyss and Daybreak remain distinct lighting palettes; Subtle, Standard, and Intense now function as
immersion levels. Clean mode removes the cinematic layers, and the saved Reduced Motion preference
directly disables portal travel, ambient orbits, and animated companion signals.

Player-facing progression language is now consistent across the complete ladder: **F-Class →
E-Class → D-Class → C-Class → B-Class → A-Class → S-Class → World Class**. Class Trials,
qualification, achievements, history, companion dialogue, milestone celebrations, help, and save
previews all use the same terminology. Internal save fields retain their established names, so
Version 6.0 requires no database migration and preserves every earned classification.

## Version 5.0 · Forge & Flame

Gym Deployment is now a complete Toji Ascension program. **Vanguard Frame**, **Iron Citadel**, and
**Shadow Hunter** form a balanced three-day foundation; **Heavenly Restriction** is an optional
fourth specialization day. Rook recommends the foundational session that has waited longest. Every
working set can record a substitution, load, and reps; rest timers stay attached to each exercise;
and the next appearance of a workout carries forward the previous performance. Reaching the top of
every prescribed rep range produces a conservative load-increase prompt rather than an automatic
jump.

Home Circuit remains available after a completed gym session. Clearing both on the same System day
awards one fixed **+150 account XP** Double Deployment surge plus Strength, Endurance, Discipline,
and Vitality XP. The Daily Workout mission still pays only once, the surge is never multiplied by
Daily Command, and stable transaction IDs prevent repeat rewards after refreshes or imports.

**Saffron, The Flame Chef** is the ninth companion. She is a theatrical, short-tempered, fiercely
supportive nutrition-minded chef with warm olive-brown skin, vivid green eyes, dark curls, a white
chef jacket, forest-green apron, and tangerine System flame. Her Kitchen rotates among eighteen meals
built around the user’s preferred proteins, vegetables, potatoes, rice, and pasta—with no beans or
peas. Each order includes ingredients, guided steps, substitutions, food-safety checkpoints,
leftover guidance, one swap, a no-penalty decline, and a private result record. The first three
completed orders each week award 40 account XP plus Stewardship, Vitality, and Discipline; later
orders remain recorded without becoming an XP farm.

Saffron also has full emotional check-ins, Direct Support, banter, milestone celebrations, Training
Hall debriefs, Weekly Campfires, Monthly Councils, and the five-chapter **The Fire We Feed**
questline. Archive Shield 12 preserves all new Kitchen and multi-session Training Hall data while
migrating Version 4.0 saves automatically.

## Version 4.0 · Scripture Sanctuary

The Bible mission now opens a complete phone-first Scripture Sanctuary. A Full Daily Study begins
with what the user is actually carrying, then selects a rotating three-passage path from 96 offline
references spanning sexual integrity, shame, anger, sadness, loneliness, stress, numbness, focus,
doubt, forgiveness, identity, and gratitude. Each path provides original context, observation,
application, and prayer prompts while leaving the Bible text itself to the user’s preferred
translation.

Snow opens and closes each session. Selah leads the Scripture work, and the companion who best
understands the selected struggle joins them. When sexual temptation and loneliness are selected
together, Amara addresses pornography as possible counterfeit intimacy: a behavior that still needs
honest boundaries while the underlying longing for closeness also receives care. This connection is
never assumed to explain every urge, and shame is never used as the recovery strategy.

Stronghold Protocol provides immediate, unlimited support when an urge or emotion is already loud.
It combines environmental interruption, targeted Scripture, a next-ten-minutes action, and movement
toward safe human connection. Stronghold sessions never award XP or clear the Bible mission. The
first completed Full Daily Study clears the existing Bible mission once; repeated studies create no
extra reward. Private reflections and prayer notes remain local and are protected by Archive Shield
format 11.

The Sanctuary is a faith and reflection tool, not clinical or crisis care. The interface encourages
trusted people, pastors, counselors, therapists, and recovery groups when human support is needed.

## Version 3.5 · The Training Hall Update

Daily Workout now opens the Training Hall. Rook chooses one of **Iron Foundation**, **Vanguard Frame**, **Shadow Engine**, or **Guardian Citadel**; Ember naturally declares a weighted 15, 20, 25, or 30-minute clock. The saved assignment cannot be changed by refreshing, one pre-start reassignment is available, and an optional five-minute Boss Extension records overtime without creating extra XP.

Home circuits support the user’s adjustable dumbbells, bodyweight work, planks, and Burn Machine. Gym, Conditioning, and Recovery are equal alternate paths for days trained elsewhere. Finishing any one path clears the Daily Workout once and opens an exhausted, in-character recovery scene with the full party.

Daily Movement has been safely retired as a duplicate. Daily Workout now carries the combined 75 account XP and Strength, Endurance, Discipline, and Vitality rewards that both former physical missions awarded together. Existing history is preserved, old briefing references migrate forward, and Training Hall state is included in Archive Shield format 10.

Class gates and the development pacing simulator were also rebalanced for the expanded XP ecosystem. The simulator includes the duration and rewards of every mandatory Class Trial instead of estimating from qualification gates alone. World Class now requires 480 Completed Days before its final 90-day trial, placing the earliest first-attempt path at roughly nineteen months and a sustainable path around twenty to twenty-four months.

- **Snow, The Constant** is the primary whole-journey companion. She greets each new System day and supports major milestones, difficult seasons, and victories. She has long black hair, a pearl-white and navy support jacket, and an ice-blue System halo.
- **Rook, The Vanguard** supports Strength, Endurance, and Vitality. He is bold, competitive, and protective, with graphite-and-gold armor and amber energy.
- **Selah, The Beacon** supports Faith, Wisdom, and spiritual consistency. She is warm and grounded, with long braids, an ivory-and-navy mantle, and a sun-gold halo.
- **Cipher, The Strategist** supports Discipline, Focus, Willpower, production systems, and technical architecture. He is precise, dryly funny, and demanding, with a navy tech jacket and violet-cyan tactical glyphs.
- **Vesper, The Spotlight** supports Creativity, YouTube, audience strategy, hooks, camera confidence, content packaging, and publishing momentum. She is charismatic, quick-witted, and camera-ready, with warm brown skin, amber-gold eyes, a high curly ponytail, a graphite broadcast jacket, and an electric-chartreuse creator halo.
- **Ember, The Ignition** supports accountability, re-entry, and locking back in after momentum slips. She is fiery, blunt, and fiercely supportive, with copper-red hair, amber eyes, charcoal-and-crimson gear, and an ember-orange System halo.
- **Mira, The Stillpoint** supports mobility, flexibility, breath, yoga, Pilates, and calm core control. She is serene, gently playful, and impossible to rush, with fair skin, long black hair, luminous purple eyes, pearl-and-indigo movement gear, and a violet System halo.
- **Amara, The Heartweaver** supports Empathy, relationships, communication, repair, healthy boundaries, belonging, and shame-free sexual-integrity support in the Sanctuary. She is warm, perceptive, and playfully romantic, with warm olive skin, wavy chestnut hair, luminous pink eyes, rose-and-plum battle attire, and a radiant pink System halo.
- **Cassian, The Steward** supports Stewardship, budgeting, savings, debt reduction, spending awareness, and financial recovery. He is a calm, exacting, never-shaming white accountant type with fair skin, tousled light-brown hair, hazel eyes behind round gold-rimmed glasses, a pencil behind one ear, a dark ledger, and a tailored emerald-and-navy Steward coat.
- **Saffron, The Flame Chef** supports cooking, meal preparation, training nutrition, leftovers, and reducing expensive convenience choices. She is theatrical, fiery, and nurturing, with warm olive-brown skin, vivid green eyes, dark curls, a white chef jacket, forest-green apron, and tangerine flame accents.
- **Quill, The Storyspark** supports A.R.C. canon, characters, Arts, dossiers, plots, continuity, and worldbuilding. He is hyperactive, source-conscious, and delighted by spoilers, with warm brown skin, amber eyes, an electric-fuchsia hair streak, a midnight archive jacket, and a luminous story-glyph halo.

Companions never judge missed missions. Snow checks in once per System day, while stat level-ups notify the matching specialist. Ember may open one Lock-In signal when the previous day is unfinished or finalized below 50%; her response is direct but never removes XP, changes a streak, or attacks the user's worth. Amara owns the Empathy stat and ordinary Character-path relationship responses; every relationship objective offers a safe alternative and never requires contact with someone unsafe. Cassian owns the Stewardship stat and Treasury coaching; Budget Stability never removes account XP, class, streaks, or mission credit. Saffron runs the Kitchen without body shame or punishment dieting. Mira guides mobility without presenting pain as progress. Quill protects the line between sourced canon and unapproved ideas. Ordinary mission reactions follow the selected Off, Quiet, Balanced, or Talkative setting. All eleven portraits are bundled locally and require no network connection.

The Party Check-In lets the user choose Energized, Proud, Good, Okay, Tired, Stressed, Frustrated, Discouraged, Lonely, or Not sure. Snow opens and closes each conversation while the complete party answers in character. Each companion has emotion-specific dialogue pools, and the app uses the least recently heard line only after every unused line in that pool has been heard. Check-ins are saved locally in the Archive and intentionally award no XP, alter no streak, and create no penalty.

Direct Support offers Motivation, Make a plan, Faith & perspective, Calm down, Recover, and Celebrate. The user can hear from the full party or intentionally open a focused channel with any of the eleven companions, including Mira, Amara, Cassian, Saffron, and Quill. Support uses separate topic-specific dialogue pools with history-aware rotation. It is selection-based, works offline, and changes no progression data.

At the start of a new week, Headquarters can present a saved Campfire Recap for the previous completed week. It counts finalized Daily Reviews, mission records, Treasury progress, and Kitchen Orders, then gives all eleven companions distinct commentary based on those facts. Snow closes the gathering. Campfires can be favorited, reopened in Headquarters, and reviewed in the Archive.

After a calendar month with at least one finalized Daily Review, a Monthly Council records mission totals, completion rate, Perfect Days, category balance, relationship actions, Treasury progress, Kitchen Orders, levels, classes, titles, Campaign milestones, and Companion Quest chapters. Snow opens and closes; all eleven companions are represented. Councils are permanent, never change scoring, and include an optional next-month intention.

### Campaign Command

Snow's Daily Command Briefing asks how much capacity is available—Low, Steady, or High—then recommends a Main Quest, Support Quest, and optional Bonus Quest from the existing daily list. Low preserves ordinary 1× mission XP. Steady requires its priorities and at least 65% of scheduled missions for 1.5×, rising to 1.75× on a Full Clear. High requires all three priorities and at least 80% for 2×, rising to 2.5× on a Full Clear. Missing the target removes nothing.

Campaign Arcs are written by the user and carry no automatic XP. They support long-term purpose, category, companion guide, optional target date, unlimited milestones, pause/resume, completion, and archive states.

Every companion also has one authored five-chapter questline:

- Snow — **The One Who Stayed**
- Rook — **Tempered Foundation**
- Selah — **Rooted in Light**
- Cipher — **Signal to Reality**
- Vesper — **Spotlight Protocol**
- Ember — **Reignite Protocol**
- Amara — **The Courage to Connect**
- Cassian — **The Keeper's Ledger**
- Saffron — **The Fire We Feed**

### Treasury Command

Treasury Command is an entirely local manual money-management section. It records paychecks, expenses, dining purchases, recurring bills and payments, debt balances and payments, and savings goals and contributions. It never connects to a bank or sends financial data anywhere. Amounts can be masked while the screen is open, and every Treasury record is included in the integrity-checked Archive Shield save.

Each week can have a spending limit, dining limit, savings target, debt target, and one written intention. The Weekly Review summarizes what actually happened and grants its displayed reward exactly once. Budget Stability is a transparent coaching score; it cannot reduce core XP, class, streaks, mission results, or permanent progress.

Each System day independently has a 75% chance to open **No Eating Out**. Passing grants the displayed account XP and Stewardship progress. Logging an eating-out expense or choosing failure records the result honestly and lowers Budget Stability only. A short recovery debrief restores half of that signal penalty and prepares an easier next choice.

Only one questline is active at a time; beginning or resuming one pauses the other without losing progress. Each chapter has three objectives, a fixed idempotent XP reward, and story text. Chapters never expire or fail. Completing all five unlocks that companion's unique legendary title.

Occasional Party Banter can follow a completed mission. Its chance follows the selected companion frequency and is never required for rewards. Major Class, account-level milestone, and achievement overlays become full-party celebrations. A heart control can preserve any meaningful line in Words to Carry; the copied message remains available even after the original toast is dismissed.

The universal Help control opens Snow's About & Help briefing. It explains every destination; the difference between account levels, classes, custom System titles, and earned achievement titles; the complete Class ladder and qualification requirements; challenges and events; what to do after a hard day; and where local data lives. A longer nontechnical guide is available at [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).

Rare daily events are optional and persisted before display. Each new System day has a 7% chance of an Emergency Quest, a 5% chance of a Mission Pass, and an 88% chance of no rare event. Declining or missing an Emergency Quest has no penalty. A Mission Pass protects one pending required mission without spending a monthly protected exception, but it does not award that mission's XP.

## Local development

Node.js 20 or later is recommended. The project uses pnpm and a locked dependency graph.

```bash
corepack enable
pnpm install
pnpm run dev
```

Useful checks:

```bash
pnpm run test
pnpm run lint
pnpm run build
pnpm run preview
pnpm run format
pnpm run test:simulator
pnpm run icons
```

`pnpm run test:simulator` verifies deterministic pacing at 7, 30, and 90 days, one year, and five years across several completion rates. Simulator code is not imported into the production app. `pnpm run icons` regenerates the original local icons without downloading art.

The production output is `dist/`. Relative assets and hash routing allow it to run from the private Sites address.

## Put it on an iPhone with private Sites hosting

The production app is published through the private Sites project and requires the owner’s sign-in.
Open its HTTPS address in Safari, complete the private sign-in, tap Safari’s **Share** button, choose
**Add to Home Screen**, and tap **Add**. Launch The System from that icon.

After one successful online load, the app shell and complete core campaign work offline. Campaign
data stays on that iPhone—not in the source repository or hosting service. AI Headquarters and
YouTube Studio synchronization are optional online features. Export a save before clearing Safari
data or changing phones.

When a new private Sites release is published, open the app online once. Use **Update Center → Check
for update** if the prompt does not appear automatically. The service worker installs the release
without deleting or re-adding the home-screen app, and earlier saves migrate automatically to the
current Version 23 format. Exporting through Archive Shield before any major update is still
recommended.

## Save, restore, and reset

Open **Update Center → Archive Shield** or **Settings → Archive Shield · Local Data**:

- **Export full save** downloads a dated JSON file containing the entire campaign, including Training Hall assignments and history, Treasury records, briefings, Campaign Arcs, quest progress, Councils, party history, settings, unlocks, cosmetics, reports, and app metadata.
- **Import save** inspects the file first and shows candidate name, level, class, and export date. It validates size, schema, required records, duplicate IDs, impossible values, unsafe object keys, supported version, and checksum before confirmation.
- A local snapshot is made before each daily finalization, import, and reset. The newest five remain available in Settings. The newest valid snapshot is also offered from onboarding after reset.
- **Reset app data** is isolated from ordinary controls, offers an export, requires typing `RESET`, and makes one final snapshot.

Replacement and restoration happen in one IndexedDB transaction. A failed write rolls back instead of leaving a partial campaign.

Save files can contain private notes. Store exported copies somewhere you trust.

## System rules

### System days

A System day uses the chosen reset time and IANA time zone. The app reevaluates the day on launch, focus, and visibility changes. Missing days and unresolved reviews are created once and remain resumable.

### XP, levels, and stats

Account and stat XP use smooth quadratic curves from `src/config/balance.ts`. Mission completion writes one account transaction and a transaction for each affected stat. Stable transaction IDs prevent double rewards when a phone button is tapped twice.

Undo creates inverse transactions and is available only in the active System day. Finalized history is retained. Account levels are never removed as punishment; stat decay is delayed, small, momentum-dependent, recovery-aware, and bounded by lifetime floors.

### Missions and Perfect Days

Mission definitions use stable IDs. In **Settings → Mission Configuration**, missions can be enabled, renamed, described, recategorized, scheduled by weekday, and made optional. Hydration, sleep, journal, reading, and practice templates are provided, along with a blank custom mission.

Optional missions award their configured XP but never determine Perfect Day status. Disabled or changed missions do not erase existing daily records.

### Challenges, classes, and reports

Weekly/monthly selection is deterministic, avoids recent repeats where possible, and scales within a bounded difficulty ceiling based on recent completion. Boss Challenges are optional. Failed Class Trials preserve progress and enter a saved cooldown.

Classes are separate from levels. Qualification checks account level, completions, days, Discipline, balanced stats, challenge completions, and a final trial. Weekly and monthly reports are saved locally. Their focus suggestion always identifies the lowest category completion rate; ties use fixed category order, and no health or personality inference is made.

## Project layout

```text
src/
  assets/       Bundled local font and its license
  components/   Shared interface, companion, briefing, Campfire, Council, banter, favorite, event, recovery, mission, and chart components
  config/       Missions, Training Hall circuits, companions, questlines, releases, support, banter, milestones, rare events, achievements, challenges, titles, and balance
  db/           Dexie schema, repositories, seed data, migrations, snapshots, and save import
  dev/          Development-only deterministic pacing simulator
  game/         XP, stats, Training Hall, companions, Campaigns, questlines, briefings, Councils, Campfires, Party Chat, support, favorites, banter, rare events, rank, report, and atomic transaction engines
  pages/        Onboarding, System, Missions, Training Hall, Status, Challenges, Campaigns, Headquarters, Party Channel, Update Center, About, Archive, and Settings
  services/     PWA update coordination
  store/        Zustand application state
  tests/        Date, XP, rank, content, pacing, and transaction behavior
  types/        Persistent TypeScript models
  utils/        Date, IDs, privacy labels, formatting, tones, and vibration helpers
```

React screens do not query IndexedDB directly. Repositories/services own UI data access; the game engine owns reward and progression transactions.

## Privacy and security

All campaign data and private notes stay in IndexedDB unless explicitly exported. Privacy Screen blurs the app-switcher view, and the sensitive mission has a configurable alias without changing its stable record ID.

Imported JSON is size-limited, parsed as data rather than code, rejects prototype-related property names, validates required data and impossible negative values, and never becomes HTML. A restrictive Content Security Policy is declared in `index.html`.

Run `pnpm audit` before releases and review dependency changes in `pnpm-lock.yaml`. A compromised phone, browser extension, exported-file location, hosting sign-in, OpenAI account, or connected Google account is outside the protection an offline web app can provide.

The app does not diagnose health, prescribe dangerous exercise, use monetary penalties, or connect spiritual or sexual setbacks to exercise punishment. Recovery language is constructive and non-shaming. Static iPhone PWAs cannot guarantee scheduled background notifications, so the app keeps notification permissions off and does not promise reminders it cannot reliably deliver.
