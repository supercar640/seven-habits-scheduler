import type { TaskStatus } from "./tasks.types";

/** Allowed status transitions: each status maps to the statuses it may move to. */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  inbox: ["planned", "cancelled"],
  planned: ["inbox", "done", "deferred", "cancelled"],
  deferred: ["planned", "inbox", "cancelled"],
  done: ["planned"],
  cancelled: ["inbox"],
};

/** The statuses `from` may transition into. */
export function getAllowedTransitions(from: TaskStatus): TaskStatus[] {
  return TASK_STATUS_TRANSITIONS[from];
}

/** True when moving from `from` to `to` is legal. A no-op (`from === to`) is not a transition. */
export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) {
    return false;
  }
  return TASK_STATUS_TRANSITIONS[from].includes(to);
}
