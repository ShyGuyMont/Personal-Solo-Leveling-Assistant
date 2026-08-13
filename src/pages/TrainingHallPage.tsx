import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  History,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Timer,
  Trophy,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { BodyDiagnosticPanel } from '@/components/BodyDiagnosticPanel';
import { GymDeploymentPanel } from '@/components/GymDeploymentPanel';
import { MobilityProtocolPanel } from '@/components/MobilityProtocolPanel';
import { BALANCE } from '@/config/balance';
import {
  EMBER_DURATION_LINES,
  ROOK_CIRCUIT_LINES,
  ROOK_TIME_REPLIES,
  getGymWorkout,
  getTrainingCircuit,
  getTrainingTimeTitle,
} from '@/config/training';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import { getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import {
  abandonTrainingSession,
  activateBossExtension,
  assignHomeTraining,
  completeHomeTraining,
  completeLoggedTraining,
  getRemainingTrainingSeconds,
  getTrainingDebriefMessage,
  getTrainingHallData,
  markTrainingTimerComplete,
  pauseTrainingTimer,
  saveTrainingLoads,
  saveTrainingProgress,
  selectTrainingLocation,
  startTrainingTimer,
  type GymWorkoutAvailability,
  type MultiPathRewardTier,
} from '@/game/training';
import { useGameStore } from '@/store/useGameStore';
import type { CompanionId, TrainingLocation, TrainingSession } from '@/types/game';

const LOCATION_OPTIONS: Array<{
  id: TrainingLocation;
  title: string;
  subtitle: string;
  icon: typeof Dumbbell;
}> = [
  {
    id: 'home',
    title: 'Home Circuit',
    subtitle: 'Rook assigns the protocol. Ember sets the clock.',
    icon: Dumbbell,
  },
  {
    id: 'gym',
    title: 'Gym Deployment',
    subtitle: 'Choose a Toji Ascension session and track every working set.',
    icon: Building2,
  },
  {
    id: 'conditioning',
    title: 'Conditioning Mission',
    subtitle: 'Walk, run, or complete another dedicated conditioning effort.',
    icon: Footprints,
  },
  {
    id: 'recovery',
    title: 'Stillpoint Protocol',
    subtitle: 'Mira rolls guided mobility, yoga or Pilates—with breath and core in every session.',
    icon: HeartPulse,
  },
];

const POST_TRAINING_STATES: Record<CompanionId, string> = {
  snow: 'Breathless · still watching over everyone',
  rook: 'Spent · pretending this was tactical',
  selah: 'Recovering · already stretching',
  cipher: 'Data secured · dignity unavailable',
  haven: 'Tired · distributing water anyway',
  ember: 'Destroyed · asking for another round',
  mira: 'Centered · breathing like none of that was difficult',
  amara: 'Disheveled · openly proud',
  cassian: 'Physically insolvent · floor-bound',
  saffron: 'Famished · threatening the recovery meal',
};

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function trainingLabel(session: TrainingSession) {
  if (session.circuitId) return getTrainingCircuit(session.circuitId).name;
  if (session.gymWorkoutId) return getGymWorkout(session.gymWorkoutId).name;
  if (session.location === 'recovery' && session.recoveryProtocol) return session.recoveryProtocol;
  return (
    {
      gym: 'Gym Deployment',
      conditioning: 'Conditioning Mission',
      recovery: 'Recovery Protocol',
      home: 'Home Circuit',
    } as const
  )[session.location];
}

function trainingMinutes(session: TrainingSession) {
  return session.durationMinutes
    ? session.durationMinutes + (session.bossExtensionUsed ? 5 : 0)
    : (session.loggedDurationMinutes ?? 0);
}

function formatMinutes(minutes: number) {
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

export function TrainingHallPage() {
  const { systemDate, todayRecords, complete, refresh } = useGameStore();
  const [session, setSession] = useState<TrainingSession>();
  const [todaySessions, setTodaySessions] = useState<TrainingSession[]>([]);
  const [recent, setRecent] = useState<TrainingSession[]>([]);
  const [gymAvailability, setGymAvailability] = useState<GymWorkoutAvailability[]>([]);
  const [multiPathRewardTiers, setMultiPathRewardTiers] = useState<MultiPathRewardTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(Date.now());
  const [loads, setLoads] = useState<Record<string, number>>({});
  const [rounds, setRounds] = useState(0);
  const [partialReps, setPartialReps] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [note, setNote] = useState('');
  const [loggedDuration, setLoggedDuration] = useState(45);
  const [conditioningType, setConditioningType] =
    useState<TrainingSession['conditioningType']>('walk-run');
  const [distance, setDistance] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [diagnosticReward, setDiagnosticReward] = useState('');
  const workoutRecord = todayRecords.find((record) => record.missionId === 'workout');
  const workoutCompleted = workoutRecord?.status === 'completed';

  const reload = useCallback(async () => {
    const data = await getTrainingHallData(systemDate);
    setSession(data.today);
    setTodaySessions(data.todaySessions);
    setRecent(data.recent);
    setGymAvailability(data.gymAvailability);
    setMultiPathRewardTiers(data.multiPathRewardTiers);
    if (data.today) {
      setLoads(data.today.exerciseLoads ?? {});
      setRounds(data.today.roundsCompleted ?? 0);
      setPartialReps(data.today.partialReps ?? 0);
      setDifficulty(data.today.difficulty ?? 3);
      setNote(data.today.note ?? '');
      setLoggedDuration(
        data.today.loggedDurationMinutes ?? (data.today.location === 'gym' ? 45 : 20),
      );
      setConditioningType(data.today.conditioningType ?? 'walk-run');
      setDistance(data.today.distance ? String(data.today.distance) : '');
    }
    setLoading(false);
  }, [systemDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (session?.status !== 'active') return;
    const interval = window.setInterval(() => setTick(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [session?.status]);

  const remainingSeconds = session ? getRemainingTrainingSeconds(session, tick) : 0;

  useEffect(() => {
    if (!session || session.status !== 'active' || remainingSeconds > 0) return;
    void markTrainingTimerComplete(session.id).then((next) => {
      if (next) setSession(next);
    });
  }, [remainingSeconds, session, systemDate]);

  useEffect(() => {
    if (session?.status !== 'completed') return;
    void getFavoriteMessages().then((favorites) =>
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.id))),
    );
  }, [session?.status]);

  const circuit = session?.circuitId ? getTrainingCircuit(session.circuitId) : undefined;
  const run = async (action: () => Promise<TrainingSession | undefined>) => {
    setWorking(true);
    setError('');
    try {
      const next = await action();
      if (next) {
        setTick(Date.now());
        setSession(next);
      }
      return next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The Training Hall could not respond.');
      return undefined;
    } finally {
      setWorking(false);
    }
  };

  const syncWorkoutMission = async (completedSession: TrainingSession) => {
    if (!workoutRecord || workoutRecord.status === 'completed') return;
    const minutes = trainingMinutes(completedSession);
    await complete(
      'workout',
      {
        workoutType: trainingLabel(completedSession),
        duration: minutes,
        difficulty: completedSession.difficulty,
        note: completedSession.note,
        trainingSessionId: completedSession.id,
      },
      systemDate,
    );
  };

  const chooseLocation = async (location: TrainingLocation) => {
    const next = await run(() => selectTrainingLocation(systemDate, location));
    if (!next) return;
    setLoggedDuration(
      location === 'gym'
        ? 65
        : location === 'conditioning'
          ? 25
          : (next.mobilityEstimatedMinutes ?? 15),
    );
  };

  const updateRounds = async (nextRounds: number) => {
    if (!session) return;
    const value = Math.max(0, nextRounds);
    setRounds(value);
    await saveTrainingProgress(session.id, { roundsCompleted: value });
  };

  const updatePartial = async (nextPartial: number) => {
    if (!session) return;
    const value = Math.max(0, nextPartial);
    setPartialReps(value);
    await saveTrainingProgress(session.id, { partialReps: value });
  };

  const finishHome = async () => {
    const completedSession = await run(() =>
      completeHomeTraining({
        sessionId: session?.id,
        date: systemDate,
        roundsCompleted: rounds,
        partialReps,
        difficulty,
        exerciseLoads: loads,
        note,
      }),
    );
    if (!completedSession) return;
    try {
      await syncWorkoutMission(completedSession);
      await reload();
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} Your session is safe; use Sync mission credit below.`
          : 'The session is safe, but mission credit still needs to be synced.',
      );
    }
  };

  const finishLogged = async () => {
    if (!session || session.location === 'home') return;
    const location = session.location;
    const completedSession = await run(() =>
      completeLoggedTraining({
        sessionId: session.id,
        date: systemDate,
        location,
        duration: loggedDuration,
        difficulty,
        conditioningType: session.location === 'conditioning' ? conditioningType : undefined,
        distance: session.location === 'conditioning' && distance ? Number(distance) : undefined,
        note,
      }),
    );
    if (!completedSession) return;
    try {
      await syncWorkoutMission(completedSession);
      await reload();
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} Your session is safe; use Sync mission credit below.`
          : 'The session is safe, but mission credit still needs to be synced.',
      );
    }
  };

  const finishMobility = async (input: {
    duration: number;
    difficulty: number;
    note: string;
    completedMovementIds: string[];
  }) => {
    if (!session || session.location !== 'recovery') return;
    const completedSession = await run(() =>
      completeLoggedTraining({
        sessionId: session.id,
        date: systemDate,
        location: 'recovery',
        duration: input.duration,
        difficulty: input.difficulty,
        recoveryProtocol: session.recoveryProtocol,
        mobilityCompletedMovementIds: input.completedMovementIds,
        note: input.note,
      }),
    );
    if (!completedSession) return;
    try {
      await syncWorkoutMission(completedSession);
      await reload();
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} Your Stillpoint Protocol is safe; use Sync mission credit below.`
          : 'The Stillpoint Protocol is safe, but mission credit still needs to be synced.',
      );
    }
  };

  const finishStructuredGym = async (completedSession: TrainingSession) => {
    try {
      await syncWorkoutMission(completedSession);
      await reload();
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} Your Gym Deployment is safe; use Sync mission credit below.`
          : 'The Gym Deployment is safe, but mission credit still needs to be synced.',
      );
    }
  };

  const chooseDifferentPath = async () => {
    if (!session || ['active', 'paused'].includes(session.status)) {
      setError('End the active circuit before changing deployment paths.');
      return;
    }
    await abandonTrainingSession(session.id);
    setSession(undefined);
    setError('');
  };

  const returnToHallCommand = async () => {
    if (!session) return;
    if (['active', 'paused'].includes(session.status)) {
      if (
        !window.confirm(
          'Return to Training Hall command? This active deployment will end without Daily Workout credit.',
        )
      ) {
        return;
      }
      await abandonTrainingSession(session.id);
      setSession(undefined);
      setError('');
      await reload();
      return;
    }
    await chooseDifferentPath();
  };

  const recentBest = useMemo(() => {
    if (!session?.circuitId) return undefined;
    return recent
      .filter(
        (entry) =>
          entry.circuitId === session.circuitId &&
          entry.durationMinutes === session.durationMinutes &&
          entry.status === 'completed',
      )
      .sort((a, b) => (b.roundsCompleted ?? 0) - (a.roundsCompleted ?? 0))[0];
  }, [recent, session?.circuitId, session?.durationMinutes]);

  const completedLocations = new Set(
    todaySessions.filter((entry) => entry.status === 'completed').map((entry) => entry.location),
  );
  const completedPathCount = completedLocations.size;
  const availableTrainingPaths = LOCATION_OPTIONS.filter(({ id }) => !completedLocations.has(id));
  const highestRewardTier = multiPathRewardTiers.at(-1);
  const nextRewardTier =
    completedPathCount >= 1 && completedPathCount < 4
      ? ((completedPathCount + 1) as MultiPathRewardTier)
      : undefined;
  const multiPathRewardXp = multiPathRewardTiers.reduce(
    (sum, tier) => sum + BALANCE.training.multiPathTiers[tier].accountXp,
    0,
  );

  if (loading) {
    return (
      <div className="page training-hall-page">
        <section className="panel training-loading">
          <Dumbbell size={28} />
          <span>Opening the Training Hall…</span>
        </section>
      </div>
    );
  }

  const renderHistory = () => (
    <section className="panel training-history">
      <header className="section-header">
        <div>
          <p className="eyebrow">HALL RECORD</p>
          <h2>Recent deployments</h2>
        </div>
        <History size={21} />
      </header>
      <div className="training-history__list">
        {recent.slice(0, 8).map((entry) => (
          <article key={entry.id}>
            <span className={`training-history__mark is-${entry.location}`}>
              {entry.location === 'home' ? <Dumbbell size={17} /> : <Check size={17} />}
            </span>
            <div>
              <strong>{trainingLabel(entry)}</strong>
              <small>
                {entry.date} · {formatMinutes(trainingMinutes(entry))}
                {entry.roundsCompleted !== undefined ? ` · ${entry.roundsCompleted} rounds` : ''}
              </small>
            </div>
            <span>{entry.difficulty ?? 3}/5</span>
          </article>
        ))}
        {!recent.length && (
          <p className="training-empty-copy">Your first cleared deployment will appear here.</p>
        )}
      </div>
    </section>
  );

  const renderDiagnostic = () => (
    <>
      <BodyDiagnosticPanel
        systemDate={systemDate}
        onReward={({ xp, levelsGained }) => {
          setDiagnosticReward(
            xp > 0
              ? `Weekly Body Diagnostic cleared · +${xp} XP${levelsGained ? ` · Level +${levelsGained}` : ''}`
              : 'Weekly Body Diagnostic secured.',
          );
          void refresh();
        }}
      />
      {diagnosticReward && (
        <div className="body-diagnostic-reward-notice">
          <Sparkles size={18} />
          <strong>{diagnosticReward}</strong>
          <button type="button" onClick={() => setDiagnosticReward('')}>
            <Check size={15} /> Acknowledge
          </button>
        </div>
      )}
    </>
  );

  if (workoutCompleted && !todaySessions.length) {
    return (
      <div className="page training-hall-page">
        <header className="page-heading training-page-heading">
          <div>
            <p className="eyebrow">PHYSICAL ASCENSION INTERFACE</p>
            <h1>Training Hall</h1>
            <p>Rook, Ember, and Mira command strength, intensity, and restoration.</p>
          </div>
          <span className="page-heading__glyph">
            <Dumbbell size={25} />
          </span>
        </header>
        <section className="panel training-complete-legacy">
          <ShieldCheck size={31} />
          <div>
            <p className="eyebrow">DAILY WORKOUT COMPLETE</p>
            <h2>Today’s mission was already recorded.</h2>
            <p>
              Today’s mission predates a Hall record. The Training Hall will generate a fresh
              assignment next System day.
            </p>
          </div>
        </section>
        {renderDiagnostic()}
        {renderHistory()}
      </div>
    );
  }

  if (session?.status === 'completed') {
    return (
      <div className="page training-hall-page training-hall-page--complete">
        <nav className="section-command-bar" aria-label="Training Hall navigation">
          <button className="text-link" type="button" onClick={() => setSession(undefined)}>
            <ArrowLeft size={16} /> Training Hall command
          </button>
          <span>
            <ShieldCheck size={15} /> Exit route verified
          </span>
        </nav>
        <section className={`training-result-hero is-${circuit?.accent ?? session.location}`}>
          <div className="training-result-hero__rays" />
          <Trophy size={35} />
          <p className="eyebrow">TRAINING COMPLETE · PARTY RECOVERY</p>
          <h1>{trainingLabel(session)}</h1>
          <div className="training-result-metrics">
            <span>
              <strong>{trainingMinutes(session)}</strong>{' '}
              {trainingMinutes(session) === 1 ? 'minute' : 'minutes'}
            </span>
            {session.roundsCompleted !== undefined && (
              <span>
                <strong>{session.roundsCompleted}</strong> rounds
              </span>
            )}
            <span>
              <strong>{session.difficulty ?? 3}/5</strong> effort
            </span>
          </div>
          {!workoutCompleted && workoutRecord?.status === 'pending' && (
            <button
              className="button button--primary"
              disabled={working}
              onClick={() => void syncWorkoutMission(session).then(reload)}
            >
              <Sparkles size={17} /> Sync Daily Workout credit
            </button>
          )}
        </section>

        {renderDiagnostic()}

        {error && <div className="training-error">{error}</div>}

        {highestRewardTier && (
          <section className="panel double-deployment-banner is-earned">
            <Flame size={27} />
            <div>
              <p className="eyebrow">ASCENSION SURGE · PATH {highestRewardTier} OF 4</p>
              <h2>{BALANCE.training.multiPathTiers[highestRewardTier].label} cleared</h2>
              <p>
                {completedPathCount} distinct paths recorded today. The deployment ladder has
                awarded +{multiPathRewardXp} total bonus account XP plus targeted stat growth.
              </p>
              <small>
                Each tier is awarded once. These bonuses are never multiplied by Snow’s Daily
                Command.
              </small>
            </div>
          </section>
        )}

        {nextRewardTier && availableTrainingPaths.length > 0 && (
          <section className="panel double-deployment-banner">
            <Dumbbell size={27} />
            <div>
              <p className="eyebrow">OPTIONAL · NOT REQUIRED</p>
              <h2>{BALANCE.training.multiPathTiers[nextRewardTier].label} available</h2>
              <p>
                Continue with any unfinished path:{' '}
                {availableTrainingPaths.map((path) => path.title).join(', ')}.
              </p>
              <strong>
                The next distinct clear adds +
                {BALANCE.training.multiPathTiers[nextRewardTier].accountXp} account XP.
              </strong>
              <small>
                This is an exceptional-day bonus, not a daily expectation. Never chase it through
                pain, broken form, or inadequate recovery.
              </small>
            </div>
            <button
              className="button button--primary"
              disabled={working}
              onClick={() => setSession(undefined)}
            >
              <Flame size={17} />
              Choose another training path
            </button>
          </section>
        )}

        {session.gymPersonalRecords?.length ? (
          <section className="panel gym-result-intelligence">
            <Trophy size={23} />
            <div>
              <p className="eyebrow">PERSONAL RECORD SCAN</p>
              <h2>{session.gymPersonalRecords.length} progression signal(s)</h2>
              <p>{session.gymPersonalRecords.join(' · ')}</p>
            </div>
          </section>
        ) : null}

        {session.gymProgressionPrompts?.length ? (
          <section className="panel gym-result-intelligence">
            <ShieldCheck size={23} />
            <div>
              <p className="eyebrow">ROOK · NEXT DEPLOYMENT</p>
              <h2>Progression orders</h2>
              <ul>
                {session.gymProgressionPrompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="panel training-party-debrief">
          <header className="section-header">
            <div>
              <p className="eyebrow">THE PARTY TRAINED WITH YOU</p>
              <h2>Post-raid recovery</h2>
            </div>
            <HeartPulse size={22} />
          </header>
          <div className="training-party-debrief__grid">
            {COMPANIONS.map((companion) => {
              const message = getTrainingDebriefMessage(session, companion.id);
              const messageId = `${session.id}:${companion.id}`;
              const favoriteId = `training:${messageId}`;
              return (
                <article
                  key={companion.id}
                  className={`training-debrief-card training-debrief-card--${companion.id}`}
                  style={{ '--companion-accent': companion.accent } as React.CSSProperties}
                >
                  <div className="training-debrief-card__portrait">
                    <img src={getCompanionImage(companion.image)} alt="" />
                    <span aria-hidden="true" />
                  </div>
                  <div>
                    <span className="training-debrief-card__state">
                      {POST_TRAINING_STATES[companion.id]}
                    </span>
                    <strong>{companion.name}</strong>
                    <p>“{message}”</p>
                  </div>
                  <FavoriteMessageButton
                    active={favoriteIds.has(favoriteId)}
                    label={`Save ${companion.name}’s Training Hall message`}
                    onToggle={async () => {
                      const active = await toggleFavoriteMessage({
                        sourceType: 'training',
                        sourceId: session.id,
                        messageId,
                        companionId: companion.id,
                        message,
                      });
                      setFavoriteIds((current) => {
                        const next = new Set(current);
                        if (active) next.add(favoriteId);
                        else next.delete(favoriteId);
                        return next;
                      });
                    }}
                  />
                </article>
              );
            })}
          </div>
        </section>
        {renderHistory()}
      </div>
    );
  }

  return (
    <div className="page training-hall-page">
      {session && session.status !== 'abandoned' && (
        <nav className="section-command-bar" aria-label="Training Hall navigation">
          <button
            className="text-link"
            type="button"
            disabled={working}
            onClick={() => void returnToHallCommand()}
          >
            <ArrowLeft size={16} /> Training Hall command
          </button>
          <span>
            <ShieldCheck size={15} /> Exit route verified
          </span>
        </nav>
      )}
      <header className="page-heading training-page-heading">
        <div>
          <p className="eyebrow">PHYSICAL ASCENSION INTERFACE</p>
          <h1>Training Hall</h1>
          <p>Rook builds strength. Ember ignites effort. Mira restores range and control.</p>
        </div>
        <span className="page-heading__glyph">
          <Dumbbell size={25} />
        </span>
      </header>

      <section className="training-commanders panel">
        <div className="training-commanders__portraits">
          {(['rook', 'ember', 'mira'] as const).map((id) => {
            const companion = getCompanion(id);
            return (
              <img
                key={id}
                src={getCompanionImage(companion.image)}
                alt={`${companion.name}, ${companion.title}`}
                style={{ '--companion-accent': companion.accent } as React.CSSProperties}
              />
            );
          })}
        </div>
        <div>
          <p className="eyebrow">HALL COMMANDERS</p>
          <h2>
            Rook · The Vanguard
            <br />
            Ember · The Ignition
            <br />
            Mira · The Stillpoint
          </h2>
          <p>
            One Daily Workout mission. Four legitimate deployment paths. Each distinct path can be
            cleared once, and exceptional multi-path days unlock increasingly powerful Ascension
            Surges without multiplying mission credit.
          </p>
        </div>
      </section>

      {renderDiagnostic()}

      {error && <div className="training-error">{error}</div>}

      {!session || session.status === 'abandoned' ? (
        <section className="panel training-location-gate">
          <header className="section-header">
            <div>
              <p className="eyebrow">TRAINING TRINITY · ENTRY CONTROL</p>
              <h2>Where are you training today?</h2>
            </div>
            <ShieldCheck size={22} />
          </header>
          <div className="training-location-grid">
            {LOCATION_OPTIONS.map(({ id, title, subtitle, icon: Icon }) => {
              const pathCompleted = completedLocations.has(id);
              return (
                <button
                  key={id}
                  disabled={working || pathCompleted}
                  className={pathCompleted ? 'is-completed' : ''}
                  onClick={() => void chooseLocation(id)}
                >
                  <span>{pathCompleted ? <Check size={23} /> : <Icon size={23} />}</span>
                  <div>
                    <strong>{title}</strong>
                    <small>
                      {pathCompleted
                        ? 'Completed today · recorded in the deployment ledger.'
                        : subtitle}
                    </small>
                  </div>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
          <p className="training-safety-note">
            Stop for sharp or radiating pain, dizziness, chest discomfort, or unusual breathing.
            Your physical therapist’s instructions override the Hall.
          </p>
        </section>
      ) : session.location === 'home' && circuit ? (
        <>
          <section className={`training-briefing panel is-${circuit.accent}`}>
            <div className="training-dialogue">
              <article className="is-rook">
                <img src={getCompanionImage(getCompanion('rook').image)} alt="" />
                <div>
                  <span>ROOK · ASSIGNMENT</span>
                  <p>“{ROOK_CIRCUIT_LINES[circuit.id][session.briefingVariant % 4]}”</p>
                </div>
              </article>
              <article className="is-ember">
                <img src={getCompanionImage(getCompanion('ember').image)} alt="" />
                <div>
                  <span>EMBER · CLOCK</span>
                  <p>
                    “{EMBER_DURATION_LINES[session.durationMinutes!][session.briefingVariant % 4]}”
                  </p>
                </div>
              </article>
              <article className="is-rook is-reply">
                <img src={getCompanionImage(getCompanion('rook').image)} alt="" />
                <div>
                  <span>ROOK · CONFIRMATION</span>
                  <p>
                    “{ROOK_TIME_REPLIES[session.durationMinutes!][session.briefingVariant % 2]}”
                  </p>
                </div>
              </article>
            </div>
            <div className="training-assignment-seal">
              <span>{getTrainingTimeTitle(session.durationMinutes!)}</span>
              <strong>{session.durationMinutes}</strong>
              <small>MINUTES</small>
            </div>
          </section>

          <section className={`panel training-circuit is-${circuit.accent}`}>
            <header className="section-header">
              <div>
                <p className="eyebrow">{circuit.codename}</p>
                <h2>{circuit.name}</h2>
                <p>{circuit.focus}</p>
              </div>
              <Dumbbell size={23} />
            </header>
            <p className="training-circuit__summary">{circuit.summary}</p>
            {recentBest && session.status === 'assigned' && (
              <div className="training-personal-best">
                <Trophy size={16} /> Same-clock best: {recentBest.roundsCompleted ?? 0} rounds
              </div>
            )}
            <div className="training-exercise-list">
              {circuit.exercises.map((exercise, index) => (
                <article key={exercise.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{exercise.name}</strong>
                    <b>{exercise.prescription}</b>
                    <small>{exercise.cue}</small>
                  </div>
                  {(exercise.load === 'pair' || exercise.load === 'single') && (
                    <label>
                      <span>{exercise.load === 'pair' ? 'LB EACH' : 'LB'}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="500"
                        disabled={session.status !== 'assigned'}
                        value={loads[exercise.id] ?? ''}
                        placeholder="—"
                        onChange={(event) =>
                          setLoads((current) => ({
                            ...current,
                            [exercise.id]: event.target.value ? Number(event.target.value) : 0,
                          }))
                        }
                        onBlur={() => void saveTrainingLoads(session.id, loads)}
                      />
                    </label>
                  )}
                </article>
              ))}
            </div>

            {session.status === 'assigned' ? (
              <div className="training-assignment-actions">
                <button
                  className="button button--primary"
                  disabled={working}
                  onClick={async () => {
                    await saveTrainingLoads(session.id, loads);
                    await run(() => startTrainingTimer(session.id));
                  }}
                >
                  <Play size={18} /> Begin {session.durationMinutes}-minute trial
                </button>
                <button
                  className="button button--ghost"
                  disabled={working || session.rerollUsed}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Request one reassignment? Rook will choose a different circuit and Ember will reset the clock.',
                      )
                    ) {
                      void run(() => assignHomeTraining(systemDate, true, session.id)).then(
                        (next) => {
                          if (next) {
                            setLoads({});
                            setRounds(0);
                            setPartialReps(0);
                          }
                        },
                      );
                    }
                  }}
                >
                  <RotateCcw size={17} />
                  {session.rerollUsed ? 'Reassignment used' : 'Request reassignment'}
                </button>
                <button className="text-button" onClick={() => void chooseDifferentPath()}>
                  <ArrowLeft size={15} /> Choose another training path
                </button>
              </div>
            ) : (
              <div className="training-active-console">
                <div className={`training-clock ${remainingSeconds === 0 ? 'is-complete' : ''}`}>
                  <Timer size={22} />
                  <strong>{formatClock(remainingSeconds)}</strong>
                  <span>
                    {remainingSeconds === 0
                      ? 'ASSIGNMENT CLEARED'
                      : session.status === 'paused'
                        ? 'CLOCK PAUSED'
                        : 'TRIAL ACTIVE'}
                  </span>
                </div>
                <div className="training-counter-grid">
                  <div>
                    <span>Complete rounds</span>
                    <div>
                      <button
                        onClick={() => void updateRounds(rounds - 1)}
                        aria-label="Remove round"
                      >
                        <Minus size={18} />
                      </button>
                      <strong>{rounds}</strong>
                      <button onClick={() => void updateRounds(rounds + 1)} aria-label="Add round">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span>Partial-round reps</span>
                    <div>
                      <button
                        onClick={() => void updatePartial(partialReps - 1)}
                        aria-label="Remove partial rep"
                      >
                        <Minus size={18} />
                      </button>
                      <strong>{partialReps}</strong>
                      <button
                        onClick={() => void updatePartial(partialReps + 1)}
                        aria-label="Add partial rep"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {remainingSeconds > 0 ? (
                  <div className="training-timer-actions">
                    {session.status === 'active' ? (
                      <button
                        className="button button--ghost"
                        onClick={() => void run(() => pauseTrainingTimer(session.id))}
                      >
                        <Pause size={17} /> Pause
                      </button>
                    ) : (
                      <button
                        className="button button--primary"
                        onClick={() => void run(() => startTrainingTimer(session.id))}
                      >
                        <Play size={17} /> Resume
                      </button>
                    )}
                    <button
                      className="button button--danger"
                      onClick={() => {
                        if (window.confirm('End this session without Daily Workout credit?')) {
                          void run(() => abandonTrainingSession(session.id));
                        }
                      }}
                    >
                      <Square size={16} /> End without credit
                    </button>
                  </div>
                ) : (
                  <div className="training-clear-form">
                    <label className="field field--wide">
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
                      <textarea
                        value={note}
                        rows={2}
                        onChange={(event) => setNote(event.target.value)}
                      />
                    </label>
                    <button
                      className="button button--primary"
                      disabled={working}
                      onClick={() => void finishHome()}
                    >
                      <Check size={18} /> Record completed trial
                    </button>
                    {!session.bossExtensionUsed && (
                      <button
                        className="button button--ghost"
                        disabled={working}
                        onClick={() => void run(() => activateBossExtension(session.id))}
                      >
                        <Flame size={18} /> Open five-minute Boss Extension
                      </button>
                    )}
                    <small>
                      Boss overtime is recorded but does not create additional repeatable XP.
                    </small>
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      ) : session?.location === 'gym' ? (
        <GymDeploymentPanel
          session={session}
          availability={gymAvailability}
          working={working}
          onWorkingChange={setWorking}
          onSessionChange={setSession}
          onComplete={finishStructuredGym}
          onBack={chooseDifferentPath}
          onError={setError}
        />
      ) : session?.location === 'recovery' ? (
        <MobilityProtocolPanel
          key={session.id}
          session={session}
          working={working}
          onComplete={finishMobility}
          onBack={chooseDifferentPath}
          onSessionChange={setSession}
          onError={setError}
        />
      ) : session ? (
        <section className={`panel training-log is-${session.location}`}>
          <header className="section-header">
            <div>
              <p className="eyebrow">{session.location.toUpperCase()} DEPLOYMENT</p>
              <h2>{trainingLabel(session)}</h2>
            </div>
            <Footprints size={23} />
          </header>
          <div className="training-dialogue training-manual-dialogue">
            <article className="is-rook">
              <img src={getCompanionImage(getCompanion('rook').image)} alt="" />
              <div>
                <span>ROOK · DEPLOYMENT</span>
                <p>
                  “ Conditioning assignment accepted. Choose a sustainable pace and finish the
                  distance you honestly began. ”
                </p>
              </div>
            </article>
            <article className="is-ember">
              <img src={getCompanionImage(getCompanion('ember').image)} alt="" />
              <div>
                <span>EMBER · TERMS</span>
                <p>
                  “ Good. Pick the pace, keep moving, and bring me the honest time when the work is
                  finished. ”
                </p>
              </div>
            </article>
          </div>
          <div className="form-grid training-log-form">
            <label className="field">
              <span>Completed minutes</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="1440"
                value={loggedDuration}
                onChange={(event) => setLoggedDuration(Number(event.target.value))}
              />
            </label>
            {session.location === 'conditioning' && (
              <>
                <label className="field">
                  <span>Conditioning type</span>
                  <select
                    value={conditioningType}
                    onChange={(event) =>
                      setConditioningType(event.target.value as TrainingSession['conditioningType'])
                    }
                  >
                    <option value="walk">Walk</option>
                    <option value="run">Run</option>
                    <option value="walk-run">Walk / run</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="field">
                  <span>Distance · miles · optional</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={distance}
                    onChange={(event) => setDistance(event.target.value)}
                  />
                </label>
              </>
            )}
            <label className="field field--wide">
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
              <span>Private note · optional</span>
              <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
          </div>
          <div className="training-log-actions">
            <button
              className="button button--primary"
              disabled={working || loggedDuration < 1}
              onClick={() => void finishLogged()}
            >
              <Check size={18} /> Record completed deployment
            </button>
            <button className="button button--ghost" onClick={() => void chooseDifferentPath()}>
              <ArrowLeft size={16} /> Choose another path
            </button>
          </div>
        </section>
      ) : null}

      {renderHistory()}
      <p className="training-footer-note">
        The Training Hall is a private motivational record, not medical care or a substitute for
        your physical therapist.
      </p>
    </div>
  );
}
