import { z } from "zod";

/** A non-empty identifier string (a Convex document id at the domain boundary). */
export const idSchema = z.string().min(1);

/** A calendar date in "YYYY-MM-DD" form that denotes a real day. */
export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => {
    const parts = value.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }, "Not a real calendar date");
