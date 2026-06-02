import type { MutationCtx, QueryCtx } from '../_generated/server'
import { DEFAULT_ADMIN, normalizeEmail } from './admins'

type Ctx = QueryCtx | MutationCtx

export async function getAdminByEmail(ctx: Ctx, email: string) {
  const normalized = normalizeEmail(email)
  return await ctx.db
    .query('admins')
    .withIndex('by_email', (q) => q.eq('email', normalized))
    .unique()
}

export async function isAdminEmail(ctx: Ctx, email: string) {
  const admin = await getAdminByEmail(ctx, email)
  return admin !== null
}

export async function assertAdmin(ctx: Ctx, adminEmail: string) {
  if (!(await isAdminEmail(ctx, adminEmail))) {
    throw new Error('Unauthorized')
  }
}

export async function seedDefaultAdmin(ctx: MutationCtx) {
  const email = normalizeEmail(DEFAULT_ADMIN.email)
  const existing = await getAdminByEmail(ctx, email)

  if (existing) {
    if (
      existing.firstName !== DEFAULT_ADMIN.firstName ||
      existing.lastName !== DEFAULT_ADMIN.lastName
    ) {
      await ctx.db.patch(existing._id, {
        firstName: DEFAULT_ADMIN.firstName,
        lastName: DEFAULT_ADMIN.lastName,
      })
    }
    return existing
  }

  return await ctx.db.insert('admins', {
    email,
    firstName: DEFAULT_ADMIN.firstName,
    lastName: DEFAULT_ADMIN.lastName,
    createdAt: Date.now(),
  })
}
