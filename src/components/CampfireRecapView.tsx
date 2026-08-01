import { Flame, Target, Trophy } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { CATEGORY_LABELS } from '@/config/missions';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { formatPercent } from '@/utils/format';
import { formatShortDate } from '@/utils/date';
import type { CampfireRecap } from '@/types/game';

export function CampfireRecapView({
  recap,
  compact = false,
}: {
  recap: CampfireRecap;
  compact?: boolean;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    void getFavoriteMessages().then((favorites) =>
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.id))),
    );
  }, [recap.id]);

  const focus = recap.metrics.focusCategory
    ? CATEGORY_LABELS[recap.metrics.focusCategory]
    : 'One meaningful path';
  return (
    <section className={`campfire-recap ${compact ? 'campfire-recap--compact' : ''}`}>
      <header className="campfire-recap__header">
        <span className="campfire-recap__flame">
          <Flame size={24} />
        </span>
        <div>
          <p className="eyebrow">
            WEEKLY CAMPFIRE · {formatShortDate(recap.weekStart)}—{formatShortDate(recap.weekEnd)}
          </p>
          <h2>The party reviews the week</h2>
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
          <Flame size={17} />
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
