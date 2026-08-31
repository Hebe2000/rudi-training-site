export const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

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

export function formatDayHeading(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function dayOfMonth(iso: string): number {
  return new Date(iso + "T00:00:00").getDate();
}

export function weekdayLabel(iso: string): string {
  const jsDay = new Date(iso + "T00:00:00").getDay();
  return WEEKDAY_LABELS[(jsDay + 6) % 7];
}

export interface MonthKey {
  year: number;
  month: number; // 1-12
}

export function currentMonthKey(): MonthKey {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthDates({ year, month }: MonthKey): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  });
}

export function monthLabel({ year, month }: MonthKey): string {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function monthKeyEquals(a: MonthKey, b: MonthKey): boolean {
  return a.year === b.year && a.month === b.month;
}

export function recentMonths(count: number): MonthKey[] {
  const { year, month } = currentMonthKey();
  return Array.from({ length: count }, (_, i) => {
    const total = year * 12 + (month - 1) - i;
    return { year: Math.floor(total / 12), month: (total % 12) + 1 };
  });
}
