import { Award, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClassEmblem } from '@/components/ClassEmblem';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getMilestoneCelebration, isPartyMilestone } from '@/config/milestoneCelebrations';
import { acknowledgeProgressionEvent, getNextProgressionEvent } from '@/db/repositories';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { useGameStore } from '@/store/useGameStore';
import { playSystemTone, vibrate } from '@/utils/feedback';
import type { ProgressionEvent } from '@/types/game';

export function ProgressionOverlay() {
  const progression = useGameStore((state) => state.progression);
  const challenges = useGameStore((state) => state.challenges);
  const settings = useGameStore((state) => state.settings);
  const [event, setEvent] = useState<ProgressionEvent>();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadNext = async () => setEvent(await getNextProgressionEvent());

  useEffect(() => {
    void loadNext();
  }, [progression?.totalXp, progression?.rank, challenges]);

  useEffect(() => {
    if (!event) return;
    playSystemTone(
      event.kind === 'rank-up' ? 'warning' : 'level',
      settings?.soundEnabled ?? false,
      settings?.soundVolume,
    );
    vibrate(
      event.kind === 'rank-up' ? [40, 50, 80] : [25, 30, 40],
      settings?.vibrationEnabled ?? false,
    );
  }, [event, settings?.soundEnabled, settings?.soundVolume, settings?.vibrationEnabled]);

  useEffect(() => {
    if (!event) return;
    void getFavoriteMessages().then((favorites) =>
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.id))),
    );
  }, [event]);

  if (!event) return null;
  const Icon = event.kind === 'rank-up' ? Crown : event.kind === 'achievement' ? Award : Sparkles;
  const celebration = isPartyMilestone(event) ? getMilestoneCelebration(event) : undefined;
  const classKey = progression?.rank.toLowerCase().replaceAll(' ', '-');

  return (
    <div
      className={`progression-overlay progression-overlay--${event.kind} ${celebration ? 'progression-overlay--party' : ''}`}
      data-class={event.kind === 'rank-up' ? classKey : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div className="progression-overlay__rays" />
      {event.kind === 'rank-up' && (
        <div className="progression-overlay__ascension-gate" aria-hidden="true">
          <i />
          <i />
          <i />
          <span />
        </div>
      )}
      <section>
        <span className="progression-overlay__icon">
          {event.kind === 'rank-up' && progression ? (
            <ClassEmblem rank={progression.rank} compact />
          ) : (
            <Icon size={40} />
          )}
        </span>
        {event.kind === 'rank-up' && (
          <strong className="progression-overlay__chapter">A NEW CHAPTER HAS OPENED</strong>
        )}
        <p className="eyebrow">
          {event.kind === 'rank-up' ? 'CLASSIFICATION ADVANCED' : 'PROGRESSION CONFIRMED'}
        </p>
        <h2>{event.headline}</h2>
        <p>{event.detail}</p>
        {celebration && (
          <div className="milestone-party">
            <p className="eyebrow">THE PARTY CELEBRATES WITH YOU</p>
            <div className="milestone-party__messages">
              {celebration.map(({ companionId, message }) => {
                const companion = getCompanion(companionId);
                const messageId = `${event.id}:${companionId}`;
                const favoriteId = getFavoriteId('milestone', messageId);
                return (
                  <article key={companionId} className={companion.primary ? 'is-primary' : ''}>
                    <img src={getCompanionImage(companion.image)} alt="" />
                    <div>
                      <strong>{companion.name}</strong>
                      <p>“{message}”</p>
                    </div>
                    <FavoriteMessageButton
                      active={favoriteIds.has(favoriteId)}
                      onToggle={async () => {
                        const active = await toggleFavoriteMessage({
                          sourceType: 'milestone',
                          sourceId: event.id,
                          messageId,
                          companionId,
                          message,
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
          </div>
        )}
        <button
          className={`button button--primary button--large ${celebration ? 'progression-overlay__continue' : ''}`}
          onClick={async () => {
            await acknowledgeProgressionEvent(event.id);
            await loadNext();
          }}
        >
          Continue <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}
