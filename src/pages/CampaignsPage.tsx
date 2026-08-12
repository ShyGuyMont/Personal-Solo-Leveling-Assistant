import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePause,
  Flag,
  HeartHandshake,
  Map,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import { COMPANION_QUESTLINES } from '@/config/questlines';
import {
  addArcMilestone,
  createCampaignArc,
  getCampaignArcs,
  setCampaignArcStatus,
  toggleArcMilestone,
  type CampaignArcDraft,
} from '@/game/campaigns';
import {
  completeManualQuestObjective,
  completeQuestChapter,
  getAllQuestProgress,
  getQuestProgressView,
  pauseQuestline,
  resumeQuestline,
  startQuestline,
  type QuestProgressView,
} from '@/game/questlines';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import { CATEGORY_LABELS } from '@/config/missions';
import type { ArcMilestone, CampaignArc, CompanionId, CompanionQuestProgress } from '@/types/game';

type ArcBundle = { arc: CampaignArc; milestones: ArcMilestone[] };

const EMPTY_ARC: CampaignArcDraft = {
  name: '',
  purpose: '',
  category: 'balanced',
  companionId: 'snow',
};

const ARC_CATEGORY_LABELS: Record<CampaignArcDraft['category'], string> = {
  balanced: 'Balanced',
  ...CATEGORY_LABELS,
  treasury: 'Treasury',
};

function metricLabel(view: QuestProgressView['objectives'][number]) {
  if (view.definition.metric === 'manual')
    return view.completed ? 'Reflection saved' : 'Reflection needed';
  return `${view.current} / ${view.definition.target}`;
}

export function CampaignsPage() {
  const refreshGame = useGameStore((state) => state.refresh);
  const [tab, setTab] = useState<'arcs' | 'quests'>('arcs');
  const [arcs, setArcs] = useState<ArcBundle[]>([]);
  const [progress, setProgress] = useState<CompanionQuestProgress[]>([]);
  const [views, setViews] = useState<Record<string, QuestProgressView>>({});
  const [selectedQuestId, setSelectedQuestId] = useState(COMPANION_QUESTLINES[0].id);
  const [showArcForm, setShowArcForm] = useState(false);
  const [arcDraft, setArcDraft] = useState<CampaignArcDraft>(EMPTY_ARC);
  const [milestoneDrafts, setMilestoneDrafts] = useState(['', '', '']);
  const [newMilestones, setNewMilestones] = useState<Record<string, string>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [nextArcs, nextProgress] = await Promise.all([getCampaignArcs(), getAllQuestProgress()]);
    const nextViews = Object.fromEntries(
      await Promise.all(
        nextProgress.map(async (item) => [item.id, await getQuestProgressView(item)] as const),
      ),
    );
    setArcs(nextArcs);
    setProgress(nextProgress);
    setViews(nextViews);
    const active = nextProgress.find((item) => item.status === 'active');
    if (active) setSelectedQuestId(active.questlineId);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedQuest = COMPANION_QUESTLINES.find((item) => item.id === selectedQuestId)!;
  const selectedProgress = progress.find((item) => item.questlineId === selectedQuestId);
  const selectedView = selectedProgress ? views[selectedProgress.id] : undefined;
  const selectedCompanion = getCompanion(selectedQuest.companionId);
  const visibleArcs = useMemo(() => arcs.filter((item) => item.arc.status !== 'archived'), [arcs]);

  async function run(key: string, action: () => Promise<unknown>, success?: string) {
    setBusy(key);
    setMessage('');
    try {
      await action();
      await Promise.all([load(), refreshGame()]);
      if (success) setMessage(success);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'The System could not complete that action.',
      );
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="page campaigns-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Back to System
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Campaign record protected
        </span>
      </div>

      <section className="campaigns-hero panel">
        <div>
          <p className="eyebrow">LONG-RANGE COMMAND</p>
          <h1>Campaigns & Companion Quests</h1>
          <p>
            Campaign Arcs organize goals you define. Companion Questlines tell authored five-chapter
            stories with real objectives. Neither can fail, expire, decay, or remove XP.
          </p>
        </div>
        <div className="campaigns-hero__count">
          <strong>{visibleArcs.filter((item) => item.arc.status === 'active').length}</strong>
          <span>Active arcs</span>
          <strong>
            {progress.reduce((sum, item) => sum + item.completedChapterIds.length, 0)}
          </strong>
          <span>Chapters cleared</span>
        </div>
      </section>

      <div className="campaign-tabs" role="tablist">
        <button className={tab === 'arcs' ? 'is-active' : ''} onClick={() => setTab('arcs')}>
          <Map size={18} /> Campaign Arcs
        </button>
        <button className={tab === 'quests' ? 'is-active' : ''} onClick={() => setTab('quests')}>
          <BookOpen size={18} /> Companion Questlines
        </button>
      </div>

      {message && (
        <div className="campaign-message" role="status">
          {message}
        </div>
      )}

      {tab === 'arcs' ? (
        <>
          <section className="section-header campaign-section-header">
            <div>
              <p className="eyebrow">YOUR LONG CAMPAIGNS</p>
              <h2>Goals with a map, not a timer</h2>
            </div>
            <button
              className="button button--primary"
              onClick={() => setShowArcForm((value) => !value)}
            >
              <Plus size={17} /> New Arc
            </button>
          </section>

          {showArcForm && (
            <section className="panel arc-form">
              <div className="section-header">
                <div>
                  <p className="eyebrow">INITIALIZE CAMPAIGN ARC</p>
                  <h2>What are we building toward?</h2>
                </div>
              </div>
              <label>
                <span>Arc name</span>
                <input
                  value={arcDraft.name}
                  onChange={(event) => setArcDraft({ ...arcDraft, name: event.target.value })}
                  placeholder="Example: Launch the next ARC chapter"
                  maxLength={80}
                />
              </label>
              <label>
                <span>Why this matters</span>
                <textarea
                  value={arcDraft.purpose}
                  onChange={(event) => setArcDraft({ ...arcDraft, purpose: event.target.value })}
                  placeholder="The purpose Snow should bring you back to when motivation changes…"
                  rows={3}
                  maxLength={500}
                />
              </label>
              <div className="arc-form__row">
                <label>
                  <span>Path</span>
                  <select
                    value={arcDraft.category}
                    onChange={(event) =>
                      setArcDraft({
                        ...arcDraft,
                        category: event.target.value as CampaignArcDraft['category'],
                      })
                    }
                  >
                    {Object.entries(ARC_CATEGORY_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Guide</span>
                  <select
                    value={arcDraft.companionId}
                    onChange={(event) =>
                      setArcDraft({ ...arcDraft, companionId: event.target.value as CompanionId })
                    }
                  >
                    {COMPANIONS.map((companion) => (
                      <option key={companion.id} value={companion.id}>
                        {companion.name} · {companion.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Target date · optional</span>
                  <input
                    type="date"
                    value={arcDraft.targetDate ?? ''}
                    onChange={(event) =>
                      setArcDraft({
                        ...arcDraft,
                        targetDate:
                          (event.target.value as CampaignArcDraft['targetDate']) || undefined,
                      })
                    }
                  />
                </label>
              </div>
              <div className="arc-form__milestones">
                <span>Opening milestones · optional</span>
                {milestoneDrafts.map((value, index) => (
                  <input
                    key={index}
                    value={value}
                    onChange={(event) =>
                      setMilestoneDrafts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                    placeholder={`Milestone ${index + 1}`}
                    maxLength={100}
                  />
                ))}
              </div>
              <div className="arc-form__actions">
                <button className="button button--ghost" onClick={() => setShowArcForm(false)}>
                  Cancel
                </button>
                <button
                  className="button button--primary"
                  disabled={busy === 'new-arc'}
                  onClick={() =>
                    void run(
                      'new-arc',
                      async () => {
                        await createCampaignArc(arcDraft, milestoneDrafts);
                        setArcDraft(EMPTY_ARC);
                        setMilestoneDrafts(['', '', '']);
                        setShowArcForm(false);
                      },
                      'Campaign Arc initialized. No hidden XP or deadline was added.',
                    )
                  }
                >
                  {busy === 'new-arc' ? 'Initializing…' : 'Initialize Arc'}
                </button>
              </div>
            </section>
          )}

          <div className="arc-list">
            {visibleArcs.map(({ arc, milestones }) => {
              const companion = getCompanion(arc.companionId);
              const complete = milestones.filter((item) => item.status === 'completed').length;
              return (
                <article
                  key={arc.id}
                  className={`panel arc-card arc-card--${arc.status}`}
                  style={{ '--companion-accent': companion.accent } as CSSProperties}
                >
                  <header>
                    <img src={getCompanionImage(companion.image)} alt="" />
                    <div>
                      <span>
                        {arc.status.toUpperCase()} · {ARC_CATEGORY_LABELS[arc.category]}
                      </span>
                      <h2>{arc.name}</h2>
                      <p>{arc.purpose}</p>
                    </div>
                  </header>
                  <div className="arc-card__meta">
                    <span>
                      <Target size={15} /> {complete}/{milestones.length} milestones
                    </span>
                    {arc.targetDate && (
                      <span>
                        <CalendarDays size={15} /> Target {arc.targetDate}
                      </span>
                    )}
                    <span>
                      <HeartHandshake size={15} /> {companion.name} guiding
                    </span>
                  </div>
                  <div className="arc-milestones">
                    {milestones.map((milestone) => (
                      <button
                        key={milestone.id}
                        className={milestone.status === 'completed' ? 'is-complete' : ''}
                        onClick={() =>
                          void run(milestone.id, () => toggleArcMilestone(milestone.id))
                        }
                      >
                        <span>
                          {milestone.status === 'completed' ? (
                            <Check size={15} />
                          ) : (
                            <Flag size={15} />
                          )}
                        </span>
                        <div>
                          <strong>{milestone.title}</strong>
                          {milestone.note && <small>{milestone.note}</small>}
                        </div>
                      </button>
                    ))}
                    {!milestones.length && (
                      <p className="arc-milestones__empty">
                        No milestones yet. Add the first visible marker below.
                      </p>
                    )}
                  </div>
                  <div className="arc-card__add">
                    <input
                      value={newMilestones[arc.id] ?? ''}
                      onChange={(event) =>
                        setNewMilestones({ ...newMilestones, [arc.id]: event.target.value })
                      }
                      placeholder="Add a milestone…"
                      maxLength={100}
                    />
                    <button
                      className="button button--small button--ghost"
                      onClick={() =>
                        void run(`add:${arc.id}`, async () => {
                          await addArcMilestone(arc.id, newMilestones[arc.id] ?? '');
                          setNewMilestones((current) => ({ ...current, [arc.id]: '' }));
                        })
                      }
                    >
                      <Plus size={15} /> Add
                    </button>
                  </div>
                  <footer>
                    {arc.status === 'active' && (
                      <button
                        className="text-button"
                        onClick={() =>
                          void run(`pause:${arc.id}`, () => setCampaignArcStatus(arc.id, 'paused'))
                        }
                      >
                        <CirclePause size={15} /> Pause
                      </button>
                    )}
                    {arc.status === 'paused' && (
                      <button
                        className="text-button"
                        onClick={() =>
                          void run(`resume:${arc.id}`, () => setCampaignArcStatus(arc.id, 'active'))
                        }
                      >
                        <Sparkles size={15} /> Resume
                      </button>
                    )}
                    {arc.status !== 'completed' && (
                      <button
                        className="text-button"
                        onClick={() =>
                          void run(
                            `complete:${arc.id}`,
                            () => setCampaignArcStatus(arc.id, 'completed'),
                            'Campaign Arc marked complete.',
                          )
                        }
                      >
                        <Trophy size={15} /> Mark complete
                      </button>
                    )}
                    <button
                      className="text-button text-button--muted"
                      onClick={() =>
                        void run(`archive:${arc.id}`, () =>
                          setCampaignArcStatus(arc.id, 'archived'),
                        )
                      }
                    >
                      Archive
                    </button>
                  </footer>
                </article>
              );
            })}
            {!visibleArcs.length && (
              <section className="panel campaign-empty">
                <Map size={30} />
                <h2>No Campaign Arcs yet</h2>
                <p>
                  Create one for a long-term goal that deserves milestones, purpose, and a companion
                  beside it.
                </p>
                <button className="button button--primary" onClick={() => setShowArcForm(true)}>
                  <Plus size={17} /> Create first Arc
                </button>
              </section>
            )}
          </div>
        </>
      ) : (
        <section className="questline-layout">
          <div className="questline-selector" aria-label="Companion questlines">
            {COMPANION_QUESTLINES.map((questline) => {
              const companion = getCompanion(questline.companionId);
              const item = progress.find((entry) => entry.questlineId === questline.id);
              return (
                <button
                  key={questline.id}
                  className={selectedQuestId === questline.id ? 'is-active' : ''}
                  style={{ '--companion-accent': companion.accent } as CSSProperties}
                  onClick={() => setSelectedQuestId(questline.id)}
                >
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <div>
                    <strong>{companion.name}</strong>
                    <span>{questline.title}</span>
                    <small>
                      {item?.status === 'completed'
                        ? 'Complete'
                        : item
                          ? `Chapter ${item.currentChapterIndex + 1} · ${item.status}`
                          : 'Not started'}
                    </small>
                  </div>
                  <ChevronRight size={17} />
                </button>
              );
            })}
          </div>

          <article
            className="panel questline-detail"
            style={{ '--companion-accent': selectedCompanion.accent } as CSSProperties}
          >
            <header className="questline-detail__hero">
              <img
                src={getCompanionImage(selectedCompanion.image)}
                alt={`${selectedCompanion.name}, ${selectedCompanion.title}`}
              />
              <div>
                <p className="eyebrow">
                  {selectedCompanion.name.toUpperCase()} · PERSONAL QUESTLINE
                </p>
                <h1>{selectedQuest.title}</h1>
                <strong>{selectedQuest.subtitle}</strong>
                <p>{selectedQuest.premise}</p>
              </div>
            </header>

            <div className="quest-chapter-map">
              {selectedQuest.chapters.map((chapter, index) => {
                const cleared = selectedProgress?.completedChapterIds.includes(chapter.id);
                const current =
                  selectedProgress?.currentChapterIndex === index &&
                  selectedProgress.status !== 'completed';
                return (
                  <div
                    key={chapter.id}
                    className={`${cleared ? 'is-complete' : ''} ${current ? 'is-current' : ''}`}
                  >
                    <span>{cleared ? <Check size={15} /> : chapter.number}</span>
                    <small>{chapter.title}</small>
                  </div>
                );
              })}
            </div>

            {!selectedProgress ? (
              <div className="questline-start">
                <Sparkles size={27} />
                <h2>Five chapters · Fifteen objectives</h2>
                <p>
                  Start when you want this companion’s story active. Another active quest pauses
                  automatically and can be resumed later. There are no deadlines or failure states.
                </p>
                <button
                  className="button button--primary button--wide"
                  disabled={busy === `start:${selectedQuest.id}`}
                  onClick={() =>
                    void run(
                      `start:${selectedQuest.id}`,
                      () => startQuestline(selectedQuest.id),
                      `${selectedQuest.title} activated.`,
                    )
                  }
                >
                  Begin questline
                </button>
              </div>
            ) : selectedProgress.status === 'completed' ? (
              <div className="questline-complete">
                <Trophy size={32} />
                <p className="eyebrow">QUESTLINE COMPLETE</p>
                <h2>{selectedQuest.title}</h2>
                <p>
                  All five chapters are sealed. The unique title has been added to your collection.
                </p>
              </div>
            ) : selectedView?.chapter ? (
              <div className="quest-chapter">
                <div className="quest-chapter__header">
                  <div>
                    <p className="eyebrow">CHAPTER {selectedView.chapter.number} OF 5</p>
                    <h2>{selectedView.chapter.title}</h2>
                  </div>
                  <span>+{selectedView.chapter.rewardXp} XP</span>
                </div>
                <blockquote>{selectedView.chapter.intro}</blockquote>
                <div className="quest-objectives">
                  {selectedView.objectives.map((objective) => (
                    <article
                      key={objective.definition.id}
                      className={objective.completed ? 'is-complete' : ''}
                    >
                      <div className="quest-objective__status">
                        {objective.completed ? <Check size={17} /> : <Target size={17} />}
                      </div>
                      <div>
                        <div className="quest-objective__title">
                          <strong>{objective.definition.title}</strong>
                          <span>{metricLabel(objective)}</span>
                        </div>
                        <p>{objective.definition.description}</p>
                        {objective.definition.metric === 'manual' && !objective.completed && (
                          <div className="quest-reflection">
                            <small>{objective.definition.reflectionPrompt}</small>
                            <textarea
                              rows={3}
                              value={reflections[objective.definition.id] ?? ''}
                              disabled={selectedProgress.status !== 'active'}
                              onChange={(event) =>
                                setReflections({
                                  ...reflections,
                                  [objective.definition.id]: event.target.value,
                                })
                              }
                              placeholder="Your private reflection is stored only on this device…"
                            />
                            <button
                              className="button button--small button--ghost"
                              disabled={
                                selectedProgress.status !== 'active' ||
                                !reflections[objective.definition.id]?.trim()
                              }
                              onClick={() =>
                                void run(objective.definition.id, async () => {
                                  await completeManualQuestObjective(
                                    selectedProgress.id,
                                    objective.definition.id,
                                    reflections[objective.definition.id] ?? '',
                                  );
                                  setReflections((current) => ({
                                    ...current,
                                    [objective.definition.id]: '',
                                  }));
                                })
                              }
                            >
                              <Check size={14} /> Save reflection
                            </button>
                            {selectedProgress.status === 'paused' && (
                              <small>Resume this questline to record a new reflection.</small>
                            )}
                          </div>
                        )}
                        {objective.manualRecord?.note && (
                          <blockquote className="quest-reflection__saved">
                            “{objective.manualRecord.note}”
                          </blockquote>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="quest-chapter__actions">
                  <button
                    className="button button--ghost"
                    onClick={() =>
                      void run(`pause:${selectedProgress.id}`, () =>
                        selectedProgress.status === 'active'
                          ? pauseQuestline(selectedProgress.id)
                          : resumeQuestline(selectedProgress.id),
                      )
                    }
                  >
                    {selectedProgress.status === 'active' ? (
                      <>
                        <CirclePause size={16} /> Pause questline
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Resume questline
                      </>
                    )}
                  </button>
                  <button
                    className="button button--primary"
                    disabled={
                      selectedProgress.status !== 'active' ||
                      !selectedView.canCompleteChapter ||
                      busy === `claim:${selectedProgress.id}`
                    }
                    onClick={() =>
                      void run(
                        `claim:${selectedProgress.id}`,
                        () => completeQuestChapter(selectedProgress.id),
                        'Chapter complete. Reward and story progress secured.',
                      )
                    }
                  >
                    <Trophy size={16} /> Complete chapter
                  </button>
                </div>
                {!selectedView.canCompleteChapter && (
                  <p className="quest-chapter__note">
                    Tracked objectives update from new records created after this chapter began.
                    Reflective objectives are completed here.
                  </p>
                )}
              </div>
            ) : null}
          </article>
        </section>
      )}
    </div>
  );
}
