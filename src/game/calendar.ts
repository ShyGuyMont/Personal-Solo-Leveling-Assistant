import { db } from '@/db/database';
import type {
  CalendarEvent,
  CalendarEventCategory,
  CalendarEventOccurrence,
  CalendarEventSource,
  CalendarEventStatus,
  CalendarRealm,
  CompanionId,
  CalendarRecurrence,
  LocalDateKey,
} from '@/types/game';

export interface CalendarEventDraft {
  id?: string;
  title: string;
  description?: string;
  category: CalendarEventCategory;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  recurrence?: CalendarRecurrence;
  recurrenceInterval?: number;
  recurrenceEndsOn?: LocalDateKey;
  location?: string;
  source?: CalendarEventSource;
  status?: CalendarEventStatus;
  linkedCompanionId?: CompanionId;
  linkedRealm?: CalendarRealm;
}

export interface CalendarMutationProposal {
  action: 'create' | 'update' | 'cancel';
  eventId: string;
  title: string;
  description: string;
  category: CalendarEventCategory;
  startAt: string;
  endAt: string;
  allDay: boolean;
  recurrence: CalendarRecurrence;
  recurrenceInterval: number;
  recurrenceEndsOn: string;
  location: string;
  linkedCompanionId?: CompanionId | '';
  linkedRealm?: CalendarRealm | '';
}

export interface CalendarConflict {
  first: CalendarEventOccurrence;
  second: CalendarEventOccurrence;
}

export interface CalendarFocusWindow {
  startAt: string;
  endAt: string;
  minutes: number;
}

export interface CalendarBriefing {
  today: CalendarEventOccurrence[];
  next?: CalendarEventOccurrence;
  conflicts: CalendarConflict[];
  focusWindows: CalendarFocusWindow[];
  scheduledMinutes: number;
  upcomingDeadlines: CalendarEventOccurrence[];
}

const CATEGORY_SET = new Set<CalendarEventCategory>([
  'personal',
  'work',
  'training',
  'faith',
  'creator',
  'appointment',
  'deadline',
]);
const RECURRENCE_SET = new Set<CalendarRecurrence>(['none', 'daily', 'weekly', 'monthly']);
const STATUS_SET = new Set<CalendarEventStatus>(['scheduled', 'completed', 'canceled']);
const SOURCE_SET = new Set<CalendarEventSource>(['hunter', 'kairo', 'snow']);

function uniqueId() {
  return crypto.randomUUID?.() ?? `calendar-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parsedIso(value: string, label: string) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error(`${label} is not a valid date and time.`);
  return parsed;
}

function clean(value: string | undefined, maxLength: number) {
  return (value ?? '').trim().slice(0, maxLength);
}

function normalizeDraft(input: CalendarEventDraft, existing?: CalendarEvent): CalendarEvent {
  const start = parsedIso(input.startAt, 'Start time');
  const end = parsedIso(input.endAt, 'End time');
  if (end.getTime() <= start.getTime()) throw new Error('End time must be after start time.');
  if (end.getTime() - start.getTime() > 366 * 86_400_000) {
    throw new Error('A single calendar entry cannot span more than one year.');
  }
  const title = clean(input.title, 160);
  if (!title) throw new Error('Give this calendar entry a title.');
  const category = CATEGORY_SET.has(input.category) ? input.category : 'personal';
  const recurrence = RECURRENCE_SET.has(input.recurrence ?? 'none')
    ? (input.recurrence ?? 'none')
    : 'none';
  const status = STATUS_SET.has(input.status ?? existing?.status ?? 'scheduled')
    ? (input.status ?? existing?.status ?? 'scheduled')
    : 'scheduled';
  const source = SOURCE_SET.has(input.source ?? existing?.source ?? 'hunter')
    ? (input.source ?? existing?.source ?? 'hunter')
    : 'hunter';
  const recurrenceInterval = Math.max(
    1,
    Math.min(12, Math.round(Number(input.recurrenceInterval) || 1)),
  );
  if (input.recurrenceEndsOn && !/^\d{4}-\d{2}-\d{2}$/.test(input.recurrenceEndsOn)) {
    throw new Error('The recurrence end date is not valid.');
  }
  const linkedCompanionId = input.linkedCompanionId ?? existing?.linkedCompanionId;
  const linkedRealm = input.linkedRealm ?? existing?.linkedRealm;
  if (Boolean(linkedCompanionId) !== Boolean(linkedRealm)) {
    throw new Error('A companion-linked time block needs both its companion and realm.');
  }
  const now = new Date().toISOString();
  return {
    id: input.id ?? existing?.id ?? uniqueId(),
    title,
    description: clean(input.description, 2_000),
    category,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    allDay: input.allDay === true,
    recurrence,
    recurrenceInterval,
    recurrenceEndsOn: recurrence === 'none' ? undefined : input.recurrenceEndsOn,
    location: clean(input.location, 240),
    source,
    linkedCompanionId,
    linkedRealm,
    status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function saveCalendarEvent(input: CalendarEventDraft) {
  const existing = input.id ? await db.calendarEvents.get(input.id) : undefined;
  const event = normalizeDraft(input, existing);
  await db.calendarEvents.put(event);
  window.dispatchEvent(new CustomEvent('system:calendar-changed', { detail: { id: event.id } }));
  return event;
}

export async function setCalendarEventStatus(id: string, status: CalendarEventStatus) {
  if (!STATUS_SET.has(status)) throw new Error('That calendar status is not valid.');
  const existing = await db.calendarEvents.get(id);
  if (!existing) throw new Error('That calendar entry no longer exists.');
  await db.calendarEvents.update(id, { status, updatedAt: new Date().toISOString() });
  window.dispatchEvent(new CustomEvent('system:calendar-changed', { detail: { id } }));
}

export async function applyCalendarProposal(
  proposal: CalendarMutationProposal,
  source: CalendarEventSource,
) {
  if (proposal.action === 'cancel') {
    const existing = await db.calendarEvents.get(proposal.eventId);
    if (!existing) throw new Error('That commitment changed or no longer exists. Ask Kairo again.');
    await setCalendarEventStatus(existing.id, 'canceled');
    return { ...existing, status: 'canceled' as const, updatedAt: new Date().toISOString() };
  }
  if (proposal.action === 'update' && !(await db.calendarEvents.get(proposal.eventId))) {
    throw new Error('That commitment changed or no longer exists. Ask Kairo again.');
  }
  if (proposal.action === 'create' && proposal.eventId) {
    throw new Error('That new commitment contains an unexpected existing ID. Ask Kairo again.');
  }
  return saveCalendarEvent({
    id: proposal.action === 'update' ? proposal.eventId : undefined,
    title: proposal.title,
    description: proposal.description,
    category: proposal.category,
    startAt: proposal.startAt,
    endAt: proposal.endAt,
    allDay: proposal.allDay,
    recurrence: proposal.recurrence,
    recurrenceInterval: proposal.recurrenceInterval,
    recurrenceEndsOn: proposal.recurrenceEndsOn
      ? (proposal.recurrenceEndsOn as LocalDateKey)
      : undefined,
    location: proposal.location,
    linkedCompanionId: proposal.linkedCompanionId || undefined,
    linkedRealm: proposal.linkedRealm || undefined,
    source,
    status: 'scheduled',
  });
}

export async function deleteCalendarEvent(id: string) {
  await db.calendarEvents.delete(id);
  window.dispatchEvent(new CustomEvent('system:calendar-changed', { detail: { id } }));
}

export async function getCalendarEvents() {
  return db.calendarEvents.orderBy('startAt').toArray();
}

function shiftOccurrence(date: Date, recurrence: CalendarRecurrence, interval: number) {
  const shifted = new Date(date);
  if (recurrence === 'daily') shifted.setDate(shifted.getDate() + interval);
  if (recurrence === 'weekly') shifted.setDate(shifted.getDate() + interval * 7);
  if (recurrence === 'monthly') {
    const originalDay = shifted.getDate();
    shifted.setDate(1);
    shifted.setMonth(shifted.getMonth() + interval);
    const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
    shifted.setDate(Math.min(originalDay, lastDay));
  }
  return shifted;
}

export function localDateKeyForDate(date: Date): LocalDateKey {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}` as LocalDateKey;
}

function occurrenceFrom(
  event: CalendarEvent,
  start: Date,
  end: Date,
  index: number,
): CalendarEventOccurrence {
  return {
    occurrenceId: `${event.id}:${index}:${start.toISOString()}`,
    eventId: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    allDay: event.allDay,
    location: event.location,
    source: event.source,
    linkedCompanionId: event.linkedCompanionId,
    linkedRealm: event.linkedRealm,
    status: event.status,
    recurring: event.recurrence !== 'none',
  };
}

export function expandCalendarEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEventOccurrence[] {
  const occurrences: CalendarEventOccurrence[] = [];
  const startLimit = rangeStart.getTime();
  const endLimit = rangeEnd.getTime();
  for (const event of events) {
    if (event.status === 'canceled') continue;
    let start = new Date(event.startAt);
    let end = new Date(event.endAt);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) continue;
    let index = 0;
    while (index < 10_000) {
      if (event.recurrenceEndsOn && localDateKeyForDate(start) > event.recurrenceEndsOn) break;
      if (end.getTime() > startLimit && start.getTime() < endLimit) {
        occurrences.push(occurrenceFrom(event, start, end, index));
      }
      if (event.recurrence === 'none' || start.getTime() >= endLimit) break;
      const nextStart = shiftOccurrence(start, event.recurrence, event.recurrenceInterval);
      const nextEnd = new Date(nextStart.getTime() + (end.getTime() - start.getTime()));
      if (nextStart.getTime() <= start.getTime()) break;
      start = nextStart;
      end = nextEnd;
      index += 1;
    }
  }
  return occurrences.sort((left, right) => left.startAt.localeCompare(right.startAt));
}

export function getCalendarConflicts(occurrences: CalendarEventOccurrence[]) {
  const timed = occurrences.filter((item) => !item.allDay && item.status === 'scheduled');
  const conflicts: CalendarConflict[] = [];
  for (let index = 0; index < timed.length; index += 1) {
    const first = timed[index];
    const firstEnd = new Date(first.endAt).getTime();
    for (let other = index + 1; other < timed.length; other += 1) {
      const second = timed[other];
      if (first.eventId === second.eventId) continue;
      const secondStart = new Date(second.startAt).getTime();
      if (secondStart >= firstEnd) break;
      if (new Date(second.endAt).getTime() > new Date(first.startAt).getTime()) {
        conflicts.push({ first, second });
      }
    }
  }
  return conflicts;
}

function dayBounds(date: LocalDateKey) {
  return {
    start: new Date(`${date}T00:00:00`),
    end: new Date(`${date}T23:59:59.999`),
  };
}

function focusWindowsForDay(date: LocalDateKey, occurrences: CalendarEventOccurrence[]) {
  const workStart = new Date(`${date}T08:00:00`);
  const workEnd = new Date(`${date}T20:00:00`);
  const busy = occurrences
    .filter((item) => !item.allDay && item.status === 'scheduled')
    .map((item) => ({
      start: Math.max(workStart.getTime(), new Date(item.startAt).getTime()),
      end: Math.min(workEnd.getTime(), new Date(item.endAt).getTime()),
    }))
    .filter((item) => item.end > item.start)
    .sort((left, right) => left.start - right.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const item of busy) {
    const previous = merged.at(-1);
    if (!previous || item.start > previous.end) merged.push({ ...item });
    else previous.end = Math.max(previous.end, item.end);
  }
  const windows: CalendarFocusWindow[] = [];
  let cursor = workStart.getTime();
  for (const item of merged) {
    if (item.start - cursor >= 60 * 60_000) {
      windows.push({
        startAt: new Date(cursor).toISOString(),
        endAt: new Date(item.start).toISOString(),
        minutes: Math.round((item.start - cursor) / 60_000),
      });
    }
    cursor = Math.max(cursor, item.end);
  }
  if (workEnd.getTime() - cursor >= 60 * 60_000) {
    windows.push({
      startAt: new Date(cursor).toISOString(),
      endAt: workEnd.toISOString(),
      minutes: Math.round((workEnd.getTime() - cursor) / 60_000),
    });
  }
  return windows;
}

export function buildCalendarBriefing(
  events: CalendarEvent[],
  date: LocalDateKey,
  now = new Date(),
): CalendarBriefing {
  const bounds = dayBounds(date);
  const weekEnd = new Date(bounds.start);
  weekEnd.setDate(weekEnd.getDate() + 14);
  const upcoming = expandCalendarEvents(events, bounds.start, weekEnd);
  const today = upcoming.filter(
    (item) => new Date(item.endAt) > bounds.start && new Date(item.startAt) <= bounds.end,
  );
  const scheduled = today.filter((item) => item.status === 'scheduled');
  const next = upcoming.find(
    (item) => item.status === 'scheduled' && new Date(item.endAt).getTime() > now.getTime(),
  );
  return {
    today,
    next,
    conflicts: getCalendarConflicts(today),
    focusWindows: focusWindowsForDay(date, today),
    scheduledMinutes: scheduled
      .filter((item) => !item.allDay)
      .reduce(
        (total, item) =>
          total +
          Math.max(0, (new Date(item.endAt).getTime() - new Date(item.startAt).getTime()) / 60_000),
        0,
      ),
    upcomingDeadlines: upcoming
      .filter((item) => item.category === 'deadline' && item.status === 'scheduled')
      .slice(0, 5),
  };
}

export function formatCalendarTime(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso));
}
