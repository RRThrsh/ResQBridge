import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const createReport = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    category: v.string(),
    animalType: v.string(),
    urgency: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    images: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    reporterEmail: v.optional(v.string()),
    reporterIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("reports", {
      name: args.name,
      phone: args.phone,
      category: args.category,
      animalType: args.animalType,
      urgency: args.urgency,
      location: args.location,
      description: args.description,
      images: args.images,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "pending",
      reporterEmail: args.reporterEmail,
      reporterIp: args.reporterIp,
      createdAt: Date.now(),
    });
    return reportId;
  },
});

export const getAdminReports = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("reports").order("desc").take(500);
    return all.filter((r) => r.archivedAt === undefined);
  },
});

export const getReports = query({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.status && args.assignedTo) {
      return await ctx.db
        .query("reports")
        .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.assignedTo!))
        .filter((q) => q.eq(q.field("status"), args.status!))
        .order("desc")
        .take(limit);
    }
    if (args.status) {
      return await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }
    if (args.assignedTo) {
      return await ctx.db
        .query("reports")
        .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.assignedTo!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("reports").order("desc").take(limit);
  },
});

export const getReport = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const assignReport = mutation({
  args: { reportId: v.id("reports"), userId: v.string(), assignedUser: v.optional(v.object({ firstName: v.string(), lastName: v.string() })) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      assignedTo: args.userId,
      assignedUser: args.assignedUser,
      status: "assigned",
    });
  },
});

export const archiveReports = mutation({
  args: { reportIds: v.array(v.id("reports")), archivedByName: v.string() },
  handler: async (ctx, args) => {
    for (const id of args.reportIds) {
      await ctx.db.patch(id, { archivedAt: Date.now(), archivedByName: args.archivedByName });
    }
  },
});

export const unarchiveReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, { archivedAt: undefined, archivedByName: undefined });
  },
});

export const getArchivedReports = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("reports").order("desc").take(500);
    return all.filter((r) => r.archivedAt !== undefined);
  },
});

export const deleteReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.reportId);
  },
});

export const rejectAssignment = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      assignedTo: undefined,
      assignedUser: undefined,
      status: "pending",
    });
  },
});

export const updateReportStatus = mutation({
  args: { reportId: v.id("reports"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, { status: args.status as any });
  },
});

export const getRescuerStats = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.uuid))
      .collect();
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const assigned = reports.filter((r) => r.status === "assigned").length;
    const enRoute = reports.filter((r) => r.status === "en_route").length;
    const inProgress = reports.filter((r) => r.status === "in_progress").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const failed = reports.filter((r) => r.status === "failed").length;
    return { total, pending, assigned, enRoute, inProgress, resolved, failed };
  },
});
