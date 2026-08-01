import { MessageCircleMore, X } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { useRoutePath } from '@/routeState';
import { useGameStore } from '@/store/useGameStore';

export function PartyBanterToast() {
  const { partyBanter, companionReaction, dismissPartyBanter, settings } = useGameStore();
  const path = useRoutePath();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const visible = Boolean(
    partyBanter &&
      !companionReaction &&
      settings?.companionMode !== 'off' &&
      path !== '/party-chat' &&
      path !== '/about',
  );

  useEffect(() => {
    if (!partyBanter) return;
    void getFavoriteMessages().then((favorites) =>
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.id))),
    );
  }, [partyBanter]);

  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(() => void dismissPartyBanter(), 14000);
    return () => window.clearTimeout(timeout);
  }, [dismissPartyBanter, visible]);

  if (!visible || !partyBanter) return null;

  return (
    <aside className="party-banter-toast" role="status">
      <header>
        <span><MessageCircleMore size={16} /> PARTY BANTER</span>
        <button onClick={() => void dismissPartyBanter()} aria-label="Dismiss party banter">
          <X size={17} />
        </button>
      </header>
      {partyBanter.messages.map((message) => {
        const companion = getCompanion(message.companionId);
        const favoriteId = getFavoriteId('banter', message.id);
        return (
          <div
            key={message.id}
            className="party-banter-toast__message"
            style={{ '--companion-accent': companion.accent } as CSSProperties}
          >
            <img src={getCompanionImage(companion.image)} alt="" />
            <p><strong>{companion.name}</strong> “{message.message}”</p>
            <FavoriteMessageButton
              active={favoriteIds.has(favoriteId)}
              onToggle={async () => {
                const active = await toggleFavoriteMessage({
                  sourceType: 'banter',
                  sourceId: partyBanter.id,
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
          </div>
        );
      })}
    </aside>
  );
}
