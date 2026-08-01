import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  ChevronRight,
  Crown,
  Shield,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/ProgressBar';
import { StatRadar } from '@/components/StatRadar';
import { getTitle } from '@/config/titles';
import { equipCosmetic, getCollectionData, getStatHistory } from '@/db/repositories';
import { calculateRankQualification } from '@/game/rank';
import { getStatProtectedLevel } from '@/game/stats';
import { formatNumber, STAT_LABELS, titleCase } from '@/utils/format';
import { useGameStore } from '@/store/useGameStore';
import type {
  Achievement,
  CosmeticDefinition,
  CosmeticUnlock,
  StatProgress,
  StatTransaction,
} from '@/types/game';

const STAT_RAISES: Record<string, string> = {
  faith: 'Prayer, Bible study, and faith challenges',
  strength: 'Workout missions and physical challenges',
  endurance: 'Movement missions and sustained physical campaigns',
  discipline: 'Prayer, integrity, workouts, creator work, and Perfect Days',
  willpower: 'Daily integrity missions and discipline campaigns',
  wisdom: 'Bible study and faith challenges',
  creativity: 'YouTube / ARC work and creator campaigns',
  focus: 'Bible study, creator work, and focused campaigns',
  vitality: 'Movement, workouts, and Perfect Days',
  character: 'Kind messages and Perfect Days',
  empathy: 'Kind messages and character challenges',
  stewardship: 'Treasury reviews, savings, debt payments, and Cassian challenges',
};

export function StatusPage() {
  const { profile, progression, stats, challenges, titles, refresh } = useGameStore();
  const [selected, setSelected] = useState<StatProgress>();
  const [transactions, setTransactions] = useState<StatTransaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [cosmetics, setCosmetics] = useState<CosmeticDefinition[]>([]);
  const [cosmeticUnlocks, setCosmeticUnlocks] = useState<CosmeticUnlock[]>([]);
  const qualification = useMemo(
    () => (progression ? calculateRankQualification(progression, stats, challenges) : undefined),
    [progression, stats, challenges],
  );
  const equipped = profile ? getTitle(profile.equippedTitleId) : undefined;

  useEffect(() => {
    if (!selected) return;
    void getStatHistory(selected.id).then(setTransactions);
  }, [selected]);

  useEffect(() => {
    void getCollectionData().then((collection) => {
      setAchievements(collection.achievements);
      setCosmetics(collection.cosmetics);
      setCosmeticUnlocks(collection.cosmeticUnlocks);
    });
  }, [progression?.totalXp, progression?.rank]);

  if (!profile || !progression || !qualification) return null;
  const strongest = [...stats].sort((a, b) => b.level - a.level)[0];

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">CANDIDATE RECORD</p>
          <h1>Status</h1>
          <p>Your progression is measured across the whole campaign, not a single day.</p>
        </div>
        <span className="page-heading__glyph">
          <Shield size={25} />
        </span>
      </header>

      <section className={`identity-card identity-card--${profile.cosmeticFrame}`}>
        <div className="identity-card__sigil">
          <span>{progression.rank}</span>
        </div>
        <div className="identity-card__copy">
          <p className="eyebrow">ACTIVE PROFILE</p>
          <h2>{profile.displayName}</h2>
          <span className="equipped-title">{equipped?.name ?? profile.systemTitle}</span>
          <div className="identity-card__level">
            <strong>LEVEL {progression.level}</strong>
            <span>{formatNumber(progression.totalXp)} lifetime XP</span>
          </div>
          <ProgressBar value={progression.currentLevelXp} max={progression.xpToNextLevel} />
        </div>
        <div className="identity-card__rank">
          <span>CURRENT RANK</span>
          <strong>{progression.rank}</strong>
        </div>
      </section>

      <div className="status-layout">
        <section className="panel stat-visualization">
          <header className="section-header">
            <div>
              <p className="eyebrow">ATTRIBUTE MATRIX</p>
              <h2>Stat balance</h2>
            </div>
            <span className="strongest-stat">
              <Activity size={15} />
              Strongest · {strongest ? STAT_LABELS[strongest.id] : '—'}
            </span>
          </header>
          <StatRadar stats={stats} />
          <p className="microcopy">
            Tap any stat below for its sources, protected floor, and history.
          </p>
        </section>

        <section className="panel rank-qualification">
          <header className="section-header">
            <div>
              <p className="eyebrow eyebrow--purple">
                {qualification.targetRank
                  ? `${qualification.targetRank}-RANK QUALIFICATION`
                  : 'HIGHEST CLASSIFICATION'}
              </p>
              <h2>
                {qualification.qualified ? 'Qualification complete' : 'Advancement requirements'}
              </h2>
            </div>
            <Crown size={23} />
          </header>
          {qualification.items.map((item) => (
            <div key={item.id} className={`qualification-row ${item.met ? 'is-met' : ''}`}>
              <span className="qualification-row__mark">{item.met ? '✓' : '·'}</span>
              <div>
                <span>{item.label}</span>
                <strong>
                  {item.display ?? `${formatNumber(item.current)} / ${formatNumber(item.target)}`}
                </strong>
              </div>
              <ProgressBar value={item.current} max={item.target} tone="purple" compact />
            </div>
          ))}
          <div className={`trial-state trial-state--${qualification.trialStatus}`}>
            <span>RANK TRIAL</span>
            <strong>{titleCase(qualification.trialStatus)}</strong>
          </div>
        </section>
      </div>

      <section className="stat-grid" aria-label="Primary stats">
        {stats.map((stat) => (
          <button key={stat.id} className="stat-card" onClick={() => setSelected(stat)}>
            <header>
              <span
                className={`trend-dot trend-dot--${stat.trend === 'declining' ? 'down' : stat.trend === 'rising' ? 'up' : 'stable'}`}
              />
              <span>{STAT_LABELS[stat.id]}</span>
              <ChevronRight size={15} />
            </header>
            <strong>LV. {stat.level}</strong>
            <ProgressBar value={stat.currentLevelXp} max={stat.xpToNextLevel} compact />
            <div>
              <span>Momentum</span>
              <b>{stat.momentum}%</b>
            </div>
          </button>
        ))}
      </section>

      <section className="panel lifetime-panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">LIFETIME RECORD</p>
            <h2>Campaign totals</h2>
          </div>
          <Award size={22} />
        </header>
        <div className="lifetime-grid">
          <div>
            <span>Missions</span>
            <strong>{formatNumber(progression.lifetimeMissionCompletions)}</strong>
          </div>
          <div>
            <span>Completed days</span>
            <strong>{formatNumber(progression.completedDays)}</strong>
          </div>
          <div>
            <span>Perfect Days</span>
            <strong>{formatNumber(progression.perfectDays)}</strong>
          </div>
          <div>
            <span>Longest streak</span>
            <strong>{formatNumber(progression.longestDayStreak)}</strong>
          </div>
          <div>
            <span>Titles unlocked</span>
            <strong>{formatNumber(titles.length)}</strong>
          </div>
          <div>
            <span>System state</span>
            <strong>{progression.xpMultiplier === 1 ? 'Stable' : 'Recalibrating'}</strong>
          </div>
        </div>
      </section>

      <section className="panel title-panel">
        <header className="section-header">
          <div>
            <p className="eyebrow eyebrow--purple">ACHIEVEMENTS & TITLES</p>
            <h2>Unlocked distinctions</h2>
          </div>
          <Award size={22} />
        </header>
        <div className="title-grid">
          {titles.map((unlocked) => {
            const title = getTitle(unlocked.titleId);
            return title ? (
              <article
                key={unlocked.id}
                className={`title-card title-card--${title.rarity}`}
                style={{ '--title-accent': title.accent } as CSSProperties}
              >
                <span>{title.rarity}</span>
                <strong>{title.name}</strong>
                <p>{title.description}</p>
              </article>
            ) : null;
          })}
        </div>
      </section>

      <section className="panel collection-panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">ACHIEVEMENT ARCHIVE</p>
            <h2>
              {achievements.filter((achievement) => achievement.unlockedAt).length} /{' '}
              {achievements.length} unlocked
            </h2>
          </div>
          <Award size={22} />
        </header>
        <div className="achievement-grid">
          {achievements.map((achievement) => {
            const unlocked = Boolean(achievement.unlockedAt);
            return (
              <article
                key={achievement.id}
                className={`achievement-card achievement-card--${achievement.rarity} ${unlocked ? 'is-unlocked' : 'is-locked'}`}
              >
                <span>{unlocked ? achievement.icon : '?'}</span>
                <div>
                  <strong>
                    {achievement.hidden && !unlocked ? 'Hidden achievement' : achievement.name}
                  </strong>
                  <p>
                    {achievement.hidden && !unlocked
                      ? 'Condition concealed.'
                      : achievement.description}
                  </p>
                  <small>
                    {unlocked
                      ? `Unlocked ${new Date(achievement.unlockedAt!).toLocaleDateString()}`
                      : achievement.condition}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel collection-panel">
        <header className="section-header">
          <div>
            <p className="eyebrow eyebrow--purple">COSMETIC LOADOUT</p>
            <h2>Frames and sigils</h2>
          </div>
          <Crown size={22} />
        </header>
        <div className="cosmetic-grid">
          {cosmetics.map((cosmetic) => {
            const unlocked = cosmeticUnlocks.some((entry) => entry.cosmeticId === cosmetic.id);
            const selected =
              cosmetic.kind === 'frame'
                ? profile.cosmeticFrame === cosmetic.previewClass
                : cosmetic.kind === 'sigil'
                  ? profile.backgroundSigil === cosmetic.previewClass
                  : false;
            const equippableKind = cosmetic.kind === 'theme' ? undefined : cosmetic.kind;
            return (
              <article key={cosmetic.id} className={`cosmetic-card ${unlocked ? '' : 'is-locked'}`}>
                <span className={`cosmetic-preview ${cosmetic.previewClass}`} />
                <strong>{cosmetic.name}</strong>
                <p>{cosmetic.description}</p>
                <small>{unlocked ? cosmetic.rarity : cosmetic.unlockCondition}</small>
                {equippableKind && (
                  <button
                    className="mini-button"
                    disabled={!unlocked || selected}
                    onClick={async () => {
                      await equipCosmetic(equippableKind, cosmetic.previewClass);
                      await refresh();
                    }}
                  >
                    {selected ? 'Equipped' : unlocked ? 'Equip' : 'Locked'}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(undefined)}
        eyebrow="STAT ANALYSIS"
        title={selected ? STAT_LABELS[selected.id] : ''}
      >
        {selected && (
          <div className="stat-detail">
            <div className="stat-detail__hero">
              <strong>LEVEL {selected.level}</strong>
              <span>{formatNumber(selected.totalXp)} total XP</span>
            </div>
            <ProgressBar
              value={selected.currentLevelXp}
              max={selected.xpToNextLevel}
              label="Next level"
            />
            <div className="detail-facts">
              <div>
                <span>Momentum</span>
                <strong>{selected.momentum}%</strong>
              </div>
              <div>
                <span>Trend</span>
                <strong>{titleCase(selected.trend)}</strong>
              </div>
              <div>
                <span>Protected floor</span>
                <strong>Level {getStatProtectedLevel(selected)}</strong>
              </div>
              <div>
                <span>Lifetime gained</span>
                <strong>{formatNumber(selected.lifetimeXpGained)} XP</strong>
              </div>
            </div>
            <div className="info-callout">
              <Activity size={17} />
              <span>
                <strong>Raised by:</strong> {STAT_RAISES[selected.id]}
              </span>
            </div>
            <p className="supportive-copy">
              Repeated neglect lowers momentum first. XP decay starts only after sustained
              inactivity, and lifetime floors protect earned progress.
            </p>
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  {transaction.amount < 0 ? (
                    <ArrowDownRight size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                  <div>
                    <strong>{transaction.note}</strong>
                    <small>{transaction.date}</small>
                  </div>
                  <span className={transaction.amount < 0 ? 'negative' : 'positive'}>
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
