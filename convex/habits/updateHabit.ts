import { mutation } from "../_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    habitId: v.id("habits"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { habitId, ...updates } = args;
    await ctx.db.patch(habitId, updates);
    return await ctx.db.get(habitId);
  },
});
