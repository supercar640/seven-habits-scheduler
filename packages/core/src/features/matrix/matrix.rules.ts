import type { Importance, Quadrant, Urgency } from "./matrix.types";

/** Q1 = important+urgent, Q2 = important+not-urgent, Q3 = not-important+urgent, Q4 = neither. */
export function getQuadrant(importance: Importance, urgency: Urgency): Quadrant {
  if (importance === "high" && urgency === "high") {
    return "Q1";
  }

  if (importance === "high" && urgency === "low") {
    return "Q2";
  }

  if (importance === "low" && urgency === "high") {
    return "Q3";
  }

  return "Q4";
}

/** True when the task is the Q2 (important, not urgent) kind that this product protects. */
export function isQ2Task(input: { importance: Importance; urgency: Urgency }): boolean {
  return input.importance === "high" && input.urgency === "low";
}
