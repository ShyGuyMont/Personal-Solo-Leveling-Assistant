import { describe, expect, it } from 'vitest';
import { addDays, dateRange, getSystemDateKey, startOfWeek } from '@/utils/date';

describe('System date utilities', () => {
  it('uses the prior date before the configured reset boundary', () => {
    expect(getSystemDateKey(new Date('2026-03-10T07:30:00Z'), '04:00', 'America/New_York')).toBe(
      '2026-03-09',
    );
    expect(getSystemDateKey(new Date('2026-03-10T08:30:00Z'), '04:00', 'America/New_York')).toBe(
      '2026-03-10',
    );
  });

  it('handles the daylight-saving transition through zoned wall time', () => {
    expect(getSystemDateKey(new Date('2026-11-01T07:30:00Z'), '04:00', 'America/New_York')).toBe(
      '2026-10-31',
    );
    expect(getSystemDateKey(new Date('2026-11-01T09:30:00Z'), '04:00', 'America/New_York')).toBe(
      '2026-11-01',
    );
  });

  it('produces stable date ranges and week boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(dateRange('2026-02-27', '2026-03-02')).toHaveLength(4);
    expect(startOfWeek('2026-07-29', 1)).toBe('2026-07-27');
  });
});
