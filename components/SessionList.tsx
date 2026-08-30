"use client";

import Link from "next/link";
import { getActivity } from "@/lib/activities";
import { TrainingSession } from "@/lib/types";

const RATING_LABEL: Record<number, string> = {
  1: "Rough",
  2: "Struggled",
  3: "OK",
  4: "Good",
  5: "Great",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function SessionList({
  sessions,
  onDelete,
}: {
  sessions: TrainingSession[];
  onDelete: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist p-8 text-center font-serif text-sm text-ink-muted">
        No sessions logged yet. Add your first one above.
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((s) => {
        const activity = s.activityId ? getActivity(s.activityId) : undefined;
        const label = activity?.name ?? s.customLabel ?? "Unknown activity";

        return (
          <li
            key={s.id}
            className="flex items-start justify-between gap-4 rounded-2xl border border-mist bg-canvas-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {activity ? (
                  <Link
                    href={`/activities#${activity.id}`}
                    className="font-sans font-medium text-ink hover:text-clay hover:underline"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="font-sans font-medium text-ink">
                    {label}
                  </span>
                )}
                <span className="text-xs text-mid">{formatDate(s.date)}</span>
              </div>
              <div className="text-sm text-ink-muted">
                {s.durationMinutes} min · {RATING_LABEL[s.rating]}
              </div>
              {s.notes && (
                <p className="mt-1 font-serif text-sm text-ink-muted">
                  {s.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => onDelete(s.id)}
              aria-label="Delete session"
              className="shrink-0 text-xs text-mid hover:text-clay-strong"
            >
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}
