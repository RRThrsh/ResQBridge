import { internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { generateReportNumber, normalizeReportStatus } from './lib/reportStatus'

export const backfillReportDispatch = internalMutation({
  args: {},
  returns: v.object({
    migrated: v.number(),
  }),
  handler: async (ctx) => {
    const reports = await ctx.db.query('reports').collect()
    let migrated = 0

    for (const report of reports) {
      const patch: Record<string, unknown> = {}
      const normalizedStatus = normalizeReportStatus(report.status)

      if (report.status !== normalizedStatus) {
        patch.status = normalizedStatus
      }

      if (!report.reportNumber) {
        patch.reportNumber = generateReportNumber(report._id)
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(report._id, patch)
        migrated += 1
      }
    }

    return { migrated }
  },
})
