import { ConvexError } from "convex/values";
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { withResolvedReportPhotos } from './lib/reportPhotos'
import { writeAuditLog } from './lib/auditLog'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const getDomesticApproverForLogin = query({
  args: { email: v.string() },

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user || user.role !== 'domestic_approver') {
      return null
    }

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: 'domestic_approver' as const,
    }
  },
})

export const isDomesticApprover = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    return user?.role === 'admin' || user?.role === 'domestic_approver'
  },
})

export const listPendingReports = query({
  args: {},
  handler: async (ctx) => {
    // Return pure, raw data so the photos don't get deleted
const rows = await ctx.db
  .query('reports')
  .filter((q) => q.eq(q.field('category'), 'domestic'))
  .filter((q) => q.eq(q.field('status'), 'pending'))
  .order('desc')
  .collect()

return await Promise.all(
  rows.map((row) => withResolvedReportPhotos(ctx, row))
)
  },
})

export const listPublishedReports = query({
  args: {},
  handler: async (ctx) => {
    // Return pure, raw data so the photos don't get deleted
const rows = await ctx.db
  .query('reports')
  .filter((q) => q.eq(q.field('category'), 'domestic'))
  .filter((q) => q.eq(q.field('status'), 'published'))
  .collect()

const filteredRows = rows.filter(
  (report) =>
    report.type === 'missing' ||
    report.type === 'found',
)

filteredRows.sort(
  (a, b) => b._creationTime - a._creationTime,
)

return await Promise.all(
  filteredRows.map((row) =>
  withResolvedReportPhotos(ctx, row),
)
)
  },
})

export const listRejectedReports = query({
  args: {},
  handler: async (ctx) => {
    // Return pure, raw data so the photos don't get deleted
    const rows = await ctx.db
      .query('reports')
      .filter((q) => q.eq(q.field('category'), 'domestic'))
      .filter((q) => q.eq(q.field('status'), 'rejected'))
      .order('desc')
      .collect()

    return await Promise.all(
      rows.map((row) => withResolvedReportPhotos(ctx, row))
    )
  },
})

export const listApprovers = query({
  args: { adminEmail: v.string() },
  handler: async (ctx) => {
    const approvers = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), 'domestic_approver'))
      .order('desc')
      .collect()

    return approvers.map((u) => ({
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      contactPhone: u.contactPhone || '',
      createdAt: u._creationTime,
    }))
  },
})

export const addApprover = mutation({
  args: {
    adminEmail: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.optional(v.string()),
    password: v.optional(v.string()),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (existing) {
      throw new Error('A user with this email already exists.')
    }

    await ctx.db.insert('users', {
      email,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      password: args.password || '',
      role: 'domestic_approver',
      contactPhone: args.contactPhone?.trim() || '',
      createdAt: Date.now(),
    })

    await writeAuditLog(ctx, {
      action: 'admin.approver.add',
      actorEmail: args.adminEmail,
      actorRole: 'admin',
      targetType: 'domestic_approver',
      targetId: email,
      details: JSON.stringify({ firstName: args.firstName.trim(), lastName: args.lastName.trim() }),
    })

    return null
  },
})

export const updateApprover = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.targetEmail)

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) {
      throw new Error('Approver not found.')
    }

    await ctx.db.patch(user._id, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      contactPhone: args.contactPhone.trim(),
    })
  },
})

export const removeApprover = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.targetEmail)

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) {
      throw new Error('Approver not found.')
    }

    await ctx.db.delete(user._id)

    await writeAuditLog(ctx, {
      action: 'admin.approver.remove',
      actorEmail: args.adminEmail,
      actorRole: 'admin',
      targetType: 'domestic_approver',
      targetId: email,
      details: JSON.stringify({ firstName: user.firstName, lastName: user.lastName }),
    })
  },
})

export const resetDomesticPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user || user.role !== 'domestic_approver') {
      throw new Error('Account not found.')
    }

    await ctx.db.patch(user._id, {
      password: args.newPassword,
    })

    return null
  },
})

export const listAllDomesticReports = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query('reports')
      .filter((q) => q.eq(q.field('category'), 'domestic'))
      .order('desc')
      .collect()

    return await Promise.all(
      rows.map((row) => withResolvedReportPhotos(ctx, row))
    )
  },
})

export const publishReport = mutation({
  args: {
    reportId: v.id('reports'),
    approverEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId)
    if (!report) throw new Error('Report not found.')
    if (report.category !== 'domestic') throw new Error('Not a domestic report.')
    if (report.status !== 'pending') throw new Error('Only pending reports can be published.')

    await ctx.db.patch(args.reportId, { status: 'published' })

    await writeAuditLog(ctx, {
      action: 'domestic_approver.publish',
      actorEmail: args.approverEmail,
      actorRole: 'domestic_approver',
      targetType: 'report',
      targetId: args.reportId,
      details: JSON.stringify({ type: report.type, animalName: report.animalName }),
    })
  },
})

export const rejectReport = mutation({
  args: {
    reportId: v.id('reports'),
    approverEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId)
    if (!report) throw new Error('Report not found.')
    if (report.category !== 'domestic') throw new Error('Not a domestic report.')
    if (report.status !== 'pending') throw new Error('Only pending reports can be rejected.')

    await ctx.db.patch(args.reportId, { status: 'rejected' })

    await writeAuditLog(ctx, {
      action: 'domestic_approver.reject',
      actorEmail: args.approverEmail,
      actorRole: 'domestic_approver',
      targetType: 'report',
      targetId: args.reportId,
      details: JSON.stringify({ type: report.type, animalName: report.animalName }),
    })
  },
})

export const deleteDomesticReport = mutation({
  args: {
    reportId: v.id('reports'),
    approverEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId)
    if (!report) throw new Error('Report not found.')
    if (report.category !== 'domestic') throw new Error('Not a domestic report.')

    await ctx.db.delete(args.reportId)

    await writeAuditLog(ctx, {
      action: 'domestic_approver.delete',
      actorEmail: args.approverEmail,
      actorRole: 'domestic_approver',
      targetType: 'report',
      targetId: args.reportId,
      details: JSON.stringify({ type: report.type, animalName: report.animalName }),
    })
  },
})

// 2. NEW mutation for the Profile Page (Requires currentPassword)
export const changeDomesticPassword = mutation({
  args: {
    email: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user || user.role !== 'domestic_approver') {
      throw new ConvexError('Account not found.')
    }

    // === ADD THIS TO SEE THE TRUTH ===
    console.log(`DB Password: "${user.password}" | Typed Password: "${args.currentPassword}"`);

    if (user.password !== args.currentPassword) {
      throw new ConvexError('Incorrect current password.')
    }

    await ctx.db.patch(user._id, {
      password: args.newPassword,
    })

    return null
  },
})
