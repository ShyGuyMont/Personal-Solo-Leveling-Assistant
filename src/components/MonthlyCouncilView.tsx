import { Crown, Flag, Heart, Map, Target, Trophy } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { saveMonthlyCouncilIntention } from '@/game/council';
import { formatPercent } from '@/utils/format';
import { formatShortDate } from '@/utils/date';
import type { MonthlyCouncil } from '@/types/game';

export function MonthlyCouncilView({
  council,
  compact = false,
  onChanged,
}: {
  council: MonthlyCouncil;
  compact?: boolean;
  onChanged?: () => void;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [intention, setIntention] = useState(council.intention ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setIntention(council.intention ?? '');
    void getFavoriteMessages().then((favorites) =>
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.id))),
    );
  }, [council.id, council.intention]);

  return (
    <section className={`monthly-council ${compact ? 'monthly-council--compact' : ''}`}>
      <header className="monthly-council__header">
        <span>
          <Crown size={25} />
        </span>
        <div>
          <p className="eyebrow">
            MONTHLY COUNCIL · {formatShortDate(council.monthStart)}—
            {formatShortDate(council.monthEnd)}
          </p>
          <h2>The full party reviews the chapter</h2>
          <p>
            Built from finalized records. The council cannot change your score, class, streaks, or
            mission history.
          </p>
        </div>
      </header>
      <div className="monthly-council__metrics">
        <div>
          <Target size={16} />
          <span>Missions</span>
          <strong>
            {council.metrics.completedMissions}/{council.metrics.availableMissions}
          </strong>
        </div>
        <div>
          <Trophy size={16} />
          <span>Perfect Days</span>
          <strong>{council.metrics.perfectDays}</strong>
        </div>
        <div>
          <Map size={16} />
          <span>Arc marks</span>
          <strong>{council.metrics.arcMilestones}</strong>
        </div>
        <div>
          <Crown size={16} />
          <span>Completion</span>
          <strong>{formatPercent(council.metrics.completionRate)}</strong>
        </div>
      </div>
      <div className="council-message-list">
        {council.messages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((message) => {
            const companion = getCompanion(message.companionId);
            const favoriteId = getFavoriteId('council', message.id);
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
                      sourceType: 'council',
                      sourceId: council.id,
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
      <div className="council-intention">
        <div>
          <Flag size={18} />
          <div>
            <strong>Next-month intention</strong>
            <span>One sentence, not a binding contract. Change it whenever you need.</span>
          </div>
        </div>
        <textarea
          rows={2}
          value={intention}
          maxLength={240}
          onChange={(event) => {
            setIntention(event.target.value);
            setSaved(false);
          }}
          placeholder="What do you want the party to help you protect or build next month?"
        />
        <button
          className="button button--ghost button--small"
          onClick={() =>
            void saveMonthlyCouncilIntention(council.id, intention).then(() => {
              setSaved(true);
              onChanged?.();
            })
          }
        >
          <Heart size={14} /> {saved ? 'Saved' : 'Save intention'}
        </button>
      </div>
    </section>
  );
}
