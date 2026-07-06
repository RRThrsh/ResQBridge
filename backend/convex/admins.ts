import { query } from "./_generated/server";
import { v } from "convex/values";

export const listTrackingRescuers = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db
      .query("rescuerLocations")
      .withIndex("by_tracking", (q) => q.eq("isTracking", true))
      .collect();

    const now = Date.now();
    const staleThreshold = 60000;

    return locations
      .filter((loc) => now - loc.updatedAt < staleThreshold)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
