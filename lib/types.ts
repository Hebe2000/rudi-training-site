export interface PlannedActivity {
  id: string;
  activityId?: string;
  customLabel?: string;
  dayDate: string; // YYYY-MM-DD
  position: number;
  completedAt?: string;
}
