import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

/** Goals for the current user, optionally filtered to a single role. */
export const listGoals = query({
  args: {
    roleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (args.roleId === undefined) {
      return goals;
    }
    return goals.filter((goal) => goal.roleId === args.roleId);
  },
});
