import type { Frequency, ISODate } from '@/types/database';
import { addDays, parseISODate, startOfWeek, toISODate, todayISO } from './dates';

/**
 * Number of consecutive completed days ending today.
 * Returns 0 if today is not completed.
 */
export function calculateStreak(completedDates: Iterable<ISODate>, today: ISODate = todayISO()): number {
  const done = new Set(completedDates);
  let streak = 0;
  let cursor = parseISODate(today);
  while (done.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Completions from Monday of the current week through today. */
export function countThisWeek(completedDates: Iterable<ISODate>, today: ISODate = todayISO()): number {
  const weekStart = toISODate(startOfWeek(parseISODate(today)));
  let count = 0;
  for (const date of completedDates) {
    if (date >= weekStart && date <= today) count += 1;
  }
  return count;
}

export const frequencyOptions: { value: Frequency; label: string; perWeek: number }[] = [
  { value: 'daily', label: 'Every day', perWeek: 7 },
  { value: '3_per_week', label: '3× a week', perWeek: 3 },
  { value: '5_per_week', label: '5× a week', perWeek: 5 },
];

export function weeklyTarget(frequency: Frequency): number {
  return frequencyOptions.find((o) => o.value === frequency)?.perWeek ?? 7;
}
