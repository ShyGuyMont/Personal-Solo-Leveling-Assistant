import { BatteryLow, BatteryMedium, BatteryFull, Edit3, LockKeyhole, Sparkles } from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { getDailyCommandProgress, reopenDailyBriefing } from '@/game/briefing';
import { useGameStore } from '@/store/useGameStore';

const ICONS = { low: BatteryLow, steady: BatteryMedium, high: BatteryFull } as const;

export function DailyBriefingCard() {
  const { dailyBriefing, missions, todayRecords, refresh } = useGameStore();
  if (!dailyBriefing) return null;
  const mission = (id?: string) => missions.find((item) => item.id === id)?.name;
  const Icon = ICONS[dailyBriefing.capacity];
  const progress = getDailyCommandProgress(dailyBriefing, todayRecords);
  const isModernCommand = dailyBriefing.rulesVersion === 1;

  let commandStatus = 'Priority map only · normal mission rewards';
  if (isModernCommand && dailyBriefing.capacity === 'low') {
    commandStatus = 'Continuity protected · normal XP · no completion quota';
  } else if (isModernCommand && progress.outcome === 'full-clear') {
    commandStatus = `Full Clear secured · ${progress.multiplier}× mission XP at Daily Review`;
  } else if (isModernCommand && progress.outcome === 'standard-clear') {
    commandStatus = `Command Clear secured · ${progress.multiplier}× mission XP at Daily Review`;
  } else if (isModernCommand && progress.remainingMissionCount > 0) {
    commandStatus = `${progress.remainingMissionCount} more mission${progress.remainingMissionCount === 1 ? '' : 's'} needed${progress.prioritiesComplete ? '' : ' · priority objectives also required'}`;
  } else if (isModernCommand && !progress.prioritiesComplete) {
    commandStatus = 'Completion target reached · finish the priority objectives to secure it';
  }

  return (
    <section
      className={`panel daily-briefing-card ${dailyBriefing.status === 'skipped' ? 'is-skipped' : ''}`}
    >
      <header>
        <span>
          <Icon size={21} />
        </span>
        <div>
          <p className="eyebrow">SNOW · DAILY COMMAND</p>
          <h2>
            {dailyBriefing.status === 'skipped'
              ? 'Briefing skipped for today'
              : `${dailyBriefing.capacity} capacity plan`}
          </h2>
        </div>
        {dailyBriefing.status === 'planned' && isModernCommand && (
          <span className="daily-command-lock">
            <LockKeyhole size={13} /> Locked for today
          </span>
        )}
        {(dailyBriefing.status === 'skipped' || !isModernCommand) && (
          <button
            className="text-button"
            onClick={() => void reopenDailyBriefing(dailyBriefing.date).then(refresh)}
          >
            <Edit3 size={14} />
            {dailyBriefing.status === 'skipped' ? 'Plan now' : 'Activate rewards'}
          </button>
        )}
      </header>
      {dailyBriefing.status === 'planned' && (
        <>
          <div className="daily-briefing-card__slots">
            <div>
              <span>MAIN</span>
              <strong>{mission(dailyBriefing.mainMissionId) ?? 'Open choice'}</strong>
            </div>
            {dailyBriefing.supportMissionId && (
              <div>
                <span>SUPPORT</span>
                <strong>{mission(dailyBriefing.supportMissionId)}</strong>
              </div>
            )}
            {dailyBriefing.bonusMissionId && (
              <div>
                <span>BONUS</span>
                <strong>{mission(dailyBriefing.bonusMissionId)}</strong>
              </div>
            )}
          </div>
          {isModernCommand && progress.eligibleMissionCount > 0 && (
            <div className="daily-command-progress">
              <ProgressBar
                value={progress.clearedMissionCount}
                max={progress.eligibleMissionCount}
                label={`${progress.clearedMissionCount} of ${progress.eligibleMissionCount} scheduled missions`}
                tone={progress.outcome === 'pending' ? 'purple' : 'mint'}
              />
              {dailyBriefing.capacity !== 'low' && (
                <div className="daily-command-progress__facts">
                  <span>
                    Target <strong>{progress.targetMissionCount}</strong>
                  </span>
                  <span>
                    Priorities{' '}
                    <strong>
                      {progress.completedPriorityCount}/{progress.requiredPriorityCount}
                    </strong>
                  </span>
                  <span>
                    Full Clear <strong>{dailyBriefing.fullClearMultiplier}×</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <blockquote>“{dailyBriefing.snowMessage}”</blockquote>
      <small>
        <Sparkles size={13} /> {commandStatus}
      </small>
    </section>
  );
}
