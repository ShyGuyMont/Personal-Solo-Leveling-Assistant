# The System

The System is a private, phone-first, offline progression RPG. The player is the real user: daily missions build account XP, stats, streaks, challenge progress, levels, achievements, cosmetics, and long-term Class qualification.

The design, writing, interface, icons, animations, and generated tones are original. No franchise art, logos, dialogue, interface assets, or sound recordings are included.

## Included

- Six default missions across Faith, Discipline, Physical, Creator, and Character
- Custom and template missions, weekday schedules, optional completion types, notes, and stable history IDs
- Daily Review, idempotent rewards, current-day undo, Perfect and Protected Perfect Days, humane momentum/decay, and Recovery Mode
- System and Clean interface styles, plus Abyss and light Daybreak color themes with selectable visual intensity
- Nine original chibi companion characters with daily greetings, stat-specific encouragement, shame-free accountability, occasional two-character banter, cinematic milestone celebrations, adjustable frequency, and individual mute controls
- A private Party Channel with ten-mood Check-Ins, six Direct Support topics, whole-party or one-to-one responses, history-aware dialogue rotation, and locally saved conversations that never affect XP or streaks
- Full Party Headquarters with the complete roster, support shortcuts, saved-message counts, Ember's Lock-In Protocol, Amara's Heartweaver Protocol, permanent Weekly Campfires, and Monthly Councils
- Weekly Campfire Recaps generated once per completed week from finalized mission data, with an in-character review from every companion and no hidden rewards or penalties
- Monthly Councils generated after a completed month with nine fact-aware party messages, permanent history, and an optional next-month intention
- Snow's optional Daily Command Briefing with Low, Steady, and High capacity planning, broad completion targets, and transparent 1×–2.5× scheduled-mission XP outcomes
- Rook and Ember’s Training Hall with four home circuits, four structured progressive gym sessions, set/load/rep/rest tracking, Conditioning and Recovery logs, a one-time Home + Gym Double Deployment surge, and a full-party post-workout scene
- Saffron’s Kitchen with twelve rotating no-bean, no-pea recipes, guided ingredients and steps, substitutions, food-safety and leftover guidance, three rewarded weekly orders, and permanent cooking history
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

There is no login, backend, external API, analytics, advertising, tracking, or paid service.

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
chef jacket, forest-green apron, and tangerine System flame. Her Kitchen rotates among twelve meals
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
- **Cipher, The Strategist** supports Discipline, Focus, Willpower, Creativity, YouTube, and ARC work. They are precise, dryly funny, and demanding, with a navy tech jacket and violet-cyan tactical glyphs.
- **Haven, The Guardian** supports Character, Recovery, balance, and comebacks. He is patient and quietly humorous, with silver-streaked hair, a teal field coat, and a translucent shield glow.
- **Ember, The Ignition** supports accountability, re-entry, and locking back in after momentum slips. She is fiery, blunt, and fiercely supportive, with copper-red hair, amber eyes, charcoal-and-crimson gear, and an ember-orange System halo.
- **Amara, The Heartweaver** supports Empathy, relationships, communication, repair, healthy boundaries, belonging, and shame-free sexual-integrity support in the Sanctuary. She is warm, perceptive, and playfully romantic, with warm olive skin, wavy chestnut hair, luminous pink eyes, rose-and-plum battle attire, and a radiant pink System halo.
- **Cassian, The Steward** supports Stewardship, budgeting, savings, debt reduction, spending awareness, and financial recovery. He is a calm, exacting, never-shaming white accountant type with fair skin, tousled light-brown hair, hazel eyes behind round gold-rimmed glasses, a pencil behind one ear, a dark ledger, and a tailored emerald-and-navy Steward coat.
- **Saffron, The Flame Chef** supports cooking, meal preparation, training nutrition, leftovers, and reducing expensive convenience choices. She is theatrical, fiery, and nurturing, with warm olive-brown skin, vivid green eyes, dark curls, a white chef jacket, forest-green apron, and tangerine flame accents.

Companions never judge missed missions. Snow checks in once per System day, while stat level-ups notify the matching specialist. Ember may open one Lock-In signal when the previous day is unfinished or finalized below 50%; her response is direct but never removes XP, changes a streak, or attacks the user's worth. Amara owns the Empathy stat and ordinary Character-path relationship responses; every relationship objective offers a safe alternative and never requires contact with someone unsafe. Cassian owns the Stewardship stat and Treasury coaching; Budget Stability never removes account XP, class, streaks, or mission credit. Saffron runs the Kitchen without body shame or punishment dieting. Ordinary mission reactions follow the selected Off, Quiet, Balanced, or Talkative setting. All nine portraits use a cohesive premium chibi RPG style, are bundled locally, and require no network connection.

The Party Check-In lets the user choose Energized, Proud, Good, Okay, Tired, Stressed, Frustrated, Discouraged, Lonely, or Not sure. Snow opens and closes each conversation while Rook, Selah, Cipher, Haven, Ember, Amara, and Cassian answer in character. Each companion has emotion-specific dialogue pools, and the app uses the least recently heard line only after every unused line in that pool has been heard. Check-ins are saved locally in the Archive and intentionally award no XP, alter no streak, and create no penalty.

Direct Support offers Motivation, Make a plan, Faith & perspective, Calm down, Recover, and Celebrate. The user can hear from the full party or intentionally open a focused channel with any of the nine companions, including Amara, Cassian, and Saffron. Support uses separate topic-specific dialogue pools with history-aware rotation. It is selection-based, works offline, and changes no progression data.

At the start of a new week, Headquarters can present a saved Campfire Recap for the previous completed week. It counts finalized Daily Reviews, mission records, Treasury progress, and Kitchen Orders, then gives all nine companions distinct commentary based on those facts. Snow closes the gathering. Campfires can be favorited, reopened in Headquarters, and reviewed in the Archive.

After a calendar month with at least one finalized Daily Review, a Monthly Council records mission totals, completion rate, Perfect Days, category balance, relationship actions, Treasury progress, Kitchen Orders, levels, classes, titles, Campaign milestones, and Companion Quest chapters. Snow opens and closes; all nine specialists speak between. Councils are permanent, never change scoring, and include an optional next-month intention.

### Campaign Command

Snow's Daily Command Briefing asks how much capacity is available—Low, Steady, or High—then recommends a Main Quest, Support Quest, and optional Bonus Quest from the existing daily list. Low preserves ordinary 1× mission XP. Steady requires its priorities and at least 65% of scheduled missions for 1.5×, rising to 1.75× on a Full Clear. High requires all three priorities and at least 80% for 2×, rising to 2.5× on a Full Clear. Missing the target removes nothing.

Campaign Arcs are written by the user and carry no automatic XP. They support long-term purpose, category, companion guide, optional target date, unlimited milestones, pause/resume, completion, and archive states.

Every companion also has one authored five-chapter questline:

- Snow — **The One Who Stayed**
- Rook — **Tempered Foundation**
- Selah — **Rooted in Light**
- Cipher — **Signal to Reality**
- Haven — **Shelter Without Stagnation**
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

The production output is `dist/`. Relative assets and hash routing allow it to run from a GitHub repository subpath.

## Put it on an iPhone with GitHub Pages

An iPhone cannot install this app directly from the Windows project folder. Safari requires an HTTPS address. The included GitHub Pages workflow supplies that address without a paid host.

1. Create a new, empty GitHub repository. Do not add a README or license during repository creation.
2. Open a terminal in this project folder and push the project:

   ```bash
   git init
   git add .
   git commit -m "Initial phone-ready release"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Open **Actions** and wait for “Deploy The System to GitHub Pages” to finish.
6. Open the deployment URL on the iPhone in Safari. It will resemble `https://YOUR-NAME.github.io/YOUR-REPOSITORY/`.
7. Tap Safari’s **Share** button, choose **Add to Home Screen**, and tap **Add**.
8. Launch The System from its Home Screen icon.

After one successful online load, the app shell works offline. Campaign data stays on that iPhone—not in GitHub or on a server. Export a save before clearing Safari data or changing phones.

If the workflow is unavailable, enable Actions under **Settings → Actions → General**. If the site is blank, confirm Pages uses GitHub Actions, confirm the workflow uploaded `dist/`, and hard-refresh once after deployment.

When updating an existing installation, commit and push the changed project through GitHub Desktop, wait for the Pages workflow to succeed, then open the app online once. Open **Update Center** and choose **Check for update** if the prompt does not appear automatically. The service worker installs the release without deleting or re-adding the home-screen app. Earlier saves are migrated automatically to the version 10 database, but exporting through Archive Shield before any major update is still recommended.

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

Run `pnpm audit` before releases and review dependency changes in `pnpm-lock.yaml`. A compromised phone, browser extension, exported-file location, or GitHub account is outside the protection an offline web app can provide.

The app does not diagnose health, prescribe dangerous exercise, use monetary penalties, or connect spiritual or sexual setbacks to exercise punishment. Recovery language is constructive and non-shaming. Static iPhone PWAs cannot guarantee scheduled background notifications, so the app keeps notification permissions off and does not promise reminders it cannot reliably deliver.
