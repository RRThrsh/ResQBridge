import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { normalizeEmail } from './lib/admins'

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query('appConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    return doc?.value ?? null
  },
})

export const update = mutation({
  args: {
    adminEmail: v.string(),
    key: v.string(),
    value: v.union(v.boolean(), v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query('admins')
      .withIndex('by_email', (q) => q.eq('email', normalizeEmail(args.adminEmail)))
      .first()
    if (!admin) throw new Error('Unauthorized')

    const existing = await ctx.db
      .query('appConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: args.adminEmail,
      })
    } else {
      await ctx.db.insert('appConfig', {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: args.adminEmail,
      })
    }
  },
})
