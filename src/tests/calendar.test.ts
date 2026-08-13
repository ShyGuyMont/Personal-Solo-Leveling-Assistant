import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import {
  applyCalendarProposal,
  buildCalendarBriefing,
  expandCalendarEvents,
  getCalendarConflicts,
  saveCalendarEvent,
} from '@/game/calendar';
import type { CalendarEvent, LocalDateKey } from '@/types/game';

const weeklyEvent: CalendarEvent = {
  id: 'calendar:training',
  title: 'Training block',
  description: 'Protected time with Rook and Ember.',
  category: 'training',
  startAt: '2026-08-17T22:00:00.000Z',
  endAt: '2026-08-17T23:00:00.000Z',
  allDay: false,
  recurrence: 'weekly',
  recurrenceInterval: 1,
  recurrenceEndsOn: '2026-09-01' as LocalDateKey,
  location: 'Training Hall',
  source: 'kairo',
  status: 'scheduled',
  createdAt: '2026-08-13T12:00:00.000Z',
  updatedAt: '2026-08-13T12:00:00.000Z',
};

describe('Calendar Command', () => {
  beforeEach(async () => {
    await db.calendarEvents.clear();
  });

  it('expands recurring commitments only through their recurrence boundary', () => {
    const occurrences = expandCalendarEvents(
      [weeklyEvent],
      new Date('2026-08-17T00:00:00.000Z'),
      new Date('2026-09-15T00:00:00.000Z'),
    );
    expect(occurrences.map((item) => item.startAt)).toEqual([
      '2026-08-17T22:00:00.000Z',
      '2026-08-24T22:00:00.000Z',
      '2026-08-31T22:00:00.000Z',
    ]);
  });

  it('detects real collisions while allowing adjacent commitments', () => {
    const occurrences = expandCalendarEvents(
      [
        { ...weeklyEvent, recurrence: 'none', recurrenceEndsOn: undefined },
        {
          ...weeklyEvent,
          id: 'calendar:overlap',
          title: 'Doctor appointment',
          startAt: '2026-08-17T22:30:00.000Z',
          endAt: '2026-08-17T23:30:00.000Z',
          recurrence: 'none',
          recurrenceEndsOn: undefined,
        },
        {
          ...weeklyEvent,
          id: 'calendar:adjacent',
          title: 'Dinner',
          startAt: '2026-08-17T23:30:00.000Z',
          endAt: '2026-08-18T00:00:00.000Z',
          recurrence: 'none',
          recurrenceEndsOn: undefined,
        },
      ],
      new Date('2026-08-17T00:00:00.000Z'),
      new Date('2026-08-18T01:00:00.000Z'),
    );
    expect(getCalendarConflicts(occurrences)).toHaveLength(1);
  });

  it('saves validated local entries and builds a useful daily briefing', async () => {
    await saveCalendarEvent({
      title: 'Upload deadline',
      category: 'deadline',
      startAt: '2026-08-17T14:00:00.000Z',
      endAt: '2026-08-17T15:00:00.000Z',
      source: 'hunter',
    });
    const events = await db.calendarEvents.toArray();
    const briefing = buildCalendarBriefing(
      events,
      '2026-08-17' as LocalDateKey,
      new Date('2026-08-17T12:00:00.000Z'),
    );
    expect(briefing.today).toHaveLength(1);
    expect(briefing.next?.title).toBe('Upload deadline');
    expect(briefing.upcomingDeadlines).toHaveLength(1);
    expect(briefing.scheduledMinutes).toBe(60);
  });

  it('applies an AI proposal only through the explicit confirmation function', async () => {
    expect(await db.calendarEvents.count()).toBe(0);
    const saved = await applyCalendarProposal(
      {
        action: 'create',
        eventId: '',
        title: 'Scripture study',
        description: 'Prepared by Snow after consulting Kairo.',
        category: 'faith',
        startAt: '2026-08-18T12:00:00.000Z',
        endAt: '2026-08-18T12:30:00.000Z',
        allDay: false,
        recurrence: 'none',
        recurrenceInterval: 1,
        recurrenceEndsOn: '',
        location: 'Sanctuary',
      },
      'snow',
    );
    expect(saved.source).toBe('snow');
    expect(await db.calendarEvents.count()).toBe(1);
  });

  it('rejects impossible times and stale update proposals', async () => {
    await expect(
      saveCalendarEvent({
        title: 'Impossible entry',
        category: 'personal',
        startAt: '2026-08-18T14:00:00.000Z',
        endAt: '2026-08-18T13:00:00.000Z',
      }),
    ).rejects.toThrow(/after start/i);
    await expect(
      applyCalendarProposal(
        {
          action: 'update',
          eventId: 'calendar:missing',
          title: 'Missing event',
          description: '',
          category: 'personal',
          startAt: '2026-08-18T14:00:00.000Z',
          endAt: '2026-08-18T15:00:00.000Z',
          allDay: false,
          recurrence: 'none',
          recurrenceInterval: 1,
          recurrenceEndsOn: '',
          location: '',
        },
        'kairo',
      ),
    ).rejects.toThrow(/no longer exists/i);
  });
});
