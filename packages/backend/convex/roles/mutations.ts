import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUserOrThrow } from "../users/helpers";

export const createRole = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    return await ctx.db.insert("roles", {
      userId: user._id,
      name: args.name,
      description: args.description,
      sortOrder: args.sortOrder ?? now,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateRole = mutation({
  args: {
    roleId: v.id("roles"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const role = await ctx.db.get(args.roleId);

    if (!role || role.userId !== user._id) {
      throw new Error("Role not found");
    }

    await ctx.db.patch(args.roleId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.sortOrder !== undefined ? { sortOrder: args.sortOrder } : {}),
      updatedAt: Date.now(),
    });
  },
});

export const archiveRole = mutation({
  args: { roleId: v.id("roles") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const role = await ctx.db.get(args.roleId);

    if (!role || role.userId !== user._id) {
      throw new Error("Role not found");
    }

    await ctx.db.patch(args.roleId, { archived: true, updatedAt: Date.now() });
  },
});
