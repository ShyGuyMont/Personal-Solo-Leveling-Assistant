import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Flame,
  Gauge,
  Orbit,
  ScanLine,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChallengeCard } from '@/components/ChallengeCard';
import { ClassEmblem } from '@/components/ClassEmblem';
import { DailyEventCard } from '@/components/DailyEventCard';
import { InstallCard } from '@/components/InstallCard';
import { MissionCard } from '@/components/MissionCard';
import { PartyPulsePanel } from '@/components/PartyPulsePanel';
import { ProgressBar } from '@/components/ProgressBar';
import { SystemCommandCenter } from '@/components/SystemCommandCenter';
import { chooseSystemMessage } from '@/config/messages';
import { getChallengeTemplate } from '@/config/challenges';
import { APP_VERSION } from '@/config/release';
import { getDashboardHistory } from '@/db/repositories';
import { buildAscensionCoreProjection, buildAscensionCoreVitality } from '@/game/ascensionCore';
import { calculateRankQualification } from '@/game/rank';
import { Link } from '@/router';
import { daySeed, formatLongDate, getCurrentHour } from '@/utils/date';
import { STAT_LABELS, formatClassName, formatNumber } from '@/utils/format';
import { useGameStore } from '@/store/useGameStore';
import type { DailyReview, StatTransaction, SystemState } from '@/types/game';

export function DashboardPage() {
  const { profile, progression, stats, settings, missions, todayRecords, challenges, systemDate } =
    useGameStore();
  const [lastReview, setLastReview] = useState<DailyReview>();
  const [recentStats, setRecentStats] = useState<StatTransaction[]>([]);
  const [coreAwakened, setCoreAwakened] = useState(false);
  const [coreVisible, setCoreVisible] = useState(true);
  const coreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void getDashboardHistory().then(({ lastReview: review, recentStats: transactions }) => {
      setLastReview(review);
      setRecentStats(transactions);
    });
  }, [todayRecords, progression?.totalXp]);

  useEffect(() => {
    const core = coreRef.current;
    if (!core || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => setCoreVisible(entry.isIntersecting), {
      rootMargin: '120px 0px',
      threshold: 0.01,
    });
    observer.observe(core);
    return () => observer.disconnect();
  }, []);

  const missionMap = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions],
  );
  const completeCount = todayRecords.filter((record) => record.status === 'completed').length;
  const pending = todayRecords.filter((record) => record.status === 'pending');
  const percentage = todayRecords.length ? completeCount / todayRecords.length : 0;
  const activeWeekly = challenges.find(
    (challenge) => challenge.kind === 'weekly' && challenge.status === 'active',
  );
  const recovery = challenges.find(
    (challenge) => challenge.kind === 'recovery' && challenge.status === 'active',
  );
  const activeTrial = challenges.some(
    (challenge) => challenge.kind === 'rank-trial' && challenge.status === 'active',
  );
  const qualification =
    progression && stats.length
      ? calculateRankQualification(progression, stats, challenges)
      : undefined;
  const systemState: SystemState = !navigator.onLine
    ? 'offline'
    : settings?.recoveryMode.active
      ? 'recovery'
      : activeTrial
        ? 'trial'
        : qualification?.targetRank && qualification.qualified
          ? 'rank-qualified'
          : progression?.recentLevelUp || progression?.recentRankUp
            ? 'ascending'
            : (lastReview?.systemState ??
              (progression?.xpMultiplier === 0.9
                ? 'warning'
                : progression && progression.xpMultiplier < 0.9
                  ? 'stagnant'
                  : 'stable'));
  const message = chooseSystemMessage(
    {
      hour: getCurrentHour(new Date(), settings?.timeZone),
      streak: progression?.currentDayStreak ?? 0,
      yesterdayRate: lastReview?.completionRate ?? 0,
      recentMisses: lastReview ? lastReview.activeMissionCount - lastReview.completionCount : 0,
      perfectDays: progression?.perfectDays ?? 0,
      recentLevelUp: progression?.recentLevelUp ?? false,
      recentRankUp: progression?.recentRankUp ?? false,
      challengeRate: activeWeekly ? activeWeekly.current / Math.max(activeWeekly.target, 1) : 0,
      state: systemState,
    },
    daySeed(systemDate),
  );
  if (!profile || !progression || !settings) return null;
  const clearedClassGates = qualification?.items.filter((item) => item.met).length ?? 0;
  const totalClassGates = qualification?.items.length ?? 0;
  const coreProjection = buildAscensionCoreProjection({
    dailyCompleted: completeCount,
    dailyTotal: todayRecords.length,
    currentLevelXp: progression.currentLevelXp,
    xpToNextLevel: progression.xpToNextLevel,
    currentStreak: progression.currentDayStreak,
    nextClass: qualification?.targetRank,
    qualifiedForNextClass: Boolean(qualification?.qualified),
    clearedClassGates,
    totalClassGates,
  });
  const coreVitality = buildAscensionCoreVitality(coreProjection.dailyCharge);
  const orbitParticles = Array.from({ length: coreVitality.particlesPerOrbit });
  const sparkParticles = Array.from({ length: coreVitality.sparkParticles });

  return (
    <div className="page dashboard-page">
      <section
        className={`hero-panel headquarters-stage hero-panel--${systemState}`}
        data-depth-surface="hero"
      >
        <div className="hero-panel__scan" />
        <div className="hero-panel__gate" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="hero-panel__version" aria-hidden="true">
          <span>V{APP_VERSION}</span>
          <b>TRUE SIGNAL</b>
        </div>
        <div className="hero-panel__top headquarters-stage__header">
          <div>
            <p className="eyebrow">LIVING SYSTEM · {formatLongDate(systemDate)}</p>
            <span className="headquarters-stage__link">
              <i /> COMMAND LINK SYNCHRONIZED
            </span>
          </div>
          <Link className="icon-button" to="/settings" aria-label="Open settings">
            <SettingsIcon size={20} />
          </Link>
        </div>

        <div className="headquarters-stage__chamber">
          <div className="headquarters-stage__identity">
            <span className="headquarters-stage__designation">PLAYER RECOGNIZED</span>
            <h1>
              Welcome back, <span>{profile.displayName}</span>
            </h1>
            <p className="system-message">“{message}”</p>
            <div className="level-block headquarters-stage__level">
              <div>
                <span>LEVEL {progression.level}</span>
                <strong>{profile.systemTitle}</strong>
              </div>
              <ProgressBar value={progression.currentLevelXp} max={progression.xpToNextLevel} />
              <small>
                {formatNumber(progression.currentLevelXp)} /{' '}
                {formatNumber(progression.xpToNextLevel)} XP TO NEXT LEVEL
              </small>
            </div>
          </div>

          <button
            ref={coreRef}
            type="button"
            className={`headquarters-stage__core ascension-core ascension-core--${coreProjection.state} ascension-core--vitality-${coreVitality.phase} ${coreAwakened ? 'is-awakened' : ''} ${coreVisible ? '' : 'is-energy-suspended'}`}
            style={
              {
                '--core-charge': `${coreProjection.dailyCharge * 3.6}deg`,
                '--core-charge-percent': `${coreProjection.dailyCharge}%`,
                '--level-charge': `${coreProjection.levelCharge * 3.6}deg`,
              } as CSSProperties
            }
            data-core-attunement={settings.coreAttunement ?? 'protocol-linked'}
            data-core-visibility={coreVisible ? 'visible' : 'suspended'}
            aria-expanded={coreAwakened}
            aria-controls="ascension-core-analysis"
            aria-label={`${coreAwakened ? 'Close' : 'Open'} Ascension Core analysis. ${coreProjection.headline}.`}
            onClick={() => setCoreAwakened((active) => !active)}
          >
            <div className="ascension-core__halo" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="ascension-core__life-field" aria-hidden="true">
              {(['one', 'two', 'three'] as const).map((orbit, orbitIndex) => (
                <span
                  className={`ascension-core__particle-orbit ascension-core__particle-orbit--${orbit}`}
                  key={orbit}
                >
                  {orbitParticles.map((_, particleIndex) => (
                    <i
                      key={particleIndex}
                      style={
                        {
                          '--particle-angle': `${
                            (360 / coreVitality.particlesPerOrbit) * particleIndex + orbitIndex * 17
                          }deg`,
                          '--particle-delay': `${-(particleIndex * 0.43 + orbitIndex * 0.7)}s`,
                          '--particle-size': `${2 + ((particleIndex + orbitIndex) % 3)}px`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
              ))}
            </div>
            <div className="ascension-core__life-sparks" aria-hidden="true">
              {sparkParticles.map((_, sparkIndex) => (
                <i
                  key={sparkIndex}
                  style={
                    {
                      '--spark-delay': `${-(sparkIndex * 0.31)}s`,
                      '--spark-drift': `${((sparkIndex * 19) % 31) - 15}px`,
                      '--spark-duration': `${2.8 + (sparkIndex % 5) * 0.42}s`,
                      '--spark-size': `${1 + (sparkIndex % 3)}px`,
                      '--spark-x': `${10 + ((sparkIndex * 37) % 80)}%`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <div className="ascension-core__energy-wings" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="ascension-core__chromatic-shell" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="ascension-core__plasma-arcs" aria-hidden="true">
              {Array.from({ length: 6 }, (_, arcIndex) => (
                <span
                  key={arcIndex}
                  style={
                    {
                      '--plasma-angle': `${arcIndex * 60}deg`,
                      '--plasma-delay': `${-(arcIndex * 0.72)}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <div className="ascension-core__dual-reactor" aria-hidden="true">
              <span />
              <span />
              <i />
              <b />
            </div>
            <div className="ascension-core__reactor-facets" aria-hidden="true">
              {Array.from({ length: 8 }, (_, facetIndex) => (
                <span
                  key={facetIndex}
                  style={
                    {
                      '--facet-angle': `${facetIndex * 45}deg`,
                      '--facet-delay': `${-(facetIndex * 0.23)}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <div className="ascension-core__power-spine" aria-hidden="true">
              {Array.from({ length: 5 }, (_, nodeIndex) => (
                <i key={nodeIndex} />
              ))}
            </div>
            <div className="ascension-core__bio-aura" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="ascension-core__neural-web" aria-hidden="true">
              {Array.from({ length: 6 }, (_, currentIndex) => (
                <span key={currentIndex}>
                  <i />
                </span>
              ))}
            </div>
            <div className="ascension-core__field" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="ascension-core__aperture" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="headquarters-stage__orbit" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="ascension-core__cage" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="ascension-core__satellites" aria-hidden="true">
              <span className="ascension-core__satellite ascension-core__satellite--level">
                <b>{progression.level}</b>
                <small>LEVEL</small>
              </span>
              <span className="ascension-core__satellite ascension-core__satellite--sync">
                <b>{coreProjection.dailyCharge}%</b>
                <small>SYNC</small>
              </span>
              <span className="ascension-core__satellite ascension-core__satellite--streak">
                <b>{progression.currentDayStreak}</b>
                <small>CLEAR CHAIN</small>
              </span>
              <span className="ascension-core__satellite ascension-core__satellite--gates">
                <b>{coreProjection.gateDisplay}</b>
                <small>GATES</small>
              </span>
            </div>
            <div className="ascension-core__emblem">
              <ClassEmblem rank={progression.rank} />
            </div>
            <div className="ascension-core__readout">
              <span>ASCENSION CORE</span>
              <em>{coreProjection.dailyCharge}% DAILY CHARGE</em>
              <small>
                {qualification?.qualified
                  ? 'ADVANCEMENT SIGNAL DETECTED'
                  : qualification?.targetRank
                    ? `${formatClassName(qualification.targetRank)} PATH ACTIVE`
                    : 'FINAL CLASSIFICATION ACHIEVED'}
              </small>
            </div>
            <span className="ascension-core__activation" aria-hidden="true">
              <ScanLine size={13} /> {coreAwakened ? 'CORE LINK OPEN' : 'TOUCH TO AWAKEN'}
            </span>
          </button>
        </div>

        {coreAwakened && (
          <section
            id="ascension-core-analysis"
            className="ascension-core-analysis"
            aria-label="Ascension Core analysis"
          >
            <div className="ascension-core-analysis__signal" aria-hidden="true">
              <Orbit size={22} />
            </div>
            <div className="ascension-core-analysis__copy">
              <p className="eyebrow">CORE INTELLIGENCE · LIVE PROJECTION</p>
              <h2>{coreProjection.headline}</h2>
              <p>{coreProjection.detail}</p>
            </div>
            <div className="ascension-core-analysis__metrics">
              <span>
                <Zap size={15} />
                <small>DAILY SYNC</small>
                <strong>{coreProjection.dailyCharge}%</strong>
              </span>
              <span>
                <Gauge size={15} />
                <small>LEVEL ENERGY</small>
                <strong>{coreProjection.levelCharge}%</strong>
              </span>
              <span>
                <Shield size={15} />
                <small>CLASS GATES</small>
                <strong>{coreProjection.gateDisplay}</strong>
              </span>
              <span>
                <Flame size={15} />
                <small>CLEARED-DAY STREAK</small>
                <strong>{progression.currentDayStreak}</strong>
              </span>
            </div>
            <Link to={coreProjection.href} className="button button--primary">
              {coreProjection.actionLabel} <ArrowRight size={16} />
            </Link>
          </section>
        )}
      </section>

      <InstallCard />
      <DailyEventCard />

      <section className="dashboard-zone dashboard-zone--today" aria-labelledby="today-command">
        <header className="dashboard-zone__header">
          <div>
            <p className="eyebrow">TODAY'S COMMAND DECK</p>
            <h2 id="today-command">
              {pending.length ? 'Move the day forward.' : 'Today’s available path is clear.'}
            </h2>
            <p>
              Your next actions stay first. Coordination and deeper System controls remain directly
              beneath them.
            </p>
          </div>
          <span className="dashboard-zone__status">
            <strong>{Math.round(percentage * 100)}%</strong>
            <small>
              {completeCount}/{todayRecords.length} cleared
            </small>
          </span>
        </header>

        <section className="panel mission-command" data-depth-surface="panel">
          <header className="section-header">
            <div>
              <p className="eyebrow">TODAY’S DIRECTIVES</p>
              <h2>{pending.length} objectives remain</h2>
            </div>
            <Link to="/missions" className="text-link">
              All missions <ChevronRight size={16} />
            </Link>
          </header>
          <ProgressBar
            value={completeCount}
            max={todayRecords.length}
            label={`${completeCount} of ${todayRecords.length} completed`}
          />
          <div className="quick-missions">
            {pending.slice(0, 3).map((record) => {
              const mission = missionMap.get(record.missionId);
              return mission ? (
                <MissionCard
                  key={record.id}
                  mission={mission}
                  record={record}
                  date={systemDate}
                  compact
                />
              ) : null;
            })}
            {!pending.length && (
              <div className="empty-state empty-state--success">
                <Sparkles size={24} />
                <strong>All available objectives answered.</strong>
                <span>The full-day integrity mission may still await tomorrow’s review.</span>
              </div>
            )}
          </div>
          <Link to="/missions" className="button button--ghost button--wide">
            Open mission interface <ArrowRight size={16} />
          </Link>
        </section>

        <SystemCommandCenter compact />
      </section>

      {(recovery || activeWeekly) && (
        <section
          className="dashboard-zone dashboard-zone--operations"
          aria-labelledby="active-operations"
        >
          <header className="dashboard-zone__header">
            <div>
              <p className="eyebrow eyebrow--purple">ACTIVE OPERATIONS</p>
              <h2 id="active-operations">Special protocols in motion.</h2>
              <p>Temporary challenges and recovery work live together without crowding today.</p>
            </div>
          </header>

          <div className="dashboard-operations-grid">
            {recovery && (
              <section className="recovery-banner">
                <span className="recovery-banner__icon">
                  <TrendingUp size={19} />
                </span>
                <div>
                  <p className="eyebrow">RECOVERY PROTOCOL</p>
                  <strong>{getChallengeTemplate(recovery.templateId)?.name}</strong>
                  <p>{getChallengeTemplate(recovery.templateId)?.description}</p>
                </div>
                <span>
                  {recovery.current}/{recovery.target}
                </span>
              </section>
            )}

            {activeWeekly && (
              <section className="panel challenge-command" data-depth-surface="panel">
                <header className="section-header">
                  <div>
                    <p className="eyebrow eyebrow--purple">ACTIVE CHALLENGE</p>
                    <h2>Weekly dungeon</h2>
                  </div>
                  <Link to="/challenges" className="text-link text-link--purple">
                    Challenges <ChevronRight size={16} />
                  </Link>
                </header>
                <ChallengeCard progress={activeWeekly} featured />
              </section>
            )}
          </div>
        </section>
      )}

      {settings.companionMode !== 'off' && (
        <section className="dashboard-party-brief" aria-labelledby="party-network">
          <header className="dashboard-zone__header">
            <div>
              <p className="eyebrow">PARTY LINK</p>
              <h2 id="party-network">Twelve companions. One clear signal.</h2>
            </div>
            <Link to="/headquarters" className="text-link">
              Headquarters <ChevronRight size={16} />
            </Link>
          </header>

          <PartyPulsePanel compact />
          <Link to="/headquarters" className="dashboard-party-access">
            <span>
              <strong>12 companions linked</strong>
              <small>Open Headquarters for the full family, bonds, and individual channels.</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </section>
      )}

      <details className="dashboard-history">
        <summary>
          <span>
            <p className="eyebrow">SYSTEM HISTORY</p>
            <strong>Recent growth and stat activity</strong>
          </span>
          <small>Open when you want the record—not while choosing the next move.</small>
          <ChevronDown size={18} />
        </summary>
        <section className="panel recent-growth" data-depth-surface="panel">
          <header className="section-header">
            <div>
              <p className="eyebrow">RECENT GROWTH</p>
              <h2>Stat activity</h2>
            </div>
            <Link to="/status" className="text-link">
              Full status <ChevronRight size={16} />
            </Link>
          </header>
          <div className="transaction-list">
            {recentStats.map((transaction) => {
              const stat = stats.find((entry) => entry.id === transaction.stat);
              return (
                <div key={transaction.id} className="transaction-row">
                  <span
                    className={`trend-dot trend-dot--${transaction.amount < 0 ? 'down' : 'up'}`}
                  />
                  <div>
                    <strong>{STAT_LABELS[transaction.stat]}</strong>
                    <small>{transaction.note}</small>
                  </div>
                  <span className={transaction.amount < 0 ? 'negative' : 'positive'}>
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount} XP
                  </span>
                  <small>Lv. {stat?.level ?? 1}</small>
                </div>
              );
            })}
            {!recentStats.length && (
              <div className="empty-state">
                <CalendarDays size={22} />
                <span>Stat changes will appear after your first completed mission.</span>
              </div>
            )}
          </div>
        </section>
      </details>
    </div>
  );
}
