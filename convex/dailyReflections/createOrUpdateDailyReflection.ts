import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrUpdate = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    completedTasks: v.optional(v.array(v.string())),
    tomorrowPlan: v.optional(v.string()),
    gratitude: v.optional(v.string()),
    dailyRating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check if a reflection already exists for this user and date
    const existing = await ctx.db
      .query("dailyReflections")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();

    if (existing) {
      // Update existing reflection
      await ctx.db.patch(existing._id, {
        completedTasks: args.completedTasks,
        tomorrowPlan: args.tomorrowPlan,
        gratitude: args.gratitude,
        dailyRating: args.dailyRating,
        notes: args.notes,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new reflection
      const reflectionId = await ctx.db.insert("dailyReflections", {
        userId: args.userId,
        date: args.date,
        completedTasks: args.completedTasks ?? [],
        tomorrowPlan: args.tomorrowPlan,
        gratitude: args.gratitude,
        dailyRating: args.dailyRating,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
      });
      return reflectionId;
    }
  },
});
