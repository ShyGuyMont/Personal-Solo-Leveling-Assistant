import { Check, Sparkles, Ticket } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { STAT_LABELS } from '@/utils/format';

export function DailyEventCard() {
  const { dailyEvent, inventory, completeEvent } = useGameStore();
  const [working, setWorking] = useState(false);
  const passes = inventory.find((item) => item.id === 'mission-pass')?.quantity ?? 0;
  const showQuest =
    dailyEvent?.kind === 'emergency-quest' &&
    (dailyEvent.status === 'active' || dailyEvent.status === 'completed');
  if (!showQuest && !passes) return null;

  return (
    <section
      className={`daily-event-card ${dailyEvent?.status === 'completed' ? 'is-complete' : ''}`}
    >
      {showQuest && dailyEvent ? (
        <>
          <span className="daily-event-card__sigil">
            {dailyEvent.status === 'completed' ? <Check size={20} /> : <Sparkles size={20} />}
          </span>
          <div>
            <p className="eyebrow">RARE DAILY EVENT</p>
            <strong>{dailyEvent.title}</strong>
            <p>{dailyEvent.description}</p>
            <small>
              +{dailyEvent.accountXp} XP ·{' '}
              {dailyEvent.statRewards.map((reward) => STAT_LABELS[reward.stat]).join(' · ')}
            </small>
          </div>
          {dailyEvent.status === 'active' ? (
            <button
              className="button button--primary"
              disabled={working}
              onClick={async () => {
                if (!window.confirm('Confirm that you completed this optional Emergency Quest?'))
                  return;
                setWorking(true);
                try {
                  await completeEvent();
                } finally {
                  setWorking(false);
                }
              }}
            >
              Complete
            </button>
          ) : (
            <span className="status-chip status-chip--completed">Reward secured</span>
          )}
        </>
      ) : (
        <>
          <span className="daily-event-card__sigil">
            <Ticket size={20} />
          </span>
          <div>
            <p className="eyebrow">INVENTORY</p>
            <strong>
              {passes} Mission Pass{passes === 1 ? '' : 'es'} available
            </strong>
            <p>
              Use one from a pending mission’s details to protect the day without earning its XP.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
