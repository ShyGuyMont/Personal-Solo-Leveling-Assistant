# The System

The System is a private, phone-first, offline progression RPG. The player is the real user: daily missions build account XP, stats, streaks, challenge progress, levels, achievements, cosmetics, and long-term rank qualification.

The design, writing, interface, icons, animations, and generated tones are original. No franchise art, logos, dialogue, interface assets, or sound recordings are included.

## Included

- Seven default missions across Faith, Discipline, Physical, Creator, and Character
- Custom and template missions, weekday schedules, optional completion types, notes, and stable history IDs
- Daily Review, idempotent rewards, current-day undo, Perfect and Protected Perfect Days, humane momentum/decay, and Recovery Mode
- System and Clean interface styles, plus Abyss and light Daybreak color themes with selectable visual intensity
- Five original chibi companion characters with daily greetings, stat-specific encouragement, occasional two-character banter, cinematic milestone celebrations, adjustable frequency, and individual mute controls
- A private Party Channel with ten-mood Check-Ins, six Direct Support topics, whole-party or one-to-one responses, history-aware dialogue rotation, and locally saved conversations that never affect XP or streaks
- Words to Carry favorites for saving companion messages from Check-Ins, Direct Support, banter, milestones, and ordinary reactions
- A Snow-guided About & Help screen available from every page, with plain-language navigation, rules, privacy guidance, and a three-step starting path
- One saved rare-event roll per System day: optional Emergency Quests and claimable Mission Passes without refresh rerolls
- F through World Class rank qualifications and seven saved Rank Trials
- 30+ weekly, 20+ monthly, six Boss, and ten supportive Recovery challenges
- 40+ titles, 50 achievements, 12 cosmetics, and full progression overlays
- Archive calendar, transparent weekly/monthly reports, history, stat analysis, and deterministic focus suggestions
- Versioned IndexedDB storage, repository/service boundaries, migrations, immutable reward transactions, and audit entries
- Save preview/import with an 8 MB limit, schema and value validation, unsafe-key rejection, SHA-256 integrity verification, atomic replacement, and five rolling recovery snapshots
- Privacy Screen, sensitive-mission alias, global recovery screen, reduced motion, optional generated tones, and honest notification limitations
- Installable iPhone PWA with safe-area support, offline caching, code-split screens, and user-controlled update prompts

There is no login, backend, external API, analytics, advertising, tracking, or paid service.

## Version 2 companion party

- **Snow, The Constant** is the primary whole-journey companion. She greets each new System day and supports major milestones, difficult seasons, and victories. She has long black hair, a pearl-white and navy support jacket, and an ice-blue System halo.
- **Rook, The Vanguard** supports Strength, Endurance, and Vitality. He is bold, competitive, and protective, with graphite-and-gold armor and amber energy.
- **Selah, The Beacon** supports Faith, Wisdom, and spiritual consistency. She is warm and grounded, with long braids, an ivory-and-navy mantle, and a sun-gold halo.
- **Cipher, The Strategist** supports Discipline, Focus, Willpower, Creativity, YouTube, and ARC work. They are precise, dryly funny, and demanding, with a navy tech jacket and violet-cyan tactical glyphs.
- **Haven, The Guardian** supports Character, Empathy, Recovery, and comebacks. He is patient and quietly humorous, with silver-streaked hair, a teal field coat, and a translucent shield glow.

Companions never judge missed missions. Snow checks in once per System day, while stat level-ups notify the matching specialist. Ordinary mission reactions follow the selected Off, Quiet, Balanced, or Talkative setting. All five portraits use a cohesive premium chibi RPG style, are bundled locally, and require no network connection.

The Party Check-In lets the user choose Energized, Proud, Good, Okay, Tired, Stressed, Frustrated, Discouraged, Lonely, or Not sure. Snow opens and closes each conversation while Rook, Selah, Cipher, and Haven answer in character. Each companion has emotion-specific dialogue pools, and the app uses the least recently heard line only after every unused line in that pool has been heard. Check-ins are saved locally in the Archive and intentionally award no XP, alter no streak, and create no penalty.

Direct Support offers Motivation, Make a plan, Faith & perspective, Calm down, Recover, and Celebrate. The user can hear from the full party or intentionally open a focused channel with Snow, Rook, Selah, Cipher, or Haven. Support uses separate topic-specific dialogue pools with history-aware rotation. It is selection-based, works offline, and changes no progression data.

Occasional Party Banter can follow a completed mission. Its chance follows the selected companion frequency and is never required for rewards. Major rank, account-level milestone, and achievement overlays become full-party celebrations. A heart control can preserve any meaningful line in Words to Carry; the copied message remains available even after the original toast is dismissed.

The universal Help control opens Snow's About & Help briefing. It explains every destination, the difference between levels, stats, ranks, challenges, and events, what to do after a hard day, and where local data lives. A longer nontechnical guide is available at [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).

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

When updating an existing installation, commit and push the changed project through GitHub Desktop, wait for the Pages workflow to succeed, then open the app online once. The service worker will offer the new release without replacing campaign progress. Earlier saves are migrated automatically to the version 6 database, but exporting a save before any major update is still recommended.

## Save, restore, and reset

Open **Settings → Local Data**:

- **Export save** downloads a dated JSON file containing the full campaign, settings, unlocks, cosmetics, reports, and app metadata.
- **Import save** inspects the file first and shows candidate name, level, rank, and export date. It validates size, schema, required records, duplicate IDs, impossible values, unsafe object keys, supported version, and checksum before confirmation.
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

### Challenges, ranks, and reports

Weekly/monthly selection is deterministic, avoids recent repeats where possible, and scales within a bounded difficulty ceiling based on recent completion. Boss Challenges are optional. Failed Rank Trials preserve progress and enter a saved cooldown.

Ranks are separate from levels. Qualification checks account level, completions, days, Discipline, balanced stats, challenge completions, and a final trial. Weekly and monthly reports are saved locally. Their focus suggestion always identifies the lowest category completion rate; ties use fixed category order, and no health or personality inference is made.

## Project layout

```text
src/
  assets/       Bundled local font and its license
  components/   Shared interface, companion, banter, favorite, event, recovery, mission, and chart components
  config/       Missions, companions, support, banter, milestones, rare events, achievements, challenges, titles, and balance
  db/           Dexie schema, repositories, seed data, migrations, snapshots, and save import
  dev/          Development-only deterministic pacing simulator
  game/         XP, stats, companions, Party Chat, support, favorites, banter, rare events, rank, report, and atomic transaction engines
  pages/        Onboarding, System, Missions, Status, Challenges, Party Channel, About, Archive, and Settings
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
