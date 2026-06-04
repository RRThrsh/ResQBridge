import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

export const REPORT_STATUSES = [
  'pending',
  'accepted',
  'en_route',
  'rescue_success',
  'rescue_failed',
  'published', // <-- Added
  'rejected',  // <-- Added
] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const LEGACY_REPORT_STATUSES = ['open', 'resolved'] as const
export type LegacyReportStatus = (typeof LEGACY_REPORT_STATUSES)[number]

export const reportStatusValidator = v.union(
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('en_route'),
  v.literal('rescue_success'),
  v.literal('rescue_failed'),
  v.literal('published'), // <-- Added
  v.literal('rejected'),  // <-- Added
)

/** Schema validator during migration (legacy + new). */
export const reportStatusSchemaValidator = v.union(
  v.literal('open'),
  v.literal('resolved'),
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('en_route'),
  v.literal('rescue_success'),
  v.literal('rescue_failed'),
  v.literal('published'), // <-- Added
  v.literal('rejected'),  // <-- Added
)

export function normalizeReportStatus(
  status: ReportStatus | LegacyReportStatus | string,
): ReportStatus {
  if (status === 'open') return 'pending'
  if (status === 'resolved') return 'rescue_success'
  if ((REPORT_STATUSES as readonly string[]).includes(status)) {
    return status as ReportStatus
  }
  return 'pending'
}

export function generateReportNumber(id: Id<'reports'>): string {
  const raw = id.replace(/[^a-z0-9]/gi, '')
  const suffix = raw.slice(-6).toUpperCase() || '000000'
  return `PWRCC-${suffix}`
}

export function isTerminalStatus(status: ReportStatus): boolean {
  return status === 'rescue_success' || status === 'rescue_failed' || status === 'published' || status === 'rejected'
}

export function isTerminalStatusValue(status: string): boolean {
  return isTerminalStatus(normalizeReportStatus(status))
}

export function isActiveDispatchStatus(status: ReportStatus): boolean {
  return status === 'accepted' || status === 'en_route'
}
