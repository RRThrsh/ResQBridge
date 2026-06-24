import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const insertReport = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    category: v.string(),
    animalType: v.string(),
    urgency: v.string(),
    location: v.string(),
    description: v.string(),
    images: v.string(),
    status: v.string(),
    assignedTo: v.optional(v.string()),
    reporterIp: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      name: args.name,
      phone: args.phone,
      category: args.category,
      animalType: args.animalType,
      urgency: args.urgency,
      location: args.location,
      description: args.description,
      images: args.images,
      status: args.status,
      assignedTo: args.assignedTo,
      reporterIp: args.reporterIp,
      latitude: args.latitude,
      longitude: args.longitude,
      createdAt: Date.now(),
    });
  },
});

export const getReports = query({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.status && args.assignedTo) {
      const all = await ctx.db.query("reports").collect();
      return all
        .filter((r) => !r.archived && r.status === args.status && r.assignedTo === args.assignedTo)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        .slice(0, limit);
    }

    if (args.status) {
      const all = await ctx.db
        .query("reports")
        .withIndex("by_status", (idx) => idx.eq("status", args.status!))
        .order("desc")
        .take(limit * 2);
      return all.filter((r) => !r.archived).slice(0, limit);
    }

    if (args.assignedTo) {
      const all = await ctx.db
        .query("reports")
        .withIndex("by_assignedTo", (idx) => idx.eq("assignedTo", args.assignedTo!))
        .order("desc")
        .take(limit * 2);
      return all.filter((r) => !r.archived).slice(0, limit);
    }

    const all = await ctx.db.query("reports").order("desc").take(limit * 2);
    return all.filter((r) => !r.archived).slice(0, limit);
  },
});

export const getRescuerStats = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("reports").collect();
    const myReports = all.filter((r) => !r.archived && r.assignedTo === args.uuid);
    const active = myReports.filter((r) => r.status === "pending" || r.status === "in_progress");
    const completed = myReports.filter((r) => r.status === "resolved");
    return {
      activeRequests: active.length,
      completed: completed.length,
      totalAssigned: myReports.length,
    };
  },
});

export const updateReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.string(),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, string> = { status: args.status };
    if (args.assignedTo !== undefined) {
      patch.assignedTo = args.assignedTo;
    }
    return await ctx.db.patch(args.reportId, patch);
  },
});

export const assignReport = mutation({
  args: {
    reportId: v.id("reports"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_createdAt", (idx) => idx.gte("createdAt", 0))
      .collect()
      .then((all) => all.find((r) => r._id === args.reportId));

    if (!report) throw new Error("Report not found");

    return await ctx.db.patch(args.reportId, {
      status: "assigned",
      assignedTo: args.userId,
    });
  },
});

export const rejectAssignment = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_createdAt", (idx) => idx.gte("createdAt", 0))
      .collect()
      .then((all) => all.find((r) => r._id === args.reportId));

    if (!report) throw new Error("Report not found");

    return await ctx.db.patch(args.reportId, {
      status: "pending",
      assignedTo: undefined,
    });
  },
});

export const getAdminReports = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").take(200);
    const users = await ctx.db.query("users").collect();

    return reports
      .filter((r) => !r.archived)
      .map((r) => {
        let assignedUser = null;
        if (r.assignedTo) {
          const u = users.find((x) => x.uuid === r.assignedTo);
          if (u) {
            assignedUser = {
              uuid: u.uuid,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phoneNumber: u.phoneNumber,
            };
          }
        }
        return { ...r, assignedUser };
      });
  },
});

export const archiveReport = mutation({
  args: {
    reportId: v.id("reports"),
    archivedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_createdAt", (idx) => idx.gte("createdAt", 0))
      .collect()
      .then((all) => all.find((r) => r._id === args.reportId));

    if (!report) throw new Error("Report not found");

    return await ctx.db.patch(args.reportId, {
      archived: true,
      archivedAt: Date.now(),
      archivedBy: args.archivedBy,
    });
  },
});

export const unarchiveReport = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_createdAt", (idx) => idx.gte("createdAt", 0))
      .collect()
      .then((all) => all.find((r) => r._id === args.reportId));

    if (!report) throw new Error("Report not found");

    return await ctx.db.patch(args.reportId, {
      archived: undefined,
      archivedAt: undefined,
      archivedBy: undefined,
    });
  },
});

export const archiveReports = mutation({
  args: {
    reportIds: v.array(v.id("reports")),
    archivedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const reportId of args.reportIds) {
      await ctx.db.patch(reportId, {
        archived: true,
        archivedAt: now,
        archivedBy: args.archivedBy,
      });
    }
  },
});

export const deleteReport = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_createdAt", (idx) => idx.gte("createdAt", 0))
      .collect()
      .then((all) => all.find((r) => r._id === args.reportId));

    if (!report) throw new Error("Report not found");

    await ctx.db.delete(args.reportId);
  },
});

export const getArchivedReports = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").take(200);
    const users = await ctx.db.query("users").collect();

    return reports
      .filter((r) => r.archived)
      .map((r) => {
        let assignedUser = null;
        if (r.assignedTo) {
          const u = users.find((x) => x.uuid === r.assignedTo);
          if (u) {
            assignedUser = {
              uuid: u.uuid,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phoneNumber: u.phoneNumber,
            };
          }
        }
        let archivedByName = null;
        if (r.archivedBy) {
          const a = users.find((x) => x.uuid === r.archivedBy);
          if (a) {
            archivedByName = `${a.firstName} ${a.lastName}`;
          }
        }
        return { ...r, assignedUser, archivedByName };
      });
  },
});
