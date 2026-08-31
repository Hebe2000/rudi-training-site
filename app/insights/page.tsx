"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CompletionHeatmap from "@/components/CompletionHeatmap";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities";
import { loadPlannedActivities } from "@/lib/storage";
import { PlannedActivity } from "@/lib/types";
import {
  MonthKey,
  currentMonthKey,
  monthDates,
  monthKeyEquals,
  monthLabel,
  recentMonths,
} from "@/lib/week";

const MONTH_OPTIONS_COUNT = 12;

function monthKeyValue({ year, month }: MonthKey): string {
  return `${year}-${month}`;
}

export default function InsightsPage() {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(
    currentMonthKey
  );
  const dates = useMemo(() => monthDates(selectedMonth), [selectedMonth]);
  const monthOptions = useMemo(() => recentMonths(MONTH_OPTIONS_COUNT), []);

  const [planned, setPlanned] = useState<PlannedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    loadPlannedActivities(dates)
      .then(setPlanned)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [dates]);

  const completed = useMemo(
    () => planned.filter((p) => p.completedAt),
    [planned]
  );

  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of completed) {
      map[p.dayDate] = (map[p.dayDate] ?? 0) + 1;
    }
    return map;
  }, [completed]);

  const activityCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of completed) {
      if (!p.activityId) continue;
      counts.set(p.activityId, (counts.get(p.activityId) ?? 0) + 1);
    }
    return ACTIVITIES.map((a) => ({
      activity: a,
      count: counts.get(a.id) ?? 0,
    })).sort((a, b) => b.count - a.count || a.activity.name.localeCompare(b.activity.name));
  }, [completed]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { activity, count } of activityCounts) {
      counts.set(activity.category, (counts.get(activity.category) ?? 0) + count);
    }
    const rows = CATEGORIES.map((c) => ({
      category: c,
      count: counts.get(c.id) ?? 0,
    }));
    const max = Math.max(1, ...rows.map((r) => r.count));
    return { rows, max };
  }, [activityCounts]);

  const daysWithActivity = Object.keys(countsByDate).length;
  const mostTrained = activityCounts[0];

  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-ink-muted hover:text-clay hover:underline"
          >
            ← Back to week
          </Link>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">
            Insights
          </h1>
          <p className="font-serif text-sm text-ink-muted">
            What's actually been getting done.
          </p>
        </header>

        <select
          value={monthKeyValue(selectedMonth)}
          onChange={(e) => {
            const found = monthOptions.find(
              (m) => monthKeyValue(m) === e.target.value
            );
            if (found) setSelectedMonth(found);
          }}
          className="self-start rounded-full border border-mist bg-canvas-card px-3.5 py-1.5 text-sm font-medium text-ink-muted focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
        >
          {monthOptions.map((m) => (
            <option key={monthKeyValue(m)} value={monthKeyValue(m)}>
              {monthKeyEquals(m, currentMonthKey())
                ? `${monthLabel(m)} (current)`
                : monthLabel(m)}
            </option>
          ))}
        </select>

        {error && (
          <div className="rounded-lg border border-clay/30 bg-clay/10 px-4 py-2 text-sm text-clay-strong">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center font-serif text-sm text-ink-muted">
            Loading…
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-mist bg-canvas-card p-4 text-center shadow-sm">
                <div className="font-sans text-2xl font-semibold text-clay">
                  {completed.length}
                </div>
                <div className="text-xs text-ink-muted">Completed</div>
              </div>
              <div className="rounded-2xl border border-mist bg-canvas-card p-4 text-center shadow-sm">
                <div className="font-sans text-2xl font-semibold text-clay">
                  {daysWithActivity}
                </div>
                <div className="text-xs text-ink-muted">
                  Days with activity
                </div>
              </div>
              <div className="rounded-2xl border border-mist bg-canvas-card p-4 text-center shadow-sm">
                <div className="truncate font-sans text-sm font-semibold text-clay">
                  {mostTrained && mostTrained.count > 0
                    ? mostTrained.activity.name
                    : "—"}
                </div>
                <div className="text-xs text-ink-muted">Most trained</div>
              </div>
            </div>

            <section className="flex flex-col gap-3 rounded-2xl border border-mist bg-canvas-card p-5 shadow-sm">
              <h2 className="font-sans text-lg font-semibold text-ink">
                Activity by day
                <span className="ml-2 font-serif text-sm font-normal text-ink-muted">
                  {monthLabel(selectedMonth)}
                </span>
              </h2>
              <CompletionHeatmap month={selectedMonth} countsByDate={countsByDate} />
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-mist bg-canvas-card p-5 shadow-sm">
              <h2 className="font-sans text-lg font-semibold text-ink">
                Category coverage
              </h2>
              <div className="flex flex-col gap-2.5">
                {categoryCounts.rows.map(({ category, count }) => (
                  <div key={category.id} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 truncate text-sm text-ink-muted">
                      {category.name}
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist/50">
                      <div
                        className="h-full rounded-full bg-clay"
                        style={{
                          width: `${(count / categoryCounts.max) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="w-6 shrink-0 text-right text-sm text-ink">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-mist bg-canvas-card p-5 shadow-sm">
              <h2 className="font-sans text-lg font-semibold text-ink">
                Most &amp; least trained
              </h2>
              <div className="scroll-thin flex max-h-96 flex-col divide-y divide-mist overflow-y-auto">
                {activityCounts.map(({ activity, count }, i) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        count === 0 ? "text-mid" : "text-ink"
                      }`}
                    >
                      {i < 3 && count > 0 && (
                        <span className="mr-1.5 text-clay">●</span>
                      )}
                      {activity.name}
                    </span>
                    <span
                      className={`shrink-0 text-sm font-medium ${
                        count === 0 ? "text-mid" : "text-ink"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
