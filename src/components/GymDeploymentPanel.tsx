import {
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Dumbbell,
  Flame,
  RotateCcw,
  ShieldCheck,
  TimerReset,
  Trophy,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EMBER_GYM_LINES, GYM_WORKOUTS, ROOK_GYM_LINES, getGymWorkout } from '@/config/training';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  assignGymWorkout,
  completeGymTraining,
  isGymWorkoutComplete,
  saveGymProgress,
  type GymWorkoutAvailability,
} from '@/game/training';
import type { GymExerciseSetLog, GymWorkoutId, TrainingSession } from '@/types/game';

interface GymDeploymentPanelProps {
  session: TrainingSession;
  availability: GymWorkoutAvailability[];
  working: boolean;
  onWorkingChange: (working: boolean) => void;
  onSessionChange: (session: TrainingSession) => void;
  onComplete: (session: TrainingSession) => Promise<void>;
  onBack: () => Promise<void>;
  onError: (message: string) => void;
}

function formatRest(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function GymDeploymentPanel({
  session,
  availability,
  working,
  onWorkingChange,
  onSessionChange,
  onComplete,
  onBack,
  onError,
}: GymDeploymentPanelProps) {
  const [logs, setLogs] = useState<Record<string, GymExerciseSetLog[]>>(
    session.gymExerciseLogs ?? {},
  );
  const [choices, setChoices] = useState<Record<string, string>>(session.gymExerciseChoices ?? {});
  const [finisherCompleted, setFinisherCompleted] = useState(session.gymFinisherCompleted ?? false);
  const [duration, setDuration] = useState(session.loggedDurationMinutes ?? 65);
  const [difficulty, setDifficulty] = useState(session.difficulty ?? 3);
  const [note, setNote] = useState(session.note ?? '');
  const [restRemaining, setRestRemaining] = useState(0);

  useEffect(() => {
    setLogs(session.gymExerciseLogs ?? {});
    setChoices(session.gymExerciseChoices ?? {});
    setFinisherCompleted(session.gymFinisherCompleted ?? false);
  }, [
    session.id,
    session.gymExerciseChoices,
    session.gymExerciseLogs,
    session.gymFinisherCompleted,
  ]);

  useEffect(() => {
    if (restRemaining <= 0) return;
    const timer = window.setInterval(
      () => setRestRemaining((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [restRemaining]);

  const workout = session.gymWorkoutId ? getGymWorkout(session.gymWorkoutId) : undefined;
  const preparedSession = useMemo(() => ({ ...session, gymExerciseLogs: logs }), [logs, session]);
  const complete = isGymWorkoutComplete(preparedSession);
  const completedSetCount = Object.values(logs)
    .flat()
    .filter((set) => set.completed).length;
  const totalSetCount = workout?.exercises.reduce((sum, exercise) => sum + exercise.sets, 0) ?? 0;

  const run = async (action: () => Promise<TrainingSession | undefined>) => {
    onWorkingChange(true);
    onError('');
    try {
      const next = await action();
      if (next) onSessionChange(next);
      return next;
    } catch (caught) {
      onError(
        caught instanceof Error ? caught.message : 'The Gym Deployment could not be updated.',
      );
      return undefined;
    } finally {
      onWorkingChange(false);
    }
  };

  const chooseWorkout = async (workoutId: GymWorkoutId) => {
    const next = await run(() => assignGymWorkout(session.id, workoutId));
    if (next) {
      setLogs(next.gymExerciseLogs ?? {});
      setChoices(next.gymExerciseChoices ?? {});
      setFinisherCompleted(false);
    }
  };

  const persist = async (
    nextLogs = logs,
    nextChoices = choices,
    nextFinisher = finisherCompleted,
  ) => {
    const next = await saveGymProgress(session.id, {
      logs: nextLogs,
      choices: nextChoices,
      finisherCompleted: nextFinisher,
    });
    if (next) onSessionChange(next);
  };

  const updateSet = (exerciseId: string, index: number, patch: Partial<GymExerciseSetLog>) => {
    setLogs((current) => {
      const next = {
        ...current,
        [exerciseId]: (current[exerciseId] ?? []).map((set, setIndex) =>
          setIndex === index ? { ...set, ...patch } : set,
        ),
      };
      void persist(next, choices, finisherCompleted);
      return next;
    });
  };

  const finish = async () => {
    onWorkingChange(true);
    onError('');
    try {
      const next = await completeGymTraining({
        sessionId: session.id,
        duration,
        difficulty,
        logs,
        choices,
        finisherCompleted,
        note,
      });
      onSessionChange(next);
      await onComplete(next);
    } catch (caught) {
      onError(
        caught instanceof Error ? caught.message : 'The Gym Deployment could not be completed.',
      );
    } finally {
      onWorkingChange(false);
    }
  };

  if (!workout) {
    const recommended = availability.find((entry) => entry.status === 'recommended');
    return (
      <section className="panel gym-deployment-picker">
        <header className="section-header">
          <div>
            <p className="eyebrow">ROOK · TRAINING LEDGER</p>
            <h2>Choose today’s Gym Deployment</h2>
            <p>
              Three foundational sessions form the week. Heavenly Restriction is the optional
              fourth.
            </p>
          </div>
          <ShieldCheck size={24} />
        </header>

        {recommended && (
          <div className="gym-recommendation-callout">
            <img src={getCompanionImage(getCompanion('rook').image)} alt="" />
            <div>
              <span>ROOK RECOMMENDS</span>
              <strong>{getGymWorkout(recommended.id).name}</strong>
              <p>“{recommended.reason}”</p>
            </div>
          </div>
        )}

        <div className="gym-workout-grid">
          {GYM_WORKOUTS.map((candidate) => {
            const state = availability.find((entry) => entry.id === candidate.id);
            return (
              <button
                key={candidate.id}
                className={`gym-workout-card is-${candidate.accent} is-${state?.status ?? 'ready'}`}
                disabled={working}
                onClick={() => void chooseWorkout(candidate.id)}
              >
                <span className="gym-workout-card__status">
                  {state?.status === 'recommended'
                    ? 'RECOMMENDED'
                    : state?.status === 'recent'
                      ? 'RECOVERY MAY BE ACTIVE'
                      : candidate.core
                        ? 'FOUNDATIONAL'
                        : 'OPTIONAL FOURTH'}
                </span>
                <strong>{candidate.name}</strong>
                <small>{candidate.focus}</small>
                <p>{candidate.summary}</p>
                {state?.lastCompletedDate && <em>Last clear · {state.lastCompletedDate}</em>}
                <ChevronRight size={19} />
              </button>
            );
          })}
        </div>
        <button className="text-button" onClick={() => void onBack()}>
          Choose another training path
        </button>
      </section>
    );
  }

  return (
    <>
      <section className={`panel gym-deployment-briefing is-${workout.accent}`}>
        <div className="training-dialogue">
          <article className="is-rook">
            <img src={getCompanionImage(getCompanion('rook').image)} alt="" />
            <div>
              <span>ROOK · SESSION COMMAND</span>
              <p>
                “
                {
                  ROOK_GYM_LINES[workout.id][
                    session.briefingVariant % ROOK_GYM_LINES[workout.id].length
                  ]
                }
                ”
              </p>
            </div>
          </article>
          <article className="is-ember">
            <img src={getCompanionImage(getCompanion('ember').image)} alt="" />
            <div>
              <span>EMBER · PRESSURE CONTROL</span>
              <p>
                “
                {
                  EMBER_GYM_LINES[workout.id][
                    session.briefingVariant % EMBER_GYM_LINES[workout.id].length
                  ]
                }
                ”
              </p>
            </div>
          </article>
        </div>
        <div className="gym-session-progress">
          <span>{workout.codename}</span>
          <strong>
            {completedSetCount}/{totalSetCount}
          </strong>
          <small>WORKING SETS</small>
        </div>
      </section>

      {restRemaining > 0 && (
        <aside className="gym-rest-dock" aria-live="polite">
          <TimerReset size={19} />
          <span>RECOVERY CLOCK</span>
          <strong>{formatRest(restRemaining)}</strong>
          <button onClick={() => setRestRemaining(0)}>Skip</button>
        </aside>
      )}

      <section className={`panel gym-workout-console is-${workout.accent}`}>
        <header className="section-header">
          <div>
            <p className="eyebrow">{workout.codename}</p>
            <h2>{workout.name}</h2>
            <p>{workout.focus}</p>
          </div>
          <Dumbbell size={24} />
        </header>
        <p className="gym-working-set-note">
          The rows below are working sets. Use sensible ramp-up sets before the first heavy
          movement; they do not need to be logged. Stop before technique breaks.
        </p>

        <div className="gym-exercise-stack">
          {workout.exercises.map((exercise, exerciseIndex) => {
            const exerciseSets = logs[exercise.id] ?? [];
            const exerciseComplete =
              exerciseSets.length > 0 && exerciseSets.every((set) => set.completed);
            const options = [exercise.name, ...exercise.alternatives];
            return (
              <article key={exercise.id} className={exerciseComplete ? 'is-complete' : ''}>
                <header>
                  <span>{String(exerciseIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <select
                      aria-label={`Exercise choice for ${exercise.name}`}
                      value={choices[exercise.id] ?? exercise.name}
                      onChange={(event) => {
                        const nextChoices = { ...choices, [exercise.id]: event.target.value };
                        setChoices(nextChoices);
                        void persist(logs, nextChoices, finisherCompleted);
                      }}
                    >
                      {options.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <b>
                      {exercise.sets} sets · {exercise.repMin}–{exercise.repMax} {exercise.unit}
                    </b>
                  </div>
                  {exerciseComplete ? <CheckCircle2 size={21} /> : <Circle size={21} />}
                </header>
                <p>{exercise.cue}</p>
                <div className="gym-set-grid">
                  {exerciseSets.map((set, setIndex) => (
                    <div key={setIndex} className={set.completed ? 'is-complete' : ''}>
                      <button
                        className="gym-set-check"
                        onClick={() =>
                          updateSet(exercise.id, setIndex, { completed: !set.completed })
                        }
                        aria-label={`${set.completed ? 'Reopen' : 'Complete'} set ${setIndex + 1}`}
                      >
                        {set.completed ? <Check size={16} /> : setIndex + 1}
                      </button>
                      {!exercise.bodyweight && (
                        <label>
                          <span>LB</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max="2000"
                            value={set.weight ?? ''}
                            onChange={(event) =>
                              updateSet(exercise.id, setIndex, {
                                weight: event.target.value ? Number(event.target.value) : undefined,
                              })
                            }
                          />
                        </label>
                      )}
                      <label>
                        <span>{exercise.unit === 'seconds' ? 'SEC' : 'REPS'}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="999"
                          value={set.reps ?? ''}
                          onChange={(event) =>
                            updateSet(exercise.id, setIndex, {
                              reps: event.target.value ? Number(event.target.value) : undefined,
                            })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  className="gym-rest-button"
                  onClick={() => setRestRemaining(exercise.restSeconds)}
                >
                  <TimerReset size={15} /> Rest {exercise.restSeconds}s
                </button>
              </article>
            );
          })}
        </div>

        {session.gymFinisher && (
          <section className={`gym-finisher ${finisherCompleted ? 'is-complete' : ''}`}>
            <Flame size={22} />
            <div>
              <span>EMBER’S OPTIONAL FINISHER</span>
              <strong>
                {session.gymFinisher.name} · {session.gymFinisher.minutes} minutes
              </strong>
              <p>{session.gymFinisher.cue}</p>
              <small>Optional and worth no extra XP. The strength work remains the priority.</small>
            </div>
            <button
              onClick={() => {
                const next = !finisherCompleted;
                setFinisherCompleted(next);
                void persist(logs, choices, next);
              }}
            >
              {finisherCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
          </section>
        )}

        <div className="form-grid gym-completion-form">
          <label className="field">
            <span>Completed minutes</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="360"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Effort · {difficulty}/5</span>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value))}
            />
          </label>
          <label className="field field--wide">
            <span>Private session note · optional</span>
            <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
        </div>

        <div className="gym-completion-actions">
          <button
            className="button button--primary"
            disabled={working || !complete || duration < 1}
            onClick={() => void finish()}
          >
            <Trophy size={18} /> Clear {workout.name}
          </button>
          {!complete && (
            <small>
              Complete all {totalSetCount} prescribed working sets to clear this deployment.
            </small>
          )}
          <button
            className="button button--ghost"
            disabled={working}
            onClick={() => {
              if (
                window.confirm('Choose a different Gym Deployment? Current set entries will reset.')
              ) {
                void chooseWorkout(
                  availability.find((entry) => entry.status === 'recommended')?.id ??
                    GYM_WORKOUTS[0].id,
                );
              }
            }}
          >
            <RotateCcw size={16} /> Reset to Rook’s recommendation
          </button>
        </div>
      </section>
    </>
  );
}
