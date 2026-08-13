import {
  AlertTriangle,
  Archive,
  CalendarCheck2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  ListChecks,
  MapPin,
  MessageCircleMore,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  buildCalendarBriefing,
  deleteCalendarEvent,
  expandCalendarEvents,
  formatCalendarTime,
  getCalendarConflicts,
  getCalendarEvents,
  saveCalendarEvent,
  setCalendarEventStatus,
  type CalendarEventDraft,
} from '@/game/calendar';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import type {
  CalendarEvent,
  CalendarEventCategory,
  CalendarEventOccurrence,
  CalendarRecurrence,
  CalendarRealm,
  LocalDateKey,
} from '@/types/game';
import {
  addDays,
  formatLongDate,
  parseDateKey,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from '@/utils/date';

interface CalendarFormState {
  id?: string;
  title: string;
  description: string;
  category: CalendarEventCategory;
  start: string;
  end: string;
  allDay: boolean;
  recurrence: CalendarRecurrence;
  recurrenceInterval: number;
  recurrenceEndsOn: string;
  location: string;
}

const CATEGORY_LABELS: Record<CalendarEventCategory, string> = {
  personal: 'Personal',
  work: 'Work',
  training: 'Training',
  faith: 'Faith',
  creator: 'Creator',
  appointment: 'Appointment',
  deadline: 'Deadline',
};

const REALM_ROUTES: Record<CalendarRealm, string> = {
  missions: '/missions',
  training: '/training-hall',
  kitchen: '/kitchen',
  sanctuary: '/sanctuary',
  creator: '/creator-forge',
  arc: '/arc-archives',
  treasury: '/treasury',
};

const MISSION_LAYER_KEY = 'the-system:calendar-mission-layer';

function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function newForm(date: LocalDateKey): CalendarFormState {
  const start = new Date(`${date}T09:00:00`);
  const end = new Date(`${date}T10:00:00`);
  return {
    title: '',
    description: '',
    category: 'personal',
    start: localInputValue(start),
    end: localInputValue(end),
    allDay: false,
    recurrence: 'none',
    recurrenceInterval: 1,
    recurrenceEndsOn: '',
    location: '',
  };
}

function formFromEvent(event: CalendarEvent): CalendarFormState {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    start: localInputValue(new Date(event.startAt)),
    end: localInputValue(new Date(event.endAt)),
    allDay: event.allDay,
    recurrence: event.recurrence,
    recurrenceInterval: event.recurrenceInterval,
    recurrenceEndsOn: event.recurrenceEndsOn ?? '',
    location: event.location,
  };
}

function shiftMonth(date: LocalDateKey, amount: number) {
  const parsed = parseDateKey(date);
  parsed.setUTCMonth(parsed.getUTCMonth() + amount, 1);
  return toDateKey(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 1);
}

function monthLabel(date: LocalDateKey) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseDateKey(date));
}

function eventTimeLabel(event: CalendarEventOccurrence, timeZone?: string) {
  if (event.allDay) return 'All day';
  return `${formatCalendarTime(event.startAt, timeZone)}–${formatCalendarTime(event.endAt, timeZone)}`;
}

export function CalendarPage() {
  const { systemDate, settings, missions, todayRecords } = useGameStore();
  const timeZone = settings?.timeZone;
  const kairo = getCompanion('kairo');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [month, setMonth] = useState(startOfMonth(systemDate));
  const [selectedDate, setSelectedDate] = useState<LocalDateKey>(systemDate);
  const [form, setForm] = useState<CalendarFormState>(() => newForm(systemDate));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('Calendar Command is synchronized locally.');
  const [showMissionLayer, setShowMissionLayer] = useState(
    () => window.localStorage.getItem(MISSION_LAYER_KEY) !== 'hidden',
  );

  const refresh = useCallback(async () => setEvents(await getCalendarEvents()), []);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener('system:calendar-changed', onChange);
    return () => window.removeEventListener('system:calendar-changed', onChange);
  }, [refresh]);

  const gridStart = startOfWeek(startOfMonth(month), settings?.weekStartsOn ?? 1);
  const monthDays = useMemo(
    () => Array.from({ length: 42 }, (_, index) => addDays(gridStart, index)),
    [gridStart],
  );
  const rangeStart = useMemo(() => new Date(`${gridStart}T00:00:00`), [gridStart]);
  const rangeEnd = useMemo(() => new Date(`${addDays(gridStart, 42)}T00:00:00`), [gridStart]);
  const monthOccurrences = useMemo(
    () => expandCalendarEvents(events, rangeStart, rangeEnd),
    [events, rangeEnd, rangeStart],
  );
  const occurrencesByDate = useMemo(() => {
    const map = new Map<LocalDateKey, CalendarEventOccurrence[]>();
    for (const occurrence of monthOccurrences) {
      const cursor = new Date(occurrence.startAt);
      const finalDate = new Date(occurrence.endAt);
      while (cursor < finalDate) {
        const key = toDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
        const list = map.get(key) ?? [];
        if (!list.some((item) => item.occurrenceId === occurrence.occurrenceId)) {
          list.push(occurrence);
          map.set(key, list);
        }
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(0, 0, 0, 0);
      }
    }
    return map;
  }, [monthOccurrences]);
  const selectedOccurrences = occurrencesByDate.get(selectedDate) ?? [];
  const missionById = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions],
  );
  const selectedMissions =
    showMissionLayer && selectedDate === systemDate
      ? todayRecords
          .map((record) => ({ record, mission: missionById.get(record.missionId) }))
          .filter((entry) => entry.mission && !entry.mission.archived)
      : [];
  const todayMissionCount = todayRecords.filter((record) => {
    const mission = missionById.get(record.missionId);
    return mission && !mission.archived;
  }).length;
  const selectedConflicts = getCalendarConflicts(selectedOccurrences);
  const briefing = useMemo(
    () => buildCalendarBriefing(events, selectedDate, new Date()),
    [events, selectedDate],
  );

  function openQuickLink(companionId: 'kairo' | 'snow', initialDraft: string) {
    window.dispatchEvent(
      new CustomEvent('system:open-quick-link', { detail: { companionId, initialDraft } }),
    );
  }

  function toggleMissionLayer() {
    setShowMissionLayer((current) => {
      const next = !current;
      window.localStorage.setItem(MISSION_LAYER_KEY, next ? 'shown' : 'hidden');
      setNotice(
        next
          ? 'Daily Missions are visible as a read-only calendar layer.'
          : 'Daily Missions are hidden. Their real records remain untouched in Missions.',
      );
      return next;
    });
  }

  function startCreate(date = selectedDate) {
    setForm(newForm(date));
    setEditing(true);
    setNotice('New commitment staged. Nothing is saved until you confirm it.');
  }

  function startEdit(id: string) {
    const event = events.find((item) => item.id === id);
    if (!event) return;
    setForm(formFromEvent(event));
    setEditing(true);
    setNotice('Editing the full event. Recurring changes apply to the complete series.');
  }

  async function submitEvent(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const start = new Date(form.start);
      const end = new Date(form.end);
      if (form.allDay) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
      const draft: CalendarEventDraft = {
        id: form.id,
        title: form.title,
        description: form.description,
        category: form.category,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        allDay: form.allDay,
        recurrence: form.recurrence,
        recurrenceInterval: form.recurrenceInterval,
        recurrenceEndsOn:
          form.recurrence === 'none' || !form.recurrenceEndsOn
            ? undefined
            : (form.recurrenceEndsOn as LocalDateKey),
        location: form.location,
        source: 'hunter',
      };
      const saved = await saveCalendarEvent(draft);
      await refresh();
      setSelectedDate(
        toDateKey(
          new Date(saved.startAt).getFullYear(),
          new Date(saved.startAt).getMonth() + 1,
          new Date(saved.startAt).getDate(),
        ),
      );
      setEditing(false);
      setNotice(`${saved.title} secured in Calendar Command.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'That commitment could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(id: string, title: string) {
    if (!window.confirm(`Remove “${title}” from Calendar Command?`)) return;
    await deleteCalendarEvent(id);
    await refresh();
    setNotice(
      `${title} removed. This cannot be undone except by restoring an Archive Shield save.`,
    );
  }

  async function completeEvent(event: CalendarEventOccurrence) {
    await setCalendarEventStatus(event.eventId, 'completed');
    await refresh();
    setNotice(`${event.title} marked complete. No mission or XP was changed.`);
  }

  return (
    <div className="calendar-command-page page-stack">
      <section className="calendar-hero">
        <div className="calendar-hero__portrait">
          <img src={getCompanionImage(kairo.image)} alt="Kairo, The Timekeeper" />
          <i />
          <i />
        </div>
        <div className="calendar-hero__copy">
          <p className="eyebrow">TWELFTH COMPANION · SNOW'S TIMEKEEPER</p>
          <h1>Calendar Command</h1>
          <p>
            Kairo keeps the exact schedule; Snow keeps the whole day human. Every commitment lives
            on this device, every conflict is visible, and no AI change becomes real without your
            confirmation.
          </p>
          <div className="calendar-hero__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={() =>
                openQuickLink(
                  'kairo',
                  `Kairo, brief me on my schedule for ${formatLongDate(selectedDate)}. Call out conflicts, deadlines, and the best protected focus window. `,
                )
              }
            >
              <MessageCircleMore size={17} /> Ask Kairo
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={() =>
                openQuickLink(
                  'snow',
                  `Snow, check with Kairo and tell me how my schedule looks for ${formatLongDate(selectedDate)}. `,
                )
              }
            >
              <Sparkles size={17} /> Ask Snow
            </button>
            <Link className="button button--ghost" to="/archive">
              <Archive size={17} /> Archive Shield
            </Link>
            <button className="button button--ghost" type="button" onClick={toggleMissionLayer}>
              {showMissionLayer ? <EyeOff size={17} /> : <Eye size={17} />}
              {showMissionLayer ? 'Hide missions' : 'Show missions'}
            </button>
          </div>
        </div>
        <div className="calendar-hero__signal">
          <CalendarCheck2 size={22} />
          <span>TIMEKEEPER LINK</span>
          <strong>{events.filter((event) => event.status === 'scheduled').length}</strong>
          <small>active commitments</small>
        </div>
      </section>

      <section className="calendar-intelligence" aria-label="Kairo schedule briefing">
        <article data-state={briefing.conflicts.length ? 'warning' : 'clear'}>
          <ShieldCheck size={20} />
          <span>Schedule integrity</span>
          <strong>
            {briefing.conflicts.length
              ? `${briefing.conflicts.length} collision${briefing.conflicts.length === 1 ? '' : 's'}`
              : 'No collisions'}
          </strong>
        </article>
        <article>
          <CalendarClock size={20} />
          <span>Next arrival</span>
          <strong>
            {briefing.next
              ? `${briefing.next.title} · ${eventTimeLabel(briefing.next, timeZone)}`
              : 'Open horizon'}
          </strong>
        </article>
        <article>
          <Clock3 size={20} />
          <span>Protected focus</span>
          <strong>
            {briefing.focusWindows[0]
              ? `${formatCalendarTime(briefing.focusWindows[0].startAt, timeZone)} · ${Math.round(
                  briefing.focusWindows[0].minutes / 60,
                )}h window`
              : 'No 60m window'}
          </strong>
        </article>
        <article>
          <AlertTriangle size={20} />
          <span>Upcoming deadlines</span>
          <strong>{briefing.upcomingDeadlines.length || 'None in 14 days'}</strong>
        </article>
      </section>

      <p className="calendar-notice" aria-live="polite">
        {notice}
      </p>

      <section className="calendar-workspace">
        <div className="calendar-month">
          <header>
            <div>
              <p className="eyebrow">CHRONICLE GRID</p>
              <h2>{monthLabel(month)}</h2>
            </div>
            <div className="calendar-month__controls">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setMonth(shiftMonth(month, -1))}
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonth(startOfMonth(systemDate));
                  setSelectedDate(systemDate);
                }}
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setMonth(shiftMonth(month, 1))}
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </header>
          <div className="calendar-weekdays" aria-hidden="true">
            {(settings?.weekStartsOn ?? 1) === 0
              ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <span key={day}>{day}</span>
                ))
              : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
          </div>
          <div className="calendar-grid">
            {monthDays.map((date) => {
              const dayEvents = occurrencesByDate.get(date) ?? [];
              const missionCount = showMissionLayer && date === systemDate ? todayMissionCount : 0;
              const hasConflict = getCalendarConflicts(dayEvents).length > 0;
              return (
                <button
                  key={date}
                  type="button"
                  className={date === selectedDate ? 'is-selected' : ''}
                  data-outside={date.slice(0, 7) !== month.slice(0, 7)}
                  data-today={date === systemDate}
                  data-conflict={hasConflict}
                  onClick={() => {
                    setSelectedDate(date);
                    setEditing(false);
                  }}
                >
                  <span>{Number(date.slice(-2))}</span>
                  <div>
                    {missionCount > 0 && (
                      <i data-category="mission" title={`${missionCount} daily missions`} />
                    )}
                    {dayEvents.slice(0, missionCount > 0 ? 2 : 3).map((event) => (
                      <i
                        key={event.occurrenceId}
                        data-category={event.category}
                        title={event.title}
                      />
                    ))}
                  </div>
                  {dayEvents.length + missionCount > 3 && (
                    <small>+{dayEvents.length + missionCount - 3}</small>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="calendar-agenda">
          <header>
            <div>
              <p className="eyebrow">SELECTED DAY</p>
              <h2>{formatLongDate(selectedDate)}</h2>
            </div>
            <button className="button button--primary" type="button" onClick={() => startCreate()}>
              <CirclePlus size={17} /> Add
            </button>
          </header>

          {selectedConflicts.length > 0 && (
            <div className="calendar-conflict-alert">
              <AlertTriangle size={19} />
              <div>
                <strong>Kairo found a collision.</strong>
                <p>
                  {selectedConflicts[0].first.title} overlaps {selectedConflicts[0].second.title}.
                  Edit one before the day arrives.
                </p>
              </div>
            </div>
          )}

          <div className="calendar-agenda__list">
            {selectedMissions.length > 0 && (
              <section className="calendar-mission-layer" aria-label="Daily missions">
                <header>
                  <span>
                    <ListChecks size={17} /> DAILY MISSIONS
                  </span>
                  <small>READ-ONLY LAYER</small>
                </header>
                {selectedMissions.map(({ record, mission }) => (
                  <article key={record.id} data-status={record.status}>
                    <span className="calendar-mission-layer__status" />
                    <div>
                      <strong>{mission?.name}</strong>
                      <small>
                        {record.status} · {mission?.accountXp ?? 0} XP
                      </small>
                    </div>
                    <Link to="/missions">Open Missions</Link>
                  </article>
                ))}
                <p>
                  Kairo can reserve time around these missions, but this layer never duplicates,
                  completes, or rewards them.
                </p>
              </section>
            )}
            {!selectedOccurrences.length && !selectedMissions.length && (
              <div className="calendar-empty">
                <CalendarClock size={34} />
                <strong>Open horizon</strong>
                <p>No commitments are scheduled for this day.</p>
              </div>
            )}
            {selectedOccurrences.map((event) => (
              <article
                key={event.occurrenceId}
                data-category={event.category}
                data-status={event.status}
              >
                <div className="calendar-agenda__time">
                  <strong>{eventTimeLabel(event, timeZone)}</strong>
                  <small>{CATEGORY_LABELS[event.category]}</small>
                </div>
                <div className="calendar-agenda__copy">
                  <h3>{event.title}</h3>
                  {event.description && <p>{event.description}</p>}
                  <div>
                    {event.location && (
                      <span>
                        <MapPin size={13} /> {event.location}
                      </span>
                    )}
                    {event.recurring && (
                      <span>
                        <Repeat2 size={13} /> Series
                      </span>
                    )}
                    <span>
                      {event.source === 'hunter'
                        ? 'You'
                        : event.source === 'snow'
                          ? 'Snow'
                          : 'Kairo'}
                    </span>
                    {event.linkedCompanionId && (
                      <span className="calendar-agenda__companion">
                        <img
                          src={getCompanionImage(getCompanion(event.linkedCompanionId).image)}
                          alt=""
                        />
                        {getCompanion(event.linkedCompanionId).name}
                      </span>
                    )}
                  </div>
                  {event.linkedRealm && (
                    <Link className="calendar-agenda__realm" to={REALM_ROUTES[event.linkedRealm]}>
                      Open {event.linkedRealm}
                    </Link>
                  )}
                </div>
                <div className="calendar-agenda__actions">
                  {event.status === 'scheduled' && !event.recurring && (
                    <button
                      type="button"
                      title="Mark complete"
                      onClick={() => void completeEvent(event)}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button type="button" title="Edit" onClick={() => startEdit(event.eventId)}>
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => void removeEvent(event.eventId, event.title)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      {editing && (
        <section className="calendar-editor">
          <header>
            <div>
              <p className="eyebrow">{form.id ? 'EDIT COMMITMENT' : 'NEW COMMITMENT'}</p>
              <h2>{form.id ? 'Adjust the timeline' : 'Secure the time'}</h2>
            </div>
            <button type="button" aria-label="Close editor" onClick={() => setEditing(false)}>
              <X size={20} />
            </button>
          </header>
          <form onSubmit={submitEvent}>
            <label className="calendar-editor__wide">
              <span>Title</span>
              <input
                value={form.title}
                maxLength={160}
                required
                placeholder="What owns this time?"
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value as CalendarEventCategory })
                }
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Location</span>
              <input
                value={form.location}
                maxLength={240}
                placeholder="Optional"
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>
            <label>
              <span>Starts</span>
              <input
                type="datetime-local"
                required
                value={form.start}
                onChange={(event) => setForm({ ...form, start: event.target.value })}
              />
            </label>
            <label>
              <span>Ends</span>
              <input
                type="datetime-local"
                required
                value={form.end}
                onChange={(event) => setForm({ ...form, end: event.target.value })}
              />
            </label>
            <label>
              <span>Repeats</span>
              <select
                value={form.recurrence}
                onChange={(event) =>
                  setForm({ ...form, recurrence: event.target.value as CalendarRecurrence })
                }
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label>
              <span>
                {form.recurrence === 'none'
                  ? 'Repeat interval'
                  : `Every ${form.recurrence.replace('ly', '')}(s)`}
              </span>
              <input
                type="number"
                min={1}
                max={12}
                disabled={form.recurrence === 'none'}
                value={form.recurrenceInterval}
                onChange={(event) =>
                  setForm({ ...form, recurrenceInterval: Number(event.target.value) })
                }
              />
            </label>
            <label>
              <span>Series ends</span>
              <input
                type="date"
                disabled={form.recurrence === 'none'}
                value={form.recurrenceEndsOn}
                onChange={(event) => setForm({ ...form, recurrenceEndsOn: event.target.value })}
              />
            </label>
            <label className="calendar-editor__toggle">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(event) => setForm({ ...form, allDay: event.target.checked })}
              />
              <span>Protect as an all-day commitment</span>
            </label>
            <label className="calendar-editor__wide">
              <span>Details</span>
              <textarea
                value={form.description}
                maxLength={2000}
                rows={4}
                placeholder="Context Kairo and Snow should know when you ask about this schedule."
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
            <div className="calendar-editor__actions calendar-editor__wide">
              <button className="button button--primary" type="submit" disabled={saving}>
                <CalendarCheck2 size={17} />{' '}
                {saving ? 'Securing…' : form.id ? 'Save changes' : 'Add commitment'}
              </button>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <small>Stored only on this device · included in Archive Shield</small>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
