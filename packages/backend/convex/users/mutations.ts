import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireIdentity } from "./helpers";

/**
 * Creates the current user's profile on first sign-in, or loads the existing one.
 * Idempotent: safe to call on every app boot.
 */
export const ensureUser = mutation({
  args: {
    timezone: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      displayName: args.displayName ?? identity.name ?? undefined,
      timezone: args.timezone ?? "UTC",
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Marks onboarding complete and optionally updates profile fields. */
export const completeOnboarding = mutation({
  args: {
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.displayName !== undefined ? { displayName: args.displayName } : {}),
      ...(args.timezone !== undefined ? { timezone: args.timezone } : {}),
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
