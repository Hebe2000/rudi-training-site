import raw from "./activities-data.json";

export type ContentStatus = "complete" | "placeholder" | "external";

export interface Category {
  id: string;
  name: string;
  order: number;
  note: string | null;
}

export interface Activity {
  id: string;
  number: number;
  name: string;
  category: string;
  cue_example: string | null;
  summary: string;
  duration_mins: [number, number] | null;
  equipment: string[];
  steps: string[];
  tips: string[];
  has_video: boolean;
  reference_url?: string;
  requires_helper?: boolean;
  content_status: ContentStatus;
  placeholder_note?: string;
  source_section: string;
}

export interface WeekPlan {
  priorities: string[];
  rules: string[];
  suggested_week: Record<string, string[]>;
  suggested_week_notes: Record<string, string>;
}

export const CATEGORIES: Category[] = [...raw.categories].sort(
  (a, b) => a.order - b.order
);

export const ACTIVITIES: Activity[] = raw.activities as Activity[];

export const FOOD_GUIDANCE = raw.food_guidance;

const suggested_week: Record<string, string[]> = {};
const suggested_week_notes: Record<string, string> = {};
for (const [key, value] of Object.entries(raw.week_1_focus.suggested_week)) {
  if (key.endsWith("_note")) {
    suggested_week_notes[key.replace("_note", "")] = value as string;
  } else {
    suggested_week[key] = value as string[];
  }
}

export const WEEK_PLAN: WeekPlan = {
  priorities: raw.week_1_focus.priorities,
  rules: raw.week_1_focus.rules,
  suggested_week,
  suggested_week_notes,
};

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getActivity(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function activitiesByCategory(categoryId: string): Activity[] {
  return ACTIVITIES.filter((a) => a.category === categoryId).sort(
    (a, b) => a.number - b.number
  );
}
