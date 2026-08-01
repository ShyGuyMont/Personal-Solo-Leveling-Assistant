import { Check, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getDailyMissionRecords } from '@/db/repositories';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/ProgressBar';
import { useGameStore } from '@/store/useGameStore';
import { formatLongDate } from '@/utils/date';
import { getMissionDisplayName } from '@/utils/privacy';
import type { DailyMissionRecord, DailyReview, MissionDefinition } from '@/types/game';

export function DailyReviewModal() {
  const {
    pendingReview,
    missions,
    complete,
    updateStatus,
    excuse,
    finalizeReview,
    systemDate,
    settings,
  } = useGameStore();
  const [records, setRecords] = useState<DailyMissionRecord[]>([]);
  const [finalizing, setFinalizing] = useState(false);
  const [result, setResult] = useState<DailyReview>();
  const pendingDate = pendingReview?.date;

  const reload = async () => {
    if (!pendingReview) return;
    setRecords(await getDailyMissionRecords(pendingReview.date));
  };

  useEffect(() => {
    setResult(undefined);
    if (!pendingDate) {
      setRecords([]);
      return;
    }
    void getDailyMissionRecords(pendingDate).then(setRecords);
  }, [pendingDate]);

  const missionMap = useMemo(
    () => new Map<string, MissionDefinition>(missions.map((mission) => [mission.id, mission])),
    [missions],
  );
  const coreRecords = records.filter((record) => !missionMap.get(record.missionId)?.optional);
  const resolved = coreRecords.filter((record) => record.status !== 'pending').length;
  const canFinalize = coreRecords.length > 0 && resolved === coreRecords.length;

  if (!pendingReview) return null;

  return (
    <Modal
      open
      lock
      onClose={() => undefined}
      eyebrow="DAILY REVIEW REQUIRED"
      title={formatLongDate(pendingReview.date)}
    >
      {result ? (
        <div className="review-verdict">
          <span className="review-verdict__mark">
            <Check size={28} />
          </span>
          <p className="eyebrow">CYCLE FINALIZED</p>
          <h3>{result.verdict}</h3>
          {result.dailyCommandCapacity && (
            <div
              className={`review-command-result review-command-result--${result.dailyCommandOutcome}`}
            >
              <span>SNOW · DAILY COMMAND</span>
              <strong>
                {result.dailyCommandOutcome === 'full-clear'
                  ? `Full Clear · ${result.dailyCommandMultiplier}×`
                  : result.dailyCommandOutcome === 'standard-clear'
                    ? `Command Clear · ${result.dailyCommandMultiplier}×`
                    : result.dailyCommandCapacity === 'low'
                      ? 'Low Capacity continuity protected'
                      : 'Command target not reached'}
              </strong>
              <small>
                {result.dailyCommandBonusXp
                  ? `+${result.dailyCommandBonusXp} account XP plus matching mission stat XP bonuses`
                  : result.dailyCommandOutcome === 'missed'
                    ? 'No XP removed. Every normal mission reward remains yours.'
                    : 'Normal mission and Perfect Day rewards were preserved.'}
              </small>
            </div>
          )}
          <p>Yesterday is sealed. Today’s objectives are now fully active.</p>
        </div>
      ) : (
        <>
          <p className="modal-intro">
            Resolve the previous cycle. Rewards and penalties are applied once, then preserved as a
            permanent review record.
          </p>
          <ProgressBar value={resolved} max={coreRecords.length} label="Core review resolution" />
          <div className="review-list">
            {records.map((record) => {
              const mission = missionMap.get(record.missionId);
              if (!mission) return null;
              return (
                <div key={record.id} className={`review-row review-row--${record.status}`}>
                  <div>
                    <span className="review-row__status">{record.status}</span>
                    <strong>
                      {getMissionDisplayName(mission, settings?.sensitiveMissionAlias)}
                    </strong>
                    {mission.id === 'no-porn' && <small>Full-day confirmation required</small>}
                  </div>
                  {record.status === 'pending' ? (
                    <div className="review-row__actions">
                      <button
                        className="mini-button mini-button--success"
                        onClick={async () => {
                          await complete(mission.id, record.details, pendingReview.date);
                          await reload();
                        }}
                      >
                        <Check size={15} />
                        Complete
                      </button>
                      <button
                        className="mini-button"
                        onClick={async () => {
                          await updateStatus(mission.id, 'failed', undefined, pendingReview.date);
                          await reload();
                        }}
                      >
                        <X size={15} />
                        Missed
                      </button>
                      <button
                        className="mini-button"
                        onClick={async () => {
                          await excuse(mission.id, false, pendingReview.date);
                          await reload();
                        }}
                      >
                        Excuse
                      </button>
                      <button
                        className="mini-button mini-button--protect"
                        onClick={async () => {
                          await excuse(mission.id, true, pendingReview.date);
                          await reload();
                        }}
                      >
                        <ShieldCheck size={15} />
                        Protect
                      </button>
                    </div>
                  ) : (
                    <span className="review-row__resolved">
                      <Check size={16} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <button
            className="button button--primary button--wide"
            disabled={!canFinalize || finalizing}
            onClick={async () => {
              setFinalizing(true);
              try {
                const review = await finalizeReview(pendingReview.date);
                setResult(review);
                window.setTimeout(() => void useGameStore.getState().refresh(), 1800);
              } finally {
                setFinalizing(false);
              }
            }}
          >
            {finalizing ? 'Applying results…' : 'Finalize review'}
          </button>
          <p className="microcopy">
            The current system day is {systemDate}. Closing the app will not lose this review.
          </p>
        </>
      )}
    </Modal>
  );
}
