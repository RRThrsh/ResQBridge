import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { reportCreateOptionalFields, reportDocValidator } from './lib/reportFields'
import {
  normalizeReportPhotos,
  photoFieldsFromNormalized,
  withResolvedReportPhotos,
} from './lib/reportPhotos'
import {
  publicDomesticReportValidator,
  toPublicDomesticReport,
} from './lib/domesticPublic'
import {
  generateReportNumber,
  isTerminalStatus,
  normalizeReportStatus,
  reportStatusValidator,
} from './lib/reportStatus'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function resolveReporterPhone(
  ctx: MutationCtx,
  userEmail: string,
  reporterPhone?: string,
) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', userEmail))
    .unique()

  // 🚨 THE GUARD: If the admin deleted them, throw an error instantly!
  if (!user) {
    throw new Error('Unauthorized: Your account has been deleted or does not exist.')
  }

  const fromProfile = user.contactPhone?.trim()
  if (fromProfile) {
    return fromProfile
  }

  const fromInput = reporterPhone?.trim()
  if (!fromInput) {
    throw new Error('Contact number is required to submit a report.')
  }

  // We no longer need `if (user)` because our guard above guarantees the user exists!
  await ctx.db.patch(user._id, { contactPhone: fromInput })

  return fromInput
}

async function getOwnedReport(
  ctx: QueryCtx | MutationCtx,
  reportId: Id<'reports'>,
  userEmail: string,
) {
  const doc = await ctx.db.get('reports', reportId)
  if (!doc || normalizeEmail(doc.userEmail) !== normalizeEmail(userEmail)) {
    throw new Error('Report not found.')
  }
  return doc
}

export const listPublicDomestic = query({
  args: {},
  returns: v.array(publicDomesticReportValidator),
  handler: async (ctx) => {
    const rows = await ctx.db.query('reports').collect()
    const domestic = rows
      .filter((row) => row.category === 'domestic')
      .sort((a, b) => b.createdAt - a.createdAt)

    return Promise.all(domestic.map((row) => toPublicDomesticReport(ctx, row)))
  },
})

export const listByUserEmail = query({
  args: { userEmail: v.string() },
  returns: v.array(reportDocValidator),
  handler: async (ctx, args) => {
    const userEmail = normalizeEmail(args.userEmail)
    const rows = await ctx.db
      .query('reports')
      .withIndex('by_user_email', (q) => q.eq('userEmail', userEmail))
      .collect()

    const sorted = rows.sort((a, b) => b.createdAt - a.createdAt)
    return Promise.all(sorted.map((row) => withResolvedReportPhotos(ctx, row)))
  },
})

export const create = mutation({
  args: {
    userEmail: v.string(),
    category: v.union(v.literal('wildlife'), v.literal('domestic')),
    type: v.string(),
    animalName: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    speciesId: v.optional(v.string()),
    condition: v.optional(v.string()),
    photoStorageIds: v.optional(v.array(v.id('_storage'))),
    photoDataUrls: v.optional(v.array(v.string())),
    photoDataUrl: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    ...reportCreateOptionalFields,
  },
  returns: v.id('reports'),
  handler: async (ctx, args) => {
    const userEmail = normalizeEmail(args.userEmail)
    const photos = await normalizeReportPhotos(ctx, {
      photoStorageIds: args.photoStorageIds,
      photoDataUrls: args.photoDataUrls,
      photoDataUrl: args.photoDataUrl,
    })

    const reporterPhone = await resolveReporterPhone(ctx, userEmail, args.reporterPhone)

    const reportId = await ctx.db.insert('reports', {
      userEmail,
      category: args.category,
      type: args.type,
      animalName: args.animalName.trim(),
      location: args.location.trim(),
      description: args.description?.trim() || undefined,
      speciesId: args.speciesId || undefined,
      condition: args.condition || undefined,
      behavior: args.behavior?.trim() || undefined,
      ...photoFieldsFromNormalized(photos),
      latitude: args.latitude,
      longitude: args.longitude,
      seenAt: args.seenAt,
      quantity: args.quantity,
      reportedSize: args.reportedSize?.trim() || undefined,
      reporterPhone,
      status: 'pending',
      createdAt: Date.now(),
    })

    await ctx.db.patch(reportId, {
      reportNumber: generateReportNumber(reportId),
    })

    return reportId
  },
})

export const update = mutation({
  args: {
    reportId: v.id('reports'),
    userEmail: v.string(),
    animalName: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    status: reportStatusValidator,
    condition: v.optional(v.string()),
    behavior: v.optional(v.string()),
    seenAt: v.optional(v.number()),
    quantity: v.optional(v.number()),
    reportedSize: v.optional(v.string()),
    reporterPhone: v.optional(v.string()),
    photoStorageIds: v.optional(v.array(v.id('_storage'))),
    photoDataUrls: v.optional(v.array(v.string())),
    photoDataUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await getOwnedReport(ctx, args.reportId, args.userEmail)
    if (isTerminalStatus(normalizeReportStatus(existing.status))) {
      throw new Error('Completed reports cannot be edited.')
    }

    const photoPatch =
      args.photoStorageIds !== undefined ||
      args.photoDataUrls !== undefined ||
      args.photoDataUrl !== undefined
        ? photoFieldsFromNormalized(
            await normalizeReportPhotos(ctx, {
              photoStorageIds: args.photoStorageIds,
              photoDataUrls: args.photoDataUrls,
              photoDataUrl: args.photoDataUrl,
            }),
          )
        : {}

    await ctx.db.patch(args.reportId, {
      animalName: args.animalName.trim(),
      location: args.location.trim(),
      description: args.description?.trim() || undefined,
      type: args.type,
      status: args.status,
      condition: args.condition || undefined,
      behavior: args.behavior?.trim() || undefined,
      seenAt: args.seenAt,
      quantity: args.quantity,
      reportedSize: args.reportedSize?.trim() || undefined,
      reporterPhone: args.reporterPhone?.trim() || undefined,
      ...photoPatch,
    })
    return null
  },
})

export const remove = mutation({
  args: {
    reportId: v.id('reports'),
    userEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await getOwnedReport(ctx, args.reportId, args.userEmail)
    if (isTerminalStatus(normalizeReportStatus(existing.status))) {
      throw new Error('Completed reports cannot be deleted.')
    }
    await ctx.db.delete(args.reportId)
    return null
  },
})

// Add this to the bottom of convex/reports.ts
export const getReportById = query({
  args: {
    reportId: v.id('reports'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId)
  },
})
