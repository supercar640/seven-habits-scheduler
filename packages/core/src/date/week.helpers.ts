export type WeekStartsOn = "monday" | "sunday";

/** Returns a new Date at 00:00:00.000 (local) of the week-start day containing `date`. Default Monday. */
export function getWeekStartDate(date: Date, weekStartsOn: WeekStartsOn = "monday"): Date {
  const weekStartDate = new Date(date);
  weekStartDate.setHours(0, 0, 0, 0);

  const day = weekStartDate.getDay();
  const daysToSubtract = weekStartsOn === "monday" ? (day + 6) % 7 : day;
  weekStartDate.setDate(weekStartDate.getDate() - daysToSubtract);

  return weekStartDate;
}

/** Formats a Date as "YYYY-MM-DD" using local date parts. */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Returns a new Date `n` days after `date` (negative for earlier), preserving the time-of-day. */
export function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/** Returns a new Date `n` weeks after `date` (negative for earlier), preserving the time-of-day. */
export function addWeeks(date: Date, n: number): Date {
  return addDays(date, n * 7);
}

/**
 * Returns the week containing `date` as a half-open range: `start` is the week-start day
 * at local midnight, `end` is exactly 7 days later (exclusive).
 */
export function getWeekRange(
  date: Date,
  weekStartsOn: WeekStartsOn = "monday",
): { start: Date; end: Date } {
  const start = getWeekStartDate(date, weekStartsOn);
  return { start, end: addDays(start, 7) };
}

/** Returns the 7 days of the week containing `date`, each at local midnight, week-start first. */
export function getWeekDays(date: Date, weekStartsOn: WeekStartsOn = "monday"): Date[] {
  const start = getWeekStartDate(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** True when `a` and `b` fall in the same week (identical week-start day). */
export function isSameWeek(a: Date, b: Date, weekStartsOn: WeekStartsOn = "monday"): boolean {
  return (
    getWeekStartDate(a, weekStartsOn).getTime() === getWeekStartDate(b, weekStartsOn).getTime()
  );
}

/** Parses a "YYYY-MM-DD" string into a Date at local midnight. Throws on malformed or impossible input. */
export function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }

  return date;
}
