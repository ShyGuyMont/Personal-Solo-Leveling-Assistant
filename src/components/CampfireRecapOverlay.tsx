import { ArrowRight, Flame } from 'lucide-react';
import { CampfireRecapView } from '@/components/CampfireRecapView';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';

export function CampfireRecapOverlay() {
  const recap = useGameStore((state) => state.campfireRecap);
  const dismiss = useGameStore((state) => state.dismissCampfireRecap);
  if (!recap) return null;

  return (
    <div
      className="campfire-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Weekly Campfire Recap"
    >
      <div className="campfire-overlay__embers" />
      <div className="campfire-overlay__panel">
        <div className="campfire-overlay__arrival">
          <Flame size={20} /> CAMPFIRE SIGNAL READY
        </div>
        <CampfireRecapView recap={recap} />
        <div className="campfire-overlay__actions">
          <button className="button button--ghost" onClick={() => void dismiss()}>
            Close for now
          </button>
          <Link
            className="button button--primary"
            to="/headquarters"
            onClick={() => void dismiss()}
          >
            Open Headquarters <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}
