import { AlertTriangle, ArrowUp, Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

export function RewardToast() {
  const { rewardNotice, clearRewardNotice } = useGameStore();
  useEffect(() => {
    if (!rewardNotice) return;
    const timeout = window.setTimeout(clearRewardNotice, 3200);
    return () => window.clearTimeout(timeout);
  }, [rewardNotice, clearRewardNotice]);
  if (!rewardNotice) return null;
  return (
    <div className="reward-toast" role="status">
      <span className="reward-toast__icon">
        {rewardNotice.levelsGained ? <ArrowUp size={20} /> : <Check size={20} />}
      </span>
      <span>
        <strong>
          {rewardNotice.levelsGained ? `LEVEL +${rewardNotice.levelsGained}` : 'MISSION COMPLETE'}
        </strong>
        <small>
          {rewardNotice.missionName} · +{rewardNotice.accountXp} XP
        </small>
      </span>
    </div>
  );
}

export function ErrorToast() {
  const { error, clearError } = useGameStore();
  if (!error) return null;
  return (
    <div className="error-toast" role="alert">
      <AlertTriangle size={18} />
      <span>{error}</span>
      <button onClick={clearError} aria-label="Dismiss error">
        <X size={16} />
      </button>
    </div>
  );
}
