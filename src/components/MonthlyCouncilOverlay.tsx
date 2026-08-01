import { Check, Crown } from 'lucide-react';
import { MonthlyCouncilView } from '@/components/MonthlyCouncilView';
import { useGameStore } from '@/store/useGameStore';

export function MonthlyCouncilOverlay() {
  const council = useGameStore((state) => state.monthlyCouncil);
  const dismiss = useGameStore((state) => state.dismissMonthlyCouncil);
  const campfire = useGameStore((state) => state.campfireRecap);
  if (!council || campfire) return null;
  return (
    <div
      className="modal-backdrop council-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Monthly Council"
    >
      <section className="modal-panel council-panel">
        <div className="council-panel__arrival">
          <Crown size={20} /> MONTHLY COUNCIL ASSEMBLED
        </div>
        <MonthlyCouncilView council={council} />
        <button className="button button--primary button--wide" onClick={() => void dismiss()}>
          <Check size={17} /> Close council
        </button>
      </section>
    </div>
  );
}
