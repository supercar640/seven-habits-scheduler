import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

/** All tasks for the current user, newest first. */
export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/** Inbox = unclassified/uncommitted tasks still in collection. */
export const listInbox = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "inbox"),
      )
      .collect();
  },
});

/** Tasks in a given quadrant, for the matrix view. */
export const listByQuadrant = query({
  args: {
    quadrant: v.union(
      v.literal("Q1"),
      v.literal("Q2"),
      v.literal("Q3"),
      v.literal("Q4"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId_quadrant", (q) =>
        q.eq("userId", user._id).eq("quadrant", args.quadrant),
      )
      .collect();
  },
});
