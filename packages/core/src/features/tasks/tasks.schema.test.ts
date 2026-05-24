import { describe, expect, it } from "vitest";

import { taskInputSchema } from "./tasks.schema";

describe("taskInputSchema", () => {
  it("parses a valid task input", () => {
    const result = taskInputSchema.parse({
      title: "Prepare weekly plan",
      description: "Review roles and choose Q2 work.",
      importance: "high",
      urgency: "low",
      roleId: "role-1",
      goalId: "goal-1",
      dueDate: new Date(2026, 4, 27).getTime(),
      estimatedMinutes: 45,
    });

    expect(result).toEqual({
      title: "Prepare weekly plan",
      description: "Review roles and choose Q2 work.",
      importance: "high",
      urgency: "low",
      roleId: "role-1",
      goalId: "goal-1",
      dueDate: new Date(2026, 4, 27).getTime(),
      estimatedMinutes: 45,
    });
  });

  it("rejects an empty title", () => {
    expect(() =>
      taskInputSchema.parse({
        title: "   ",
        importance: "high",
        urgency: "low",
      }),
    ).toThrow();
  });

  it("rejects invalid importance", () => {
    expect(() =>
      taskInputSchema.parse({
        title: "Prepare weekly plan",
        importance: "medium",
        urgency: "low",
      }),
    ).toThrow();
  });
});
