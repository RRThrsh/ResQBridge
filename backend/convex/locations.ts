import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateRescuerLocation = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rescuerLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        latitude: args.latitude,
        longitude: args.longitude,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("rescuerLocations", {
      userId: args.userId,
      userName: args.userName,
      latitude: args.latitude,
      longitude: args.longitude,
      updatedAt: Date.now(),
    });
  },
});

export const getRescuerLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rescuerLocations").order("desc").take(200);
  },
});
