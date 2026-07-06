import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertShift = mutation({
  args: {
    userId: v.string(),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shifts")
      .withIndex("by_userId_and_day", (idx) =>
        idx.eq("userId", args.userId).eq("dayOfWeek", args.dayOfWeek)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        startTime: args.startTime,
        endTime: args.endTime,
        active: args.active,
      });
    }

    return await ctx.db.insert("shifts", {
      userId: args.userId,
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      active: args.active,
    });
  },
});

export const getMyShifts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shifts")
      .withIndex("by_userId", (idx) => idx.eq("userId", args.userId))
      .order("asc")
      .take(50);
  },
});

export const getActiveRescuers = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const time = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    const allShifts = await ctx.db.query("shifts").collect();
    const activeUserIds = allShifts
      .filter((s) => s.active && s.dayOfWeek === dayOfWeek && s.startTime <= time && s.endTime >= time)
      .map((s) => s.userId);

    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => activeUserIds.includes(u.uuid))
      .map((u) => ({ uuid: u.uuid, firstName: u.firstName, lastName: u.lastName }));
  },
});
