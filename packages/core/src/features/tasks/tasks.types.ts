import type { Importance, Urgency } from "../matrix/matrix.types";

export type TaskStatus = "inbox" | "planned" | "done" | "deferred" | "cancelled";

export interface TaskInput {
  title: string;
  description?: string;
  importance: Importance;
  urgency: Urgency;
  roleId?: string;
  goalId?: string;
  dueDate?: number;
  estimatedMinutes?: number;
}
