import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveChecklist = mutation({
  args: {
    reportId: v.string(),
    userId: v.string(),
    items: v.array(
      v.object({
        label: v.string(),
        checked: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("equipmentChecklists")
      .withIndex("by_reportId", (idx) => idx.eq("reportId", args.reportId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        items: args.items,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("equipmentChecklists", {
      reportId: args.reportId,
      userId: args.userId,
      items: args.items,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getChecklist = query({
  args: { reportId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("equipmentChecklists")
      .withIndex("by_reportId", (idx) => idx.eq("reportId", args.reportId))
      .unique();
  },
});
