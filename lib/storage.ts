import { supabase } from "./supabase";
import { PlannedActivity } from "./types";

export async function loadRecentlyDoneActivityIds(
  sinceDate: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("planned_activities")
    .select("activity_id")
    .gte("day_date", sinceDate)
    .not("activity_id", "is", null)
    .not("completed_at", "is", null);

  if (error) throw error;
  const ids = (data as { activity_id: string | null }[]).map(
    (r) => r.activity_id as string
  );
  return Array.from(new Set(ids));
}

interface PlannedActivityRow {
  id: string;
  activity_id: string | null;
  custom_label: string | null;
  day_date: string;
  position: number;
  completed_at: string | null;
}

function plannedFromRow(row: PlannedActivityRow): PlannedActivity {
  return {
    id: row.id,
    activityId: row.activity_id ?? undefined,
    customLabel: row.custom_label ?? undefined,
    dayDate: row.day_date,
    position: row.position,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function loadPlannedActivities(
  dates: string[]
): Promise<PlannedActivity[]> {
  const { data, error } = await supabase
    .from("planned_activities")
    .select("*")
    .gte("day_date", dates[0])
    .lte("day_date", dates[dates.length - 1])
    .order("position", { ascending: true });

  if (error) throw error;
  return (data as PlannedActivityRow[]).map(plannedFromRow);
}

export async function addPlannedActivity(
  planned: Omit<PlannedActivity, "id" | "completedAt">
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

export async function addPlannedActivities(
  items: Omit<PlannedActivity, "id" | "completedAt">[]
): Promise<PlannedActivity[]> {
  const { data, error } = await supabase
    .from("planned_activities")
    .insert(
      items.map((planned) => ({
        activity_id: planned.activityId ?? null,
        custom_label: planned.customLabel ?? null,
        day_date: planned.dayDate,
        position: planned.position,
      }))
    )
    .select();

  if (error) throw error;
  return (data as PlannedActivityRow[]).map(plannedFromRow);
}

export async function deletePlannedActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from("planned_activities")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function markPlannedActivityDone(id: string): Promise<string> {
  const completedAt = new Date().toISOString();
  const { error } = await supabase
    .from("planned_activities")
    .update({ completed_at: completedAt })
    .eq("id", id);

  if (error) throw error;
  return completedAt;
}

export async function markPlannedActivityNotDone(id: string): Promise<void> {
  const { error } = await supabase
    .from("planned_activities")
    .update({ completed_at: null })
    .eq("id", id);

  if (error) throw error;
}
