import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

/** Reviews for the current user, optionally filtered by period type. */
export const listReviews = query({
  args: {
    periodType: v.optional(
      v.union(v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (args.periodType === undefined) {
      return reviews;
    }
    return reviews.filter((review) => review.periodType === args.periodType);
  },
});
