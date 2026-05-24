import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

const horizon = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("weekly"),
);
const status = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived"),
);

export const createGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    horizon,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    return await ctx.db.insert("goals", {
      userId: user._id,
      roleId: args.roleId,
      title: args.title,
      description: args.description,
      horizon: args.horizon,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    horizon: v.optional(horizon),
    status: v.optional(status),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const goal = await ctx.db.get(args.goalId);

    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found");
    }

    await ctx.db.patch(args.goalId, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.roleId !== undefined ? { roleId: args.roleId } : {}),
      ...(args.horizon !== undefined ? { horizon: args.horizon } : {}),
      ...(args.status !== undefined ? { status: args.status } : {}),
      updatedAt: Date.now(),
    });
  },
});
