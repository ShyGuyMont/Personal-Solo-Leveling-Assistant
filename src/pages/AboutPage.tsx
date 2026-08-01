import {
  Archive,
  ArrowLeft,
  BookOpenCheck,
  CircleGauge,
  CloudOff,
  Diamond,
  HeartHandshake,
  HelpCircle,
  ListChecks,
  Settings,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';

const DESTINATIONS = [
  { to: '/', icon: CircleGauge, title: 'System', text: 'See today’s progress, current rank, and quick missions.' },
  { to: '/missions', icon: ListChecks, title: 'Missions', text: 'Complete, review, or configure the actions that build your stats.' },
  { to: '/status', icon: Shield, title: 'Status', text: 'Understand your level, rank, stats, achievements, and collection.' },
  { to: '/challenges', icon: Diamond, title: 'Challenges', text: 'Follow longer weekly, monthly, boss, and recovery objectives.' },
  { to: '/party-chat', icon: Users, title: 'Party Channel', text: 'Check in, request direct support, or revisit saved messages.' },
  { to: '/archive', icon: Archive, title: 'Archive', text: 'Review permanent history, reports, check-ins, and Party records.' },
  { to: '/settings', icon: Settings, title: 'Settings', text: 'Change appearance, companions, missions, privacy, and backups.' },
];

export function AboutPage() {
  const profile = useGameStore((state) => state.profile);
  const snow = getCompanion('snow');
  const firstName = profile?.displayName.trim().split(/\s+/)[0] || 'Hunter';

  return (
    <div className="page about-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/"><ArrowLeft size={17} /> Back to System</Link>
        <span className="party-chat__saved"><HelpCircle size={15} /> Guide available offline</span>
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
            “It turns the real choices you care about into visible missions, stats, levels, and a long-term record. The game language is here to make growth feel alive—not to decide your worth.”
          </p>
        </div>
      </section>

      <section className="about-start panel">
        <header className="section-header">
          <div><p className="eyebrow">IF YOU FEEL LOST</p><h2>Use this three-step path</h2></div>
          <Sparkles size={21} />
        </header>
        <ol>
          <li><span>1</span><div><strong>Open Missions</strong><p>Choose one realistic objective and complete it when it is genuinely done.</p></div></li>
          <li><span>2</span><div><strong>Return to System</strong><p>See the XP, stat growth, challenge progress, and companion response it created.</p></div></li>
          <li><span>3</span><div><strong>Use the Party Channel when needed</strong><p>Check in emotionally, ask for focused support, or save words you want to carry.</p></div></li>
        </ol>
      </section>

      <section className="about-destinations">
        <header className="section-header">
          <div><p className="eyebrow">WHERE DO I GO?</p><h2>Every part of the interface</h2></div>
        </header>
        <div className="about-destinations__grid">
          {DESTINATIONS.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="panel">
              <span><Icon size={20} /></span>
              <div><strong>{title}</strong><p>{text}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-explainer panel">
        <header className="section-header">
          <div><p className="eyebrow">HOW THE SYSTEM WORKS</p><h2>Plain-language briefing</h2></div>
          <BookOpenCheck size={21} />
        </header>
        <details open>
          <summary>What do XP, levels, and stats mean?</summary>
          <p>Completing a real mission awards account XP and XP for related stats. Account XP raises your overall level. Stat XP shows which parts of your life you are strengthening. These are motivational records—not a measure of your value.</p>
        </details>
        <details>
          <summary>How do ranks work?</summary>
          <p>Ranks require balanced long-term progress, completed days, mission history, and certain challenge or trial requirements. They cannot be purchased or granted by a single easy action.</p>
        </details>
        <details>
          <summary>What are Challenges and rare events?</summary>
          <p>Challenges create longer arcs across a week, month, or special trial. Rare events occasionally offer an optional Emergency Quest or a Mission Pass. Declining an optional event does not punish you.</p>
        </details>
        <details>
          <summary>What happens when I miss a day?</summary>
          <p>The Archive keeps an honest record, but the System is designed for returning. Recovery Mode, protected exceptions, Mission Passes, and companion comeback support help you continue without pretending difficult circumstances did not happen.</p>
        </details>
        <details>
          <summary>What do the companions change?</summary>
          <p>Snow, Rook, Selah, Cipher, and Haven provide context, encouragement, check-ins, direct support, banter, and milestone celebrations. Their words never secretly change XP, streaks, mission results, or rank requirements.</p>
        </details>
      </section>

      <div className="about-info-grid">
        <section className="panel">
          <HeartHandshake size={23} />
          <p className="eyebrow">ON A HARD DAY</p>
          <h2>Reduce the load without abandoning the journey.</h2>
          <p>Use Direct Support, activate Recovery Mode in Settings, excuse a mission when appropriate, or simply choose one honest step. The System is a tool for support—not medical care, crisis support, or a substitute for trusted people.</p>
          <Link to="/party-chat" className="button button--primary">Open Party Channel</Link>
        </section>
        <section className="panel">
          <CloudOff size={23} />
          <p className="eyebrow">PRIVATE & OFFLINE</p>
          <h2>Your campaign remains on this device.</h2>
          <p>The app does not require an account or remote AI. Export a backup from Settings before switching phones, clearing browser data, or installing a major update.</p>
          <Link to="/settings" className="button button--ghost">Open Settings & Backups</Link>
        </section>
      </div>

      <section className="about-snow-note panel">
        <img src={getCompanionImage(snow.image)} alt="" />
        <div>
          <strong>Snow’s final note</strong>
          <p>“You do not need to master every screen today. Complete one real thing, let the System record it, and learn the rest when it becomes useful. I’ll keep the guide here.”</p>
        </div>
      </section>
    </div>
  );
}
