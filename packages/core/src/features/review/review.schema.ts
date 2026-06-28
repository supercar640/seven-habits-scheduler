import { z } from "zod";

import { isoDateStringSchema } from "../../validation/common";
import type { ReviewInput } from "./review.types";

export const reviewInputSchema: z.ZodType<ReviewInput> = z.object({
  periodType: z.enum(["weekly", "monthly", "yearly"]),
  periodStartDate: isoDateStringSchema,
  wins: z.string().optional(),
  misses: z.string().optional(),
  lessons: z.string().optional(),
  nextAdjustments: z.string().optional(),
});
