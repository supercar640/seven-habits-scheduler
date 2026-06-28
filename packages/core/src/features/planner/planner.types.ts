export type WeeklyPlanStatus = "draft" | "active" | "completed";
export type ScheduleSource = "weeklyPlan" | "dailyPlan" | "manual";

export interface WeeklyPlanInput {
  weekStartDate: string;
  selectedRoleIds: string[];
  bigRockTaskIds: string[];
  status: WeeklyPlanStatus;
}

export interface ScheduleBlockInput {
  taskId?: string;
  title?: string;
  startAt: number;
  endAt: number;
  date: string;
  source: ScheduleSource;
}
