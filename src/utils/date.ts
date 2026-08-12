import type { LocalDateKey } from '@/types/game';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateKey(year: number, month: number, day: number): LocalDateKey {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` as LocalDateKey;
}

export function parseDateKey(key: LocalDateKey): Date {
  if (!DATE_PATTERN.test(key)) throw new Error(`Invalid local date key: ${key}`);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function addDays(key: LocalDateKey, amount: number): LocalDateKey {
  const date = parseDateKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function compareDateKeys(a: LocalDateKey, b: LocalDateKey) {
  return a.localeCompare(b);
}

export function daysBetween(a: LocalDateKey, b: LocalDateKey) {
  return Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / 86_400_000);
}

export function dateRange(start: LocalDateKey, end: LocalDateKey): LocalDateKey[] {
  if (compareDateKeys(start, end) > 0) return [];
  const result: LocalDateKey[] = [];
  let cursor = start;
  while (compareDateKeys(cursor, end) <= 0) {
    result.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return result;
}

export function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

export function getSystemDateKey(
  now: Date = new Date(),
  resetTime = '04:00',
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): LocalDateKey {
  const [resetHour, resetMinute] = resetTime.split(':').map(Number);
  const parts = getZonedParts(now, timeZone);
  const localKey = toDateKey(parts.year, parts.month, parts.day);
  const currentMinute = parts.hour * 60 + parts.minute;
  const resetMinuteOfDay = resetHour * 60 + resetMinute;
  return currentMinute < resetMinuteOfDay ? addDays(localKey, -1) : localKey;
}

export function getCurrentHour(
  now: Date = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) {
  return getZonedParts(now, timeZone).hour;
}

export function startOfWeek(date: LocalDateKey, weekStartsOn = 1): LocalDateKey {
  const parsed = parseDateKey(date);
  const weekday = parsed.getUTCDay();
  const delta = (weekday - weekStartsOn + 7) % 7;
  return addDays(date, -delta);
}

export function endOfWeek(date: LocalDateKey, weekStartsOn = 1): LocalDateKey {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

export function startOfMonth(date: LocalDateKey): LocalDateKey {
  const [year, month] = date.split('-').map(Number);
  return toDateKey(year, month, 1);
}

export function endOfMonth(date: LocalDateKey): LocalDateKey {
  const [year, month] = date.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return toDateKey(year, month, lastDay);
}

export function monthKey(date: LocalDateKey) {
  return date.slice(0, 7);
}

export function formatLongDate(date: LocalDateKey) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseDateKey(date));
}

export function formatShortDate(date: LocalDateKey) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parseDateKey(date));
}

export function daySeed(date: LocalDateKey) {
  return date
    .replaceAll('-', '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}

export function isFutureDate(date: LocalDateKey, systemDate: LocalDateKey) {
  return compareDateKeys(date, systemDate) > 0;
}
