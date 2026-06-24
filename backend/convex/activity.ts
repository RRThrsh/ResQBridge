import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_userId", (idx) => idx.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
