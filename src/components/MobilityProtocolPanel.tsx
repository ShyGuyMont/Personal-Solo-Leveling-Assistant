import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getMobilityDiscipline, getMobilityMood } from '@/config/mobility';
import { saveMobilityProgress } from '@/game/training';
import type { TrainingSession } from '@/types/game';

interface MobilityProtocolPanelProps {
  session: TrainingSession;
  working: boolean;
  onComplete: (input: {
    duration: number;
    difficulty: number;
    note: string;
    completedMovementIds: string[];
  }) => Promise<void>;
  onBack: () => Promise<void>;
  onSessionChange: (session: TrainingSession) => void;
  onError: (message: string) => void;
}

const KIND_LABELS = {
  breath: 'Breath',
  mobility: 'Mobility',
  yoga: 'Yoga',
  pilates: 'Pilates',
  core: 'Core',
} as const;

export function MobilityProtocolPanel({
  session,
  working,
  onComplete,
  onBack,
  onSessionChange,
  onError,
}: MobilityProtocolPanelProps) {
  const mira = getCompanion('mira');
  const movements = session.mobilityMovements ?? [];
  const mood = session.mobilityMoodId ? getMobilityMood(session.mobilityMoodId) : undefined;
  const discipline = session.mobilityDiscipline
    ? getMobilityDiscipline(session.mobilityDiscipline)
    : undefined;
  const [completedIds, setCompletedIds] = useState(
    () => new Set(session.mobilityCompletedMovementIds ?? []),
  );
  const [duration, setDuration] = useState(session.mobilityEstimatedMinutes ?? 14);
  const [difficulty, setDifficulty] = useState(session.difficulty ?? 2);
  const [note, setNote] = useState(session.note ?? '');
  const allComplete =
    movements.length > 0 && movements.every((movement) => completedIds.has(movement.id));
  const completionPercent = useMemo(
    () => (movements.length ? Math.round((completedIds.size / movements.length) * 100) : 0),
    [completedIds.size, movements.length],
  );

  const toggleMovement = async (movementId: string) => {
    const next = new Set(completedIds);
    if (next.has(movementId)) next.delete(movementId);
    else next.add(movementId);
    setCompletedIds(next);
    try {
      const saved = await saveMobilityProgress(session.id, Array.from(next));
      if (saved) onSessionChange(saved);
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Mira could not save that movement yet.');
    }
  };

  if (!mood || !discipline || !movements.length) {
    return (
      <section className="panel mobility-protocol mobility-protocol--empty">
        <HeartPulse size={28} />
        <div>
          <p className="eyebrow">STILLPOINT LINK RECALIBRATING</p>
          <h2>Mira is preparing a fresh protocol.</h2>
          <p>
            Return to Training Hall command and reopen Recovery Protocol to complete the assignment.
          </p>
        </div>
        <button className="button button--ghost" onClick={() => void onBack()}>
          <ArrowLeft size={16} /> Training Hall command
        </button>
      </section>
    );
  }

  return (
    <section className={`panel mobility-protocol is-${mood.id}`}>
      <header className="mobility-protocol__hero">
        <div className="mobility-protocol__portrait">
          <span />
          <img src={getCompanionImage(mira.image)} alt={`${mira.name}, ${mira.title}`} />
        </div>
        <div className="mobility-protocol__intro">
          <p className="eyebrow">MIRA · THE STILLPOINT</p>
          <h2>{discipline.name}</h2>
          <p>{discipline.subtitle}</p>
          <blockquote>“{mood.message}”</blockquote>
        </div>
        <div className="mobility-mood-seal">
          <Wind size={22} />
          <small>MIRA’S MOOD</small>
          <strong>{mood.name}</strong>
          <span>{mood.state}</span>
        </div>
      </header>

      <div className="mobility-protocol__telemetry">
        <span>
          <strong>{movements.length}</strong> movements
        </span>
        <span>
          <strong>~{session.mobilityEstimatedMinutes}</strong> minutes
        </span>
        <span>
          <strong>{completionPercent}%</strong> complete
        </span>
        <span>
          <strong>Core</strong> always included
        </span>
      </div>

      <div className="mobility-safety-callout">
        <ShieldCheck size={20} />
        <div>
          <strong>Comfortable tension only.</strong>
          <p>
            Never bounce or force range. Stop for sharp or radiating pain, numbness, dizziness,
            chest discomfort, or unusual breathing. A clinician’s instructions always override this
            protocol.
          </p>
        </div>
      </div>

      <div className="mobility-sequence" aria-label="Assigned Stillpoint sequence">
        {movements.map((movement, index) => {
          const complete = completedIds.has(movement.id);
          return (
            <article key={movement.id} className={complete ? 'is-complete' : ''}>
              <button
                type="button"
                className="mobility-sequence__check"
                onClick={() => void toggleMovement(movement.id)}
                aria-pressed={complete}
                aria-label={`${complete ? 'Mark incomplete' : 'Mark complete'}: ${movement.name}`}
              >
                {complete ? <CheckCircle2 size={25} /> : <Circle size={25} />}
              </button>
              <span className="mobility-sequence__number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="mobility-sequence__content">
                <div className="mobility-sequence__title">
                  <span className={`is-${movement.kind}`}>{KIND_LABELS[movement.kind]}</span>
                  <h3>{movement.name}</h3>
                  <strong>{movement.prescription}</strong>
                </div>
                <ol>
                  {movement.instructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
                <p className="mobility-breath-cue">
                  <Wind size={15} /> {movement.breathingCue}
                </p>
                {movement.safetyCue && (
                  <p className="mobility-safety-cue">
                    <ShieldCheck size={15} /> {movement.safetyCue}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mobility-completion-form">
        <div className="form-grid">
          <label className="field">
            <span>Completed minutes</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="180"
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
            <span>Body notes · optional</span>
            <textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What felt freer, tighter, or worth adjusting next time?"
            />
          </label>
        </div>
        <div className="mobility-completion-form__actions">
          <button
            className="button button--primary"
            disabled={working || !allComplete || duration < 1}
            onClick={() =>
              void onComplete({
                duration,
                difficulty,
                note,
                completedMovementIds: Array.from(completedIds),
              })
            }
          >
            {allComplete ? <Sparkles size={18} /> : <Check size={18} />}
            {allComplete
              ? 'Complete Stillpoint Protocol'
              : `${movements.length - completedIds.size} movement${movements.length - completedIds.size === 1 ? '' : 's'} remaining`}
          </button>
          <button className="button button--ghost" disabled={working} onClick={() => void onBack()}>
            <ArrowLeft size={16} /> Choose another path
          </button>
        </div>
      </div>
    </section>
  );
}
