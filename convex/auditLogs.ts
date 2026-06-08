import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { assertAdmin } from './lib/adminAccess'
import { writeAuditLog } from './lib/auditLog'

export const list = query({
  args: { adminEmail: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id('auditLogs'),
    _creationTime: v.number(),
    action: v.string(),
    actorEmail: v.string(),
    actorName: v.optional(v.string()),
    actorRole: v.optional(v.string()),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    metadata: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const limit = args.limit ?? 100
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_created_at')
      .order('asc')
      .take(limit)
    return logs
  },
})

export const fromAction = mutation({
  args: {
    action: v.string(),
    actorEmail: v.string(),
    actorName: v.optional(v.string()),
    actorRole: v.optional(v.union(v.literal('user'), v.literal('admin'), v.literal('rescuer'), v.literal('domestic_approver'), v.literal('guest'))),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    metadata: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await writeAuditLog(ctx, args as any)
    return null
  },
})
