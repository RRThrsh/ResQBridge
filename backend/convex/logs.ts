import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const insertLog = mutation({
  args: {
    userId: v.optional(v.string()),
    eventType: v.string(),
    section: v.optional(v.string()),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.string()),
    sessionDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("logs", {
      userId: args.userId,
      eventType: args.eventType,
      section: args.section,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      metadata: args.metadata,
      sessionDuration: args.sessionDuration,
      createdAt: Date.now(),
    });
  },
});

export const getLogs = query({
  args: {
    eventType: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    let q = ctx.db.query("logs").order("desc");

    if (args.eventType) {
      q = q.withIndex("by_eventType", (idx) => idx.eq("eventType", args.eventType!));
    }
    if (args.ipAddress) {
      q = q.withIndex("by_ipAddress", (idx) => idx.eq("ipAddress", args.ipAddress!));
    }

    const results = await q.take(limit + 1);
    const hasMore = results.length > limit;
    const items = results.slice(0, limit);

    return {
      items: items.map((doc) => ({
        _id: doc._id,
        _creationTime: doc._creationTime,
        userId: doc.userId,
        eventType: doc.eventType,
        section: doc.section,
        ipAddress: doc.ipAddress,
        userAgent: doc.userAgent,
        metadata: doc.metadata,
        sessionDuration: doc.sessionDuration,
        createdAt: doc.createdAt,
      })),
      hasMore,
      cursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});

export const getLogStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("logs").collect();

    const ipCounts = new Map<string, number>();
    const eventCounts = new Map<string, number>();
    let totalDuration = 0;
    let durationCount = 0;

    for (const log of all) {
      ipCounts.set(log.ipAddress, (ipCounts.get(log.ipAddress) ?? 0) + 1);
      eventCounts.set(log.eventType, (eventCounts.get(log.eventType) ?? 0) + 1);
      if (log.sessionDuration != null) {
        totalDuration += log.sessionDuration;
        durationCount++;
      }
    }

    const ipEntries = Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLogs: all.length,
      uniqueIPs: ipCounts.size,
      avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
      ipBreakdown: ipEntries,
      eventBreakdown: Object.fromEntries(eventCounts),
    };
  },
});

export const deleteOldLogs = mutation({
  args: { retentionDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.retentionDays * 24 * 60 * 60 * 1000;
    const oldLogs = await ctx.db
      .query("logs")
      .withIndex("by_createdAt", (q) => q.lt(q.field("createdAt"), cutoff))
      .collect();

    for (const doc of oldLogs) {
      await ctx.db.delete(doc._id);
    }

    return { deleted: oldLogs.length };
  },
});

export const getLogsByIP = query({
  args: { ipAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("logs")
      .withIndex("by_ipAddress", (q) => q.eq("ipAddress", args.ipAddress))
      .order("desc")
      .collect();
  },
});
