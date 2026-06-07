import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { withResolvedReportPhotos } from './lib/reportPhotos'
// 🚨 WE IMPORT THE PHOTO UNLOCKER HERE

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
  .order('desc')
  .collect()

return await Promise.all(
  rows.map((row) => withResolvedReportPhotos(ctx, row))
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
    contactPhone: v.string(),
    password: v.string(),
  },
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
  password: args.password,
  role: 'domestic_approver',
  contactPhone: args.contactPhone.trim(),
  createdAt: Date.now(),
})
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
      .withIndex('by_email', (q) =>
        q.eq('email', email),
      )
      .unique()

    if (
      !user ||
      user.role !== 'domestic_approver'
    ) {
      throw new Error('Account not found.')
    }

    await ctx.db.patch(user._id, {
      password: args.newPassword,
    })

    return null
  },
})
