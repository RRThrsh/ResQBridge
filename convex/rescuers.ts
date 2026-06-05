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
import {
  assertRescuer,
  getRescuerByEmail,
  isRescuerEmail,
} from './lib/rescuerAccess'

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
  reporterFirstName: v.string(),
  reporterLastName: v.string(),
  assignedRescuerName: v.optional(v.string()),
})

function normalizeReportRow<
  T extends {
    status: string
    reportNumber?: string
    _id: Id<'reports'>
  },
>(report: T) {
  return {
    ...report,
    status: normalizeReportStatus(
      report.status,
    ),
    reportNumber:
      report.reportNumber ??
      generateReportNumber(
        report._id,
      ),
  }
}

async function getAssignedReportDoc(
  ctx: Parameters<
    typeof assertRescuer
  >[0],
  reportId: Id<'reports'>,
  rescuerEmail: string,
) {
  const email =
    normalizeEmail(rescuerEmail)

  const doc = await ctx.db.get(
    reportId,
  )

  if (!doc) {
    throw new Error(
      'Report not found.',
    )
  }

  if (
    normalizeEmail(
      doc.assignedRescuerEmail ??
        '',
    ) !== email
  ) {
    throw new Error(
      'Report not assigned to you.',
    )
  }

  return doc
}

async function enrichReport(
  ctx: Parameters<
    typeof assertRescuer
  >[0],
  report: Awaited<
    ReturnType<
      typeof getAssignedReportDoc
    >
  >,
) {
  const reporter = await ctx.db
    .query('users')
    .withIndex(
      'by_email',
      (q) =>
        q.eq(
          'email',
          normalizeEmail(
            report.userEmail,
          ),
        ),
    )
    .unique()

  let assignedRescuerName:
    | string
    | undefined

  if (report.assignedRescuerEmail) {
    const rescuer =
      await getRescuerByEmail(
        ctx,
        report.assignedRescuerEmail,
      )

    if (rescuer) {
      assignedRescuerName =
        `${rescuer.firstName} ${rescuer.lastName}`.trim()
    }
  }

  const resolved =
    await withResolvedReportPhotos(
      ctx,
      report,
    )

  return {
    ...normalizeReportRow(
      resolved,
    ),
    reporterFirstName:
      reporter?.firstName ??
      'Unknown',
    reporterLastName:
      reporter?.lastName ?? '',
    assignedRescuerName,
  }
}

export const isRescuer = query({
  args: {
    email: v.string(),
  },

  returns: v.boolean(),

  handler: async (ctx, args) =>
    isRescuerEmail(
      ctx,
      args.email,
    ),
})

export const getRescuerForLogin =
  query({
    args: {
      email: v.string(),
    },

    returns: v.union(
      v.null(),
      rescuerProfileValidator,
    ),

    handler: async (
      ctx,
      args,
    ) => {
      const rescuer =
        await getRescuerByEmail(
          ctx,
          args.email,
        )

      if (!rescuer) return null

      return {
        email: rescuer.email,
        firstName:
          rescuer.firstName,
        lastName:
          rescuer.lastName,
        contactPhone:
          rescuer.contactPhone ??
          '',
        password:
          rescuer.password,
      }
    },
  })

export const getProfile = query({
  args: {
    rescuerEmail: v.string(),
  },

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

  handler: async (
    ctx,
    args,
  ) => {
    await assertRescuer(
      ctx,
      args.rescuerEmail,
    )

    const rescuer =
      await getRescuerByEmail(
        ctx,
        args.rescuerEmail,
      )

    if (!rescuer) return null

    return {
      email: rescuer.email,
      firstName:
        rescuer.firstName,
      lastName:
        rescuer.lastName,
      contactPhone:
        rescuer.contactPhone ??
        '',
      createdAt:
        rescuer.createdAt,
    }
  },
})

export const updateProfile =
  mutation({
    args: {
      rescuerEmail:
        v.string(),
      firstName: v.string(),
      lastName: v.string(),
      contactPhone:
        v.string(),
    },

    returns:
      rescuerProfileValidator,

    handler: async (
      ctx,
      args,
    ) => {
      await assertRescuer(
        ctx,
        args.rescuerEmail,
      )

      const rescuer =
        await getRescuerByEmail(
          ctx,
          args.rescuerEmail,
        )

      if (!rescuer) {
        throw new Error(
          'Rescuer not found.',
        )
      }

      const firstName =
        args.firstName.trim()

      const lastName =
        args.lastName.trim()

      const contactPhone =
        normalizeContactPhone(
          args.contactPhone,
        )

      if (
        !firstName ||
        !lastName
      ) {
        throw new Error(
          'First and last name are required.',
        )
      }

      await ctx.db.patch(
        rescuer._id,
        {
          firstName,
          lastName,
          contactPhone,
        },
      )

      const email =
        normalizeEmail(
          rescuer.email,
        )

      const userRow =
        await ctx.db
          .query('users')
          .withIndex(
            'by_email',
            (q) =>
              q.eq(
                'email',
                email,
              ),
          )
          .unique()

      if (userRow) {
        await ctx.db.patch(
          userRow._id,
          {
            firstName,
            lastName,
            role: 'rescuer',
            contactPhone,
          },
        )
      }

      return {
        email,
        firstName,
        lastName,
        contactPhone,
      }
    },
  })

export const listRescuers =
  query({
    args: {
      adminEmail:
        v.string(),
    },

    returns: v.array(
      v.object({
        email: v.string(),
        firstName:
          v.string(),
        lastName:
          v.string(),
        contactPhone:
          v.string(),
        createdAt:
          v.number(),
      }),
    ),

    handler: async (
      ctx,
      args,
    ) => {
      await assertAdmin(
        ctx,
        args.adminEmail,
      )

      const rescuers =
        await ctx.db
          .query('rescuers')
          .collect()

      return rescuers
        .sort(
          (a, b) =>
            b.createdAt -
            a.createdAt,
        )
        .map((rescuer) => ({
          email:
            rescuer.email,
          firstName:
            rescuer.firstName,
          lastName:
            rescuer.lastName,
          contactPhone:
            rescuer.contactPhone ??
            '',
          createdAt:
            rescuer.createdAt,
        }))
    },
  })

export const addRescuer =
  mutation({
    args: {
      adminEmail:
        v.string(),
      email: v.string(),
      firstName:
        v.string(),
      lastName:
        v.string(),
      contactPhone:
        v.string(),
      password:
        v.string(),
    },

    returns:
      rescuerProfileValidator,

    handler: async (
      ctx,
      args,
    ) => {
      await assertAdmin(
        ctx,
        args.adminEmail,
      )

      const email =
        normalizeEmail(
          args.email,
        )

      const firstName =
        args.firstName.trim()

      const lastName =
        args.lastName.trim()

      const contactPhone =
        normalizeContactPhone(
          args.contactPhone,
        )

      if (
        !firstName ||
        !lastName
      ) {
        throw new Error(
          'First and last name are required.',
        )
      }

      const existing =
        await getRescuerByEmail(
          ctx,
          email,
        )

      if (existing) {
        throw new Error(
          'A rescuer with this email already exists.',
        )
      }

      await ctx.db.insert(
        'rescuers',
        {
          email,
          firstName,
          lastName,
          contactPhone,
          password:
            args.password,
          createdAt:
            Date.now(),
        },
      )

      const userRow =
        await ctx.db
          .query('users')
          .withIndex(
            'by_email',
            (q) =>
              q.eq(
                'email',
                email,
              ),
          )
          .unique()

      if (userRow) {
        await ctx.db.patch(
          userRow._id,
          {
            firstName,
            lastName,
            role: 'rescuer',
            contactPhone,
            password:
              args.password,
          },
        )
      } else {
        await ctx.db.insert(
          'users',
          {
            email,
            firstName,
            lastName,
            role: 'rescuer',
            contactPhone,
            password:
              args.password,
            createdAt:
              Date.now(),
          },
        )
      }

      return {
        email,
        firstName,
        lastName,
        contactPhone,
        password:
          args.password,
      }
    },
  })

export const resetRescuerPassword =
  mutation({
    args: {
      email: v.string(),
      newPassword:
        v.string(),
    },

    returns: v.null(),

    handler: async (
      ctx,
      args,
    ) => {
      const email =
        normalizeEmail(
          args.email,
        )

      const rescuer =
        await getRescuerByEmail(
          ctx,
          email,
        )

      if (!rescuer) {
        throw new Error(
          'Rescuer not found.',
        )
      }

      await ctx.db.patch(
        rescuer._id,
        {
          password:
            args.newPassword,
        },
      )

      const userRow =
        await ctx.db
          .query('users')
          .withIndex(
            'by_email',
            (q) =>
              q.eq(
                'email',
                email,
              ),
          )
          .unique()

      if (userRow) {
        await ctx.db.patch(
          userRow._id,
          {
            password:
              args.newPassword,
          },
        )
      }

      return null
    },
  })
