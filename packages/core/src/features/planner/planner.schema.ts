import { z } from "zod";

import { idSchema, isoDateStringSchema } from "../../validation/common";
import type { ScheduleBlockInput, WeeklyPlanInput } from "./planner.types";

export const weeklyPlanInputSchema: z.ZodType<WeeklyPlanInput> = z.object({
  weekStartDate: isoDateStringSchema,
  selectedRoleIds: z.array(idSchema),
  bigRockTaskIds: z.array(idSchema),
  status: z.enum(["draft", "active", "completed"]),
});

export const scheduleBlockInputSchema: z.ZodType<ScheduleBlockInput> = z
  .object({
    taskId: idSchema.optional(),
    title: z.string().optional(),
    startAt: z.number(),
    endAt: z.number(),
    date: isoDateStringSchema,
    source: z.enum(["weeklyPlan", "dailyPlan", "manual"]),
  })
  .refine((block) => block.endAt > block.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });
