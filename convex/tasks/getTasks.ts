import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listByType = query({
  args: { userId: v.string(), taskType: v.union(v.literal("light"), v.literal("deep"), v.literal("today")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_type", (q) => q.eq("userId", args.userId).eq("taskType", args.taskType))
      .collect();
  },
});

export const listPending = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});
