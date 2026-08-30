import {
  Archive,
  BatteryMedium,
  BookHeart,
  BookOpen,
  CookingPot,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Crown,
  Heart,
  LineChart,
  Map as MapIcon,
  MessageCircle,
  MessagesSquare,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { CampfireRecapView } from '@/components/CampfireRecapView';
import { MonthlyCouncilView } from '@/components/MonthlyCouncilView';
import { ProgressBar } from '@/components/ProgressBar';
import { CATEGORY_LABELS } from '@/config/missions';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getMoodDefinition } from '@/config/partyChat';
import { getSupportTopic } from '@/config/support';
import { getQuestline } from '@/config/questlines';
import { getSanctuaryConcern } from '@/config/scripture';
import { resolveKitchenSessionRecipe } from '@/game/kitchen';
import { getGymWorkout, getTrainingCircuit } from '@/config/training';
import { getArchiveData } from '@/db/repositories';
import { getSanctuaryPassages } from '@/game/sanctuary';
import {
  dateRange,
  endOfMonth,
  formatLongDate,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from '@/utils/date';
import { formatClassName, formatPercent, STAT_LABELS } from '@/utils/format';
import { getMissionDisplayName } from '@/utils/privacy';
import { useGameStore } from '@/store/useGameStore';
import { Link } from '@/router';
import type {
  CampfireRecap,
  ArcMilestone,
  CampaignArc,
  ChallengeProgress,
  CompanionReaction,
  DailyEventRecord,
  DailyMissionRecord,
  DailyReview,
  DailyCommandBriefing,
  LevelHistory,
  LocalDateKey,
  MonthlyCouncil,
  RankHistory,
  PeriodicReport,
  PartyCheckIn,
  PartyBanter,
  FavoriteMessage,
  SupportConversation,
  CompanionQuestProgress,
  StatTransaction,
  SanctuarySession,
  TrainingSession,
  KitchenSession,
} from '@/types/game';

type ArchiveTab = 'calendar' | 'reports' | 'missions' | 'stats' | 'progression' | 'system';

function shiftMonth(key: LocalDateKey, amount: number): LocalDateKey {
  const date = parseDateKey(key);
  date.setUTCMonth(date.getUTCMonth() + amount, 1);
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

export function ArchivePage() {
  const { systemDate, missions, stats, settings } = useGameStore();
  const [tab, setTab] = useState<ArchiveTab>('calendar');
  const [month, setMonth] = useState(startOfMonth(systemDate));
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [records, setRecords] = useState<DailyMissionRecord[]>([]);
  const [statTransactions, setStatTransactions] = useState<StatTransaction[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeProgress[]>([]);
  const [levelHistory, setLevelHistory] = useState<LevelHistory[]>([]);
  const [rankHistory, setRankHistory] = useState<RankHistory[]>([]);
  const [savedReports, setSavedReports] = useState<PeriodicReport[]>([]);
  const [dailyEvents, setDailyEvents] = useState<DailyEventRecord[]>([]);
  const [companionReactions, setCompanionReactions] = useState<CompanionReaction[]>([]);
  const [partyCheckIns, setPartyCheckIns] = useState<PartyCheckIn[]>([]);
  const [supportConversations, setSupportConversations] = useState<SupportConversation[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState<FavoriteMessage[]>([]);
  const [partyBanters, setPartyBanters] = useState<PartyBanter[]>([]);
  const [campfireRecaps, setCampfireRecaps] = useState<CampfireRecap[]>([]);
  const [dailyBriefings, setDailyBriefings] = useState<DailyCommandBriefing[]>([]);
  const [campaignArcs, setCampaignArcs] = useState<CampaignArc[]>([]);
  const [arcMilestones, setArcMilestones] = useState<ArcMilestone[]>([]);
  const [questProgress, setQuestProgress] = useState<CompanionQuestProgress[]>([]);
  const [monthlyCouncils, setMonthlyCouncils] = useState<MonthlyCouncil[]>([]);
  const [sanctuarySessions, setSanctuarySessions] = useState<SanctuarySession[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [kitchenSessions, setKitchenSessions] = useState<KitchenSession[]>([]);
  const [selectedReview, setSelectedReview] = useState<DailyReview>();
  const [missionFilter, setMissionFilter] = useState('all');

  useEffect(() => {
    void getArchiveData().then((data) => {
      setReviews(data.reviews);
      setRecords(data.records);
      setStatTransactions(data.statTransactions);
      setChallengeHistory(data.challengeHistory);
      setLevelHistory(data.levelHistory);
      setRankHistory(data.rankHistory);
      setSavedReports(data.reports);
      setDailyEvents(data.dailyEvents);
      setCompanionReactions(data.companionReactions);
      setPartyCheckIns(data.partyCheckIns);
      setSupportConversations(data.supportConversations);
      setFavoriteMessages(data.favoriteMessages);
      setPartyBanters(data.partyBanters);
      setCampfireRecaps(data.campfireRecaps);
      setDailyBriefings(data.dailyBriefings);
      setCampaignArcs(data.campaignArcs);
      setArcMilestones(data.arcMilestones);
      setQuestProgress(data.companionQuestProgress);
      setMonthlyCouncils(data.monthlyCouncils);
      setSanctuarySessions(data.sanctuarySessions);
      setTrainingSessions(data.trainingSessions);
      setKitchenSessions(data.kitchenSessions);
    });
  }, []);

  const reviewMap = useMemo(
    () => new Map(reviews.map((review) => [review.date, review])),
    [reviews],
  );
  const monthDays = dateRange(startOfMonth(month), endOfMonth(month));
  const startWeekday = parseDateKey(monthDays[0]).getUTCDay();
  const finalizedRecords = records.filter((record) => reviewMap.has(record.date));
  const completedRecords = finalizedRecords.filter((record) => record.status === 'completed');
  const completionRate = finalizedRecords.length
    ? completedRecords.length / finalizedRecords.length
    : 0;
  const averagePerDay = reviews.length ? completedRecords.length / reviews.length : 0;
  const sevenReviews = reviews.slice(-7);
  const thirtyReviews = reviews.slice(-30);
  const averageRate = (items: DailyReview[]) =>
    items.length ? items.reduce((sum, review) => sum + review.completionRate, 0) / items.length : 0;
  const strongest = [...stats].sort((a, b) => b.level - a.level)[0];
  const neglected = [...stats].sort((a, b) => a.momentum - b.momentum)[0];
  const completedChallenges = challengeHistory.filter((item) => item.status === 'completed').length;
  const resolvedChallenges = challengeHistory.filter((item) =>
    ['completed', 'failed', 'cooldown'].includes(item.status),
  ).length;

  const categoryRates = Object.keys(CATEGORY_LABELS).map((category) => {
    const ids = new Set(
      missions.filter((mission) => mission.category === category).map((mission) => mission.id),
    );
    const categoryRecords = finalizedRecords.filter((record) => ids.has(record.missionId));
    return {
      category,
      rate: categoryRecords.length
        ? categoryRecords.filter((record) => record.status === 'completed').length /
          categoryRecords.length
        : 0,
    };
  });

  const selectedRecords = selectedReview
    ? records.filter((record) => record.date === selectedReview.date)
    : [];

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">PERMANENT CAMPAIGN RECORD</p>
          <h1>Archive</h1>
          <p>History remains visible even when a streak breaks.</p>
        </div>
        <span className="page-heading__glyph">
          <Archive size={25} />
        </span>
      </header>

      <section className="analytics-grid">
        <div className="metric-card">
          <span>Lifetime completion</span>
          <strong>{formatPercent(completionRate)}</strong>
          <small>Across finalized days</small>
        </div>
        <div className="metric-card">
          <span>Perfect Days</span>
          <strong>{reviews.filter((review) => review.perfectDay).length}</strong>
          <small>Protected days shown separately</small>
        </div>
        <div className="metric-card">
          <span>Average completed</span>
          <strong>{averagePerDay.toFixed(1)}</strong>
          <small>Missions per recorded day</small>
        </div>
        <div className="metric-card">
          <span>Challenge success</span>
          <strong>
            {resolvedChallenges ? formatPercent(completedChallenges / resolvedChallenges) : '—'}
          </strong>
          <small>No health conclusions inferred</small>
        </div>
      </section>

      <nav className="archive-tabs" aria-label="Archive views">
        {(
          [
            ['calendar', 'Calendar'],
            ['reports', 'Reports'],
            ['missions', 'Missions'],
            ['stats', 'Stats'],
            ['progression', 'Progression'],
            ['system', 'System Log'],
          ] as [ArchiveTab, string][]
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'calendar' && (
        <section className="panel calendar-panel">
          <header className="calendar-header">
            <button
              className="icon-button"
              onClick={() => setMonth(shiftMonth(month, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={19} />
            </button>
            <div>
              <p className="eyebrow">CALENDAR VIEW</p>
              <h2>
                {new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                }).format(parseDateKey(month))}
              </h2>
            </div>
            <button
              className="icon-button"
              onClick={() => setMonth(shiftMonth(month, 1))}
              disabled={shiftMonth(month, 1) > systemDate}
              aria-label="Next month"
            >
              <ChevronRight size={19} />
            </button>
          </header>
          <div className="calendar-legend">
            <span>
              <i className="day-dot day-dot--perfect" />
              Perfect
            </span>
            <span>
              <i className="day-dot day-dot--partial" />
              Partial
            </span>
            <span>
              <i className="day-dot day-dot--failed" />
              Failed
            </span>
            <span>
              <i className="day-dot day-dot--excused" />
              Excused
            </span>
            <span>
              <i className="day-dot" />
              No data
            </span>
          </div>
          <div className="calendar-grid calendar-grid--head">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: startWeekday }).map((_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {monthDays.map((day) => {
              const review = reviewMap.get(day);
              const kind = review?.perfectDay
                ? 'perfect'
                : review?.protectedPerfectDay
                  ? 'excused'
                  : review
                    ? review.completionRate > 0
                      ? 'partial'
                      : 'failed'
                    : 'empty';
              return (
                <button
                  key={day}
                  className={`calendar-day calendar-day--${kind} ${day === systemDate ? 'is-today' : ''}`}
                  onClick={() => review && setSelectedReview(review)}
                  disabled={!review}
                  aria-label={`${day}: ${review ? kind : 'no data'}`}
                >
                  <span>{Number(day.slice(-2))}</span>
                  {review && <strong>{Math.round(review.completionRate * 100)}%</strong>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'reports' && (
        <div className="report-layout">
          <section className="panel trend-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow">TREND REPORT</p>
                <h2>Recent trajectory</h2>
              </div>
              <LineChart size={21} />
            </header>
            <div className="trend-comparison">
              <div>
                <span>Last 7 days</span>
                <strong>{formatPercent(averageRate(sevenReviews))}</strong>
                <ProgressBar value={averageRate(sevenReviews)} max={1} />
              </div>
              <div>
                <span>Last 30 days</span>
                <strong>{formatPercent(averageRate(thirtyReviews))}</strong>
                <ProgressBar value={averageRate(thirtyReviews)} max={1} />
              </div>
            </div>
            <div className="insight-row">
              <span>
                <Sparkles size={17} />
              </span>
              <div>
                <strong>Strongest stat</strong>
                <small>
                  {strongest
                    ? `${STAT_LABELS[strongest.id]} · Level ${strongest.level}`
                    : 'No data'}
                </small>
              </div>
            </div>
            <div className="insight-row">
              <span>
                <Flame size={17} />
              </span>
              <div>
                <strong>Lowest current momentum</strong>
                <small>
                  {neglected ? `${STAT_LABELS[neglected.id]} · ${neglected.momentum}%` : 'No data'}
                </small>
              </div>
            </div>
          </section>
          <section className="panel category-report">
            <header className="section-header">
              <div>
                <p className="eyebrow">CATEGORY REPORT</p>
                <h2>Completion balance</h2>
              </div>
            </header>
            {categoryRates.map(({ category, rate }) => (
              <div key={category} className="category-rate">
                <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
                <ProgressBar value={rate} max={1} compact />
                <strong>{formatPercent(rate)}</strong>
              </div>
            ))}
          </section>
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow">SAVED PERIOD REPORTS</p>
                <h2>Transparent focus suggestions</h2>
              </div>
            </header>
            <div className="archive-list">
              {savedReports.map((report) => (
                <article key={report.id} className="saved-report">
                  <div>
                    <span className="status-chip">{report.kind}</span>
                    <strong>
                      {report.periodStart} → {report.periodEnd}
                    </strong>
                  </div>
                  <p>{report.focusSuggestion}</p>
                  <small>{report.ruleExplanation}</small>
                </article>
              ))}
              {!savedReports.length && (
                <div className="empty-state">
                  Reports are archived after the first Daily Review.
                </div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel campfire-archive">
            <header className="section-header">
              <div>
                <p className="eyebrow">WEEKLY STRATEGY ROOMS</p>
                <h2>The party remembers each week and its direction</h2>
              </div>
              <Link to="/headquarters" className="text-link">
                Headquarters <Flame size={16} />
              </Link>
            </header>
            <div className="campfire-archive__list">
              {campfireRecaps.map((recap) => (
                <details key={recap.id}>
                  <summary>
                    <span>
                      <Flame size={16} />
                    </span>
                    <div>
                      <strong>
                        {recap.weekStart} → {recap.weekEnd}
                      </strong>
                      <small>
                        {recap.metrics.completedMissions}/{recap.metrics.availableMissions} missions
                        · {recap.metrics.perfectDays} Perfect Days
                      </small>
                    </div>
                  </summary>
                  <CampfireRecapView recap={recap} compact />
                </details>
              ))}
              {!campfireRecaps.length && (
                <div className="empty-state">
                  The first completed Weekly Strategy Room will be archived here.
                </div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel campfire-archive council-archive">
            <header className="section-header">
              <div>
                <p className="eyebrow">MONTHLY COUNCILS</p>
                <h2>The party remembers each chapter</h2>
              </div>
              <Link to="/headquarters" className="text-link">
                Headquarters <Crown size={16} />
              </Link>
            </header>
            <div className="campfire-archive__list">
              {monthlyCouncils.map((council) => (
                <details key={council.id}>
                  <summary>
                    <span>
                      <Crown size={16} />
                    </span>
                    <div>
                      <strong>
                        {council.monthStart} → {council.monthEnd}
                      </strong>
                      <small>
                        {council.metrics.completedMissions}/{council.metrics.availableMissions}{' '}
                        missions · {council.metrics.questChapters} quest chapters
                      </small>
                    </div>
                  </summary>
                  <MonthlyCouncilView council={council} compact />
                </details>
              ))}
              {!monthlyCouncils.length && (
                <div className="empty-state">
                  The first completed Monthly Council will be archived here.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'missions' && (
        <section className="panel archive-list-panel">
          <header className="section-header">
            <div>
              <p className="eyebrow">MISSION HISTORY</p>
              <h2>Recorded objectives</h2>
            </div>
            <label className="select-filter">
              <Filter size={15} />
              <select
                value={missionFilter}
                onChange={(event) => setMissionFilter(event.target.value)}
              >
                <option value="all">All missions</option>
                {missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {getMissionDisplayName(mission, settings?.sensitiveMissionAlias)}
                  </option>
                ))}
              </select>
            </label>
          </header>
          <div className="archive-list">
            {finalizedRecords
              .filter((record) => missionFilter === 'all' || record.missionId === missionFilter)
              .slice()
              .reverse()
              .slice(0, 100)
              .map((record) => (
                <div key={record.id} className="archive-row">
                  <i
                    className={`day-dot day-dot--${record.status === 'completed' ? 'perfect' : record.status === 'excused' ? 'excused' : 'failed'}`}
                  />
                  <div>
                    <strong>
                      {(() => {
                        const mission = missions.find((item) => item.id === record.missionId);
                        return mission
                          ? getMissionDisplayName(mission, settings?.sensitiveMissionAlias)
                          : 'Archived mission';
                      })()}
                    </strong>
                    <small>{record.date}</small>
                  </div>
                  <span className={`status-chip status-chip--${record.status}`}>
                    {record.status}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {tab === 'stats' && (
        <section className="panel archive-list-panel">
          <header className="section-header">
            <div>
              <p className="eyebrow">STAT HISTORY</p>
              <h2>Immutable transactions</h2>
            </div>
          </header>
          <div className="archive-list">
            {statTransactions.slice(0, 120).map((transaction) => (
              <div key={transaction.id} className="archive-row">
                <span
                  className={`trend-dot trend-dot--${transaction.amount < 0 ? 'down' : 'up'}`}
                />
                <div>
                  <strong>
                    {STAT_LABELS[transaction.stat]} · {transaction.note}
                  </strong>
                  <small>{transaction.date}</small>
                </div>
                <span className={transaction.amount < 0 ? 'negative' : 'positive'}>
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'progression' && (
        <div className="report-layout">
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow eyebrow--purple">LEVEL HISTORY</p>
                <h2>Thresholds crossed</h2>
              </div>
            </header>
            <div className="archive-list">
              {levelHistory.map((entry) => (
                <div key={entry.id} className="archive-row">
                  <Sparkles size={17} />
                  <div>
                    <strong>Account Level {entry.level}</strong>
                    <small>{entry.date}</small>
                  </div>
                </div>
              ))}
              {!levelHistory.length && (
                <div className="empty-state">
                  <span>Level-up history will appear here.</span>
                </div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow eyebrow--purple">CLASS HISTORY</p>
                <h2>Classifications earned</h2>
              </div>
            </header>
            <div className="archive-list">
              {rankHistory.map((entry) => (
                <div key={entry.id} className="archive-row">
                  <Flame size={17} />
                  <div>
                    <strong>
                      {formatClassName(entry.from)} → {formatClassName(entry.to)}
                    </strong>
                    <small>{entry.date}</small>
                  </div>
                </div>
              ))}
              {!rankHistory.length && (
                <div className="empty-state">
                  <span>Class advancement will appear here.</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'system' && (
        <div className="report-layout">
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow">CAMPAIGN COMMAND HISTORY</p>
                <h2>Arcs, chapters, and daily briefings</h2>
              </div>
              <Link to="/campaigns" className="text-link">
                Open campaigns <MapIcon size={16} />
              </Link>
            </header>
            <div className="archive-list">
              {campaignArcs.map((arc) => {
                const marks = arcMilestones.filter((item) => item.arcId === arc.id);
                return (
                  <div key={arc.id} className="archive-row">
                    <MapIcon size={17} />
                    <div>
                      <strong>{arc.name}</strong>
                      <small>
                        {arc.status} · {marks.filter((item) => item.status === 'completed').length}/
                        {marks.length} milestones · guided by {getCompanion(arc.companionId).name}
                      </small>
                    </div>
                    <span className="status-chip">arc</span>
                  </div>
                );
              })}
              {questProgress.map((progressItem) => {
                const quest = getQuestline(progressItem.questlineId);
                return (
                  <div key={progressItem.id} className="archive-row">
                    <BookOpen size={17} />
                    <div>
                      <strong>{quest?.title ?? 'Companion Questline'}</strong>
                      <small>
                        {progressItem.status} · {progressItem.completedChapterIds.length}/5 chapters
                        · {getCompanion(progressItem.companionId).name}
                      </small>
                    </div>
                    <span className="status-chip">questline</span>
                  </div>
                );
              })}
              {dailyBriefings.slice(0, 31).map((briefing) => (
                <div key={briefing.id} className="archive-row">
                  <BatteryMedium size={17} />
                  <div>
                    <strong>Legacy Daily Command · {briefing.capacity}</strong>
                    <small>
                      {briefing.date} · {briefing.outcome ?? briefing.status}
                      {briefing.awardedMultiplier && briefing.awardedMultiplier > 1
                        ? ` · ${briefing.awardedMultiplier}×`
                        : ''}
                    </small>
                  </div>
                  <span className="status-chip">briefing</span>
                </div>
              ))}
              {!campaignArcs.length && !questProgress.length && !dailyBriefings.length && (
                <div className="empty-state">
                  Campaign Arcs, companion chapters, and legacy command records will be preserved
                  here.
                </div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow">RARE SIGNAL HISTORY</p>
                <h2>Daily events encountered</h2>
              </div>
              <Radio size={20} />
            </header>
            <div className="archive-list">
              {dailyEvents
                .filter((event) => event.kind !== 'none')
                .map((event) => (
                  <div key={event.id} className="archive-row">
                    <span className={`status-chip status-chip--${event.status}`}>
                      {event.kind.replaceAll('-', ' ')}
                    </span>
                    <div>
                      <strong>{event.title}</strong>
                      <small>
                        {event.date} · {event.status}
                      </small>
                    </div>
                    {event.accountXp > 0 && <span className="positive">+{event.accountXp} XP</span>}
                  </div>
                ))}
              {!dailyEvents.some((event) => event.kind !== 'none') && (
                <div className="empty-state">Rare daily events will be recorded here.</div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel party-checkin-archive">
            <header className="section-header">
              <div>
                <p className="eyebrow">TRAINING & PROVISION</p>
                <h2>Hall and Kitchen history</h2>
              </div>
              <Link to="/kitchen" className="text-link">
                Open Kitchen <CookingPot size={16} />
              </Link>
            </header>
            <div className="archive-list">
              {trainingSessions
                .filter((entry) => ['completed', 'partial'].includes(entry.status))
                .slice(0, 60)
                .map((entry) => (
                  <div key={`training:${entry.id}`} className="archive-row">
                    <Dumbbell size={17} />
                    <div>
                      <strong>
                        {entry.gymWorkoutId
                          ? getGymWorkout(entry.gymWorkoutId).name
                          : entry.circuitId
                            ? getTrainingCircuit(entry.circuitId).name
                            : entry.location === 'conditioning'
                              ? 'Conditioning Mission'
                              : 'Recovery Protocol'}
                      </strong>
                      <small>
                        {formatLongDate(entry.date)} · {entry.location} ·{' '}
                        {entry.loggedDurationMinutes ?? entry.durationMinutes ?? 0} minutes
                        {entry.status === 'partial'
                          ? ` · ${entry.completedSetCount ?? 0}/${entry.prescribedSetCount ?? 0} sets logged`
                          : ''}
                      </small>
                    </div>
                    <span className="status-chip">
                      {entry.status === 'partial' ? 'partial' : 'training'}
                    </span>
                  </div>
                ))}
              {kitchenSessions
                .filter((entry) => entry.status !== 'assigned')
                .slice(0, 60)
                .map((entry) => (
                  <div key={`kitchen:${entry.id}`} className="archive-row">
                    <CookingPot size={17} />
                    <div>
                      <strong>
                        {resolveKitchenSessionRecipe(entry)?.name ?? 'Archived recipe'}
                      </strong>
                      <small>
                        {formatLongDate(entry.date)} · {entry.status}
                        {entry.servingsPrepared ? ` · ${entry.servingsPrepared} servings` : ''}
                      </small>
                    </div>
                    <span className="status-chip">kitchen</span>
                  </div>
                ))}
              {!trainingSessions.some((entry) => ['completed', 'partial'].includes(entry.status)) &&
                !kitchenSessions.some((entry) => entry.status !== 'assigned') && (
                  <div className="empty-state">
                    Completed Training Hall and Kitchen records will be preserved here.
                  </div>
                )}
            </div>
          </section>
          <section className="panel archive-list-panel party-checkin-archive">
            <header className="section-header">
              <div>
                <p className="eyebrow">SCRIPTURE SANCTUARY</p>
                <h2>Study and Stronghold history</h2>
              </div>
              <Link to="/sanctuary" className="text-link">
                Open Sanctuary <BookHeart size={16} />
              </Link>
            </header>
            <div className="party-checkin-archive__list">
              {sanctuarySessions
                .filter((entry) => entry.status === 'completed')
                .slice(0, 60)
                .map((entry) => (
                  <details key={entry.id} className="party-checkin-archive__item">
                    <summary>
                      <BookHeart size={18} />
                      <div>
                        <strong>
                          {entry.mode === 'study' ? 'Daily Scripture Study' : 'Stronghold Protocol'}
                        </strong>
                        <small>
                          {formatLongDate(entry.date)} ·{' '}
                          {getSanctuaryConcern(entry.primaryConcern).label}
                          {entry.secondaryConcern
                            ? ` + ${getSanctuaryConcern(entry.secondaryConcern).label}`
                            : ''}
                        </small>
                      </div>
                      <ChevronRight size={17} />
                    </summary>
                    <div className="sanctuary-archive-detail">
                      <p>
                        <strong>Scripture path</strong>{' '}
                        {getSanctuaryPassages(entry)
                          .map((passage) => passage.reference)
                          .join(' · ')}
                      </p>
                      {entry.reflection && (
                        <p>
                          <strong>Reflection</strong> {entry.reflection}
                        </p>
                      )}
                      {entry.prayer && (
                        <p>
                          <strong>Prayer</strong> {entry.prayer}
                        </p>
                      )}
                      {entry.nextAction && (
                        <p>
                          <strong>Next action</strong> {entry.nextAction}
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              {!sanctuarySessions.some((entry) => entry.status === 'completed') && (
                <div className="empty-state">Completed Sanctuary sessions will be saved here.</div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel party-checkin-archive">
            <header className="section-header">
              <div>
                <p className="eyebrow">PARTY CHECK-INS</p>
                <h2>How the party met you</h2>
              </div>
              <Link to="/party-chat" className="text-link">
                New check-in <MessageCircle size={16} />
              </Link>
            </header>
            <div className="party-checkin-archive__list">
              {partyCheckIns.slice(0, 60).map((checkIn) => {
                const mood = getMoodDefinition(checkIn.mood);
                return (
                  <details key={checkIn.id} className="party-checkin-archive__item">
                    <summary>
                      <span
                        className="party-checkin-archive__mood"
                        style={{ background: mood.accent }}
                      />
                      <div>
                        <strong>{mood.label}</strong>
                        <small>{formatLongDate(checkIn.date)}</small>
                      </div>
                      <ChevronRight size={17} />
                    </summary>
                    <div className="party-checkin-archive__messages">
                      {checkIn.messages
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((message) => {
                          const companion = getCompanion(message.companionId);
                          return (
                            <div key={message.id}>
                              <img src={getCompanionImage(companion.image)} alt="" />
                              <p>
                                <strong>{companion.name}</strong> “{message.message}”
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </details>
                );
              })}
              {!partyCheckIns.length && (
                <div className="empty-state">
                  <span>Your first emotional check-in will be saved here.</span>
                  <Link to="/party-chat" className="button button--ghost button--small">
                    Open Party Channel
                  </Link>
                </div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel party-checkin-archive">
            <header className="section-header">
              <div>
                <p className="eyebrow">DIRECT SUPPORT CHANNELS</p>
                <h2>Support requested on purpose</h2>
              </div>
              <Link to="/party-chat" className="text-link">
                Ask the party <MessagesSquare size={16} />
              </Link>
            </header>
            <div className="party-checkin-archive__list">
              {supportConversations.slice(0, 60).map((conversation) => {
                const topic = getSupportTopic(conversation.topic);
                return (
                  <details key={conversation.id} className="party-checkin-archive__item">
                    <summary>
                      <span
                        className="party-checkin-archive__mood"
                        style={{ background: topic.accent }}
                      />
                      <div>
                        <strong>{topic.label}</strong>
                        <small>
                          {formatLongDate(conversation.date)} ·{' '}
                          {conversation.audience === 'party'
                            ? 'Whole Party'
                            : getCompanion(conversation.audience).name}
                        </small>
                      </div>
                      <ChevronRight size={17} />
                    </summary>
                    <div className="party-checkin-archive__messages">
                      {conversation.messages
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((message) => {
                          const companion = getCompanion(message.companionId);
                          return (
                            <div key={message.id}>
                              <img src={getCompanionImage(companion.image)} alt="" />
                              <p>
                                <strong>{companion.name}</strong> “{message.message}”
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </details>
                );
              })}
              {!supportConversations.length && (
                <div className="empty-state">Direct Support conversations will be saved here.</div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow">WORDS TO CARRY</p>
                <h2>Messages you chose to keep</h2>
              </div>
              <Heart size={20} />
            </header>
            <div className="archive-list">
              {favoriteMessages.slice(0, 60).map((favorite) => {
                const companion = getCompanion(favorite.companionId);
                return (
                  <div key={favorite.id} className="archive-row archive-row--companion">
                    <img src={getCompanionImage(companion.image)} alt="" />
                    <div>
                      <strong>{companion.name}</strong>
                      <small>“{favorite.message}”</small>
                    </div>
                    <span className="status-chip">{favorite.sourceType.replaceAll('-', ' ')}</span>
                  </div>
                );
              })}
              {!favoriteMessages.length && (
                <div className="empty-state">Favorite companion messages will wait here.</div>
              )}
            </div>
          </section>
          <section className="panel archive-list-panel">
            <header className="section-header">
              <div>
                <p className="eyebrow">PARTY TRANSMISSIONS</p>
                <h2>Words carried with you</h2>
              </div>
              <MessageCircle size={20} />
            </header>
            <div className="archive-list">
              {partyBanters.slice(0, 60).flatMap((banter) =>
                banter.messages.map((message) => {
                  const companion = getCompanion(message.companionId);
                  return (
                    <div key={message.id} className="archive-row archive-row--companion">
                      <img src={getCompanionImage(companion.image)} alt="" />
                      <div>
                        <strong>{companion.name} · Party Banter</strong>
                        <small>“{message.message}”</small>
                      </div>
                      <span className="status-chip">banter</span>
                    </div>
                  );
                }),
              )}
              {companionReactions.slice(0, 100).map((reaction) => {
                const companion = getCompanion(reaction.companionId);
                return (
                  <div key={reaction.id} className="archive-row archive-row--companion">
                    <img src={getCompanionImage(companion.image)} alt="" />
                    <div>
                      <strong>
                        {companion.name} · {companion.title}
                      </strong>
                      <small>“{reaction.message}”</small>
                    </div>
                    <span className="status-chip">{reaction.trigger.replaceAll('-', ' ')}</span>
                  </div>
                );
              })}
              {!companionReactions.length && !partyBanters.length && (
                <div className="empty-state">Companion messages will remain available here.</div>
              )}
            </div>
          </section>
        </div>
      )}

      <Modal
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(undefined)}
        eyebrow="FINALIZED DAILY REVIEW"
        title={selectedReview ? formatLongDate(selectedReview.date) : ''}
      >
        {selectedReview && (
          <div className="archive-review">
            <div className="review-summary-ring">
              <strong>{Math.round(selectedReview.completionRate * 100)}%</strong>
              <span>
                {selectedReview.completionCount}/{selectedReview.activeMissionCount}
              </span>
            </div>
            <h3>{selectedReview.verdict}</h3>
            <div className="review-list">
              {selectedRecords.map((record) => (
                <div key={record.id} className={`review-row review-row--${record.status}`}>
                  <div>
                    <span className="review-row__status">{record.status}</span>
                    <strong>
                      {(() => {
                        const mission = missions.find((item) => item.id === record.missionId);
                        return mission
                          ? getMissionDisplayName(mission, settings?.sensitiveMissionAlias)
                          : 'Archived mission';
                      })()}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
            <div className="detail-facts">
              <div>
                <span>Bonus XP</span>
                <strong>+{selectedReview.accountXpAwarded}</strong>
              </div>
              {selectedReview.dailyCommandCapacity && (
                <div>
                  <span>Legacy Command</span>
                  <strong>
                    {selectedReview.dailyCommandOutcome === 'full-clear'
                      ? `Full Clear · ${selectedReview.dailyCommandMultiplier}×`
                      : selectedReview.dailyCommandOutcome === 'standard-clear'
                        ? `Clear · ${selectedReview.dailyCommandMultiplier}×`
                        : selectedReview.dailyCommandCapacity === 'low'
                          ? 'Low · 1×'
                          : 'Missed · 1×'}
                  </strong>
                </div>
              )}
              <div>
                <span>System state</span>
                <strong>{selectedReview.systemState}</strong>
              </div>
              <div>
                <span>Perfect</span>
                <strong>
                  {selectedReview.perfectDay
                    ? 'Yes'
                    : selectedReview.protectedPerfectDay
                      ? 'Protected'
                      : 'No'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
