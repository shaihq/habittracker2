import type { ISODate } from '@/types/database';

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date as YYYY-MM-DD using the device's local calendar day. */
export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses YYYY-MM-DD as a local date (midnight), avoiding UTC shifts. */
export function parseISODate(value: ISODate): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday-based start of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const mondayOffset = (date.getDay() + 6) % 7;
  return addDays(date, -mondayOffset);
}

/**
 * Builds a GitHub-style grid: an array of week columns (oldest first), each
 * holding 7 days Monday→Sunday. Days after `today` are `null`.
 */
export function buildGridWeeks(weekCount: number, today: Date = new Date()): (ISODate | null)[][] {
  const todayKey = toISODate(today);
  const firstMonday = addDays(startOfWeek(today), -7 * (weekCount - 1));

  return Array.from({ length: weekCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const key = toISODate(addDays(firstMonday, w * 7 + d));
      return key > todayKey ? null : key;
    }),
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Short month label (e.g. "Oct") for the month containing `value`. */
export function monthLabel(value: ISODate): string {
  return MONTHS[parseISODate(value).getMonth()];
}
