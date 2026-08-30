import { supabase } from "./supabase";
import { PlannedActivity, TrainingSession } from "./types";

interface SessionRow {
  id: string;
  activity_id: string | null;
  custom_label: string | null;
  session_date: string;
  duration_minutes: number;
  rating: 1 | 2 | 3 | 4 | 5;
  notes: string | null;
}

function fromRow(row: SessionRow): TrainingSession {
  return {
    id: row.id,
    activityId: row.activity_id ?? undefined,
    customLabel: row.custom_label ?? undefined,
    date: row.session_date,
    durationMinutes: row.duration_minutes,
    rating: row.rating,
    notes: row.notes ?? undefined,
  };
}

export async function loadSessions(): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from("training_sessions")
    .select("*")
    .order("session_date", { ascending: false });

  if (error) throw error;
  return (data as SessionRow[]).map(fromRow);
}

export async function loadRecentlyDoneActivityIds(
  sinceDate: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("training_sessions")
    .select("activity_id")
    .gte("session_date", sinceDate)
    .not("activity_id", "is", null);

  if (error) throw error;
  const ids = (data as { activity_id: string | null }[]).map(
    (r) => r.activity_id as string
  );
  return Array.from(new Set(ids));
}

export async function insertSession(
  session: Omit<TrainingSession, "id">
): Promise<TrainingSession> {
  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      activity_id: session.activityId ?? null,
      custom_label: session.customLabel ?? null,
      session_date: session.date,
      duration_minutes: session.durationMinutes,
      rating: session.rating,
      notes: session.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return fromRow(data as SessionRow);
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

interface PlannedActivityRow {
  id: string;
  activity_id: string | null;
  custom_label: string | null;
  day_date: string;
  position: number;
  session_id: string | null;
}

function plannedFromRow(row: PlannedActivityRow): PlannedActivity {
  return {
    id: row.id,
    activityId: row.activity_id ?? undefined,
    customLabel: row.custom_label ?? undefined,
    dayDate: row.day_date,
    position: row.position,
    sessionId: row.session_id ?? undefined,
  };
}

export async function loadPlannedActivities(
  weekDates: string[]
): Promise<PlannedActivity[]> {
  const { data, error } = await supabase
    .from("planned_activities")
    .select("*")
    .gte("day_date", weekDates[0])
    .lte("day_date", weekDates[weekDates.length - 1])
    .order("position", { ascending: true });

  if (error) throw error;
  return (data as PlannedActivityRow[]).map(plannedFromRow);
}

export async function addPlannedActivity(
  planned: Omit<PlannedActivity, "id" | "sessionId">
): Promise<PlannedActivity> {
  const { data, error } = await supabase
    .from("planned_activities")
    .insert({
      activity_id: planned.activityId ?? null,
      custom_label: planned.customLabel ?? null,
      day_date: planned.dayDate,
      position: planned.position,
    })
    .select()
    .single();

  if (error) throw error;
  return plannedFromRow(data as PlannedActivityRow);
}

export async function deletePlannedActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from("planned_activities")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function linkPlannedActivitySession(
  id: string,
  sessionId: string
): Promise<void> {
  const { error } = await supabase
    .from("planned_activities")
    .update({ session_id: sessionId })
    .eq("id", id);

  if (error) throw error;
}

export async function unlinkPlannedActivitySession(id: string): Promise<void> {
  const { error } = await supabase
    .from("planned_activities")
    .update({ session_id: null })
    .eq("id", id);

  if (error) throw error;
}
