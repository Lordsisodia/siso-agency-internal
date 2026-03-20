import { query } from "../_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    userId: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let habits;

    if (args.category) {
      habits = await ctx.db
        .query("habits")
        .withIndex("by_user_category", (q) =>
          q.eq("userId", args.userId).eq("category", args.category)
        )
        .collect();
    } else {
      habits = await ctx.db
        .query("habits")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }

    return habits.filter((h) => h.isActive);
  },
});
