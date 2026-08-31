"use client";

import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { getActivity } from "@/lib/activities";
import { PlannedActivity } from "@/lib/types";
import { formatDayHeading, todayISO, weekdayLabel } from "@/lib/week";

export const dayDropId = (date: string) => `day:${date}`;

function PlannedCard({
  planned,
  onToggleDone,
  onRemove,
  onSelect,
}: {
  planned: PlannedActivity;
  onToggleDone: () => void;
  onRemove: () => void;
  onSelect: (activityId: string) => void;
}) {
  const activity = planned.activityId
    ? getActivity(planned.activityId)
    : undefined;
  const label = activity?.name ?? planned.customLabel ?? "Activity";
  const done = Boolean(planned.completedAt);

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm ${
        done ? "border-sage/30 bg-sage/10" : "border-mist bg-canvas-card"
      }`}
    >
      <button
        onClick={onToggleDone}
        aria-label={done ? "Mark not done" : "Mark done"}
        title={done ? "Untick" : "Mark done"}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
          done
            ? "border-sage bg-sage text-white"
            : "border-mist text-transparent hover:border-clay"
        }`}
      >
        ✓
      </button>
      {activity ? (
        <button
          onClick={() => onSelect(activity.id)}
          className={`min-w-0 flex-1 text-left leading-tight hover:underline ${
            done ? "text-sage-strong" : "text-ink"
          }`}
        >
          {label}
        </button>
      ) : (
        <span
          className={`min-w-0 flex-1 leading-tight ${
            done ? "text-sage-strong" : "text-ink"
          }`}
        >
          {label}
        </span>
      )}
      <button
        onClick={done ? undefined : onRemove}
        disabled={done}
        aria-label="Remove"
        title={done ? "Untick before removing" : "Remove"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
          done
            ? "cursor-not-allowed border-sage/30 text-sage/50"
            : "border-mist text-ink-muted hover:border-clay/50 hover:bg-clay/10 hover:text-clay-strong"
        }`}
      >
        ×
      </button>
    </div>
  );
}

function DayColumn({
  date,
  planned,
  onToggleDone,
  onRemove,
  onSelect,
  todayRef,
}: {
  date: string;
  planned: PlannedActivity[];
  onToggleDone: (p: PlannedActivity) => void;
  onRemove: (p: PlannedActivity) => void;
  onSelect: (activityId: string) => void;
  todayRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dayDropId(date) });
  const isToday = date === todayISO();

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (isToday) todayRef.current = node;
      }}
      className={`flex h-[32rem] w-56 shrink-0 snap-start flex-col gap-3 rounded-2xl border p-3 sm:w-64 ${
        isOver
          ? "border-clay bg-clay/10"
          : isToday
            ? "border-clay/40 bg-canvas-card"
            : "border-mist bg-canvas-card"
      }`}
    >
      <div className="shrink-0 px-0.5">
        <div
          className={`text-xs font-semibold uppercase tracking-wide ${
            isToday ? "text-clay" : "text-mid"
          }`}
        >
          {weekdayLabel(date)}
        </div>
        <div className="text-xs text-mid">{formatDayHeading(date)}</div>
      </div>
      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {planned.map((p) => (
          <PlannedCard
            key={p.id}
            planned={p}
            onToggleDone={() => onToggleDone(p)}
            onRemove={() => onRemove(p)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default function WeekCalendar({
  dates,
  plannedByDay,
  onToggleDone,
  onRemove,
  onSelect,
}: {
  dates: string[];
  plannedByDay: Record<string, PlannedActivity[]>;
  onToggleDone: (p: PlannedActivity) => void;
  onRemove: (p: PlannedActivity) => void;
  onSelect: (activityId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const today = todayRef.current;
    if (!today) {
      // Viewing a month without "today" in it — start from day 1.
      container.scrollLeft = 0;
      return;
    }
    // Native scrollIntoView clamps to the max scroll position, which can't
    // left-align a column near the end of the row (not enough trailing
    // content to fill the rest of the viewport) — the trailing spacer
    // below exists so that clamp never kicks in.
    const offset =
      today.getBoundingClientRect().left -
      container.getBoundingClientRect().left +
      container.scrollLeft;
    container.scrollLeft = offset;
  }, [dates]);

  return (
    <div
      ref={containerRef}
      className="scroll-thin flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
    >
      {dates.map((date) => (
        <DayColumn
          key={date}
          date={date}
          planned={plannedByDay[date] ?? []}
          onToggleDone={onToggleDone}
          onRemove={onRemove}
          onSelect={onSelect}
          todayRef={todayRef}
        />
      ))}
      <div aria-hidden="true" className="w-screen shrink-0" />
    </div>
  );
}
