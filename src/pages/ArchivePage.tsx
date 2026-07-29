import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  LineChart,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/ProgressBar';
import { CATEGORY_LABELS } from '@/config/missions';
import { getArchiveData } from '@/db/repositories';
import {
  dateRange,
  endOfMonth,
  formatLongDate,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from '@/utils/date';
import { formatPercent, STAT_LABELS } from '@/utils/format';
import { getMissionDisplayName } from '@/utils/privacy';
import { useGameStore } from '@/store/useGameStore';
import type {
  ChallengeProgress,
  DailyMissionRecord,
  DailyReview,
  LevelHistory,
  LocalDateKey,
  RankHistory,
  PeriodicReport,
  StatTransaction,
} from '@/types/game';

type ArchiveTab = 'calendar' | 'reports' | 'missions' | 'stats' | 'progression';

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
                    {mission.name}
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
                <p className="eyebrow eyebrow--purple">RANK HISTORY</p>
                <h2>Classifications earned</h2>
              </div>
            </header>
            <div className="archive-list">
              {rankHistory.map((entry) => (
                <div key={entry.id} className="archive-row">
                  <Flame size={17} />
                  <div>
                    <strong>
                      {entry.from} → {entry.to}
                    </strong>
                    <small>{entry.date}</small>
                  </div>
                </div>
              ))}
              {!rankHistory.length && (
                <div className="empty-state">
                  <span>Rank advancement will appear here.</span>
                </div>
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
