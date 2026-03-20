import { query } from "../_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    userId: v.string(),
    habitId: v.optional(v.id("habits")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let completions;

    if (args.habitId) {
      completions = await ctx.db
        .query("habitCompletions")
        .withIndex("by_habit", (q) => q.eq("habitId", args.habitId!))
        .collect();
    } else {
      completions = await ctx.db
        .query("habitCompletions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      completions = completions.filter((c) => {
        const compDate = c.completedAt.split("T")[0];
        if (args.startDate && compDate < args.startDate) return false;
        if (args.endDate && compDate > args.endDate) return false;
        return true;
      });
    }

    return completions;
  },
});
