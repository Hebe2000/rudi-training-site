import { MonthKey, WEEKDAY_LABELS, dayOfMonth, monthDates, todayISO, weekdayIndex } from "@/lib/week";

function intensityClass(count: number): string {
  if (count <= 0) return "bg-mist/40";
  if (count === 1) return "bg-clay/25";
  if (count <= 3) return "bg-clay/50";
  if (count <= 5) return "bg-clay/75";
  return "bg-clay";
}

function textClass(count: number): string {
  return count >= 4 ? "text-white" : "text-ink";
}

export default function CompletionHeatmap({
  month,
  countsByDate,
}: {
  month: MonthKey;
  countsByDate: Record<string, number>;
}) {
  const dates = monthDates(month);
  const leadingBlanks = weekdayIndex(dates[0]);
  const today = todayISO();

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-medium uppercase tracking-wide text-mid"
          >
            {label}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {dates.map((date) => {
          const count = countsByDate[date] ?? 0;
          const isToday = date === today;
          return (
            <div
              key={date}
              title={`${count} done`}
              className={`flex aspect-square flex-col items-center justify-center rounded-md text-xs ${intensityClass(
                count
              )} ${textClass(count)} ${
                isToday ? "ring-2 ring-clay ring-offset-1 ring-offset-canvas-card" : ""
              }`}
            >
              <span className="font-medium">{dayOfMonth(date)}</span>
              {count > 0 && <span className="text-[10px] opacity-90">{count}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 self-end text-xs text-mid">
        Less
        {[0, 1, 2, 4, 6].map((c) => (
          <span
            key={c}
            className={`h-3 w-3 rounded-sm ${intensityClass(c)}`}
          />
        ))}
        More
      </div>
    </div>
  );
}
