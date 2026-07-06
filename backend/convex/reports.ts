import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const getReport = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

export const createReport = mutation({
  args: {
    animalName: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    reporterEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("reports", {
      animalName: args.animalName,
      location: args.location,
      description: args.description,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "pending",
      reporterEmail: args.reporterEmail,
      createdAt: Date.now(),
    });
    return reportId;
  },
});

export const listReportsByRescuer = query({
  args: { rescuerEmail: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_assigned_rescuer", (q) => q.eq("assignedRescuerEmail", args.rescuerEmail))
      .collect();
  },
});
