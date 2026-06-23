import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const insertActivityLog = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    reportId: v.optional(v.string()),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", {
      userId: args.userId,
      action: args.action,
      reportId: args.reportId,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});

export const getActivityLogs = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_userId", (idx) => idx.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
