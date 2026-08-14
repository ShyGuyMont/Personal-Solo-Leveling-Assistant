import {
  Check,
  BookHeart,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Dumbbell,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/router';
import { CATEGORY_LABELS } from '@/config/missions';
import { playSystemTone, vibrate } from '@/utils/feedback';
import { STAT_LABELS } from '@/utils/format';
import { getMissionDisplayName } from '@/utils/privacy';
import { useGameStore } from '@/store/useGameStore';
import { missionAccountXp } from '@/game/rewards';
import type {
  DailyMissionRecord,
  LocalDateKey,
  MissionDefinition,
  MissionDetails,
} from '@/types/game';

export function MissionCard({
  mission,
  record,
  date,
  compact = false,
}: {
  mission: MissionDefinition;
  record: DailyMissionRecord;
  date: LocalDateKey;
  compact?: boolean;
}) {
  const {
    complete,
    undo,
    excuse,
    saveDetails,
    updateStatus,
    applyMissionPass,
    inventory,
    settings,
    streaks,
  } = useGameStore();
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<MissionDetails>(record.details);
  const [working, setWorking] = useState(false);

  useEffect(() => setDetails(record.details), [record.details]);

  const done = record.status === 'completed';
  const displayName = getMissionDisplayName(mission, settings?.sensitiveMissionAlias);
  const streak = streaks.find((item) => item.id === `mission:${mission.id}`)?.current ?? 0;
  const missionPasses = inventory.find((item) => item.id === 'mission-pass')?.quantity ?? 0;
  const unavailableToday =
    mission.method === 'day-boundary' && date === useGameStore.getState().systemDate;
  const requiresConfirmation = ['numeric', 'duration', 'checklist', 'choice'].includes(
    mission.method,
  );
  const trainingHallMission =
    mission.id === 'workout' && date === useGameStore.getState().systemDate;
  const sanctuaryMission = mission.id === 'bible' && date === useGameStore.getState().systemDate;
  const checklistComplete =
    mission.method !== 'checklist' ||
    (mission.checklistItems?.length
      ? mission.checklistItems.every((item) => details.checklist?.[item])
      : true);
  const numericComplete =
    mission.method !== 'numeric' ||
    !mission.numericTarget ||
    (details.quantity ?? 0) >= mission.numericTarget;
  const completionReady = checklistComplete && numericComplete;

  const runComplete = async () => {
    setWorking(true);
    try {
      await complete(mission.id, details, date);
      playSystemTone('complete', settings?.soundEnabled ?? false, settings?.soundVolume);
      vibrate([20, 25, 35], settings?.vibrationEnabled ?? false);
    } finally {
      setWorking(false);
    }
  };

  const runUndo = async () => {
    if (!window.confirm(`Undo ${displayName}? Its XP and stat rewards will be reversed.`)) return;
    setWorking(true);
    try {
      await undo(mission.id, date);
    } finally {
      setWorking(false);
    }
  };

  const updateDetail = <K extends keyof MissionDetails>(key: K, value: MissionDetails[K]) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  return (
    <article
      className={`mission-card mission-card--${record.status} ${compact ? 'mission-card--compact' : ''}`}
    >
      <div className="mission-card__main">
        <span className="mission-card__sigil" aria-hidden="true">
          {done ? <Check size={20} /> : <span>{displayName.slice(0, 1)}</span>}
        </span>
        <div className="mission-card__copy">
          <div className="mission-card__meta">
            <span>{CATEGORY_LABELS[mission.category]}</span>
            <span className={`status-chip status-chip--${record.status}`}>{record.status}</span>
          </div>
          <h3>{displayName}</h3>
          {!compact && <p>{mission.customDescription ?? mission.description}</p>}
          <div className="reward-line">
            <Sparkles size={13} />
            <span>+{missionAccountXp(mission)} account XP</span>
            <span>·</span>
            <span>{mission.statRewards.map((reward) => STAT_LABELS[reward.stat]).join(' · ')}</span>
            <span>· {streak} day streak</span>
          </div>
        </div>
        <div className="mission-card__actions">
          {done ? (
            <button
              className="mission-action mission-action--undo"
              onClick={runUndo}
              disabled={working}
            >
              <RotateCcw size={18} />
              <span className="sr-only">Undo {displayName}</span>
            </button>
          ) : trainingHallMission ? (
            <Link
              to="/training-hall"
              className="mission-action mission-action--training"
              aria-label="Enter the Training Hall"
            >
              <Dumbbell size={19} />
            </Link>
          ) : sanctuaryMission ? (
            <Link
              to="/sanctuary"
              className="mission-action mission-action--sanctuary"
              aria-label="Enter the Scripture Sanctuary"
            >
              <BookHeart size={19} />
            </Link>
          ) : unavailableToday || requiresConfirmation ? (
            <button
              className="mission-action mission-action--deferred"
              onClick={() => setExpanded(true)}
              aria-label={`Open ${displayName} confirmation`}
            >
              <Clock3 size={18} />
            </button>
          ) : (
            <button
              className="mission-action mission-action--complete"
              onClick={runComplete}
              disabled={working || record.status === 'failed' || record.status === 'excused'}
              aria-label={`Complete ${displayName}`}
            >
              <Check size={21} />
            </button>
          )}
          {!compact && (
            <button
              className="mission-expand"
              onClick={() => setExpanded((current) => !current)}
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${displayName}`}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div
          className={`mission-card__details ${
            mission.method === 'day-boundary' ? 'mission-card__details--day-boundary' : ''
          }`}
        >
          <header className="mission-detail-header">
            <div>
              <p className="eyebrow">MISSION CONFIRMATION</p>
              <strong>{displayName}</strong>
              <small>+{missionAccountXp(mission)} account XP</small>
            </div>
            <button className="icon-button" onClick={() => setExpanded(false)} aria-label="Close">
              <X size={19} />
            </button>
          </header>
          {trainingHallMission ? (
            <div className="training-mission-gate">
              <Dumbbell size={25} />
              <div>
                <strong>Rook and Ember are waiting in the Training Hall.</strong>
                <p>
                  Choose a home circuit, record a gym deployment, complete conditioning, or log a
                  recovery protocol. The Hall awards this mission once when the work is finished.
                </p>
              </div>
              <Link to="/training-hall" className="button button--primary">
                Enter Training Hall
              </Link>
            </div>
          ) : sanctuaryMission ? (
            <div className="sanctuary-mission-gate">
              <BookHeart size={25} />
              <div>
                <strong>Snow and Selah are waiting in the Scripture Sanctuary.</strong>
                <p>
                  Choose what you are carrying, read a guided Scripture path, reflect, and pray.
                  Your first completed Daily Study clears this mission; Stronghold support remains
                  available without repeatable XP.
                </p>
              </div>
              <Link to="/sanctuary" className="button button--primary">
                Enter Scripture Sanctuary
              </Link>
            </div>
          ) : mission.method === 'day-boundary' ? (
            <div className="evening-check">
              <div className="info-callout">
                <Clock3 size={17} />
                <span>
                  This full-day mission is confirmed after the daily reset. An evening check-in
                  records how the day is going without awarding rewards early.
                </span>
              </div>
              <div className="segmented-control">
                {[
                  ['successful', 'Still successful'],
                  ['struggling', 'Struggling'],
                  ['failed', 'Failed'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={details.eveningStatus === value ? 'is-active' : ''}
                    onClick={async () => {
                      updateDetail('eveningStatus', value as MissionDetails['eveningStatus']);
                      if (value === 'failed') {
                        await updateStatus(mission.id, 'failed', { eveningStatus: 'failed' }, date);
                      } else {
                        await saveDetails(mission.id, {
                          eveningStatus: value as 'successful' | 'struggling',
                        });
                      }
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {details.eveningStatus === 'struggling' && (
                <p className="supportive-copy">
                  Pause, change your environment, and choose the next healthy action. No verdict has
                  been recorded.
                </p>
              )}
              {details.eveningStatus === 'failed' && (
                <p className="supportive-copy">
                  The mission was not completed. Recovery protocol is available.
                </p>
              )}
              <label className="field field--wide">
                <span>Private trigger / support note · optional</span>
                <textarea
                  value={details.note ?? ''}
                  onChange={(event) => updateDetail('note', event.target.value)}
                  onBlur={() => void saveDetails(mission.id, details)}
                  placeholder="What made the moment harder, or what helped?"
                  rows={2}
                />
              </label>
            </div>
          ) : (
            <>
              {mission.detailFields.includes('creatorChoice') && (
                <label className="field">
                  <span>Work path</span>
                  <select
                    value={details.creatorChoice ?? 'arc'}
                    onChange={(event) =>
                      updateDetail(
                        'creatorChoice',
                        event.target.value as 'youtube' | 'arc' | 'both',
                      )
                    }
                  >
                    <option value="youtube">YouTube</option>
                    <option value="arc">ARC</option>
                    <option value="both">Both</option>
                  </select>
                </label>
              )}
              {mission.detailFields.includes('passage') && (
                <label className="field">
                  <span>Passage</span>
                  <input
                    value={details.passage ?? ''}
                    onChange={(event) => updateDetail('passage', event.target.value)}
                    placeholder="Optional passage"
                  />
                </label>
              )}
              {mission.detailFields.includes('recipient') && (
                <label className="field">
                  <span>Who it was for</span>
                  <input
                    value={details.recipient ?? ''}
                    onChange={(event) => updateDetail('recipient', event.target.value)}
                    placeholder="Private and optional"
                  />
                </label>
              )}
              {(mission.detailFields.includes('minutes') ||
                mission.detailFields.includes('duration')) && (
                <label className="field">
                  <span>Minutes</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={details.minutes ?? details.duration ?? ''}
                    onChange={(event) => {
                      const value = event.target.value ? Number(event.target.value) : undefined;
                      updateDetail(
                        mission.detailFields.includes('minutes') ? 'minutes' : 'duration',
                        value,
                      );
                    }}
                    placeholder="Optional"
                  />
                </label>
              )}
              {mission.detailFields.includes('distance') && (
                <label className="field">
                  <span>Distance</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={details.distance ?? ''}
                    onChange={(event) =>
                      updateDetail(
                        'distance',
                        event.target.value ? Number(event.target.value) : undefined,
                      )
                    }
                    placeholder="Optional"
                  />
                </label>
              )}
              {mission.detailFields.includes('quantity') && (
                <label className="field">
                  <span>Amount {mission.numericUnit ? `· ${mission.numericUnit}` : ''}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={details.quantity ?? ''}
                    onChange={(event) =>
                      updateDetail(
                        'quantity',
                        event.target.value ? Number(event.target.value) : undefined,
                      )
                    }
                    placeholder={
                      mission.numericTarget ? `Target: ${mission.numericTarget}` : 'Optional'
                    }
                  />
                </label>
              )}
              {mission.method === 'checklist' && (
                <fieldset className="mission-checklist">
                  <legend>Completion checklist</legend>
                  {(mission.checklistItems ?? []).map((item) => (
                    <label key={item}>
                      <input
                        type="checkbox"
                        checked={details.checklist?.[item] ?? false}
                        onChange={(event) =>
                          updateDetail('checklist', {
                            ...details.checklist,
                            [item]: event.target.checked,
                          })
                        }
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </fieldset>
              )}
              {mission.detailFields.includes('workoutType') && (
                <label className="field">
                  <span>Workout type</span>
                  <input
                    value={details.workoutType ?? ''}
                    onChange={(event) => updateDetail('workoutType', event.target.value)}
                    placeholder="Strength, run, mobility…"
                  />
                </label>
              )}
              {mission.detailFields.includes('difficulty') && (
                <label className="field">
                  <span>Difficulty · {details.difficulty ?? 3}/5</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={details.difficulty ?? 3}
                    onChange={(event) => updateDetail('difficulty', Number(event.target.value))}
                  />
                </label>
              )}
              {mission.detailFields.includes('workPerformed') && (
                <label className="field field--wide">
                  <span>Work performed</span>
                  <input
                    value={details.workPerformed ?? ''}
                    onChange={(event) => updateDetail('workPerformed', event.target.value)}
                    placeholder="Planned, wrote, recorded, edited…"
                  />
                </label>
              )}
              {mission.allowNotes && (
                <label className="field field--wide">
                  <span>Private note</span>
                  <textarea
                    value={details.note ?? ''}
                    onChange={(event) => updateDetail('note', event.target.value)}
                    placeholder="Optional reflection"
                    rows={2}
                  />
                </label>
              )}
              {!done && record.status === 'pending' && (
                <button
                  className="button button--primary button--wide"
                  onClick={runComplete}
                  disabled={!completionReady || working}
                >
                  <Check size={18} />
                  Complete mission
                </button>
              )}
              {Object.keys(details).length > 0 && !done && (
                <button
                  className="button button--ghost"
                  onClick={() => saveDetails(mission.id, details)}
                >
                  Save details
                </button>
              )}
            </>
          )}
          {!done && record.status === 'pending' && (
            <div className="mission-card__exception-row">
              {missionPasses > 0 && (
                <button
                  className="text-button text-button--pass"
                  onClick={async () => {
                    if (
                      window.confirm(
                        `Use a Mission Pass on ${displayName}? It grants no XP but protects the day.`,
                      )
                    ) {
                      await applyMissionPass(mission.id, date);
                    }
                  }}
                >
                  <Ticket size={15} />
                  Use pass · {missionPasses}
                </button>
              )}
              <button
                className="text-button"
                onClick={async () => {
                  if (window.confirm('Mark this mission excused? It will grant no XP.')) {
                    await excuse(mission.id, false, date);
                  }
                }}
              >
                <CircleAlert size={15} />
                Excuse
              </button>
              <button
                className="text-button"
                onClick={async () => {
                  if (
                    window.confirm(
                      'Use a protected exception? It grants no XP, but may preserve a streak.',
                    )
                  ) {
                    await excuse(mission.id, true, date);
                  }
                }}
              >
                <ShieldCheck size={15} />
                Protect
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
