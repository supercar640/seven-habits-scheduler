import { query } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

/** All non-archived roles for the current user, in sort order. */
export const listRoles = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const roles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return roles
      .filter((role) => !role.archived)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});
