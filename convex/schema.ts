import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // TASKS - Light Work, Deep Work, Today's Tasks
  // ============================================
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    taskType: v.union(
      v.literal("light"),
      v.literal("deep"),
      v.literal("today")
    ),
    dueDate: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    actualMinutes: v.optional(v.number()),
    xpEarned: v.optional(v.number()),
    completedAt: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["taskType"])
    .index("by_user_type", ["userId", "taskType"]),

  // ============================================
  // TIMEBOX - Focused work sessions
  // ============================================
  timeboxSessions: defineTable({
    userId: v.string(),
    taskId: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    plannedDuration: v.number(), // minutes
    actualDuration: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // ============================================
  // XP ANALYTICS
  // ============================================
  dailyXpStats: defineTable({
    userId: v.string(),
    date: v.string(),
    totalXp: v.number(),
    baseXp: v.number(),
    bonusXp: v.number(),
    sessionCount: v.number(),
    sourceBreakdown: v.optional(v.object({
      tasks: v.optional(v.number()),
      wellness: v.optional(v.number()),
      morning: v.optional(v.number()),
      focus: v.optional(v.number()),
      habits: v.optional(v.number()),
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user_date", ["userId", "date"]),

  xpSessions: defineTable({
    userId: v.string(),
    sessionDate: v.string(),
    sessionHour: v.number(),
    activityId: v.string(),
    activityName: v.string(),
    baseXp: v.number(),
    bonusXp: v.number(),
    totalXp: v.number(),
    category: v.string(),
    sourceType: v.string(),
    levelAtTime: v.number(),
    createdAt: v.string(),
  }).index("by_user_date", ["userId", "sessionDate"])
    .index("by_user_category", ["userId", "category"]),

  hourlyXpStats: defineTable({
    userId: v.string(),
    date: v.string(),
    hour: v.number(),
    xpEarned: v.number(),
    sessions: v.number(),
  }).index("by_user_date_hour", ["userId", "date", "hour"]),

  // ============================================
  // HABITS & WELLNESS
  // ============================================
  habits: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastCompleted: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_user_category", ["userId", "category"]),

  habitCompletions: defineTable({
    userId: v.string(),
    habitId: v.id("habits"),
    completedAt: v.string(),
    notes: v.optional(v.string()),
  }).index("by_habit", ["habitId"])
    .index("by_user", ["userId"]),

  // ============================================
  // MORNING ROUTINE
  // ============================================
  morningRoutines: defineTable({
    userId: v.string(),
    date: v.string(),
    wakeTime: v.optional(v.string()),
    meditationMinutes: v.optional(v.number()),
    affirmations: v.optional(v.boolean()),
    journalEntry: v.optional(v.string()),
    exerciseCompleted: v.optional(v.boolean()),
    waterIntake: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user_date", ["userId", "date"]),

  // ============================================
  // CHECKOUT / DAILY REFLECTION
  // ============================================
  dailyReflections: defineTable({
    userId: v.string(),
    date: v.string(),
    completedTasks: v.array(v.string()),
    tomorrowPlan: v.optional(v.string()),
    gratitude: v.optional(v.string()),
    dailyRating: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user_date", ["userId", "date"]),

  // ============================================
  // XP GOALS
  // ============================================
  xpGoals: defineTable({
    userId: v.string(),
    goalType: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    targetXp: v.number(),
    currentXp: v.number(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    completed: v.boolean(),
    completedAt: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_user_type", ["userId", "goalType"]),
});
