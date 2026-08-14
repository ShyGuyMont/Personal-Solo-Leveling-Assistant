import {
  Activity,
  Award,
  Camera,
  CalendarCheck2,
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  LockKeyhole,
  MessageCircleMore,
  RefreshCw,
  ScanLine,
  Scale,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  completeBodyDiagnostic,
  getBodyDiagnosticData,
  type BodyDiagnosticData,
} from '@/game/bodyDiagnostic';
import { estimateTextCostUsd, recordAiUsage } from '@/game/aiVoice';
import {
  prepareBodyDiagnosticImage,
  requestBodyDiagnostic,
  type PreparedDiagnosticImage,
} from '@/services/bodyDiagnostic';
import type {
  BodyDiagnosticGoal,
  BodyDiagnosticRecord,
  BodyDiagnosticSourceKind,
  LocalDateKey,
} from '@/types/game';
import { formatShortDate } from '@/utils/date';

interface SelectedImage {
  id: string;
  file: File;
  kind: BodyDiagnosticSourceKind;
  previewUrl: string;
}

const GOALS: Array<{ id: BodyDiagnosticGoal; label: string }> = [
  { id: 'balanced', label: 'Balanced development' },
  { id: 'recomposition', label: 'Body recomposition' },
  { id: 'fat-loss', label: 'Fat loss' },
  { id: 'muscle-gain', label: 'Muscle gain' },
  { id: 'performance', label: 'Performance' },
  { id: 'mobility', label: 'Mobility and posture' },
];

function sourceLabel(kind: BodyDiagnosticSourceKind) {
  return kind === 'scale' ? 'Scale screenshot' : 'Physique photo';
}

function dueMessage(data: BodyDiagnosticData) {
  if (data.current) return 'Evidence submitted. This week is secured.';
  if (data.daysRemaining === 0)
    return 'Last day. Stop negotiating with the camera and submit the evidence.';
  if (data.daysRemaining <= 2)
    return `${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'} left. The Hall is done accepting “later.”`;
  return `Weekly diagnostic is open. ${data.daysRemaining} days remain—get clean evidence before the week decides for you.`;
}

function DiagnosticReport({ record }: { record: BodyDiagnosticRecord }) {
  const [expanded, setExpanded] = useState(true);
  const weeklyAdjustment = record.assessment.weeklyAdjustment;

  const conveneTrainingCouncil = () => {
    if (!weeklyAdjustment?.recommended || !weeklyAdjustment.sessions.length) return;
    window.dispatchEvent(
      new CustomEvent('system:open-quick-link', {
        detail: {
          companionId: 'rook',
          participantIds: ['rook', 'ember', 'mira', 'kairo', 'snow'],
          roomKind: 'commons',
          initialDraft:
            'Training Council, review my saved weekly Body Diagnostic adjustment together. Ask how I feel right now before proposing any change. If the support plan still fits, have Kairo check my schedule and Snow review each request with me one at a time. Preserve my normal workouts, respect every warning, and do not duplicate XP already earned through the Training Hall.',
        },
      }),
    );
  };
  return (
    <article className="body-diagnostic-report">
      <header>
        <div>
          <p className="eyebrow">WEEKLY EVIDENCE SECURED · +{record.rewardXp} XP</p>
          <h3>{record.assessment.title}</h3>
          <small>
            {formatShortDate(record.date)} · {record.assessment.scanType} scan ·{' '}
            {record.assessment.dataQuality} evidence
          </small>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label={expanded ? 'Collapse diagnostic report' : 'Expand diagnostic report'}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </header>
      {expanded && (
        <div className="body-diagnostic-report__body">
          <p className="body-diagnostic-report__summary">{record.assessment.summary}</p>
          {record.assessment.comparison && (
            <div className="body-diagnostic-callout">
              <strong>Previous signal</strong>
              <p>{record.assessment.comparison}</p>
            </div>
          )}
          {record.assessment.metrics.length > 0 && (
            <div className="body-diagnostic-metrics">
              {record.assessment.metrics.map((metric, index) => (
                <div key={`${metric.label}:${index}`}>
                  <span>{metric.label}</span>
                  <strong>
                    {metric.value} {metric.unit}
                  </strong>
                  <small>
                    {metric.source} · {metric.confidence} confidence
                  </small>
                </div>
              ))}
            </div>
          )}
          {record.assessment.observations.length > 0 && (
            <section>
              <p className="eyebrow">VISIBLE OBSERVATIONS</p>
              <div className="body-diagnostic-observations">
                {record.assessment.observations.map((item, index) => (
                  <article key={`${item.area}:${index}`}>
                    <strong>{item.area}</strong>
                    <p>{item.observation}</p>
                    <small>
                      Evidence: {item.evidence} · {item.confidence} confidence
                    </small>
                  </article>
                ))}
              </div>
            </section>
          )}
          <section>
            <p className="eyebrow">HALL PRIORITIES</p>
            <div className="body-diagnostic-priorities">
              {record.assessment.priorities.map((priority, index) => (
                <article key={`${priority.title}:${index}`}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{priority.title}</strong>
                    <p>{priority.why}</p>
                    <small>{priority.nextAction}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
          {record.assessment.bonusExercises.length > 0 && (
            <section>
              <p className="eyebrow">OPTIONAL SUPPORT WORK · NO MISSION CREDIT</p>
              <div className="body-diagnostic-exercises">
                {record.assessment.bonusExercises.map((exercise, index) => (
                  <article key={`${exercise.name}:${index}`}>
                    <strong>{exercise.name}</strong>
                    <span>{exercise.prescription}</span>
                    <p>{exercise.rationale}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
          {weeklyAdjustment && (
            <section className="body-diagnostic-adjustment">
              <header>
                <span>
                  <CalendarCheck2 size={18} /> WEEKLY HALL DIRECTIVE
                </span>
                <small>
                  {weeklyAdjustment.recommended ? 'COUNCIL REVIEW AVAILABLE' : 'NO EXTRA LOAD'}
                </small>
              </header>
              <h4>{weeklyAdjustment.summary}</h4>
              <p>{weeklyAdjustment.reason}</p>
              {weeklyAdjustment.reportedSignals.length > 0 && (
                <div className="body-diagnostic-adjustment__signals">
                  <strong>Hunter-reported signals</strong>
                  <span>{weeklyAdjustment.reportedSignals.join(' · ')}</span>
                </div>
              )}
              {weeklyAdjustment.sessions.length > 0 && (
                <div className="body-diagnostic-adjustment__sessions">
                  {weeklyAdjustment.sessions.map((session, index) => (
                    <article key={`${session.title}:${index}`}>
                      <span>{getCompanion(session.companionId).name}</span>
                      <strong>{session.title}</strong>
                      <small>
                        {session.durationMinutes} min · {session.sessionsThisWeek}× this week ·{' '}
                        {session.intensity}
                      </small>
                      <p>{session.focus}</p>
                      <em>{session.rationale}</em>
                    </article>
                  ))}
                </div>
              )}
              {weeklyAdjustment.recommended && weeklyAdjustment.sessions.length > 0 && (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={conveneTrainingCouncil}
                >
                  <MessageCircleMore size={17} /> Convene Training Council
                </button>
              )}
              <small className="body-diagnostic-adjustment__boundary">
                Online council only · recommendations cannot replace normal Training Hall work ·
                Kairo and Snow still require your confirmation before scheduling anything.
              </small>
            </section>
          )}
          <section className="body-diagnostic-commanders">
            {record.assessment.companionMessages.map((entry) => {
              const companion = getCompanion(entry.companionId);
              return (
                <article key={entry.companionId} className={`is-${entry.companionId}`}>
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <div>
                    <strong>{companion.name}</strong>
                    <p>“{entry.message}”</p>
                  </div>
                </article>
              );
            })}
          </section>
          {(record.assessment.dataQualityNotes.length > 0 ||
            record.assessment.warnings.length > 0) && (
            <div className="body-diagnostic-caveats">
              <ShieldAlert size={18} />
              <div>
                {[...record.assessment.dataQualityNotes, ...record.assessment.warnings].map(
                  (note, index) => (
                    <p key={`${note}:${index}`}>{note}</p>
                  ),
                )}
              </div>
            </div>
          )}
          <p className="body-diagnostic-disclaimer">{record.assessment.disclaimer}</p>
        </div>
      )}
    </article>
  );
}

export function BodyDiagnosticPanel({
  systemDate,
  onReward,
}: {
  systemDate: LocalDateKey;
  onReward?: (reward: { xp: number; levelsGained: number }) => void;
}) {
  const [data, setData] = useState<BodyDiagnosticData>();
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [goal, setGoal] = useState<BodyDiagnosticGoal>('balanced');
  const [hunterContext, setHunterContext] = useState('');
  const [consented, setConsented] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const imagesRef = useRef<SelectedImage[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const reload = useCallback(async () => {
    setData(await getBodyDiagnosticData(systemDate));
  }, [systemDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(
    () => () => {
      for (const image of imagesRef.current) URL.revokeObjectURL(image.previewUrl);
    },
    [],
  );

  const counts = useMemo(
    () => ({
      physique: images.filter((image) => image.kind === 'physique').length,
      scale: images.filter((image) => image.kind === 'scale').length,
    }),
    [images],
  );

  const addImages = (files: FileList | null, kind: BodyDiagnosticSourceKind) => {
    if (!files?.length) return;
    setError('');
    const limit = kind === 'physique' ? 3 : 1;
    const available = Math.max(0, limit - counts[kind]);
    if (!available) {
      setError(
        kind === 'physique'
          ? 'Three physique angles are already loaded.'
          : 'One scale screenshot is enough.',
      );
      return;
    }
    const selected = Array.from(files).slice(0, available);
    const supported = selected.filter((file) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    );
    if (supported.length !== selected.length)
      setError('Only JPG, PNG, and WEBP images are accepted.');
    setImages((current) => [
      ...current,
      ...supported.map((file) => ({
        id: crypto.randomUUID(),
        file,
        kind,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  };

  const runDiagnostic = async () => {
    if (!data || data.current || !images.length || !consented) return;
    setWorking(true);
    setError('');
    try {
      const prepared: PreparedDiagnosticImage[] = [];
      for (const image of images) {
        prepared.push(await prepareBodyDiagnosticImage(image.file, image.kind));
      }
      const result = await requestBodyDiagnostic({
        images: prepared,
        goal,
        hunterContext,
        previous: data.previous,
      });
      const completed = await completeBodyDiagnostic({
        date: systemDate,
        goal,
        hunterContext,
        sourceKinds: images.map((image) => image.kind),
        assessment: result.assessment,
        model: result.model,
        usage: result.usage,
      });
      await recordAiUsage({
        kind: 'vision',
        sessionId: `body-diagnostic:${data.weekStart}`,
        model: result.model,
        inputTokens: result.usage.inputTokens,
        cachedInputTokens: result.usage.cachedInputTokens,
        outputTokens: result.usage.outputTokens,
        reasoningTokens: result.usage.reasoningTokens,
        totalTokens: result.usage.totalTokens,
        characters: 0,
        audioSeconds: 0,
        estimatedCostUsd: estimateTextCostUsd(
          result.model,
          result.usage.inputTokens,
          result.usage.outputTokens,
          result.usage.cachedInputTokens,
        ),
        exactUsage: true,
      }).catch(() => undefined);
      for (const image of images) URL.revokeObjectURL(image.previewUrl);
      setImages([]);
      setConsented(false);
      setHunterContext('');
      await reload();
      onReward?.({ xp: completed.awardedXp, levelsGained: completed.levelsGained });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The diagnostic could not be completed.');
    } finally {
      setWorking(false);
    }
  };

  if (!data) {
    return (
      <section className="panel body-diagnostic-panel body-diagnostic-panel--loading">
        <RefreshCw className="spin" size={22} /> Opening Body Diagnostic…
      </section>
    );
  }

  return (
    <section className={`panel body-diagnostic-panel ${data.current ? 'is-complete' : 'is-due'}`}>
      <header className="body-diagnostic-panel__header">
        <div className="body-diagnostic-panel__seal">
          {data.current ? <Check size={27} /> : <ScanLine size={27} />}
        </div>
        <div>
          <p className="eyebrow">TRAINING HALL · WEEKLY BODY DIAGNOSTIC</p>
          <h2>{data.current ? 'Evidence secured' : 'Submit the evidence'}</h2>
          <p>{dueMessage(data)}</p>
        </div>
        <div className="body-diagnostic-panel__reward">
          <Award size={17} />
          <strong>{data.weeklyXp} XP</strong>
          <small>once weekly</small>
        </div>
      </header>

      {data.current ? (
        <>
          <DiagnosticReport record={data.current} />
          <p className="body-diagnostic-next">
            <Activity size={16} /> Next diagnostic opens {formatShortDate(data.nextEligibleDate)}.
            Keep lighting, distance, pose, and scale timing consistent when possible.
          </p>
        </>
      ) : (
        <div className="body-diagnostic-intake">
          <div className="body-diagnostic-upload-grid">
            <label className="body-diagnostic-upload">
              <Camera size={25} />
              <strong>Physique angles</strong>
              <span>Front, side, or back · up to 3</span>
              <small>{counts.physique}/3 loaded</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                multiple
                onChange={(event) => {
                  addImages(event.target.files, 'physique');
                  event.target.value = '';
                }}
              />
            </label>
            <label className="body-diagnostic-upload">
              <Scale size={25} />
              <strong>Smart-scale screen</strong>
              <span>Screenshot like your scale summary</span>
              <small>{counts.scale}/1 loaded</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  addImages(event.target.files, 'scale');
                  event.target.value = '';
                }}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="body-diagnostic-previews" aria-label="Selected diagnostic images">
              {images.map((image) => (
                <figure key={image.id}>
                  <img src={image.previewUrl} alt={`${sourceLabel(image.kind)} preview`} />
                  <figcaption>{sourceLabel(image.kind)}</figcaption>
                  <button
                    type="button"
                    aria-label={`Remove ${sourceLabel(image.kind)}`}
                    onClick={() => removeImage(image.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </figure>
              ))}
              {counts.physique < 3 && (
                <label className="body-diagnostic-previews__add">
                  <ImagePlus size={20} /> Add angle
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    multiple
                    onChange={(event) => {
                      addImages(event.target.files, 'physique');
                      event.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          )}

          <div className="body-diagnostic-fields">
            <label className="field">
              <span>Current objective</span>
              <select
                value={goal}
                onChange={(event) => setGoal(event.target.value as BodyDiagnosticGoal)}
              >
                {GOALS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--wide">
              <span>Other comments for the Hall · optional</span>
              <textarea
                rows={3}
                maxLength={800}
                value={hunterContext}
                placeholder="Example: I want better mobility; my neck has been bothering me; photos were taken this morning. Report pain or limitations plainly—the Hall treats them as self-reported, not as a diagnosis from a photo."
                onChange={(event) => setHunterContext(event.target.value)}
              />
            </label>
          </div>

          <div className="body-diagnostic-privacy">
            <LockKeyhole size={20} />
            <div>
              <strong>Your submitted images are analyzed, not added to the save.</strong>
              <p>
                The original photos are sent through your private OpenAI gateway for this scan and
                then released by the app. Only the text report, extracted metrics, model usage, and
                weekly XP record remain on this device. OpenAI may retain API content in
                abuse-monitoring logs for up to 30 days under its default controls.
              </p>
            </div>
          </div>
          <label className="body-diagnostic-consent">
            <input
              type="checkbox"
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
            />
            <span>
              I choose to send these images for AI analysis and understand this is a fitness
              progress report—not medical care or an exact body-composition test.
            </span>
          </label>

          {error && <div className="training-error">{error}</div>}
          <button
            className="button button--primary body-diagnostic-submit"
            type="button"
            disabled={working || !images.length || !consented}
            onClick={() => void runDiagnostic()}
          >
            {working ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} />}
            {working ? 'Hall commanders are analyzing…' : 'Run weekly diagnostic'}
          </button>
          <small className="body-diagnostic-submit-note">
            Completing the diagnostic does not alter, replace, or complete today’s workout.
          </small>
        </div>
      )}
    </section>
  );
}
