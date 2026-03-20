import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrUpdate = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    wakeTime: v.optional(v.string()),
    meditationMinutes: v.optional(v.number()),
    affirmations: v.optional(v.boolean()),
    journalEntry: v.optional(v.string()),
    exerciseCompleted: v.optional(v.boolean()),
    waterIntake: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check if a routine already exists for this user and date
    const existing = await ctx.db
      .query("morningRoutines")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();

    if (existing) {
      // Update existing routine
      await ctx.db.patch(existing._id, {
        wakeTime: args.wakeTime,
        meditationMinutes: args.meditationMinutes,
        affirmations: args.affirmations,
        journalEntry: args.journalEntry,
        exerciseCompleted: args.exerciseCompleted,
        waterIntake: args.waterIntake,
        notes: args.notes,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new routine
      const routineId = await ctx.db.insert("morningRoutines", {
        userId: args.userId,
        date: args.date,
        wakeTime: args.wakeTime,
        meditationMinutes: args.meditationMinutes,
        affirmations: args.affirmations,
        journalEntry: args.journalEntry,
        exerciseCompleted: args.exerciseCompleted,
        waterIntake: args.waterIntake,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
      });
      return routineId;
    }
  },
});
