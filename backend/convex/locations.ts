import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateRescuerLocation = mutation({
  args: {
    rescuerEmail: v.string(),
    rescuerName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rescuerLocations")
      .withIndex("by_rescuer_email", (idx) => idx.eq("rescuerEmail", args.rescuerEmail))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        latitude: args.latitude,
        longitude: args.longitude,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("rescuerLocations", {
      rescuerEmail: args.rescuerEmail,
      rescuerName: args.rescuerName,
      latitude: args.latitude,
      longitude: args.longitude,
      updatedAt: Date.now(),
    });
  },
});

export const getRescuerLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rescuerLocations").order("desc").collect();
  },
});
