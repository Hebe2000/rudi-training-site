export interface TrainingSession {
  id: string;
  activityId?: string;
  customLabel?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface PlannedActivity {
  id: string;
  activityId?: string;
  customLabel?: string;
  dayDate: string; // YYYY-MM-DD
  position: number;
  completedAt?: string;
}
