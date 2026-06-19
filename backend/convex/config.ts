import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("config").collect();
    const config: Record<string, string> = {};
    for (const entry of entries) {
      config[entry.key] = entry.value;
    }
    return config;
  },
});

export const getConfigValue = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("config")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return entry?.value ?? null;
  },
});

export const upsertConfig = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("config")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      return await ctx.db.patch(existing._id, { value: args.value });
    }
    return await ctx.db.insert("config", { key: args.key, value: args.value });
  },
});
