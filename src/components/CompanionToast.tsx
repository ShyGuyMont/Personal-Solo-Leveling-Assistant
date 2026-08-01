import { X } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { useGameStore } from '@/store/useGameStore';
import { useRoutePath } from '@/routeState';

export function CompanionToast() {
  const { companionReaction, dismissCompanionReaction, settings } = useGameStore();
  const path = useRoutePath();
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!companionReaction) return;
    const id = getFavoriteId('reaction', companionReaction.id);
    void getFavoriteMessages().then((favorites) =>
      setFavorite(favorites.some((item) => item.id === id)),
    );
  }, [companionReaction]);

  useEffect(() => {
    if (!companionReaction || path === '/party-chat' || path === '/about') return;
    const timeout = window.setTimeout(() => void dismissCompanionReaction(), 9000);
    return () => window.clearTimeout(timeout);
  }, [companionReaction, dismissCompanionReaction, path]);

  if (
    !companionReaction ||
    settings?.companionMode === 'off' ||
    path === '/party-chat' ||
    path === '/about'
  )
    return null;
  const companion = getCompanion(companionReaction.companionId);

  return (
    <aside
      className={`companion-toast ${companion.primary ? 'companion-toast--primary' : ''}`}
      role="status"
      style={{ '--companion-accent': companion.accent } as CSSProperties}
    >
      <div className="companion-toast__portrait">
        <img src={getCompanionImage(companion.image)} alt="" />
      </div>
      <div className="companion-toast__copy">
        <span>
          {companion.name} · {companion.title}
        </span>
        <p>“{companionReaction.message}”</p>
      </div>
      <div className="companion-toast__actions">
        <FavoriteMessageButton
          active={favorite}
          onToggle={async () => {
            setFavorite(
              await toggleFavoriteMessage({
                sourceType: 'reaction',
                sourceId: companionReaction.id,
                messageId: companionReaction.id,
                companionId: companionReaction.companionId,
                message: companionReaction.message,
              }),
            );
          }}
        />
        <button
          onClick={() => void dismissCompanionReaction()}
          aria-label="Dismiss companion message"
        >
          <X size={17} />
        </button>
      </div>
    </aside>
  );
}
