import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

// 1. Check if the user is an authorized Domestic Approver
export const isDomesticApprover = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()
    
    // Check if they exist and have the correct role (allows both admins and dedicated approvers)
    return user?.role === 'admin' || user?.role === 'domestic_approver'
  },
})
// 2. Fetch reports that are waiting for approval
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

// 3. Fetch reports that have already been published
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

// 4. List all approvers for the Admin Dashboard
export const listApprovers = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
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

// 5. Add a new approver from the Admin Dashboard
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

// 6. Update an existing approver's details
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

    if (!user) throw new Error('Approver not found.')

    await ctx.db.patch(user._id, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      contactPhone: args.contactPhone.trim(),
    })
  },
})

// 7. Remove an approver's access entirely
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

    if (!user) throw new Error('Approver not found.')
    
    await ctx.db.delete(user._id) 
  },
})
