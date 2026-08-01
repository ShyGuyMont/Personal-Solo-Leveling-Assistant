import {
  Archive,
  ArrowLeft,
  BookOpenCheck,
  CircleGauge,
  CloudOff,
  CloudDownload,
  Diamond,
  HeartHandshake,
  HelpCircle,
  ListChecks,
  Map,
  Settings,
  Shield,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { RANK_REQUIREMENTS } from '@/config/balance';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { TITLE_LIBRARY } from '@/config/titles';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';

const DESTINATIONS = [
  {
    to: '/',
    icon: CircleGauge,
    title: 'System',
    text: 'See today’s progress, current rank, and quick missions.',
  },
  {
    to: '/missions',
    icon: ListChecks,
    title: 'Missions',
    text: 'Complete, review, or configure the actions that build your stats.',
  },
  {
    to: '/status',
    icon: Shield,
    title: 'Status',
    text: 'Understand your level, rank, stats, achievements, and collection.',
  },
  {
    to: '/challenges',
    icon: Diamond,
    title: 'Challenges',
    text: 'Follow longer weekly, monthly, boss, and recovery objectives.',
  },
  {
    to: '/headquarters',
    icon: Users,
    title: 'Party Headquarters',
    text: 'Meet the full roster, open support channels, and review weekly Campfires.',
  },
  {
    to: '/party-chat',
    icon: Users,
    title: 'Party Channel',
    text: 'Check in, request direct support, or revisit saved messages.',
  },
  {
    to: '/campaigns',
    icon: Map,
    title: 'Campaign Command',
    text: 'Create long-term Campaign Arcs or follow any companion’s five-chapter questline.',
  },
  {
    to: '/treasury',
    icon: WalletCards,
    title: 'Treasury Command',
    text: 'Plan and review paychecks, spending, bills, debt, savings, and Cassian directives.',
  },
  {
    to: '/archive',
    icon: Archive,
    title: 'Archive',
    text: 'Review permanent history, reports, check-ins, and Party records.',
  },
  {
    to: '/settings',
    icon: Settings,
    title: 'Settings',
    text: 'Change appearance, companions, missions, privacy, and backups.',
  },
  {
    to: '/update-center',
    icon: CloudDownload,
    title: 'Update Center',
    text: 'Check the installed version, export a protected save, and install waiting releases.',
  },
];

export function AboutPage() {
  const profile = useGameStore((state) => state.profile);
  const snow = getCompanion('snow');
  const firstName = profile?.displayName.trim().split(/\s+/)[0] || 'Hunter';

  return (
    <div className="page about-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Back to System
        </Link>
        <span className="party-chat__saved">
          <HelpCircle size={15} /> Guide available offline
        </span>
      </div>

      <section className="about-snow panel">
        <div className="about-snow__portrait">
          <img src={getCompanionImage(snow.image)} alt="Snow, The Constant" />
          <span />
        </div>
        <div>
          <p className="eyebrow">SNOW · SYSTEM ORIENTATION</p>
          <h1>This is your personal progression System, {firstName}.</h1>
          <p>
            “It turns the real choices you care about into visible missions, stats, levels, and a
            long-term record. The game language is here to make growth feel alive—not to decide your
            worth.”
          </p>
        </div>
      </section>

      <section className="about-start panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">IF YOU FEEL LOST</p>
            <h2>Use this three-step path</h2>
          </div>
          <Sparkles size={21} />
        </header>
        <ol>
          <li>
            <span>1</span>
            <div>
              <strong>Open Missions</strong>
              <p>Choose one realistic objective and complete it when it is genuinely done.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Return to System</strong>
              <p>See the XP, stat growth, challenge progress, and companion response it created.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Use the Party Channel when needed</strong>
              <p>Check in emotionally, ask for focused support, or save words you want to carry.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="about-destinations">
        <header className="section-header">
          <div>
            <p className="eyebrow">WHERE DO I GO?</p>
            <h2>Every part of the interface</h2>
          </div>
        </header>
        <div className="about-destinations__grid">
          {DESTINATIONS.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="panel">
              <span>
                <Icon size={20} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-explainer panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">HOW THE SYSTEM WORKS</p>
            <h2>Plain-language briefing</h2>
          </div>
          <BookOpenCheck size={21} />
        </header>
        <details open>
          <summary>What are my level, rank, and two kinds of title?</summary>
          <div className="about-progression-grid">
            <article>
              <strong>Account Level</strong>
              <p>
                Your overall XP level. Completing real missions and challenge rewards raises it.
              </p>
            </article>
            <article>
              <strong>Rank</strong>
              <p>
                Your long-term classification. Meet every requirement, then pass the Rank Trial.
              </p>
            </article>
            <article>
              <strong>Custom System Title</strong>
              <p>
                A nickname you write for yourself. It is cosmetic and never changes XP, stats, or
                rank.
              </p>
            </article>
            <article>
              <strong>Achievement Title</strong>
              <p>
                One of {TITLE_LIBRARY.length} distinctions earned from recorded accomplishments.
                Choose an unlocked one to equip in Settings.
              </p>
            </article>
          </div>
          <p>
            Stat XP separately shows which parts of your life you are strengthening. Every number
            here is a motivational record—not a measure of your value.
          </p>
        </details>
        <details>
          <summary>How do ranks work?</summary>
          <p>
            You begin at F Rank. The ladder is F → E → D → C → B → A → S → World Class. For each
            step, meet all six requirements shown below; then the matching Rank Trial becomes
            available. Passing it advances you exactly one rank. A failed trial keeps your rank and
            earned progress, enters a cooldown, and can be attempted again later.
          </p>
          <div className="about-rank-grid">
            {RANK_REQUIREMENTS.filter((requirement) => requirement.rank !== 'F').map(
              (requirement) => (
                <article key={requirement.rank}>
                  <header>
                    <span>QUALIFY FOR</span>
                    <strong>{requirement.rank}</strong>
                  </header>
                  <ul>
                    <li>
                      <b>Account level</b>
                      <span>{requirement.minimumLevel}</span>
                    </li>
                    <li>
                      <b>Missions</b>
                      <span>{requirement.lifetimeCompletions.toLocaleString()}</span>
                    </li>
                    <li>
                      <b>Completed days</b>
                      <span>{requirement.completedDays.toLocaleString()}</span>
                    </li>
                    <li>
                      <b>Discipline</b>
                      <span>Level {requirement.disciplineLevel}</span>
                    </li>
                    <li>
                      <b>Balanced stats</b>
                      <span>
                        {requirement.balancedStatsRequired} at Level {requirement.balancedStatLevel}
                      </span>
                    </li>
                    <li>
                      <b>Challenges</b>
                      <span>{requirement.challengesCompleted}</span>
                    </li>
                  </ul>
                </article>
              ),
            )}
          </div>
          <p>
            <strong>Highest classification:</strong> World Class. Numerical account and stat levels
            can continue as high as Level 999. Once a rank is earned, missed days do not demote it.
          </p>
        </details>
        <details>
          <summary>How does the System decide which achievement titles I earn?</summary>
          <p>
            Titles unlock automatically from objective facts already recorded by the app—mission
            totals, Perfect Days, streaks, finalized reviews, stat levels, completed challenges,
            Recovery or exception milestones, and ranks. For example, Steady Hand unlocks at 25
            missions, Unbroken Focus at Focus Level 20, Deep Root at Faith Level 30, Rank Breaker
            after a rank-up, and Beyond Measure at World Class. Unlocks are permanent, are not
            random, and do not automatically replace the title you chose to equip.
          </p>
        </details>
        <details>
          <summary>What are Challenges and rare events?</summary>
          <p>
            Challenges create longer arcs across a week, month, or special trial. Rare events
            occasionally offer an optional Emergency Quest or a Mission Pass. Declining an optional
            event does not punish you.
          </p>
        </details>
        <details>
          <summary>What is Snow’s Daily Command Briefing?</summary>
          <p>
            Once per System day, Snow asks whether your real capacity is Low, Steady, or High. Main
            is the first priority, Support is the second, and Bonus is High Capacity’s third
            priority. These are existing scheduled missions—not extra tasks—and completing only the
            priority slots does not automatically clear a Steady or High command.
          </p>
          <p>
            <strong>Low</strong> has no completion quota and keeps normal 1× mission XP.{' '}
            <strong>Steady</strong> requires Main, Support, and at least 65% of the full scheduled
            list for 1.5× mission XP; clearing the entire list raises it to 1.75×.{' '}
            <strong>High</strong> requires Main, Support, Bonus, and at least 80% for 2×; clearing
            the entire list raises it to 2.5×.
          </p>
          <p>
            Snow locks the scheduled count and chosen command when you confirm it. The multiplier is
            verified and awarded during the next Daily Review to account and stat XP earned from
            completed scheduled missions. Perfect Day rewards still apply separately. Rare events,
            companion quests, Treasury rewards, and other special XP are never multiplied. Missing a
            target removes nothing: you keep every normal reward and simply do not receive the
            command bonus. A protected exception counts as resolved for the command, but creates no
            mission XP to multiply. You can skip the briefing before confirming it or disable future
            briefings in Settings.
          </p>
        </details>
        <details>
          <summary>What is the difference between Campaign Arcs and Companion Questlines?</summary>
          <p>
            <strong>Campaign Arcs</strong> are goals you define. Give one a purpose, path, companion
            guide, optional target date, and as many milestones as useful; then pause, resume,
            complete, or archive it. <strong>Companion Questlines</strong> are authored stories:
            every companion has five chapters with three objectives each. Only one is active at a
            time, but paused progress is permanent. Questlines have no failure timer or decay, and
            completing all five chapters unlocks that companion’s unique legendary title.
          </p>
        </details>
        <details>
          <summary>How does Treasury Command work?</summary>
          <p>
            Treasury Command is a private manual money planner led by Cassian. Log income and
            spending, track bills, debt, and savings, set realistic weekly targets, then finalize a
            Weekly Review for its displayed one-time reward. Budget Stability is a coaching signal,
            not a punishment: it never removes account XP or changes rank, streaks, or missions. No
            bank is connected, and all Treasury records are included in Archive Shield exports.
          </p>
        </details>
        <details>
          <summary>How does Cassian’s No Eating Out challenge work?</summary>
          <p>
            Each System day has an independent 75% chance to receive the optional directive. You can
            decline before or after accepting with no reward, penalty, or congratulatory message.
            Passing grants the displayed account XP plus Stewardship progress. If you accept and
            then order out, record the result honestly: no core XP is removed. Budget Stability
            falls temporarily, and a short recovery debrief can restore half of that signal penalty.
            The challenge can be turned off in the Treasury Weekly tab.
          </p>
        </details>
        <details>
          <summary>How do Weekly Campfires and Monthly Councils work?</summary>
          <p>
            Campfires summarize a completed week with at least one finalized Daily Review. Monthly
            Councils assemble all eight companions after a completed calendar month and review
            mission balance, Perfect Days, levels, ranks, titles, Campaign milestones, quest
            chapters, and relationship actions that were actually recorded. Their commentary is
            saved in Headquarters and the Archive, and never changes scoring. The Council also gives
            you an optional place to write one next-month intention.
          </p>
        </details>
        <details>
          <summary>What happens when I miss a day?</summary>
          <p>
            The Archive keeps an honest record, but the System is designed for returning. Recovery
            Mode, protected exceptions, Mission Passes, and companion comeback support help you
            continue without pretending difficult circumstances did not happen.
          </p>
        </details>
        <details>
          <summary>What do the companions change?</summary>
          <p>
            Snow, Rook, Selah, Cipher, Haven, Ember, Amara, and Cassian provide context,
            encouragement, check-ins, direct support, banter, milestone celebrations,
            accountability, weekly Campfires, Monthly Councils, and personal questlines. Amara
            specializes in empathy, relationships, belonging, communication, repair, and healthy
            boundaries; she never requires unsafe contact. Cassian specializes in budgeting, saving,
            debt reduction, spending awareness, and shame-free financial recovery. Companion words
            never secretly change XP, streaks, mission results, or rank requirements.
          </p>
        </details>
        <details>
          <summary>How do updates and the Archive Shield work on my phone?</summary>
          <p>
            Open the Update Center to check GitHub Pages for a new release. When one is waiting,
            export a full save if you want an extra portable copy, then tap Install; the web app
            reloads once and keeps the home-screen installation. Archive Shield exports use a
            checksum and include every current record type. Imports are previewed and validated, and
            the app creates an on-device recovery snapshot before replacing current data.
          </p>
        </details>
      </section>

      <div className="about-info-grid">
        <section className="panel">
          <HeartHandshake size={23} />
          <p className="eyebrow">ON A HARD DAY</p>
          <h2>Reduce the load without abandoning the journey.</h2>
          <p>
            Use Direct Support, activate Recovery Mode in Settings, excuse a mission when
            appropriate, or simply choose one honest step. The System is a tool for support—not
            medical care, crisis support, or a substitute for trusted people.
          </p>
          <Link to="/party-chat" className="button button--primary">
            Open Party Channel
          </Link>
        </section>
        <section className="panel">
          <CloudOff size={23} />
          <p className="eyebrow">PRIVATE & OFFLINE</p>
          <h2>Your campaign remains on this device.</h2>
          <p>
            The app does not require an account or remote AI. Export a backup from Settings before
            switching phones, clearing browser data, or installing a major update.
          </p>
          <Link to="/settings" className="button button--ghost">
            Open Settings & Backups
          </Link>
          <Link to="/update-center" className="button button--ghost">
            Open Update Center
          </Link>
        </section>
      </div>

      <section className="about-snow-note panel">
        <img src={getCompanionImage(snow.image)} alt="" />
        <div>
          <strong>Snow’s final note</strong>
          <p>
            “You do not need to master every screen today. Complete one real thing, let the System
            record it, and learn the rest when it becomes useful. I’ll keep the guide here.”
          </p>
        </div>
      </section>
    </div>
  );
}
