import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const getProfile = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rescuers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const startTracking = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    reportId: v.id("reports"),
    latitude: v.number(),
    longitude: v.number(),
    heading: v.optional(v.number()),
    speed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found.");

    const existing = await ctx.db
      .query("rescuerLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const data = {
      userId: args.userId,
      userName: args.userName,
      latitude: args.latitude,
      longitude: args.longitude,
      heading: args.heading,
      speed: args.speed,
      updatedAt: Date.now(),
      reportId: args.reportId,
      animalName: report.name,
      isTracking: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("rescuerLocations", data);
    }
  },
});

export const updateLocation = mutation({
  args: {
    userId: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    heading: v.optional(v.number()),
    speed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rescuerLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!existing) throw new Error("No active tracking session.");
    if (!existing.isTracking) throw new Error("Tracking is not active.");

    await ctx.db.patch(existing._id, {
      latitude: args.latitude,
      longitude: args.longitude,
      heading: args.heading,
      speed: args.speed,
      updatedAt: Date.now(),
    });
  },
});

export const stopTracking = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rescuerLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { isTracking: false, updatedAt: Date.now() });
    }
  },
});
