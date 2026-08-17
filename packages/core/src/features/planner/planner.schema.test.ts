import { describe, expect, it } from "vitest";

import { scheduleBlockInputSchema, weeklyPlanInputSchema } from "./planner.schema";

describe("weeklyPlanInputSchema", () => {
  it("parses a valid weekly plan input", () => {
    const input = {
      weekStartDate: "2026-05-25",
      selectedRoleIds: ["role-1", "role-2"],
      bigRockTaskIds: ["task-1"],
      status: "draft" as const,
    };
    expect(weeklyPlanInputSchema.parse(input)).toEqual(input);
  });

  it("rejects an invalid week start date", () => {
    expect(() =>
      weeklyPlanInputSchema.parse({
        weekStartDate: "2026-99-99",
        selectedRoleIds: [],
        bigRockTaskIds: [],
        status: "draft",
      }),
    ).toThrow();
  });
});

describe("scheduleBlockInputSchema", () => {
  it("parses a valid schedule block input", () => {
    const input = {
      taskId: "task-1",
      startAt: 1000,
      endAt: 2000,
      date: "2026-05-25",
      source: "weeklyPlan" as const,
    };
    expect(scheduleBlockInputSchema.parse(input)).toEqual(input);
  });

  it("rejects a block whose endAt is not after startAt", () => {
    expect(() =>
      scheduleBlockInputSchema.parse({
        startAt: 2000,
        endAt: 2000,
        date: "2026-05-25",
        source: "manual",
      }),
    ).toThrow();
  });
});
