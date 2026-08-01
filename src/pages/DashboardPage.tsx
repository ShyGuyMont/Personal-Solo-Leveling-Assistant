import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Map as MapIcon,
  Flame,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ChallengeCard } from '@/components/ChallengeCard';
import { CompanionRoster } from '@/components/CompanionRoster';
import { DailyEventCard } from '@/components/DailyEventCard';
import { DailyBriefingCard } from '@/components/DailyBriefingCard';
import { InstallCard } from '@/components/InstallCard';
import { MissionCard } from '@/components/MissionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { chooseSystemMessage } from '@/config/messages';
import { getChallengeTemplate } from '@/config/challenges';
import { getDashboardHistory } from '@/db/repositories';
import { calculateRankQualification } from '@/game/rank';
import { Link } from '@/router';
import { daySeed, formatLongDate, getCurrentHour } from '@/utils/date';
import { STAT_LABELS, formatNumber } from '@/utils/format';
import { useGameStore } from '@/store/useGameStore';
import type { DailyReview, StatTransaction, SystemState } from '@/types/game';

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
        : qualification?.qualified
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

  return (
    <div className="page dashboard-page">
      <section className={`hero-panel hero-panel--${systemState}`}>
        <div className="hero-panel__scan" />
        <div className="hero-panel__top">
          <div>
            <p className="eyebrow">{formatLongDate(systemDate)}</p>
            <h1>
              Welcome, <span>{profile.displayName}</span>
            </h1>
            <p className="system-message">“{message}”</p>
          </div>
          <Link className="icon-button" to="/settings" aria-label="Open settings">
            <SettingsIcon size={20} />
          </Link>
        </div>
        <div className="identity-strip">
          <div className="rank-emblem">
            <span>RANK</span>
            <strong>{progression.rank}</strong>
          </div>
          <div className="level-block">
            <div>
              <span>LEVEL {progression.level}</span>
              <strong>{profile.systemTitle}</strong>
            </div>
            <ProgressBar value={progression.currentLevelXp} max={progression.xpToNextLevel} />
            <small>
              {formatNumber(progression.currentLevelXp)} / {formatNumber(progression.xpToNextLevel)}{' '}
              XP
            </small>
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
            <strong>{systemState}</strong>
          </div>
        </div>
      </section>

      <InstallCard />
      <DailyEventCard />
      <DailyBriefingCard />

      <Link
        to="/treasury"
        className={`treasury-dashboard-card panel is-${treasuryChallenge?.status ?? 'quiet'}`}
      >
        <span>
          <WalletCards size={23} />
        </span>
        <div>
          <p className="eyebrow">TREASURY COMMAND · CASSIAN</p>
          <strong>
            {treasuryChallenge?.status === 'active'
              ? 'No Eating Out directive active'
              : treasuryChallenge?.status === 'passed'
                ? 'Kitchen line held today'
                : treasuryChallenge?.status === 'failed'
                  ? 'Recovery protocol available'
                  : 'Open the private ledger'}
          </strong>
          <small>
            {treasuryChallenge?.status === 'active'
              ? `Optional · +${treasuryChallenge.rewardXp} XP · clear it before day reset`
              : 'Paychecks, spending, bills, debt, savings, and the weekly review'}
          </small>
        </div>
        {treasuryChallenge?.status === 'active' ? (
          <UtensilsCrossed size={20} />
        ) : (
          <ChevronRight size={20} />
        )}
      </Link>

      <Link to="/campaigns" className="campaign-command-card panel">
        <span>
          <MapIcon size={23} />
        </span>
        <div>
          <p className="eyebrow">LONG-RANGE COMMAND</p>
          <strong>Campaign Arcs & Companion Questlines</strong>
          <small>
            Build your own milestones or enter one of eight five-chapter party campaigns.
          </small>
        </div>
        <ChevronRight size={20} />
      </Link>

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
        <section className="panel mission-command">
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

        <section className="panel challenge-command">
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

        <section className="panel recent-growth">
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
