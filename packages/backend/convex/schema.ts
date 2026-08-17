import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const importance = v.union(v.literal("high"), v.literal("low"));
const urgency = v.union(v.literal("high"), v.literal("low"));
const quadrant = v.union(
  v.literal("Q1"),
  v.literal("Q2"),
  v.literal("Q3"),
  v.literal("Q4"),
);

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    displayName: v.optional(v.string()),
    timezone: v.string(),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  roles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    archived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  goals: defineTable({
    userId: v.id("users"),
    roleId: v.optional(v.id("roles")),
    title: v.string(),
    description: v.optional(v.string()),
    horizon: v.union(v.literal("yearly"), v.literal("monthly"), v.literal("weekly")),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_roleId", ["roleId"]),

  tasks: defineTable({
    userId: v.id("users"),
    roleId: v.optional(v.id("roles")),
    goalId: v.optional(v.id("goals")),
    title: v.string(),
    description: v.optional(v.string()),
    importance,
    urgency,
    quadrant,
    dueDate: v.optional(v.number()),
    estimatedMinutes: v.optional(v.number()),
    status: v.union(
      v.literal("inbox"),
      v.literal("planned"),
      v.literal("done"),
      v.literal("deferred"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_userId_quadrant", ["userId", "quadrant"]),

  weeklyPlans: defineTable({
    userId: v.id("users"),
    weekStartDate: v.string(),
    selectedRoleIds: v.array(v.id("roles")),
    bigRockTaskIds: v.array(v.id("tasks")),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_weekStartDate", ["userId", "weekStartDate"]),

  scheduleBlocks: defineTable({
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.number(),
    date: v.string(),
    source: v.union(v.literal("weeklyPlan"), v.literal("dailyPlan"), v.literal("manual")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  reviews: defineTable({
    userId: v.id("users"),
    periodType: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    periodStartDate: v.string(),
    wins: v.optional(v.string()),
    misses: v.optional(v.string()),
    lessons: v.optional(v.string()),
    nextAdjustments: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_period", ["userId", "periodType", "periodStartDate"]),
});
