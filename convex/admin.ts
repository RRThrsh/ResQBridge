import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { mutation, query, type MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import {
  assertAdmin,
  getAdminByEmail,
  isAdminEmail,
  seedDefaultAdmin,
} from './lib/adminAccess'
import { normalizeEmail } from './lib/admins'
import { reportDocValidator } from './lib/reportFields'
import { withResolvedReportPhotos } from './lib/reportPhotos'
import {
  generateReportNumber,
  isTerminalStatus,
  normalizeReportStatus,
} from './lib/reportStatus'
import { buildReportAnalytics } from './lib/reportAnalytics'
import { getRescuerByEmail } from './lib/rescuerAccess'

const userDocValidator = v.object({
  _id: v.id('users'),
  _creationTime: v.number(),
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
role: v.optional(
  v.union(
    v.literal('admin'),
    v.literal('user'),
    v.literal('rescuer'),
    v.literal('domestic_approver'),
  ),
),
  contactPhone: v.optional(v.string()),
  createdAt: v.number(),
})

const adminReportDocValidator = v.object({
  ...reportDocValidator.fields,
  reporterFirstName: v.string(),
  reporterLastName: v.string(),
  assignedRescuerName: v.optional(v.string()),
})

export const bootstrapAdmins = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await seedDefaultAdmin(ctx)
    await ctx.runMutation(internal.migrations.backfillReportDispatch, {})
    return null
  },
})

export const isAdmin = query({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => isAdminEmail(ctx, args.email),
})

export const getAdminForLogin = query({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      password: v.string(), 
    }),
  ),
  handler: async (ctx, args) => {
    const admin = await getAdminByEmail(ctx, args.email)
    if (!admin) return null
    return {
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      // ADD THIS LINE: safely return the password, or an empty string if it's an old account
      password: admin.password ?? "", 
    }
  },
})

export const getProfile = query({
  args: { adminEmail: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const admin = await getAdminByEmail(ctx, args.adminEmail)
    if (!admin) return null
    return {
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      createdAt: admin.createdAt,
    }
  },
})

export const updateProfile = mutation({
  args: {
    adminEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  returns: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  }),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const admin = await getAdminByEmail(ctx, args.adminEmail)
    if (!admin) throw new Error('Admin not found.')

    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    await ctx.db.patch(admin._id, { firstName, lastName })

    const email = normalizeEmail(admin.email)
    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, { firstName, lastName, role: 'admin' })
    }

    return { email, firstName, lastName }
  },
})

// UPDATE: Added password argument to fix TS2353
export const addAdmin = mutation({
  args: {
    adminEmail: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    password: v.string(), 
  },
  returns: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  }),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const email = normalizeEmail(args.email)
    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const password = args.password 

    if (!email.includes('@')) {
      throw new Error('Enter a valid email address.')
    }
    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    const existing = await getAdminByEmail(ctx, email)
    if (existing) {
      throw new Error('This email is already an admin.')
    }

    // UPDATE: Inserting password field
    await ctx.db.insert('admins', {
      email,
      firstName,
      lastName,
      password, 
      createdAt: Date.now(),
    })

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, { role: 'admin', firstName, lastName })
    }

    return { email, firstName, lastName }
  },
})

export const removeAdmin = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const targetEmail = normalizeEmail(args.targetEmail)
    const requesterEmail = normalizeEmail(args.adminEmail)

    if (targetEmail === requesterEmail) {
      throw new Error('You cannot remove your own admin access.')
    }

    const target = await getAdminByEmail(ctx, targetEmail)
    if (!target) {
      throw new Error('Admin not found.')
    }

    const allAdmins = await ctx.db.query('admins').collect()
    if (allAdmins.length <= 1) {
      throw new Error('At least one admin must remain.')
    }

    await ctx.db.delete(target._id)

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', targetEmail))
      .unique()

    if (userRow && userRow.role === 'admin') {
      await ctx.db.patch(userRow._id, { role: 'user' })
    }

    return null
  },
})

export const updateAdmin = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  returns: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  }),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const targetEmail = normalizeEmail(args.targetEmail)
    const target = await getAdminByEmail(ctx, targetEmail)
    if (!target) {
      throw new Error('Admin not found.')
    }

    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    await ctx.db.patch(target._id, { firstName, lastName })

    const userRow = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', targetEmail))
      .unique()

    if (userRow) {
      await ctx.db.patch(userRow._id, { firstName, lastName, role: 'admin' })
    }

    return { email: targetEmail, firstName, lastName }
  },
})

export const listAdmins = query({
  args: { adminEmail: v.string() },
  returns: v.array(
    v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const admins = await ctx.db.query('admins').collect()
    return admins
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((admin) => ({
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        createdAt: admin.createdAt,
      }))
  },
})
export const getAdminsForNotifications = query({
  args: {},

  returns: v.array(
    v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
    }),
  ),

  handler: async (ctx) => {
    const admins = await ctx.db.query('admins').collect()

    return admins.map((admin) => ({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    }))
  },
})
export const getStats = query({
  args: { adminEmail: v.string() },
  returns: v.object({
    totalUsers: v.number(),
    totalReports: v.number(),
    pendingReports: v.number(),
    activeDispatchReports: v.number(),
    completedReports: v.number(),
    wildlifeReports: v.number(),
    domesticReports: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const users = await ctx.db.query('users').collect()
    const reports = await ctx.db.query('reports').collect()

    return {
      totalUsers: users.length,
      totalReports: reports.length,
      pendingReports: reports.filter(
        (r) => normalizeReportStatus(r.status) === 'pending',
      ).length,
      activeDispatchReports: reports.filter((r) => {
        const status = normalizeReportStatus(r.status)
        return status === 'accepted' || status === 'en_route'
      }).length,
      completedReports: reports.filter((r) => {
        const status = normalizeReportStatus(r.status)
        return status === 'rescue_success' || status === 'rescue_failed'
      }).length,
      wildlifeReports: reports.filter((r) => r.category === 'wildlife').length,
      domesticReports: reports.filter((r) => r.category === 'domestic').length,
    }
  },
})

const analyticsDaysValidator = v.optional(
  v.union(v.literal(7), v.literal(30), v.literal(90), v.null()),
)

const reportAnalyticsSummaryValidator = v.object({
  totalUsers: v.number(),
  totalReports: v.number(),
  pendingReports: v.number(),
  activeDispatchReports: v.number(),
  completedReports: v.number(),
  wildlifeReports: v.number(),
  domesticReports: v.number(),
  totalRescuers: v.number(),
  unassignedPending: v.number(),
  reportsWithPhotos: v.number(),
  reportsWithGps: v.number(),
})

export const getReportAnalytics = query({
  args: {
    adminEmail: v.string(),
    days: analyticsDaysValidator,
  },
  returns: v.object({
    summary: reportAnalyticsSummaryValidator,
    reportsOverTime: v.array(
      v.object({
        date: v.string(),
        total: v.number(),
        wildlife: v.number(),
        domestic: v.number(),
      }),
    ),
    byStatus: v.array(
      v.object({
        status: v.union(
          v.literal('pending'),
          v.literal('accepted'),
          v.literal('en_route'),
          v.literal('rescue_success'),
          v.literal('rescue_failed'),
          v.literal('published'), 
          v.literal('rejected')   
        ),
        label: v.string(),
        count: v.number(),
      }),
    ),
    byCategory: v.array(
      v.object({
        category: v.union(v.literal('wildlife'), v.literal('domestic')),
        label: v.string(),
        count: v.number(),
      }),
    ),
    domesticByType: v.array(
      v.object({
        type: v.string(),
        label: v.string(),
        count: v.number(),
      }),
    ),
    wildlifeTopSpecies: v.array(
      v.object({
        name: v.string(),
        count: v.number(),
      }),
    ),
    wildlifeByCondition: v.array(
      v.object({
        condition: v.string(),
        label: v.string(),
        count: v.number(),
      }),
    ),
    rescuerWorkload: v.array(
      v.object({
        email: v.string(),
        name: v.string(),
        active: v.number(),
        completed: v.number(),
        total: v.number(),
      }),
    ),
    outcomes: v.object({
      success: v.number(),
      failed: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const [users, reports, rescuers] = await Promise.all([
      ctx.db.query('users').collect(),
      ctx.db.query('reports').collect(),
      ctx.db.query('rescuers').collect(),
    ])

    return buildReportAnalytics(
      reports,
      rescuers,
      users.length,
      args.days ?? null,
    )
  },
})

export const listUsers = query({
  args: { adminEmail: v.string() },
  returns: v.array(userDocValidator),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const users = await ctx.db.query('users').collect()
    return users.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const listReports = query({
  args: { adminEmail: v.string() },
  returns: v.array(adminReportDocValidator),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const [reports, users, rescuers] = await Promise.all([
      ctx.db.query('reports').collect(),
      ctx.db.query('users').collect(),
      ctx.db.query('rescuers').collect(),
    ])

    const usersByEmail = new Map(
      users.map((row) => [normalizeEmail(row.email), row]),
    )
    const rescuersByEmail = new Map(
      rescuers.map((row) => [normalizeEmail(row.email), row]),
    )

    const sorted = reports.sort((a, b) => b.createdAt - a.createdAt)
    return Promise.all(
      sorted.map(async (report) => {
        const reporter = usersByEmail.get(normalizeEmail(report.userEmail))
        const assigned = report.assignedRescuerEmail
          ? rescuersByEmail.get(normalizeEmail(report.assignedRescuerEmail))
          : undefined
        const resolved = await withResolvedReportPhotos(ctx, report)
        return {
          ...resolved,
          status: normalizeReportStatus(resolved.status),
          reportNumber: resolved.reportNumber ?? generateReportNumber(resolved._id),
          reporterFirstName: reporter?.firstName ?? 'Unknown',
          reporterLastName: reporter?.lastName ?? '',
          assignedRescuerName: assigned
            ? `${assigned.firstName} ${assigned.lastName}`.trim()
            : undefined,
        }
      }),
    )
  },
})

export const updateReport = mutation({
  args: {
    adminEmail: v.string(),
    reportId: v.id('reports'),
    animalName: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    condition: v.optional(v.string()),
    behavior: v.optional(v.string()),
    seenAt: v.optional(v.number()),
    quantity: v.optional(v.number()),
    reportedSize: v.optional(v.string()),
    reporterPhone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const doc = await ctx.db.get('reports', args.reportId)
    if (!doc) throw new Error('Report not found.')

    await ctx.db.patch(args.reportId, {
      animalName: args.animalName.trim(),
      location: args.location.trim(),
      description: args.description?.trim() || undefined,
      type: args.type,
      condition: args.condition || undefined,
      behavior: args.behavior || undefined,
      seenAt: args.seenAt,
      quantity: args.quantity,
      reportedSize: args.reportedSize?.trim() || undefined,
      reporterPhone: args.reporterPhone?.trim() || undefined,
    })
    return null
  },
})

async function assignRescuerToReportHandler(
  ctx: MutationCtx,
  args: { reportId: Id<'reports'>; rescuerEmail: string },
) {
  const doc = await ctx.db.get('reports', args.reportId)
  if (!doc) throw new Error('Report not found.')

  const status = normalizeReportStatus(doc.status)
  if (isTerminalStatus(status)) {
    throw new Error('Completed reports cannot be assigned to a rescuer.')
  }
  if (status !== 'pending' && status !== 'accepted' && status !== 'en_route') {
    throw new Error('This report cannot be assigned in its current status.')
  }

  const rescuerEmail = normalizeEmail(args.rescuerEmail)
  const rescuer = await getRescuerByEmail(ctx, rescuerEmail)
  if (!rescuer) {
    throw new Error('Rescuer not found.')
  }

  await ctx.db.patch(args.reportId, {
    ...(status === 'pending' ? { status: 'accepted' as const } : {}),
    assignedRescuerEmail: rescuerEmail,
  })

  // =========================
  // NOTIFY RESCUER
  // =========================
  await ctx.scheduler.runAfter(
    0,
    internal.notifications.notifyRescuer,
    {
      rescuerEmail: rescuer.email,
      rescuerPhone: rescuer.contactPhone ?? '',
      animalName: doc.animalName,
      location: doc.location,
      reportNumber: doc.reportNumber ?? '',
    }
  )
}

export const assignRescuerToReport = mutation({
  args: {
    adminEmail: v.string(),
    reportId: v.id('reports'),
    rescuerEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    await assignRescuerToReportHandler(ctx, {
      reportId: args.reportId,
      rescuerEmail: args.rescuerEmail,
    })
    return null
  },
})

export const acceptAndAssignReport = mutation({
  args: {
    adminEmail: v.string(),
    reportId: v.id('reports'),
    rescuerEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    await assignRescuerToReportHandler(ctx, {
      reportId: args.reportId,
      rescuerEmail: args.rescuerEmail,
    })
    return null
  },
})

export const reassignReport = mutation({
  args: {
    adminEmail: v.string(),
    reportId: v.id('reports'),
    rescuerEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    await assignRescuerToReportHandler(ctx, {
      reportId: args.reportId,
      rescuerEmail: args.rescuerEmail,
    })
    return null
  },
})

export const deleteReport = mutation({
  args: {
    adminEmail: v.string(),
    reportId: v.id('reports'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const doc = await ctx.db.get('reports', args.reportId)
    if (!doc) throw new Error('Report not found.')
    await ctx.db.delete(args.reportId)
    return null
  },
})

export const updateUser = mutation({
  args: {
    adminEmail: v.string(),
    userId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const target = await ctx.db.get('users', args.userId)
    if (!target) throw new Error('User not found.')

    await ctx.db.patch(args.userId, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
    })
    return null
  },
})

export const deleteUser = mutation({
  args: {
    adminEmail: v.string(),
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const target = await ctx.db.get('users', args.userId)
    if (!target) throw new Error('User not found.')

    const targetIsAdmin = await getAdminByEmail(ctx, target.email)
    if (targetIsAdmin) {
      throw new Error('Admin accounts cannot be deleted from the users table.')
    }

    if (normalizeEmail(target.email) === normalizeEmail(args.adminEmail)) {
      throw new Error('You cannot delete your own account.')
    }

    const reports = await ctx.db
      .query('reports')
      .withIndex('by_user_email', (q) => q.eq('userEmail', target.email))
      .collect()

    for (const report of reports) {
      await ctx.db.delete(report._id)
    }

    await ctx.db.delete(args.userId)
    return null
  },
})

export const ensureAdminAccount = mutation({
  args: { adminEmail: v.string() },
  returns: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.optional(
  v.union(
    v.literal('admin'),
    v.literal('user'),
    v.literal('rescuer'),
    v.literal('domestic_approver'),
  ),
),
  }),
  handler: async (ctx, args) => {
    await seedDefaultAdmin(ctx)
    const admin = await getAdminByEmail(ctx, args.adminEmail)
    if (!admin) {
      throw new Error('Unauthorized')
    }

    const email = normalizeEmail(admin.email)
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: 'admin',
        firstName: admin.firstName,
        lastName: admin.lastName,
      })
      return {
        email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'admin' as const,
      }
    }

    await ctx.db.insert('users', {
      email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: 'admin',
      createdAt: Date.now(),
    })

    return {
      email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: 'admin' as const,
    }
  },
})

export const changeAdminPassword = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const targetEmail = normalizeEmail(args.targetEmail)
    const target = await getAdminByEmail(ctx, targetEmail)
    
    if (!target) {
      throw new Error('Admin not found.')
    }

    // Treat an undefined password in the database as an empty string for comparison
    const storedPassword = target.password ?? ""
    if (storedPassword !== args.currentPassword) {
      throw new Error('Incorrect current password.')
    }

    if (args.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters.')
    }

    // Update the password
    await ctx.db.patch(target._id, { password: args.newPassword })

    return null
  },
})

export const resetAdminPasswordWithOtp = mutation({
  args: {
    adminEmail: v.string(),
    targetEmail: v.string(),
    otpCode: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const targetEmail = normalizeEmail(args.targetEmail)
    const target = await getAdminByEmail(ctx, targetEmail)
    
    if (!target) {
      throw new Error('Admin not found.')
    }

    // DEBUGGING: Log what we are looking for
    console.log(`Searching for OTP. Email: ${targetEmail}, Scope: admin, Code Typed: ${args.otpCode}`)

    const otpRecords = await ctx.db
      .query('verificationCodes')
      .withIndex('by_email_scope', (q) =>
        q.eq('email', targetEmail).eq('scope', 'admin')
      )
      .collect()

    // DEBUGGING: Log what we actually found in the database
    console.log("OTP Records found in database:", otpRecords)

    const validRecord = otpRecords.find(
      (r) => r.code === args.otpCode && r.expiresAt > Date.now()
    )

    if (!validRecord) {
      console.error("Match Failed! Either the code is wrong, expired, or doesn't exist.")
      // We use ConvexError here so the frontend can actually read the message!
      throw new Error('Invalid or expired verification code.')
    }

    await ctx.db.patch(target._id, { password: args.newPassword })
    await ctx.db.delete(validRecord._id)

    return null
  },
})
