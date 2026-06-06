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
    const patch: Record<string, unknown> = {}
    if (existing.firstName !== DEFAULT_ADMIN.firstName) patch.firstName = DEFAULT_ADMIN.firstName
    if (existing.lastName !== DEFAULT_ADMIN.lastName) patch.lastName = DEFAULT_ADMIN.lastName
    if (!existing.password) patch.password = DEFAULT_ADMIN.password
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch)
    }
    return existing
  }

  return await ctx.db.insert('admins', {
    email,
    firstName: DEFAULT_ADMIN.firstName,
    lastName: DEFAULT_ADMIN.lastName,
    password: DEFAULT_ADMIN.password,
    createdAt: Date.now(),
  })
}
