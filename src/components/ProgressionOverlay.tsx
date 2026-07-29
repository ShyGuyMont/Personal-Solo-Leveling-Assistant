import { Award, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { acknowledgeProgressionEvent, getNextProgressionEvent } from '@/db/repositories';
import { useGameStore } from '@/store/useGameStore';
import { playSystemTone, vibrate } from '@/utils/feedback';
import type { ProgressionEvent } from '@/types/game';

export function ProgressionOverlay() {
  const progression = useGameStore((state) => state.progression);
  const challenges = useGameStore((state) => state.challenges);
  const settings = useGameStore((state) => state.settings);
  const [event, setEvent] = useState<ProgressionEvent>();

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

  if (!event) return null;
  const Icon = event.kind === 'rank-up' ? Crown : event.kind === 'achievement' ? Award : Sparkles;

  return (
    <div
      className={`progression-overlay progression-overlay--${event.kind}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="progression-overlay__rays" />
      <section>
        <span className="progression-overlay__icon">
          <Icon size={40} />
        </span>
        <p className="eyebrow">
          {event.kind === 'rank-up' ? 'CLASSIFICATION ADVANCED' : 'PROGRESSION CONFIRMED'}
        </p>
        <h2>{event.headline}</h2>
        <p>{event.detail}</p>
        <button
          className="button button--primary button--large"
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
