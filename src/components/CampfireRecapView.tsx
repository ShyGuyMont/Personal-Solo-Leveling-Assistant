import { ChartNoAxesCombined, CircleCheckBig, Sparkles, Target, Trophy } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { CATEGORY_LABELS } from '@/config/missions';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { BALANCE } from '@/config/balance';
import { confirmWeeklyStrategy } from '@/game/campfire';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { formatPercent } from '@/utils/format';
import { formatShortDate } from '@/utils/date';
import type { CampfireRecap } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';

export function CampfireRecapView({
  recap,
  compact = false,
}: {
  recap: CampfireRecap;
  compact?: boolean;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [strategyConfirmed, setStrategyConfirmed] = useState(Boolean(recap.strategyConfirmedAt));
  const [strategyBusy, setStrategyBusy] = useState(false);
  const systemDate = useGameStore((state) => state.systemDate);
  const refresh = useGameStore((state) => state.refresh);

  useEffect(() => {
    void getFavoriteMessages().then((favorites) =>
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.id))),
    );
  }, [recap.id]);

  useEffect(() => setStrategyConfirmed(Boolean(recap.strategyConfirmedAt)), [recap]);

  const focus = recap.metrics.focusCategory
    ? CATEGORY_LABELS[recap.metrics.focusCategory]
    : 'One meaningful path';
  const strongest = recap.metrics.strongestCategory
    ? CATEGORY_LABELS[recap.metrics.strongestCategory]
    : 'No single path yet';
  return (
    <section className={`campfire-recap ${compact ? 'campfire-recap--compact' : ''}`}>
      <header className="campfire-recap__header">
        <span className="campfire-recap__flame">
          <ChartNoAxesCombined size={24} />
        </span>
        <div>
          <p className="eyebrow">
            WEEKLY STRATEGY ROOM · {formatShortDate(recap.weekStart)}—
            {formatShortDate(recap.weekEnd)}
          </p>
          <h2>The party turns last week into a clear next move.</h2>
          <p>
            Built only from finalized mission records. No hidden scoring and no invented personal
            conclusions.
          </p>
        </div>
      </header>

      <div className="campfire-metrics">
        <div>
          <Target size={17} />
          <span>Completed</span>
          <strong>
            {recap.metrics.completedMissions}/{recap.metrics.availableMissions}
          </strong>
        </div>
        <div>
          <ChartNoAxesCombined size={17} />
          <span>Completion</span>
          <strong>{formatPercent(recap.metrics.completionRate)}</strong>
        </div>
        <div>
          <Trophy size={17} />
          <span>Perfect Days</span>
          <strong>{recap.metrics.perfectDays}</strong>
        </div>
        <div>
          <span>Next focus</span>
          <strong>{focus}</strong>
        </div>
      </div>

      <div className="weekly-strategy-brief">
        <div>
          <span>PROTECT</span>
          <strong>{strongest}</strong>
          <small>Keep the rhythm that already proved it can survive real life.</small>
        </div>
        <div>
          <span>PRIORITIZE</span>
          <strong>{focus}</strong>
          <small>Give this path one deliberately small early win.</small>
        </div>
        {strategyConfirmed && (
          <div className="is-confirmed">
            <CircleCheckBig size={19} />
            <span>STRATEGY LOCKED</span>
            <strong>+{recap.strategyRewardXp ?? BALANCE.weeklyStrategy.accountXp} XP</strong>
            <small>The week has a direction. Its assignments remain yours to complete.</small>
          </div>
        )}
      </div>

      {!compact && !strategyConfirmed && (
        <button
          type="button"
          className="button button--primary weekly-strategy-confirm"
          disabled={strategyBusy}
          onClick={async () => {
            setStrategyBusy(true);
            try {
              await confirmWeeklyStrategy(recap.id, systemDate);
              setStrategyConfirmed(true);
              await refresh();
            } finally {
              setStrategyBusy(false);
            }
          }}
        >
          <Sparkles size={17} />
          {strategyBusy
            ? 'Locking strategy…'
            : `Confirm weekly strategy · +${BALANCE.weeklyStrategy.accountXp} XP`}
        </button>
      )}

      <div className="campfire-message-list">
        {recap.messages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((message) => {
            const companion = getCompanion(message.companionId);
            const favoriteId = getFavoriteId('campfire', message.id);
            return (
              <article
                key={message.id}
                className={message.role === 'closing' ? 'is-closing' : ''}
                style={{ '--companion-accent': companion.accent } as CSSProperties}
              >
                <img src={getCompanionImage(companion.image)} alt="" />
                <div>
                  <strong>{companion.name}</strong>
                  <span>{companion.title}</span>
                  <p>“{message.message}”</p>
                </div>
                <FavoriteMessageButton
                  active={favoriteIds.has(favoriteId)}
                  onToggle={async () => {
                    const active = await toggleFavoriteMessage({
                      sourceType: 'campfire',
                      sourceId: recap.id,
                      messageId: message.id,
                      companionId: message.companionId,
                      message: message.message,
                    });
                    setFavoriteIds((current) => {
                      const next = new Set(current);
                      if (active) next.add(favoriteId);
                      else next.delete(favoriteId);
                      return next;
                    });
                  }}
                />
              </article>
            );
          })}
      </div>
    </section>
  );
}
