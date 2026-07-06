import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addVoiceNote = mutation({
  args: {
    reportId: v.string(),
    userId: v.string(),
    userName: v.string(),
    audioUrl: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceNotes", {
      reportId: args.reportId,
      userId: args.userId,
      userName: args.userName,
      audioUrl: args.audioUrl,
      duration: args.duration,
      createdAt: Date.now(),
    });
  },
});

export const getVoiceNotes = query({
  args: { reportId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voiceNotes")
      .withIndex("by_reportId", (idx) => idx.eq("reportId", args.reportId))
      .order("desc")
      .take(50);
  },
});
