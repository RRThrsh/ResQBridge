import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

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
    return await ctx.db
      .query('reports')
      .filter((q) => q.eq(q.field('category'), 'domestic'))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .order('desc')
      .collect()
  },
})

export const listPublishedReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('reports')
      .filter((q) => q.eq(q.field('category'), 'domestic'))
      .filter((q) => q.eq(q.field('status'), 'published'))
      .order('desc')
      .collect()
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