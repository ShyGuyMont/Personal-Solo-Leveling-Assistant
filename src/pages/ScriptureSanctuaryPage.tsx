import {
  ArrowLeft,
  BookHeart,
  Check,
  ChevronRight,
  HeartHandshake,
  History,
  MessageCircleHeart,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { SANCTUARY_CONCERNS, getSanctuaryConcern } from '@/config/scripture';
import {
  abandonSanctuarySession,
  completeSanctuarySession,
  getSanctuaryData,
  getSanctuaryMessages,
  getSanctuaryPassages,
  getStrongholdSteps,
  markSanctuaryMissionCredited,
  saveSanctuaryDraft,
  startSanctuarySession,
} from '@/game/sanctuary';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import type {
  SanctuaryConcern,
  SanctuaryMode,
  SanctuarySession,
} from '@/types/game';

const PRAYER_MOVEMENTS = [
  ['Adoration', 'What is true and worthy about God here?'],
  ['Honesty', 'What do you need to confess, grieve, or say without polishing it?'],
  ['Gratitude', 'Where can you recognize grace, provision, or a reason to keep going?'],
  ['Ask & surrender', 'What help do you need, and what outcome can you place back in God’s hands?'],
] as const;

const OUTCOMES: Array<{ id: NonNullable<SanctuarySession['outcome']>; label: string }> = [
  { id: 'steadier', label: 'I feel steadier' },
  { id: 'moved', label: 'I took the next step' },
  { id: 'connected', label: 'I reached for connection' },
  { id: 'need-support', label: 'I still need support' },
];

function sessionTitle(session: SanctuarySession) {
  return session.mode === 'study' ? 'Daily Scripture Study' : 'Stronghold Protocol';
}

export function ScriptureSanctuaryPage() {
  const { systemDate, todayRecords, complete } = useGameStore();
  const [session, setSession] = useState<SanctuarySession>();
  const [todayCompleted, setTodayCompleted] = useState<SanctuarySession[]>([]);
  const [recent, setRecent] = useState<SanctuarySession[]>([]);
  const [mode, setMode] = useState<SanctuaryMode>();
  const [primaryConcern, setPrimaryConcern] = useState<SanctuaryConcern>();
  const [secondaryConcern, setSecondaryConcern] = useState<SanctuaryConcern>();
  const [reflection, setReflection] = useState('');
  const [prayer, setPrayer] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [outcome, setOutcome] = useState<SanctuarySession['outcome']>();
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const bibleRecord = todayRecords.find((record) => record.missionId === 'bible');
  const bibleCompleted = bibleRecord?.status === 'completed';

  const reload = useCallback(async () => {
    const data = await getSanctuaryData(systemDate);
    setSession(data.active);
    setTodayCompleted(data.todayCompleted);
    setRecent(data.recent);
    setReflection(data.active?.reflection ?? '');
    setPrayer(data.active?.prayer ?? '');
    setNextAction(data.active?.nextAction ?? '');
    setLoading(false);
  }, [systemDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const resetEntry = () => {
    setSession(undefined);
    setMode(undefined);
    setPrimaryConcern(undefined);
    setSecondaryConcern(undefined);
    setReflection('');
    setPrayer('');
    setNextAction('');
    setOutcome(undefined);
    setError('');
  };

  const begin = async () => {
    if (!mode || !primaryConcern) return;
    setWorking(true);
    setError('');
    try {
      const next = await startSanctuarySession({
        date: systemDate,
        mode,
        primaryConcern,
        secondaryConcern,
      });
      setSession(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The Sanctuary could not open.');
    } finally {
      setWorking(false);
    }
  };

  const syncBibleMission = async (completed: SanctuarySession) => {
    if (completed.mode !== 'study' || bibleCompleted || bibleRecord?.status !== 'pending') return;
    const passages = getSanctuaryPassages(completed);
    await complete(
      'bible',
      {
        passage: passages.map((passage) => passage.reference).join('; '),
        note: completed.reflection,
        sanctuarySessionId: completed.id,
      },
      systemDate,
    );
    const credited = await markSanctuaryMissionCredited(completed.id);
    if (credited) setSession(credited);
  };

  const finish = async () => {
    if (!session || session.status !== 'active') return;
    setWorking(true);
    setError('');
    try {
      const completed = await completeSanctuarySession({
        id: session.id,
        reflection,
        prayer,
        nextAction,
        outcome,
      });
      setSession(completed);
      setRecent((current) => [completed, ...current.filter((item) => item.id !== completed.id)]);
      setTodayCompleted((current) => [
        completed,
        ...current.filter((item) => item.id !== completed.id),
      ]);
      if (completed.mode === 'study') await syncBibleMission(completed);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} Your Sanctuary record is preserved.`
          : 'Your Sanctuary record is preserved, but the final step could not be synced.',
      );
    } finally {
      setWorking(false);
    }
  };

  const endWithoutCompleting = async () => {
    if (!session) return;
    await abandonSanctuarySession(session.id);
    resetEntry();
    await reload();
  };

  const passages = useMemo(
    () => (session ? getSanctuaryPassages(session) : []),
    [session],
  );
  const messages = useMemo(
    () => (session ? getSanctuaryMessages(session) : []),
    [session],
  );
  const lonelinessIntegrity = session
    ? [session.primaryConcern, session.secondaryConcern].includes('sexual-integrity') &&
      [session.primaryConcern, session.secondaryConcern].includes('loneliness')
    : false;

  const renderHistory = () => (
    <section className="panel sanctuary-history">
      <header className="section-header">
        <div>
          <p className="eyebrow">PRIVATE SANCTUARY RECORD</p>
          <h2>Recent sessions</h2>
        </div>
        <History size={21} />
      </header>
      <div className="sanctuary-history__list">
        {recent.slice(0, 8).map((entry) => (
          <article key={entry.id}>
            <span className={`sanctuary-history__mark is-${entry.mode}`}>
              {entry.mode === 'study' ? <BookHeart size={17} /> : <ShieldAlert size={17} />}
            </span>
            <div>
              <strong>{sessionTitle(entry)}</strong>
              <small>
                {entry.date} · {getSanctuaryConcern(entry.primaryConcern).label}
                {entry.secondaryConcern
                  ? ` + ${getSanctuaryConcern(entry.secondaryConcern).label}`
                  : ''}
              </small>
            </div>
            {entry.bibleMissionCredited && <Check size={17} aria-label="Bible mission credited" />}
          </article>
        ))}
        {!recent.length && (
          <p className="sanctuary-empty-copy">Your first completed session will appear here.</p>
        )}
      </div>
      <p className="sanctuary-privacy-note">
        Reflections and prayer notes remain in this app on this device and are included in your
        private backup export.
      </p>
    </section>
  );

  if (loading) {
    return (
      <div className="page sanctuary-page">
        <section className="panel sanctuary-loading">
          <BookHeart size={28} /> Opening the Scripture Sanctuary…
        </section>
      </div>
    );
  }

  if (session?.status === 'completed') {
    const concern = getSanctuaryConcern(session.primaryConcern);
    return (
      <div className={`page sanctuary-page sanctuary-page--complete is-${session.mode}`}>
        <section className="sanctuary-completion-hero">
          <Sparkles size={34} />
          <p className="eyebrow">
            {session.mode === 'study' ? 'SCRIPTURE STUDY COMPLETE' : 'STRONGHOLD HELD'}
          </p>
          <h1>{concern.label}</h1>
          <p>
            {session.mode === 'study'
              ? 'You did not rush past what was happening inside you. You brought it into truth, prayer, and a next step.'
              : 'The goal was not to feel nothing. The goal was to interrupt the pattern and choose the next faithful ten minutes.'}
          </p>
          {session.mode === 'study' ? (
            session.bibleMissionCredited || bibleCompleted ? (
              <span className="sanctuary-credit is-earned">
                <Check size={16} /> Today’s Bible mission credited
              </span>
            ) : (
              <button
                className="button button--primary"
                disabled={working || bibleRecord?.status !== 'pending'}
                onClick={() => void syncBibleMission(session)}
              >
                <Sparkles size={17} /> Sync Bible mission credit
              </button>
            )
          ) : (
            <span className="sanctuary-credit">
              Stronghold sessions are unlimited support and do not create repeatable XP.
            </span>
          )}
        </section>

        {error && <div className="sanctuary-error">{error}</div>}

        <section className="panel sanctuary-party-response">
          <header className="section-header">
            <div>
              <p className="eyebrow">THE PARTY STAYS WITH YOU</p>
              <h2>Closing counsel</h2>
            </div>
            <HeartHandshake size={22} />
          </header>
          <div className="sanctuary-message-list">
            {messages.map((message) => {
              const companion = getCompanion(message.companionId);
              return (
                <article
                  key={message.id}
                  style={{ '--companion-accent': companion.accent } as React.CSSProperties}
                >
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <div>
                    <span>{companion.name} · {companion.title}</span>
                    <p>“{message.text}”</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {session.outcome === 'need-support' && (
          <section className="panel sanctuary-support-callout">
            <MessageCircleHeart size={25} />
            <div>
              <h2>Needing more support is not failure.</h2>
              <p>
                Consider contacting a trusted person, pastor, counselor, therapist, or recovery
                group. If you might harm yourself or cannot stay safe, call or text 988 in the U.S.
                or contact local emergency services now.
              </p>
            </div>
          </section>
        )}

        <button className="button button--primary sanctuary-return" onClick={resetEntry}>
          <BookHeart size={17} /> Return to the Sanctuary
        </button>
        {renderHistory()}
      </div>
    );
  }

  if (session?.status === 'active') {
    const primary = getSanctuaryConcern(session.primaryConcern);
    return (
      <div className={`page sanctuary-page sanctuary-page--active is-${session.mode}`}>
        <header className="page-heading sanctuary-page-heading">
          <div>
            <p className="eyebrow">
              {session.mode === 'study' ? 'FULL DAILY STUDY' : 'IMMEDIATE STRONGHOLD PROTOCOL'}
            </p>
            <h1>{primary.label}</h1>
            <p>{primary.prompt}</p>
          </div>
          <span className="page-heading__glyph">
            {session.mode === 'study' ? <BookHeart size={25} /> : <ShieldAlert size={25} />}
          </span>
        </header>

        {error && <div className="sanctuary-error">{error}</div>}

        <section className="panel sanctuary-guides">
          <div className="sanctuary-guides__portraits">
            {(['snow', 'selah'] as const).map((id) => {
              const companion = getCompanion(id);
              return (
                <img
                  key={id}
                  src={getCompanionImage(companion.image)}
                  alt={`${companion.name}, ${companion.title}`}
                />
              );
            })}
          </div>
          <div>
            <p className="eyebrow">SNOW OPENS · SELAH GUIDES</p>
            <p>“{messages[0]?.text}”</p>
            <p>“{messages[1]?.text}”</p>
          </div>
        </section>

        {lonelinessIntegrity && (
          <section className="sanctuary-amara-connection">
            <img src={getCompanionImage(getCompanion('amara').image)} alt="" />
            <div>
              <span>AMARA · CONNECTION WITHOUT SHAME</span>
              <p>“{messages.find((message) => message.companionId === 'amara')?.text}”</p>
            </div>
          </section>
        )}

        {session.mode === 'stronghold' && (
          <section className="panel sanctuary-stronghold-steps">
            <header className="section-header">
              <div>
                <p className="eyebrow">DO THIS NOW</p>
                <h2>Interrupt the pattern</h2>
              </div>
              <ShieldAlert size={22} />
            </header>
            <ol>
              {getStrongholdSteps(session).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        <section className="sanctuary-passage-list">
          <header className="section-header">
            <div>
              <p className="eyebrow">SELAH · SCRIPTURE PATH</p>
              <h2>Read in your Bible, then remain with the passage</h2>
            </div>
            <BookHeart size={22} />
          </header>
          {passages.map((passage, index) => (
            <article key={passage.id} className="panel sanctuary-passage-card">
              <div className="sanctuary-passage-card__number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <span>{passage.theme}</span>
                <h3>{passage.reference}</h3>
                <dl>
                  <div>
                    <dt>Context</dt>
                    <dd>{passage.context}</dd>
                  </div>
                  <div>
                    <dt>Observe</dt>
                    <dd>{passage.observe}</dd>
                  </div>
                  <div>
                    <dt>Bring it close</dt>
                    <dd>{passage.apply}</dd>
                  </div>
                  <div>
                    <dt>Pray</dt>
                    <dd>{passage.prayer}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </section>

        {session.mode === 'study' && (
          <section className="panel sanctuary-prayer-framework">
            <header className="section-header">
              <div>
                <p className="eyebrow">SNOW · DO NOT RUSH THIS PART</p>
                <h2>A deeper prayer path</h2>
              </div>
              <HeartHandshake size={22} />
            </header>
            <div className="sanctuary-prayer-grid">
              {PRAYER_MOVEMENTS.map(([title, prompt], index) => (
                <article key={title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{prompt}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="panel sanctuary-reflection-form">
          <header className="section-header">
            <div>
              <p className="eyebrow">PRIVATE RESPONSE · OPTIONAL</p>
              <h2>{session.mode === 'study' ? 'Stay honest with what surfaced' : 'Record the interruption'}</h2>
            </div>
          </header>
          <label className="field field--wide">
            <span>What are you noticing?</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              onBlur={() =>
                void saveSanctuaryDraft(session.id, { reflection, prayer, nextAction })
              }
              placeholder="Name the emotion, desire, lie, grief, or truth that became clearer…"
            />
          </label>
          {session.mode === 'study' && (
            <label className="field field--wide">
              <span>Private prayer notes</span>
              <textarea
                rows={5}
                maxLength={3000}
                value={prayer}
                onChange={(event) => setPrayer(event.target.value)}
                onBlur={() =>
                  void saveSanctuaryDraft(session.id, { reflection, prayer, nextAction })
                }
                placeholder="Adoration… Honesty… Gratitude… Ask and surrender…"
              />
            </label>
          )}
          <label className="field field--wide">
            <span>Your next faithful action</span>
            <input
              maxLength={500}
              value={nextAction}
              onChange={(event) => setNextAction(event.target.value)}
              onBlur={() =>
                void saveSanctuaryDraft(session.id, { reflection, prayer, nextAction })
              }
              placeholder="For the next ten minutes, I will…"
            />
          </label>
          {session.mode === 'stronghold' && (
            <div className="sanctuary-outcomes" aria-label="How are you leaving this session?">
              {OUTCOMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={outcome === item.id ? 'is-selected' : ''}
                  onClick={() => setOutcome(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <div className="sanctuary-finish-actions">
            <button className="button button--primary" disabled={working} onClick={() => void finish()}>
              <Check size={18} />
              {session.mode === 'study' ? 'Complete Scripture study' : 'Close Stronghold session'}
            </button>
            <button
              className="button button--ghost"
              disabled={working}
              onClick={() => {
                if (window.confirm('Close this session without recording it as complete?')) {
                  void endWithoutCompleting();
                }
              }}
            >
              <X size={17} /> End without completing
            </button>
          </div>
        </section>
      </div>
    );
  }

  const completedStudyToday = todayCompleted.find((entry) => entry.mode === 'study');
  return (
    <div className="page sanctuary-page">
      <header className="page-heading sanctuary-page-heading">
        <div>
          <p className="eyebrow">SPIRITUAL FORMATION INTERFACE</p>
          <h1>Scripture Sanctuary</h1>
          <p>Bring the real feeling. Selah brings a Scripture path. Snow stays for the prayer.</p>
        </div>
        <span className="page-heading__glyph">
          <BookHeart size={25} />
        </span>
      </header>

      <section className="panel sanctuary-guides sanctuary-guides--entry">
        <div className="sanctuary-guides__portraits">
          {(['snow', 'selah', 'amara'] as const).map((id) => {
            const companion = getCompanion(id);
            return (
              <img key={id} src={getCompanionImage(companion.image)} alt={`${companion.name}`} />
            );
          })}
        </div>
        <div>
          <p className="eyebrow">YOU DO NOT HAVE TO ARRIVE COMPOSED</p>
          <h2>Tell the truth about what you are carrying.</h2>
          <p>
            Pornography can be connected to loneliness, stress, shame, or a longing for closeness.
            The Sanctuary will address the behavior and the need beneath it—without excusing the
            harm or making shame the strategy.
          </p>
        </div>
      </section>

      {error && <div className="sanctuary-error">{error}</div>}

      {!mode ? (
        <section className="panel sanctuary-mode-gate">
          <header className="section-header">
            <div>
              <p className="eyebrow">CHOOSE YOUR ENTRY</p>
              <h2>What kind of help do you need right now?</h2>
            </div>
          </header>
          <div className="sanctuary-mode-grid">
            <button onClick={() => setMode('study')}>
              <span><BookHeart size={25} /></span>
              <div>
                <strong>Daily Scripture Study</strong>
                <small>Three passages, guided reflection, and a deeper prayer path. Completes today’s Bible mission once.</small>
              </div>
              <ChevronRight size={19} />
            </button>
            <button className="is-stronghold" onClick={() => setMode('stronghold')}>
              <span><ShieldAlert size={25} /></span>
              <div>
                <strong>Stronghold Protocol</strong>
                <small>Immediate Scripture and practical interruption when an urge or emotion is already loud. Unlimited, no XP.</small>
              </div>
              <ChevronRight size={19} />
            </button>
          </div>
          {completedStudyToday && (
            <div className="sanctuary-today-status">
              <Check size={17} /> Daily study completed. The Sanctuary remains open as often as you need it.
            </div>
          )}
        </section>
      ) : (
        <section className="panel sanctuary-concern-gate">
          <button className="text-button" onClick={() => setMode(undefined)}>
            <ArrowLeft size={15} /> Change entry
          </button>
          <header className="section-header">
            <div>
              <p className="eyebrow">{mode === 'study' ? 'STUDY DIRECTION' : 'STRONGHOLD SIGNAL'}</p>
              <h2>What feels most present?</h2>
              <p>Choose one primary concern and, if it fits, one connected concern.</p>
            </div>
          </header>
          <div className="sanctuary-concern-list">
            {SANCTUARY_CONCERNS.map((concern) => {
              const selected = primaryConcern === concern.id || secondaryConcern === concern.id;
              const position = primaryConcern === concern.id ? 'PRIMARY' : 'CONNECTED';
              return (
                <button
                  key={concern.id}
                  className={selected ? 'is-selected' : ''}
                  onClick={() => {
                    if (primaryConcern === concern.id) {
                      setPrimaryConcern(secondaryConcern);
                      setSecondaryConcern(undefined);
                    } else if (secondaryConcern === concern.id) {
                      setSecondaryConcern(undefined);
                    } else if (!primaryConcern) {
                      setPrimaryConcern(concern.id);
                    } else {
                      setSecondaryConcern(concern.id);
                    }
                  }}
                >
                  <span>{selected ? position : 'SELECT'}</span>
                  <strong>{concern.label}</strong>
                  <small>{concern.prompt}</small>
                </button>
              );
            })}
          </div>
          <div className="sanctuary-start-actions">
            <button
              className="button button--primary"
              disabled={!primaryConcern || working}
              onClick={() => void begin()}
            >
              {mode === 'study' ? <BookHeart size={18} /> : <ShieldAlert size={18} />}
              {mode === 'study' ? 'Begin guided study' : 'Activate Stronghold'}
            </button>
            <small>You can choose up to two. Notes are optional; honesty is enough to begin.</small>
          </div>
        </section>
      )}

      <Link to="/missions" className="sanctuary-back-link">
        <ArrowLeft size={15} /> Return to missions
      </Link>
      {renderHistory()}
    </div>
  );
}
