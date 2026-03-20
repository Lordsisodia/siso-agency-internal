import { mutation } from "../_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
  },
  handler: async (ctx, args) => {
    const habitId = await ctx.db.insert("habits", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      category: args.category,
      frequency: args.frequency,
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    return habitId;
  },
});
