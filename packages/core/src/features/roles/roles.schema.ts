import { z } from "zod";

import type { RoleInput } from "./roles.types";

export const roleInputSchema: z.ZodType<RoleInput> = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  sortOrder: z.number(),
});
