import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    taskType: v.union(
      v.literal("light"),
      v.literal("deep"),
      v.literal("today")
    ),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    dueDate: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      taskType: args.taskType,
      priority: args.priority,
      dueDate: args.dueDate,
      estimatedMinutes: args.estimatedMinutes,
      status: "pending",
      xpEarned: 0,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
    return taskId;
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: now,
      ...(args.status === "completed" ? { completedAt: now } : {}),
    });
  },
});

export const complete = mutation({
  args: {
    taskId: v.id("tasks"),
    actualMinutes: v.optional(v.number()),
    xpEarned: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.taskId, {
      status: "completed",
      completedAt: now,
      updatedAt: now,
      actualMinutes: args.actualMinutes,
      xpEarned: args.xpEarned,
    });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
