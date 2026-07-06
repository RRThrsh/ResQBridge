import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.string(),
    content: v.string(),
    reportId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      content: args.content,
      reportId: args.reportId,
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: {
    reportId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.reportId) {
      return await ctx.db
        .query("messages")
        .withIndex("by_reportId", (idx) => idx.eq("reportId", args.reportId))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("messages").order("desc").take(limit);
  },
});

export const getConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("messages").order("desc").take(200);
    const seen = new Set();
    const conversations: Array<{ reportId: string; lastMessage: string; lastTime: number; senderName: string }> = [];

    for (const msg of all) {
      const key = msg.reportId || "general";
      if (!seen.has(key)) {
        seen.add(key);
        conversations.push({
          reportId: msg.reportId || "general",
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          senderName: msg.senderName,
        });
      }
    }

    return conversations;
  },
});
