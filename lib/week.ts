export const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export function startOfWeek(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toLocalISODate(new Date());
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalISODate(d);
}

export function currentWeekDates(): string[] {
  const monday = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toLocalISODate(d);
  });
}

export function formatDayHeading(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function dayOfMonth(iso: string): number {
  return new Date(iso + "T00:00:00").getDate();
}
