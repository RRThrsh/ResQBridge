import type { MutationCtx, QueryCtx } from '../_generated/server'
import { normalizeEmail } from './admins'

type Ctx = QueryCtx | MutationCtx

export async function getRescuerByEmail(ctx: Ctx, email: string) {
  const normalized = normalizeEmail(email)
  return await ctx.db
    .query('rescuers')
    .withIndex('by_email', (q) => q.eq('email', normalized))
    .unique()
}

export async function isRescuerEmail(ctx: Ctx, email: string) {
  const rescuer = await getRescuerByEmail(ctx, email)
  return rescuer !== null
}

export async function assertRescuer(ctx: Ctx, rescuerEmail: string) {
  if (!(await isRescuerEmail(ctx, rescuerEmail))) {
    throw new Error('Unauthorized')
  }
}
