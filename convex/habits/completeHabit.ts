import { mutation } from "../_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    userId: v.string(),
    habitId: v.id("habits"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Get the habit to update streak
    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("Habit not found");
    }

    // Check if already completed today
    const today = now.split("T")[0];
    const existingCompletion = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();

    const alreadyCompletedToday = existingCompletion.some((c) =>
      c.completedAt.startsWith(today)
    );

    if (alreadyCompletedToday) {
      return { success: false, message: "Already completed today" };
    }

    // Create completion record
    const completionId = await ctx.db.insert("habitCompletions", {
      userId: args.userId,
      habitId: args.habitId,
      completedAt: now,
      notes: args.notes,
    });

    // Update streak
    let newStreak = habit.currentStreak;
    const lastCompleted = habit.lastCompleted;

    if (lastCompleted) {
      const lastDate = new Date(lastCompleted);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If diffDays === 0, same day, don't change streak
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, habit.longestStreak);

    await ctx.db.patch(args.habitId, {
      currentStreak: newStreak,
      longestStreak,
      lastCompleted: now,
    });

    return {
      success: true,
      completionId,
      newStreak,
      longestStreak,
    };
  },
});
