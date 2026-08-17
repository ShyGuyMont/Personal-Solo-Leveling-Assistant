import { describe, expect, it } from 'vitest';
import {
  buildLocalSystemDebrief,
  chooseDebriefParticipants,
  getLocalClockTime,
  isSystemDebriefDue,
  systemDebriefToMarkdown,
  type SystemExperienceSignal,
} from '@/game/systemDebrief';
import type { DailyMissionRecord, MissionDefinition } from '@/types/game';

function signal(summary: string, surface = '/calendar'): SystemExperienceSignal {
  return {
    id: `signal-${summary}`,
    date: '2026-08-17',
    kind: 'interface-error',
    surface,
    summary,
    createdAt: '2026-08-17T23:00:00.000Z',
  };
}

describe('Daily System Debrief', () => {
  it('becomes due after the evening threshold and only once per day', () => {
    expect(isSystemDebriefDue('20:29', false)).toBe(false);
    expect(isSystemDebriefDue('20:30', false)).toBe(true);
    expect(isSystemDebriefDue('23:59', true)).toBe(false);
    expect(isSystemDebriefDue('21:00', false, false)).toBe(false);
  });

  it('formats the configured local clock without reading UTC as wall time', () => {
    expect(getLocalClockTime(new Date('2026-08-18T00:45:00.000Z'), 'America/New_York')).toBe(
      '20:45',
    );
  });

  it('always seats Snow and Cipher, then only relevant specialists', () => {
    const participants = chooseDebriefParticipants([
      signal('Calendar time label was confusing', '/calendar'),
      signal('Kitchen recipe handoff stalled', '/kitchen'),
    ]);
    expect(participants.slice(0, 2)).toEqual(['snow', 'cipher']);
    expect(participants).toContain('kairo');
    expect(participants).toContain('saffron');
    expect(participants.length).toBeLessThanOrEqual(5);
  });

  it('builds a detailed, copy-ready local report without claiming self-mutation', () => {
    const mission = {
      id: 'workout',
      name: 'Training Directive',
      description: 'Move',
    } as MissionDefinition;
    const record = {
      id: '2026-08-17:workout',
      date: '2026-08-17',
      missionId: 'workout',
      status: 'pending',
      details: {},
      updatedAt: '2026-08-17T23:00:00.000Z',
      protectedException: false,
    } satisfies DailyMissionRecord;
    const report = buildLocalSystemDebrief({
      date: '2026-08-17',
      records: [record],
      missions: [mission],
      signals: [signal('A button produced an unreadable response', '/headquarters')],
    });
    const markdown = systemDebriefToMarkdown(report);
    expect(report.status).toBe('local-scan');
    expect(report.snowPriority).toContain('Training Directive');
    expect(markdown).toContain('## Things the family wishes it could do better');
    expect(markdown).toContain('Codex development brief');
    expect(markdown).toContain('Do not alter progression');
  });
});
