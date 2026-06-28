import { z } from "zod";

import { idSchema } from "../../validation/common";
import type { GoalInput } from "./goals.types";

export const goalInputSchema: z.ZodType<GoalInput> = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  horizon: z.enum(["yearly", "monthly", "weekly"]),
  roleId: idSchema.optional(),
  status: z.enum(["active", "completed", "archived"]),
});
