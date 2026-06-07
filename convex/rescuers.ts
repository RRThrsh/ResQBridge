import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { assertAdmin } from './lib/adminAccess'
import { reportDocValidator } from './lib/reportFields'
import { withResolvedReportPhotos } from './lib/reportPhotos'
import {
  generateReportNumber,
  isActiveDispatchStatus,
  isTerminalStatus,
  normalizeReportStatus,
  type ReportStatus,
} from './lib/reportStatus'
import { assertRescuer, getRescuerByEmail, isRescuerEmail } from './lib/rescuerAccess'
import { normalizeEmail } from './lib/admins'
import { normalizeContactPhone } from './lib/contactPhone'

const rescuerProfileValidator = v.object({
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  contactPhone: v.string(),
  password: v.optional(v.string()),
})

const rescuerReportValidator = v.object({
  ...reportDocValidator.fields,

  color: v.optional(v.string()),

  reporterFirstName: v.string(),
  reporterLastName: v.string(),
  assignedRescuerName: v.optional(v.string()),
})

function normalizeReportRow<T extends { status: string; reportNumber?: string; _id: Id<'reports'> }>(
  report: T,
) {
  return {
    ...report,
    status: normalizeReportStatus(report.status),
    reportNumber: report.reportNumber ?? generateReportNumber(report._id),
  }
}

async function getAssignedReportDoc(
  ctx: Parameters<typeof assertRescuer>[0],
  reportId: Id<'reports'>,
  rescuerEmail: string,
) {
  const email = normalizeEmail(rescuerEmail)
  const doc = await ctx.db.get('reports', reportId)
  if (!doc) {
    throw new Error('Report not found.')
  }
  if (normalizeEmail(doc.assignedRescuerEmail ?? '') !== email) {
    throw new Error('Report not assigned to you.')
  }
  return doc
}

async function enrichReport(
  ctx: Parameters<typeof assertRescuer>[0],
  report: Awaited<ReturnType<typeof getAssignedReportDoc>>,
) {
  const reporter = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', normalizeEmail(report.userEmail)))
    .unique()

  let assignedRescuerName: string | undefined
  if (report.assignedRescuerEmail) {
    const rescuer = await getRescuerByEmail(ctx, report.assignedRescuerEmail)
    if (rescuer) {
      assignedRescuerName = `${rescuer.firstName} ${rescuer.lastName}`.trim()
    }
  }

  const resolved = await withResolvedReportPhotos(ctx, report)
  return {
    ...normalizeReportRow(resolved),
    reporterFirstName: reporter?.firstName ?? 'Unknown',
    reporterLastName: reporter?.lastName ?? '',
    assignedRescuerName,
  }
}

export const isRescuer = query({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => isRescuerEmail(ctx, args.email),
})

export const getRescuerForLogin = query({
  args: { email: v.string() },
  returns: v.union(v.null(), rescuerProfileValidator),
  handler: async (ctx, args) => {
    const rescuer = await getRescuerByEmail(ctx, args.email)
    if (!rescuer) return null
    
    return {
      email: rescuer.email,
      firstName: rescuer.firstName,
      lastName: rescuer.lastName,
      contactPhone: rescuer.contactPhone ?? '',
      password: rescuer.password,
    }
  },
})

export const getProfile = query({
  args: { rescuerEmail: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      contactPhone: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    const rescuer = await getRescuerByEmail(ctx, args.rescuerEmail)
    if (!rescuer) return null
    return {
      email: rescuer.email,
      firstName: rescuer.firstName,
      lastName: rescuer.lastName,
      contactPhone: rescuer.contactPhone ?? '',
      createdAt: rescuer.createdAt,
    }
  },
})

export const updateProfile = mutation({
  args: {
    rescuerEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.string(),
  },
  returns: rescuerProfileValidator,
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    const rescuer = await getRescuerByEmail(ctx, args.rescuerEmail)
    if (!rescuer) throw new Error('Rescuer not found.')

    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const contactPhone = normalizeContactPhone(args.contactPhone)
    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    await ctx.db.patch(rescuer._id, { firstName, lastName, contactPhone })

    const email = normalizeEmail(rescuer.email)
    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, { firstName, lastName, role: 'rescuer', contactPhone })
    }

    return {
      email,
      firstName,
      lastName,
      contactPhone,
    }
  },
})

export const listRescuers = query({
  args: { adminEmail: v.string() },
  returns: v.array(
    v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      contactPhone: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const rescuers = await ctx.db.query('rescuers').collect()
    return rescuers
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((rescuer) => ({
        email: rescuer.email,
        firstName: rescuer.firstName,
        lastName: rescuer.lastName,
        contactPhone: rescuer.contactPhone ?? '',
        createdAt: rescuer.createdAt,
      }))
  },
})

export const addRescuer = mutation({
  args: {
    adminEmail: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.string(),
    password: v.string(),
  },
  returns: rescuerProfileValidator,
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const email = normalizeEmail(args.email)
    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const contactPhone = normalizeContactPhone(args.contactPhone)
    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    const existing = await getRescuerByEmail(ctx, email)
    if (existing) {
      throw new Error('A rescuer with this email already exists.')
    }

    await ctx.db.insert('rescuers', {
      email,
      firstName,
      lastName,
      contactPhone,
      password: args.password,
      createdAt: Date.now(),
    })

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, {
        firstName,
        lastName,
        password: args.password,
        role: 'rescuer',
        contactPhone,
      })
    }

    return {
      email,
      firstName,
      lastName,
      contactPhone,
      password: args.password,
    }
  },
})

export const updateRescuer = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.string(),
    password: v.optional(v.string()), // 👈 Added optional password argument
  },
  returns: rescuerProfileValidator,
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const targetEmail = normalizeEmail(args.targetEmail)
    const target = await getRescuerByEmail(ctx, targetEmail)
    if (!target) {
      throw new Error('Rescuer not found.')
    }

    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const contactPhone = normalizeContactPhone(args.contactPhone)
    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    // Build the patch object dynamically so we only update the password if it's passed in
    const patchData: { firstName: string; lastName: string; contactPhone: string; password?: string } = { 
      firstName, 
      lastName, 
      contactPhone 
    }
    
    if (args.password) {
      patchData.password = args.password
    }

    // Patch the rescuer table
    await ctx.db.patch(target._id, patchData)

    // Patch the users table
    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', targetEmail))
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, { ...patchData, role: 'rescuer' })
    }

    return { 
      email: targetEmail, 
      firstName, 
      lastName, 
      contactPhone,
      password: args.password 
    }
  },
})

export const removeRescuer = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const targetEmail = normalizeEmail(args.targetEmail)
    const target = await getRescuerByEmail(ctx, targetEmail)
    if (!target) {
      throw new Error('Rescuer not found.')
    }

    await ctx.db.delete(target._id)

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', targetEmail))
      .unique()

if (userRow) {
  await ctx.db.delete(userRow._id)
}

    return null
  },
})

export const ensureRescuerAccount = mutation({
  args: { rescuerEmail: v.string() },
  returns: rescuerProfileValidator,
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.rescuerEmail)
    const rescuer = await getRescuerByEmail(ctx, email)
    if (!rescuer) {
      throw new Error('Rescuer not found.')
    }

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    const contactPhone = rescuer.contactPhone ?? ''

    if (userRow) {
      await ctx.db.patch(userRow._id, {
        firstName: rescuer.firstName,
        lastName: rescuer.lastName,
        role: 'rescuer',
        ...(contactPhone ? { contactPhone } : {}),
      })
    } else {
      await ctx.db.insert('users', {
        email,
        firstName: rescuer.firstName,
        lastName: rescuer.lastName,
        role: 'rescuer',
        ...(contactPhone ? { contactPhone } : {}),
        createdAt: Date.now(),
      })
    }

    return {
      email: rescuer.email,
      firstName: rescuer.firstName,
      lastName: rescuer.lastName,
      contactPhone,
    }
  },
})

async function listReportsForRescuer(
  ctx: Parameters<typeof assertRescuer>[0],
  rescuerEmail: string,
  filter: 'active' | 'completed',
) {
  const email = normalizeEmail(rescuerEmail)
  const reports = await ctx.db
    .query('reports')
    .withIndex('by_assigned_rescuer', (q) => q.eq('assignedRescuerEmail', email))
    .collect()

  const filtered = reports.filter((r) => {
    const status = normalizeReportStatus(r.status)
    return filter === 'active'
      ? isActiveDispatchStatus(status)
      : isTerminalStatus(status)
  })

  const enriched = await Promise.all(filtered.map((report) => enrichReport(ctx, report)))
  return enriched.sort((a, b) => b.createdAt - a.createdAt)
}

export const listAssignedReports = query({
  args: { rescuerEmail: v.string() },
  returns: v.array(rescuerReportValidator),
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    return await listReportsForRescuer(ctx, args.rescuerEmail, 'active')
  },
})

export const listCompletedReports = query({
  args: { rescuerEmail: v.string() },
  returns: v.array(rescuerReportValidator),
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    return await listReportsForRescuer(ctx, args.rescuerEmail, 'completed')
  },
})

export const getAssignedReport = query({
  args: {
    rescuerEmail: v.string(),
    reportId: v.id('reports'),
  },
  returns: v.union(v.null(), rescuerReportValidator),
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    try {
      const doc = await getAssignedReportDoc(ctx, args.reportId, args.rescuerEmail)
      return await enrichReport(ctx, doc)
    } catch {
      return null
    }
  },
})

export const markEnRoute = mutation({
  args: {
    rescuerEmail: v.string(),
    reportId: v.id('reports'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    const doc = await getAssignedReportDoc(ctx, args.reportId, args.rescuerEmail)
    const status = normalizeReportStatus(doc.status)

    if (status !== 'accepted') {
      throw new Error('Report must be accepted before marking en route.')
    }

    await ctx.db.patch(args.reportId, { status: 'en_route' satisfies ReportStatus })
    return null
  },
})

export const completeRescue = mutation({
  args: {
    rescuerEmail: v.string(),
    reportId: v.id('reports'),
    outcome: v.union(v.literal('rescue_success'), v.literal('rescue_failed')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertRescuer(ctx, args.rescuerEmail)
    const doc = await getAssignedReportDoc(ctx, args.reportId, args.rescuerEmail)
    const status = normalizeReportStatus(doc.status)

    if (status !== 'en_route') {
      throw new Error('Report must be en route before completing rescue.')
    }

    await ctx.db.patch(args.reportId, { status: args.outcome })
    return null
  },
})

export const resetRescuerPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)

    const rescuer = await getRescuerByEmail(ctx, email)

    if (!rescuer) {
      throw new Error('Rescuer not found.')
    }

    await ctx.db.patch(rescuer._id, {
      password: args.newPassword,
    })

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) =>
        q.eq('email', email),
      )
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, {
        password: args.newPassword,
      })
    }

    return null
  },
})
