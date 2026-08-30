"use client";

import { TrainingSession } from "@/lib/types";

function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function StatsBar({
  sessions,
}: {
  sessions: TrainingSession[];
}) {
  const total = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const weekStart = startOfWeek();
  const thisWeek = sessions.filter(
    (s) => new Date(s.date + "T00:00:00") >= weekStart
  ).length;

  const uniqueActivities = new Set(
    sessions.map((s) => s.activityId ?? s.customLabel)
  ).size;

  const stats = [
    { label: "Sessions", value: total },
    { label: "This week", value: thisWeek },
    { label: "Total minutes", value: totalMinutes },
    { label: "Activities covered", value: uniqueActivities },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-mist bg-canvas-card p-4 text-center shadow-sm"
        >
          <div className="font-sans text-2xl font-semibold text-clay">
            {s.value}
          </div>
          <div className="text-xs text-ink-muted">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
