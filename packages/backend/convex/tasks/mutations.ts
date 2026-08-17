import { v } from "convex/values";
import { getQuadrant } from "@seven-habits/core";
import { mutation } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

const importance = v.union(v.literal("high"), v.literal("low"));
const urgency = v.union(v.literal("high"), v.literal("low"));

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    importance,
    urgency,
    roleId: v.optional(v.id("roles")),
    goalId: v.optional(v.id("goals")),
    dueDate: v.optional(v.number()),
    estimatedMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    // Single source of quadrant truth lives in @seven-habits/core.
    const quadrant = getQuadrant(args.importance, args.urgency);

    return await ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title,
      description: args.description,
      importance: args.importance,
      urgency: args.urgency,
      quadrant,
      roleId: args.roleId,
      goalId: args.goalId,
      dueDate: args.dueDate,
      estimatedMinutes: args.estimatedMinutes,
      status: "inbox",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const reclassifyTask = mutation({
  args: {
    taskId: v.id("tasks"),
    importance,
    urgency,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      importance: args.importance,
      urgency: args.urgency,
      quadrant: getQuadrant(args.importance, args.urgency),
      updatedAt: Date.now(),
    });
  },
});

export const setTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("planned"),
      v.literal("done"),
      v.literal("deferred"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
