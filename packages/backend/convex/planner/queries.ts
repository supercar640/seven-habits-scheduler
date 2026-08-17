import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

/** The weekly plan for a given week-start date (YYYY-MM-DD), if it exists. */
export const getWeeklyPlan = query({
  args: { weekStartDate: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("weeklyPlans")
      .withIndex("by_userId_weekStartDate", (q) =>
        q.eq("userId", user._id).eq("weekStartDate", args.weekStartDate),
      )
      .unique();
  },
});

/** Schedule blocks for a single day (YYYY-MM-DD), for the daily planner. */
export const listScheduleBlocksForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("scheduleBlocks")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date),
      )
      .collect();
  },
});
