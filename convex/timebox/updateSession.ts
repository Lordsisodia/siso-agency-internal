import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const complete = mutation({
  args: {
    sessionId: v.id("timeboxSessions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "active") {
      throw new Error("Can only complete active sessions");
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const actualDuration = Math.round((now.getTime() - startTime.getTime()) / 60000);

    await ctx.db.patch(args.sessionId, {
      endTime: now.toISOString(),
      actualDuration,
      status: "completed",
      notes: args.notes || session.notes,
    });

    return args.sessionId;
  },
});

export const cancel = mutation({
  args: {
    sessionId: v.id("timeboxSessions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "active") {
      throw new Error("Can only cancel active sessions");
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const actualDuration = Math.round((now.getTime() - startTime.getTime()) / 60000);

    await ctx.db.patch(args.sessionId, {
      endTime: now.toISOString(),
      actualDuration,
      status: "cancelled",
      notes: args.notes || session.notes,
    });

    return args.sessionId;
  },
});

export const updateNotes = mutation({
  args: {
    sessionId: v.id("timeboxSessions"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "active") {
      throw new Error("Can only update notes for active sessions");
    }

    await ctx.db.patch(args.sessionId, {
      notes: args.notes,
    });

    return args.sessionId;
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("timeboxSessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
  },
});
