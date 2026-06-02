import type { MutationCtx, QueryCtx } from '../../../convex/_generated/server'
import {
  assertAdmin,
  getAdminByEmail,
  isAdminEmail,
  seedDefaultAdmin,
} from '../../../convex/lib/adminAccess'
import { DEFAULT_ADMIN } from '../../../convex/lib/admins'
import { createMockConvexCtx } from '../../helpers/mockConvexCtx'

function asQueryCtx(ctx: ReturnType<typeof createMockConvexCtx>['ctx']) {
  return ctx as unknown as QueryCtx
}

function asMutationCtx(ctx: ReturnType<typeof createMockConvexCtx>['ctx']) {
  return ctx as unknown as MutationCtx
}

describe('Convex adminAccess integration', () => {
  it('getAdminByEmail normalizes lookup email', async () => {
    const { ctx } = createMockConvexCtx([
      {
        email: DEFAULT_ADMIN.email.toLowerCase(),
        firstName: 'A',
        lastName: 'B',
        createdAt: 1,
      },
    ])

    const admin = await getAdminByEmail(asQueryCtx(ctx), `  ${DEFAULT_ADMIN.email.toUpperCase()}  `)
    expect(admin?.firstName).toBe('A')
  })

  it('isAdminEmail returns false for unknown emails', async () => {
    const { ctx } = createMockConvexCtx()
    expect(await isAdminEmail(asQueryCtx(ctx), 'unknown@example.com')).toBe(false)
  })

  it('assertAdmin throws for non-admin', async () => {
    const { ctx } = createMockConvexCtx()
    await expect(assertAdmin(asQueryCtx(ctx), 'not-admin@example.com')).rejects.toThrow(
      'Unauthorized',
    )
  })

  it('seedDefaultAdmin inserts default admin when missing', async () => {
    const { ctx, admins } = createMockConvexCtx()
    await seedDefaultAdmin(asMutationCtx(ctx))

    expect(admins).toHaveLength(1)
    expect(admins[0]).toMatchObject({
      email: DEFAULT_ADMIN.email.toLowerCase(),
      firstName: DEFAULT_ADMIN.firstName,
      lastName: DEFAULT_ADMIN.lastName,
    })
  })

  it('seedDefaultAdmin patches name when default admin exists with stale names', async () => {
    const { ctx, admins } = createMockConvexCtx([
      {
        email: DEFAULT_ADMIN.email.toLowerCase(),
        firstName: 'Old',
        lastName: 'Name',
        createdAt: 1,
      },
    ])

    await seedDefaultAdmin(asMutationCtx(ctx))

    expect(admins[0].firstName).toBe(DEFAULT_ADMIN.firstName)
    expect(admins[0].lastName).toBe(DEFAULT_ADMIN.lastName)
  })
})
