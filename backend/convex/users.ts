import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    uuid: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("domestic"),
      v.literal("rescuer"),
      v.literal("user"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      uuid: args.uuid,
      firstName: args.firstName,
      lastName: args.lastName,
      phoneNumber: args.phoneNumber,
      email: args.email,
      password: args.password,
      role: args.role,
    });
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});
