import {
  ArrowRight,
  Archive,
  BookHeart,
  CalendarDays,
  Castle,
  ChefHat,
  ChevronRight,
  Crown,
  Dumbbell,
  Map as MapIcon,
  Flame,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ChallengeCard } from '@/components/ChallengeCard';
import { ClassEmblem } from '@/components/ClassEmblem';
import { CompanionRoster } from '@/components/CompanionRoster';
import { DailyEventCard } from '@/components/DailyEventCard';
import { DailyBriefingCard } from '@/components/DailyBriefingCard';
import { InstallCard } from '@/components/InstallCard';
import { MissionCard } from '@/components/MissionCard';
import { PartyPulsePanel } from '@/components/PartyPulsePanel';
import { ProgressBar } from '@/components/ProgressBar';
import { chooseSystemMessage } from '@/config/messages';
import { getChallengeTemplate } from '@/config/challenges';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { APP_VERSION } from '@/config/release';
import { getDashboardHistory } from '@/db/repositories';
import { calculateRankQualification } from '@/game/rank';
import { Link } from '@/router';
import { daySeed, formatLongDate, getCurrentHour } from '@/utils/date';
import { STAT_LABELS, formatClassName, formatNumber } from '@/utils/format';
import { useGameStore } from '@/store/useGameStore';
import type { DailyReview, StatTransaction, SystemState } from '@/types/game';

function RealmVista() {
  return (
    <span className="realm-portal__vista" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function DashboardPage() {
  const {
    profile,
    progression,
    stats,
    settings,
    missions,
    todayRecords,
    challenges,
    systemDate,
    treasuryChallenge,
  } = useGameStore();
  const [lastReview, setLastReview] = useState<DailyReview>();
  const [recentStats, setRecentStats] = useState<StatTransaction[]>([]);

  useEffect(() => {
    void getDashboardHistory().then(({ lastReview: review, recentStats: transactions }) => {
      setLastReview(review);
      setRecentStats(transactions);
    });
  }, [todayRecords, progression?.totalXp]);

  const missionMap = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions],
  );
  const completeCount = todayRecords.filter((record) => record.status === 'completed').length;
  const pending = todayRecords.filter((record) => record.status === 'pending');
  const percentage = todayRecords.length ? completeCount / todayRecords.length : 0;
  const workoutRecord = todayRecords.find((record) => record.missionId === 'workout');
  const bibleRecord = todayRecords.find((record) => record.missionId === 'bible');
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
  const systemStateLabel = systemState === 'rank-qualified' ? 'class ready' : systemState;

  if (!profile || !progression || !settings) return null;
  const snow = getCompanion('snow');

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
          <b>SYSTEM TRANSCENDENCE</b>
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

          <div
            className="headquarters-stage__core"
            style={{ '--core-charge': `${Math.round(percentage * 360)}deg` } as CSSProperties}
          >
            <div className="ascension-core__field" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
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
            <div className="ascension-core__emblem">
              <ClassEmblem rank={progression.rank} />
            </div>
            <div className="ascension-core__readout">
              <span>ASCENSION CORE</span>
              <em>{Math.round(percentage * 100)}% DAILY CHARGE</em>
              <small>
                {qualification?.qualified
                  ? 'ADVANCEMENT SIGNAL DETECTED'
                  : qualification?.targetRank
                    ? `${formatClassName(qualification.targetRank)} PATH ACTIVE`
                    : 'FINAL CLASSIFICATION ACHIEVED'}
              </small>
            </div>
          </div>

          <div
            className="headquarters-stage__companion"
            style={{ '--companion-accent': snow.accent } as CSSProperties}
          >
            <div className="headquarters-stage__portrait">
              <img src={getCompanionImage(snow.image)} alt="Snow, The Constant" />
              <span>
                <i /> LIVE
              </span>
            </div>
            <div>
              <p className="eyebrow">PRIMARY COMPANION · SNOW</p>
              <strong>The Constant is beside you.</strong>
              <small>
                {pending.length
                  ? `${pending.length} objectives remain. We only need to choose the next one.`
                  : 'Every available objective has been answered. Let yourself recognize that.'}
              </small>
              <Link to="/party-chat">
                Open private channel <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-metrics">
          <div>
            <Sparkles size={17} />
            <span>Today</span>
            <strong>{Math.round(percentage * 100)}%</strong>
          </div>
          <div>
            <Flame size={17} />
            <span>Day streak</span>
            <strong>{progression.currentDayStreak}</strong>
          </div>
          <div>
            <Shield size={17} />
            <span>System state</span>
            <strong>{systemStateLabel}</strong>
          </div>
        </div>
      </section>

      <InstallCard />
      <DailyEventCard />
      <DailyBriefingCard />
      <PartyPulsePanel />

      <section className="panel realm-command-map" data-depth-surface="panel">
        <header className="section-header realm-command-map__header">
          <div>
            <p className="eyebrow">DIMENSIONAL ROUTE MAP</p>
            <h2>Choose where the System opens next.</h2>
            <p>Each realm carries its own companion link, atmosphere, and purpose.</p>
          </div>
          <span className="realm-command-map__live">
            <i /> 8 LINKS ONLINE
          </span>
        </header>
        <div className="realm-command-map__grid">
          <Link to="/training-hall" className="realm-portal" data-portal="training">
            <span className="realm-portal__icon">
              <Dumbbell size={23} />
            </span>
            <span>
              <small>ROOK & EMBER</small>
              <strong>Training Hall</strong>
            </span>
            <em>
              {workoutRecord?.status === 'completed' ? 'Deployment complete' : 'Assignment ready'}
            </em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/sanctuary" className="realm-portal" data-portal="sanctuary">
            <span className="realm-portal__icon">
              <BookHeart size={23} />
            </span>
            <span>
              <small>SNOW & SELAH</small>
              <strong>Scripture Sanctuary</strong>
            </span>
            <em>
              {bibleRecord?.status === 'completed'
                ? 'Study complete · doors open'
                : 'Stronghold available'}
            </em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/kitchen" className="realm-portal" data-portal="kitchen">
            <span className="realm-portal__icon">
              <ChefHat size={23} />
            </span>
            <span>
              <small>SAFFRON</small>
              <strong>Provision Command</strong>
            </span>
            <em>Kitchen channel ready</em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/treasury" className="realm-portal" data-portal="treasury">
            <span className="realm-portal__icon">
              <WalletCards size={23} />
            </span>
            <span>
              <small>CASSIAN</small>
              <strong>Treasury Command</strong>
            </span>
            <em>
              {treasuryChallenge?.status === 'active'
                ? `Directive · +${treasuryChallenge.rewardXp} XP`
                : 'Ledger secured'}
            </em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/headquarters" className="realm-portal" data-portal="party">
            <span className="realm-portal__icon">
              <Castle size={23} />
            </span>
            <span>
              <small>FULL PARTY</small>
              <strong>Party Headquarters</strong>
            </span>
            <em>Ten companion links</em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/campaigns" className="realm-portal" data-portal="campaign">
            <span className="realm-portal__icon">
              <MapIcon size={23} />
            </span>
            <span>
              <small>CIPHER</small>
              <strong>Campaign Command</strong>
            </span>
            <em>{activeWeekly ? 'Active challenge signal' : 'Long-range objectives'}</em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/status" className="realm-portal" data-portal="progression">
            <span className="realm-portal__icon">
              <Crown size={23} />
            </span>
            <span>
              <small>ASCENSION CORE</small>
              <strong>Class Path</strong>
            </span>
            <em>
              {qualification?.qualified
                ? 'Advancement ready'
                : qualification?.targetRank
                  ? `${formatClassName(qualification.targetRank)} signal`
                  : 'World Class achieved'}
            </em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
          <Link to="/archive" className="realm-portal" data-portal="archive">
            <span className="realm-portal__icon">
              <Archive size={23} />
            </span>
            <span>
              <small>HAVEN</small>
              <strong>Memory Archive</strong>
            </span>
            <em>Campaign record intact</em>
            <ChevronRight size={17} />
            <RealmVista />
          </Link>
        </div>
      </section>

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

      <div className="dashboard-grid">
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
          {activeWeekly ? <ChallengeCard progress={activeWeekly} featured /> : null}
        </section>

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
        <CompanionRoster />
      </div>
    </div>
  );
}
