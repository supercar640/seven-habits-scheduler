export type GoalHorizon = "yearly" | "monthly" | "weekly";
export type GoalStatus = "active" | "completed" | "archived";

export interface Goal {
  id: string;
  userId: string;
  roleId?: string;
  title: string;
  description?: string;
  horizon: GoalHorizon;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
}
