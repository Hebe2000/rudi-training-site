"use client";

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  CATEGORIES,
  Activity,
  filterActivityGroups,
} from "@/lib/activities";

export const activityDragId = (activityId: string) => `activity:${activityId}`;

function GripIcon() {
  return (
    <svg viewBox="0 0 12 20" className="h-4 w-3 fill-mid">
      {[2, 8, 14].map((y) =>
        [2, 8].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" />)
      )}
    </svg>
  );
}

function DraggableActivityCard({
  activity,
  onSelect,
}: {
  activity: Activity;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: activityDragId(activity.id),
    data: { activityId: activity.id },
  });

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-lg border border-mist bg-canvas-card shadow-sm ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="flex w-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        aria-label="Drag to schedule"
      >
        <GripIcon />
      </div>
      <button
        type="button"
        onClick={() => onSelect(activity.id)}
        className="min-w-0 flex-1 px-2 py-2 text-left text-sm"
      >
        <div className="font-sans font-medium text-ink">{activity.name}</div>
        <div className="truncate font-serif text-xs text-ink-muted">
          {activity.summary}
        </div>
      </button>
    </div>
  );
}

export function DragPreviewCard({ activity }: { activity: Activity }) {
  return (
    <div className="w-56 rounded-lg border border-clay/40 bg-canvas-card px-3 py-2 text-sm shadow-lg">
      <div className="font-sans font-medium text-ink">{activity.name}</div>
    </div>
  );
}

export default function ActivityRail({
  onSelect,
  recentlyDoneIds,
}: {
  onSelect: (activityId: string) => void;
  recentlyDoneIds: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [hideRecentlyDone, setHideRecentlyDone] = useState(false);

  const groups = useMemo(
    () =>
      filterActivityGroups({
        query,
        categoryId: categoryFilter,
        hideIds: hideRecentlyDone ? recentlyDoneIds : undefined,
      }),
    [query, categoryFilter, hideRecentlyDone, recentlyDoneIds]
  );

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-col gap-3 rounded-2xl border border-mist bg-canvas-card/60 p-3 lg:sticky lg:top-6">
      <div className="flex shrink-0 flex-col gap-2">
        <h2 className="px-1 font-sans text-sm font-semibold text-ink">
          Activities
        </h2>
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

      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
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
              {activities.map((a) => (
                <DraggableActivityCard
                  key={a.id}
                  activity={a}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
