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
