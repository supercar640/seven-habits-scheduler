import { z } from "zod";

/** A non-empty identifier string (a Convex document id at the domain boundary). */
export const idSchema = z.string().min(1);

/** A calendar date in "YYYY-MM-DD" form that denotes a real day. */
export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }, "Not a real calendar date");
