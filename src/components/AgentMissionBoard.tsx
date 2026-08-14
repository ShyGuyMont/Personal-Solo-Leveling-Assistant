import {
  CalendarClock,
  Check,
  ChevronDown,
  CircleDot,
  Plus,
  RefreshCcw,
  RotateCcw,
  ShieldX,
  Sparkles,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import {
  AGENT_MISSION_DAILY_XP_CAP,
  AGENT_MISSION_REWARDS,
  completeAgentMission,
  createAgentMission,
  listAgentMissions,
  reopenAgentMission,
  retireAgentMission,
  setAgentMissionChecklist,
} from '@/game/agentMissions';
import type {
  AgentMission,
  AgentMissionDifficulty,
  AgentMissionRecurrence,
  CompanionId,
  LocalDateKey,
  MissionCategory,
} from '@/types/game';

const CATEGORIES: Array<{ id: MissionCategory; label: string }> = [
  { id: 'faith', label: 'Faith' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'physical', label: 'Physical' },
  { id: 'creator', label: 'Creator' },
  { id: 'character', label: 'Character' },
];

const DIFFICULTIES: AgentMissionDifficulty[] = ['minor', 'standard', 'major', 'boss'];

export function AgentMissionBoard({
  systemDate,
  enabledCompanionIds,
  onProgressionChanged,
}: {
  systemDate: LocalDateKey;
  enabledCompanionIds: CompanionId[];
  onProgressionChanged: () => Promise<unknown>;
}) {
  const [missions, setMissions] = useState<AgentMission[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MissionCategory>('discipline');
  const [companionId, setCompanionId] = useState<CompanionId>('snow');
  const [difficulty, setDifficulty] = useState<AgentMissionDifficulty>('standard');
  const [dueDate, setDueDate] = useState(systemDate);
  const [recurrence, setRecurrence] = useState<AgentMissionRecurrence>('none');
  const [steps, setSteps] = useState('');

  const reload = useCallback(async () => setMissions(await listAgentMissions()), []);
  useEffect(() => void reload(), [reload]);

  const enabled = useMemo(() => {
    const ids = new Set(enabledCompanionIds);
    return COMPANIONS.filter((companion) => ids.has(companion.id));
  }, [enabledCompanionIds]);
  const active = missions.filter((mission) => mission.status === 'active');
  const visible = historyOpen
    ? missions
    : missions.filter(
        (mission) => mission.status === 'active' || mission.lastCompletedOn === systemDate,
      );

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setNotice(undefined);
    try {
      await action();
      await Promise.all([reload(), onProgressionChanged()]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'The mission record could not be changed.',
      );
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void act(async () => {
      await createAgentMission({
        title,
        description,
        category,
        companionId,
        createdBy: 'hunter',
        source: 'hunter',
        difficulty,
        dueDate,
        recurrence,
        checklistItems: steps
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setTitle('');
      setDescription('');
      setSteps('');
      setFormOpen(false);
      setNotice('Companion Order secured. It is separate from the locked Daily Mission cycle.');
    });
  }

  return (
    <section className="agent-mission-board panel">
      <header className="agent-mission-board__header">
        <div>
          <p className="eyebrow">SOVEREIGN MISSION FORGE</p>
          <h2>Companion Orders</h2>
          <p>
            New optional missions live here. Daily rolls, Class gates, and their rewards remain
            locked and authoritative.
          </p>
        </div>
        <div className="agent-mission-board__signal">
          <Sparkles size={18} />
          <strong>{active.length}</strong>
          <span>orders</span>
        </div>
      </header>

      <div className="agent-mission-board__rules">
        <span>
          <ShieldX size={15} /> Original daily missions cannot be rewritten
        </span>
        <span>
          <CircleDot size={15} /> {AGENT_MISSION_DAILY_XP_CAP} Agent XP daily ceiling
        </span>
        <span>
          <RotateCcw size={15} /> Same-day completion can be reopened
        </span>
      </div>

      <div className="agent-mission-board__controls">
        <button className="button button--primary" onClick={() => setFormOpen((value) => !value)}>
          <Plus size={16} /> {formOpen ? 'Close Forge' : 'Forge an order'}
        </button>
        <button className="button button--ghost" onClick={() => setHistoryOpen((value) => !value)}>
          <ChevronDown size={16} /> {historyOpen ? 'Hide history' : 'Show history'}
        </button>
      </div>

      {formOpen && (
        <form className="agent-mission-form" onSubmit={submit}>
          <label className="agent-mission-form__wide">
            <span>Mission title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="agent-mission-form__wide">
            <span>Brief</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="What counts as an honest clear?"
            />
          </label>
          <label>
            <span>Owner</span>
            <select
              value={companionId}
              onChange={(event) => setCompanionId(event.target.value as CompanionId)}
            >
              {enabled.map((companion) => (
                <option key={companion.id} value={companion.id}>
                  {companion.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Realm</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as MissionCategory)}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Threat tier</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as AgentMissionDifficulty)}
            >
              {DIFFICULTIES.map((item) => (
                <option key={item} value={item}>
                  {item} · {AGENT_MISSION_REWARDS[item].accountXp} XP
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value as LocalDateKey)}
            />
          </label>
          <label>
            <span>Recurrence</span>
            <select
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value as AgentMissionRecurrence)}
            >
              <option value="none">One time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="agent-mission-form__wide">
            <span>Optional checklist · one step per line</span>
            <textarea value={steps} onChange={(event) => setSteps(event.target.value)} rows={3} />
          </label>
          <button className="button button--primary agent-mission-form__wide" disabled={busy}>
            <Sparkles size={16} /> Secure Companion Order
          </button>
        </form>
      )}

      {notice && <p className="agent-mission-board__notice">{notice}</p>}

      <div className="agent-mission-list">
        {visible.length ? (
          visible.map((mission) => {
            const companion = getCompanion(mission.companionId);
            const completeToday = mission.lastCompletedOn === systemDate;
            return (
              <article
                key={mission.id}
                className={`agent-mission-card ${completeToday ? 'is-complete' : ''}`}
                style={{ '--companion-accent': companion.accent } as React.CSSProperties}
              >
                <header>
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <div>
                    <p className="eyebrow">
                      {companion.name} · {mission.difficulty} order
                    </p>
                    <h3>{mission.title}</h3>
                  </div>
                  <span className="agent-mission-card__xp">{mission.accountXp} XP</span>
                </header>
                {mission.description && <p>{mission.description}</p>}
                <div className="agent-mission-card__meta">
                  <span>
                    <CalendarClock size={14} /> {mission.dueDate ?? 'No deadline'}
                  </span>
                  <span>
                    <RefreshCcw size={14} /> {mission.recurrence}
                  </span>
                  <span>{mission.category}</span>
                </div>
                {mission.status === 'active' &&
                  mission.checklistItems.length > 0 &&
                  !completeToday && (
                    <div className="agent-mission-card__checklist">
                      {mission.checklistItems.map((item) => (
                        <label key={item}>
                          <input
                            type="checkbox"
                            checked={Boolean(mission.checklist[item])}
                            disabled={busy}
                            onChange={(event) =>
                              void act(() =>
                                setAgentMissionChecklist(mission.id, item, event.target.checked),
                              )
                            }
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  )}
                <div className="agent-mission-card__actions">
                  {mission.status === 'retired' ? (
                    <span className="agent-mission-card__cleared">Retired · history preserved</span>
                  ) : completeToday ? (
                    <>
                      <span className="agent-mission-card__cleared">
                        <Check size={16} /> Cleared today
                      </span>
                      <button
                        className="button button--ghost"
                        disabled={busy}
                        onClick={() => void act(() => reopenAgentMission(mission.id, systemDate))}
                      >
                        Reopen
                      </button>
                    </>
                  ) : mission.status === 'active' ? (
                    <>
                      <button
                        className="button button--primary"
                        disabled={busy}
                        onClick={() => void act(() => completeAgentMission(mission.id, systemDate))}
                      >
                        <Check size={16} /> Confirm clear
                      </button>
                      <button
                        className="button button--ghost"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Retire “${mission.title}” without deleting its history?`,
                            )
                          ) {
                            void act(() => retireAgentMission(mission.id));
                          }
                        }}
                      >
                        Retire
                      </button>
                    </>
                  ) : (
                    <span className="agent-mission-card__cleared">
                      <Check size={16} /> Completed
                    </span>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="agent-mission-empty">
            <Sparkles size={24} />
            <strong>No Companion Orders yet.</strong>
            <span>
              Forge one here, or ask a companion once the Sovereign command link is active.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
