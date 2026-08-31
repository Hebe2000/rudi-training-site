"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, filterActivityGroups } from "@/lib/activities";
import { WEEKDAY_LABELS, dayOfMonth, todayISO } from "@/lib/week";

export default function MobileActivityDrawer({
  weekDates,
  recentlyDoneIds,
  onClose,
  onBulkAdd,
}: {
  weekDates: string[];
  recentlyDoneIds: Set<string>;
  onClose: () => void;
  onBulkAdd: (activityIds: string[], dayDate: string) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [hideRecentlyDone, setHideRecentlyDone] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetDay, setTargetDay] = useState<string>(
    weekDates.includes(todayISO()) ? todayISO() : weekDates[0]
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const groups = useMemo(
    () =>
      filterActivityGroups({
        query,
        categoryId: categoryFilter,
        hideIds: hideRecentlyDone ? recentlyDoneIds : undefined,
      }),
    [query, categoryFilter, hideRecentlyDone, recentlyDoneIds]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const dayButtonLabel =
    targetDay === todayISO()
      ? "today"
      : WEEKDAY_LABELS[weekDates.indexOf(targetDay)];

  async function handleAdd() {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      await onBulkAdd(Array.from(selected), targetDay);
      setSelected(new Set());
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={`flex h-full w-full flex-col bg-canvas transition-transform duration-200 ${
          mounted ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-mist p-4">
          <h2 className="font-sans text-lg font-semibold text-ink">
            Add activities
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-mist"
          >
            ×
          </button>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-b border-mist p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities…"
            className="rounded-lg border border-mist bg-canvas-card px-2.5 py-1.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-mist bg-canvas-card px-2.5 py-1.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-1 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={hideRecentlyDone}
              onChange={(e) => setHideRecentlyDone(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-mist accent-clay"
            />
            Not done in last 7 days
          </label>
        </div>

        <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {groups.length === 0 && (
            <p className="px-1 font-serif text-sm text-ink-muted">
              No activities match.
            </p>
          )}
          {groups.map(({ category, activities }) => (
            <div key={category.id} className="flex flex-col gap-2">
              <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-mid">
                {category.name}
              </h3>
              <div className="flex flex-col gap-2">
                {activities.map((a) => {
                  const isSelected = selected.has(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(a.id)}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm ${
                        isSelected
                          ? "border-clay bg-clay/10"
                          : "border-mist bg-canvas-card"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                          isSelected
                            ? "border-clay bg-clay text-white"
                            : "border-mist text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-sans font-medium text-ink">
                          {a.name}
                        </span>
                        <span className="block truncate font-serif text-xs text-ink-muted">
                          {a.summary}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-mist bg-canvas-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">
              {selected.size} selected
            </span>
            {selected.size > 0 && (
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-ink-muted hover:text-clay-strong"
              >
                Clear
              </button>
            )}
          </div>
          <div className="scroll-thin flex gap-1.5 overflow-x-auto pb-1">
            {weekDates.map((date, i) => {
              const isToday = date === todayISO();
              const isTarget = date === targetDay;
              return (
                <button
                  key={date}
                  onClick={() => setTargetDay(date)}
                  className={`flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg border text-xs ${
                    isTarget
                      ? "border-clay bg-clay text-white"
                      : isToday
                        ? "border-clay/50 text-clay"
                        : "border-mist text-ink-muted"
                  }`}
                >
                  <span className="font-medium">{WEEKDAY_LABELS[i]}</span>
                  <span className="text-[10px] opacity-80">
                    {dayOfMonth(date)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0 || submitting}
            className="rounded-full bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay-strong disabled:opacity-50"
          >
            {submitting
              ? "Adding…"
              : selected.size > 0
                ? `Add ${selected.size} to ${dayButtonLabel}`
                : `Add to ${dayButtonLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
