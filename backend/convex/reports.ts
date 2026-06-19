import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const insertReport = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    category: v.string(),
    animalType: v.string(),
    urgency: v.string(),
    location: v.string(),
    description: v.string(),
    images: v.string(),
    status: v.string(),
    assignedTo: v.optional(v.string()),
    reporterIp: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      name: args.name,
      phone: args.phone,
      category: args.category,
      animalType: args.animalType,
      urgency: args.urgency,
      location: args.location,
      description: args.description,
      images: args.images,
      status: args.status,
      assignedTo: args.assignedTo,
      reporterIp: args.reporterIp,
      latitude: args.latitude,
      longitude: args.longitude,
      createdAt: Date.now(),
    });
  },
});

export const getReports = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let q = ctx.db.query("reports").order("desc");

    if (args.status) {
      q = q.withIndex("by_status", (idx) => idx.eq("status", args.status!));
    }

    return await q.take(limit);
  },
});

export const updateReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.string(),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, string> = { status: args.status };
    if (args.assignedTo !== undefined) {
      patch.assignedTo = args.assignedTo;
    }
    return await ctx.db.patch(args.reportId, patch);
  },
});
