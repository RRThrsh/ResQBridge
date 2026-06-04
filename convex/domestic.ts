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
    
    // Check if they exist and have the correct role (adjust 'admin' to 'domestic_approver' if you have a specific role for them)
    return user?.role === 'admin' 
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
      .filter((q) => q.eq(q.field('status'), 'published')) // Assuming 'published' or 'resolved'
      .order('desc')
      .collect()
  },
})
