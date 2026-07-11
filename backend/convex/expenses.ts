import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const insertExpense = mutation({
  args: {
    userId: v.string(),
    reportId: v.string(),
    category: v.string(),
    amount: v.number(),
    description: v.string(),
    receiptImages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenses", {
      userId: args.userId,
      reportId: args.reportId,
      category: args.category,
      amount: args.amount,
      description: args.description,
      receiptImages: args.receiptImages,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getExpenses = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100);
  },
});

export const getExpenseStats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const pending = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
    const approved = expenses.filter((e) => e.status === "approved" || e.status === "reimbursed").reduce((s, e) => s + e.amount, 0);
    return { total, pending, approved, count: expenses.length };
  },
});

export const getAllExpenses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("expenses").order("desc").take(500);
  },
});

export const updateExpenseStatus = mutation({
  args: {
    expenseId: v.id("expenses"),
    status: v.union(v.literal("approved"), v.literal("reimbursed"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.expenseId, { status: args.status });
  },
});

export const updateExpense = mutation({
  args: {
    expenseId: v.id("expenses"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    receiptImages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = {};
    if (args.amount !== undefined) patch.amount = args.amount;
    if (args.description !== undefined) patch.description = args.description;
    if (args.receiptImages !== undefined) patch.receiptImages = args.receiptImages;
    await ctx.db.patch(args.expenseId, patch);
  },
});

export const deleteExpense = mutation({
  args: {
    expenseId: v.id("expenses"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.expenseId);
  },
});
