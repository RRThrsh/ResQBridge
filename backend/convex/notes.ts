import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addReportNote = mutation({
  args: {
    reportId: v.string(),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reportNotes", {
      reportId: args.reportId,
      userId: args.userId,
      userName: args.userName,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getReportNotes = query({
  args: {
    reportId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reportNotes")
      .withIndex("by_reportId", (idx) => idx.eq("reportId", args.reportId))
      .order("desc")
      .take(50);
  },
});
