import { ShieldCheck, UtensilsCrossed, X } from 'lucide-react';
import { useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { useGameStore } from '@/store/useGameStore';

export function TreasuryChallengeOverlay() {
  const {
    settings,
    dailyEvent,
    dailyBriefing,
    campfireRecap,
    monthlyCouncil,
    treasuryChallenge,
    acknowledgeTreasuryChallenge,
    declineTreasuryChallenge,
  } = useGameStore();
  const cassian = getCompanion('cassian');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  if (
    !settings?.firstDayGuideCompleted ||
    dailyEvent?.status === 'unrevealed' ||
    (settings.dailyBriefingEnabled && !dailyBriefing) ||
    campfireRecap ||
    monthlyCouncil ||
    !treasuryChallenge ||
    treasuryChallenge.status !== 'active' ||
    treasuryChallenge.revealedAt
  ) {
    return null;
  }

  return (
    <div className="modal-backdrop treasury-challenge-backdrop" role="dialog" aria-modal="true">
      <section
        className="modal-panel treasury-challenge-panel"
        style={{ '--companion-accent': cassian.accent } as React.CSSProperties}
      >
        <div className="treasury-challenge-panel__signal">
          <span>RANDOM STEWARDSHIP DIRECTIVE</span>
          <strong>THE KITCHEN LINE</strong>
        </div>
        <img src={getCompanionImage(cassian.image)} alt="Cassian, The Steward" />
        <div className="treasury-challenge-panel__copy">
          <p className="eyebrow">CASSIAN · THE STEWARD</p>
          <h2>No Eating Out today.</h2>
          <p>
            No delivery, restaurant meal, or convenience order before the day closes. Use what is
            already available, prepare the easiest workable option, and let tomorrow keep the money.
          </p>
          <div className="treasury-challenge-panel__reward">
            <UtensilsCrossed size={20} />
            <span>
              <strong>Optional challenge · +{treasuryChallenge.rewardXp} XP</strong>
              <small>Plus Stewardship progress · Failure removes no account XP</small>
            </span>
          </div>
          <blockquote>
            “Do not rely on a heroic evening. Decide what you will eat before hunger begins
            negotiating.”
          </blockquote>
          <div className="treasury-inline-actions">
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() => void run(acknowledgeTreasuryChallenge)}
            >
              <ShieldCheck size={17} /> Accept today’s command
            </button>
            <button
              className="button button--ghost"
              disabled={busy}
              onClick={() => void run(declineTreasuryChallenge)}
            >
              <X size={17} /> Decline today
            </button>
          </div>
          <small className="treasury-fine-print">
            Declining has no penalty · Rolled independently each day at a 75% chance · You can
            change this in the Treasury
          </small>
        </div>
      </section>
    </div>
  );
}
