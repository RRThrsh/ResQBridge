import type { MutationCtx, QueryCtx } from '../../../convex/_generated/server'
import {
  assertRescuer,
  getRescuerByEmail,
  isRescuerEmail,
} from '../../../convex/lib/rescuerAccess'
import { normalizeReportStatus } from '../../../convex/lib/reportStatus'
import { createMockConvexCtx } from '../../helpers/mockConvexCtx'

function asQueryCtx(ctx: ReturnType<typeof createMockConvexCtx>['ctx']) {
  return ctx as unknown as QueryCtx
}

function asMutationCtx(ctx: ReturnType<typeof createMockConvexCtx>['ctx']) {
  return ctx as unknown as MutationCtx
}

describe('Convex rescuerAccess integration', () => {
  it('getRescuerByEmail normalizes lookup email', async () => {
    const { ctx } = createMockConvexCtx([], {
      rescuers: [
        {
          email: 'rescuer@example.com',
          firstName: 'R',
          lastName: 'One',
          createdAt: 1,
        },
      ],
    })

    const rescuer = await getRescuerByEmail(asQueryCtx(ctx), '  RESCUER@example.com  ')
    expect(rescuer?.firstName).toBe('R')
  })

  it('isRescuerEmail returns false for unknown emails', async () => {
    const { ctx } = createMockConvexCtx()
    expect(await isRescuerEmail(asQueryCtx(ctx), 'unknown@example.com')).toBe(false)
  })

  it('assertRescuer throws for non-rescuer', async () => {
    const { ctx } = createMockConvexCtx()
    await expect(assertRescuer(asQueryCtx(ctx), 'not-rescuer@example.com')).rejects.toThrow(
      'Unauthorized',
    )
  })
})

describe('report status normalization', () => {
  it('maps legacy open and resolved statuses', () => {
    expect(normalizeReportStatus('open')).toBe('pending')
    expect(normalizeReportStatus('resolved')).toBe('rescue_success')
    expect(normalizeReportStatus('accepted')).toBe('accepted')
  })
})

describe('rescuer authorization with mock data', () => {
  it('assertRescuer passes for registered rescuer email', async () => {
    const { ctx } = createMockConvexCtx([], {
      rescuers: [
        {
          email: 'rescuer@example.com',
          firstName: 'Rescue',
          lastName: 'Team',
          createdAt: 1,
        },
      ],
    })

    await expect(assertRescuer(asMutationCtx(ctx), 'rescuer@example.com')).resolves.toBeUndefined()
  })
})
