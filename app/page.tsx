"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import ActivityRail, { DragPreviewCard } from "@/components/ActivityRail";
import WeekCalendar from "@/components/WeekCalendar";
import Modal from "@/components/Modal";
import ActivityDetailModal from "@/components/ActivityDetailModal";
import SessionForm from "@/components/SessionForm";
import { getActivity } from "@/lib/activities";
import {
  addPlannedActivity,
  deletePlannedActivity,
  insertSession,
  linkPlannedActivitySession,
  loadPlannedActivities,
  loadRecentlyDoneActivityIds,
  unlinkPlannedActivitySession,
} from "@/lib/storage";
import { PlannedActivity, TrainingSession } from "@/lib/types";
import { currentWeekDates, daysAgoISO } from "@/lib/week";

const RECENT_WINDOW_DAYS = 6;

export default function Home() {
  const weekDates = useMemo(() => currentWeekDates(), []);
  const [planned, setPlanned] = useState<PlannedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingActivityId, setDraggingActivityId] = useState<string | null>(
    null
  );
  const [activePlanned, setActivePlanned] = useState<PlannedActivity | null>(
    null
  );
  const [detailActivityId, setDetailActivityId] = useState<string | null>(
    null
  );
  const [recentlyDoneIds, setRecentlyDoneIds] = useState<Set<string>>(
    new Set()
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  );

  useEffect(() => {
    loadPlannedActivities(weekDates)
      .then(setPlanned)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [weekDates]);

  useEffect(() => {
    loadRecentlyDoneActivityIds(daysAgoISO(RECENT_WINDOW_DAYS))
      .then((ids) => setRecentlyDoneIds(new Set(ids)))
      .catch((e) => setError(e.message));
  }, []);

  const plannedByDay = useMemo(() => {
    const map: Record<string, PlannedActivity[]> = {};
    for (const p of planned) {
      (map[p.dayDate] ??= []).push(p);
    }
    return map;
  }, [planned]);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith("activity:")) {
      setDraggingActivityId(id.slice("activity:".length));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingActivityId(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId || !activeId.startsWith("activity:") || !overId.startsWith("day:")) {
      return;
    }

    const activityId = activeId.slice("activity:".length);
    const dayDate = overId.slice("day:".length);
    const position = (plannedByDay[dayDate] ?? []).length;

    setError(null);
    try {
      const created = await addPlannedActivity({
        activityId,
        dayDate,
        position,
      });
      setPlanned((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to schedule activity");
    }
  }

  async function handleUncheck(p: PlannedActivity) {
    setError(null);
    const previous = planned;
    setPlanned((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, sessionId: undefined } : x))
    );
    try {
      await unlinkPlannedActivitySession(p.id);
    } catch (e) {
      setPlanned(previous);
      setError(e instanceof Error ? e.message : "Failed to untick activity");
    }
  }

  async function handleRemove(p: PlannedActivity) {
    setError(null);
    const previous = planned;
    setPlanned((prev) => prev.filter((x) => x.id !== p.id));
    try {
      await deletePlannedActivity(p.id);
    } catch (e) {
      setPlanned(previous);
      setError(e instanceof Error ? e.message : "Failed to remove activity");
    }
  }

  async function handleLogSubmit(session: Omit<TrainingSession, "id">) {
    if (!activePlanned) return;
    setError(null);
    try {
      const created = await insertSession(session);
      await linkPlannedActivitySession(activePlanned.id, created.id);
      setPlanned((prev) =>
        prev.map((p) =>
          p.id === activePlanned.id ? { ...p, sessionId: created.id } : p
        )
      );
      if (created.activityId) {
        setRecentlyDoneIds((prev) => new Set(prev).add(created.activityId!));
      }
      setActivePlanned(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to log session");
    }
  }

  const draggingActivity = draggingActivityId
    ? getActivity(draggingActivityId)
    : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-canvas">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">
                Rudi's Training Log
              </h1>
              <p className="font-serif text-sm text-ink-muted">
                Drag an activity onto a day to plan it, tap the check to log
                it.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/history"
                className="rounded-full border border-mist px-3.5 py-1.5 text-sm font-medium text-ink-muted hover:border-clay hover:text-clay"
              >
                History
              </Link>
              <Link
                href="/activities"
                className="rounded-full border border-mist px-3.5 py-1.5 text-sm font-medium text-ink-muted hover:border-clay hover:text-clay"
              >
                Activity library
              </Link>
            </div>
          </header>

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
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-72 lg:shrink-0">
                <ActivityRail
                  onSelect={setDetailActivityId}
                  recentlyDoneIds={recentlyDoneIds}
                />
              </div>
              <div className="min-w-0 flex-1">
                <WeekCalendar
                  weekDates={weekDates}
                  plannedByDay={plannedByDay}
                  onCheck={setActivePlanned}
                  onUncheck={handleUncheck}
                  onRemove={handleRemove}
                  onSelect={setDetailActivityId}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      <DragOverlay>
        {draggingActivity ? <DragPreviewCard activity={draggingActivity} /> : null}
      </DragOverlay>

      {activePlanned && (
        <Modal onClose={() => setActivePlanned(null)}>
          <SessionForm
            onAdd={handleLogSubmit}
            initialActivityId={activePlanned.activityId}
            initialCustomLabel={activePlanned.customLabel}
            initialDate={activePlanned.dayDate}
            submitLabel="Log session"
          />
        </Modal>
      )}

      {detailActivityId && (
        <ActivityDetailModal
          activityId={detailActivityId}
          onClose={() => setDetailActivityId(null)}
        />
      )}
    </DndContext>
  );
}
