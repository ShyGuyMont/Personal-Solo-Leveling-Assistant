import { AlertTriangle, Sparkles, Ticket, X } from 'lucide-react';
import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { playSystemTone, vibrate } from '@/utils/feedback';

export function DailyEventOverlay() {
  const { dailyEvent, settings, activateEvent, declineEvent, claimPass } = useGameStore();
  const visible =
    dailyEvent?.status === 'unrevealed' &&
    dailyEvent.kind !== 'none' &&
    settings?.dailyEventsEnabled &&
    settings?.firstDayGuideCompleted;

  useEffect(() => {
    if (!visible) return;
    playSystemTone('warning', settings?.soundEnabled ?? false, settings?.soundVolume);
    vibrate([35, 40, 65], settings?.vibrationEnabled ?? false);
  }, [visible, settings?.soundEnabled, settings?.soundVolume, settings?.vibrationEnabled]);

  if (!visible || !dailyEvent) return null;
  const isPass = dailyEvent.kind === 'mission-pass';
  const Icon = isPass ? Ticket : AlertTriangle;

  return (
    <div
      className={`daily-event-overlay daily-event-overlay--${dailyEvent.kind}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="daily-event-overlay__scan" />
      <section>
        <span className="daily-event-overlay__icon">
          <Icon size={34} />
        </span>
        <p className="eyebrow">{isPass ? 'RARE REWARD DETECTED' : 'EMERGENCY QUEST GENERATED'}</p>
        <h2>{dailyEvent.title}</h2>
        <p>{dailyEvent.description}</p>
        {!isPass && (
          <div className="event-reward-line">
            <Sparkles size={16} />
            <strong>+{dailyEvent.accountXp} account XP</strong>
            <span>Optional · expires at the next System day</span>
          </div>
        )}
        <div className="daily-event-overlay__actions">
          {isPass ? (
            <button
              className="button button--primary button--large"
              onClick={() => void claimPass()}
            >
              <Ticket size={18} /> Claim Mission Pass
            </button>
          ) : (
            <>
              <button
                className="button button--primary button--large"
                onClick={() => void activateEvent()}
              >
                <Sparkles size={18} /> Accept optional quest
              </button>
              <button className="text-button" onClick={() => void declineEvent()}>
                <X size={15} /> Not today · no penalty
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
