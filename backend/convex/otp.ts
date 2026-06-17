import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOtp = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("otps", {
      email: args.email,
      otp: args.otp,
      expiresAt: args.expiresAt,
      used: false,
    });
  },
});

export const getValidOtp = query({
  args: { email: v.string(), otp: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("otps")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("otp"), args.otp))
      .filter((q) => q.eq(q.field("used"), false))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .order("desc")
      .first();
  },
});

export const markOtpUsed = mutation({
  args: { id: v.id("otps") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { used: true });
  },
});

export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("otps")
      .filter((q) => q.lt(q.field("expiresAt"), Date.now()))
      .collect();
    for (const doc of expired) {
      await ctx.db.delete(doc._id);
    }
  },
});
