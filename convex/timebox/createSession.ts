import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.string(),
    taskId: v.optional(v.string()),
    plannedDuration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check for existing active session
    const existingActive = await ctx.db
      .query("timeboxSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active")
      )
      .take(1);

    if (existingActive.length > 0) {
      throw new Error("An active session already exists. Complete or cancel it first.");
    }

    const sessionId = await ctx.db.insert("timeboxSessions", {
      userId: args.userId,
      taskId: args.taskId,
      startTime: now,
      plannedDuration: args.plannedDuration,
      status: "active",
      notes: args.notes,
      createdAt: now,
    });

    return sessionId;
  },
});

export const startQuick = mutation({
  args: {
    userId: v.string(),
    plannedDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check for existing active session
    const existingActive = await ctx.db
      .query("timeboxSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active")
      )
      .take(1);

    if (existingActive.length > 0) {
      throw new Error("An active session already exists. Complete or cancel it first.");
    }

    const sessionId = await ctx.db.insert("timeboxSessions", {
      userId: args.userId,
      startTime: now,
      plannedDuration: args.plannedDuration,
      status: "active",
      createdAt: now,
    });

    return sessionId;
  },
});
