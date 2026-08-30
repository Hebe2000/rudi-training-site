"use client";

import { useState } from "react";
import { CATEGORIES, activitiesByCategory } from "@/lib/activities";
import { TrainingSession } from "@/lib/types";
import { todayISO } from "@/lib/week";

const OTHER = "__other__";

const fieldClass =
  "rounded-lg border border-mist bg-canvas-card px-3 py-2 text-ink focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay";

export default function SessionForm({
  onAdd,
}: {
  onAdd: (session: Omit<TrainingSession, "id">) => Promise<void>;
}) {
  const [activityId, setActivityId] = useState<string>(OTHER);
  const [customLabel, setCustomLabel] = useState("");
  const [date, setDate] = useState(todayISO());
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd({
        activityId: activityId === OTHER ? undefined : activityId,
        customLabel: activityId === OTHER ? customLabel : undefined,
        date,
        durationMinutes,
        rating,
        notes: notes.trim() || undefined,
      });
      setNotes("");
      setCustomLabel("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-mist bg-canvas-card p-5 shadow-sm"
    >
      <h2 className="font-sans text-lg font-semibold text-ink">
        Log a session
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          Activity
          <select
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className={fieldClass}
          >
            <option value={OTHER}>Other…</option>
            {CATEGORIES.map((cat) => {
              const activities = activitiesByCategory(cat.id);
              if (activities.length === 0) return null;
              return (
                <optgroup key={cat.id} label={cat.name}>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.number}. {a.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={fieldClass}
          />
        </label>
      </div>

      {activityId === OTHER && (
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          What did you work on?
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Doorbell reactivity"
            required
            className={fieldClass}
          />
        </label>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          Duration (minutes)
          <input
            type="number"
            min={1}
            max={180}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          How'd it go?
          <select
            value={rating}
            onChange={(e) =>
              setRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
            }
            className={fieldClass}
          >
            <option value={1}>1 - Rough</option>
            <option value={2}>2 - Struggled</option>
            <option value={3}>3 - OK</option>
            <option value={4}>4 - Good</option>
            <option value={5}>5 - Great</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-ink-muted">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything to remember for next time..."
          className={`resize-none ${fieldClass}`}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-full bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay-strong disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add session"}
      </button>
    </form>
  );
}
