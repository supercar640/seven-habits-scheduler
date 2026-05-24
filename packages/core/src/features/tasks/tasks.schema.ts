import { z } from "zod";

import type { TaskInput } from "./tasks.types";

export const taskInputSchema: z.ZodType<TaskInput> = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  importance: z.enum(["high", "low"]),
  urgency: z.enum(["high", "low"]),
  roleId: z.string().optional(),
  goalId: z.string().optional(),
  dueDate: z.number().optional(),
  estimatedMinutes: z.number().optional(),
});
