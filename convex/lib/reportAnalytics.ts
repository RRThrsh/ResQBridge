import type { Doc } from '../_generated/dataModel'
import { normalizeEmail } from './admins'
import {
  isActiveDispatchStatus,
  isTerminalStatus,
  normalizeReportStatus,
  type ReportStatus,
} from './reportStatus'

export type AnalyticsDays = 7 | 30 | 90 | null

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  en_route: 'En route',
  rescue_success: 'Rescue success',
  rescue_failed: 'Rescue failed',
}

export const DOMESTIC_TYPE_LABELS: Record<string, string> = {
  missing: 'Missing',
  found: 'Found',
  stray: 'Stray',
  injured: 'Injured',
}

export const WILDLIFE_CONDITION_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  injured: 'Injured',
  trapped: 'Trapped',
  dead: 'Deceased',
}

type ReportRow = Doc<'reports'>
type RescuerRow = Doc<'rescuers'>

export type ReportAnalyticsSummary = {
  totalUsers: number
  totalReports: number
  pendingReports: number
  activeDispatchReports: number
  completedReports: number
  wildlifeReports: number
  domesticReports: number
  totalRescuers: number
  unassignedPending: number
  reportsWithPhotos: number
  reportsWithGps: number
}

export type ReportAnalyticsResult = {
  summary: ReportAnalyticsSummary
  reportsOverTime: Array<{
    date: string
    total: number
    wildlife: number
    domestic: number
  }>
  byStatus: Array<{ status: ReportStatus; label: string; count: number }>
  byCategory: Array<{ category: 'wildlife' | 'domestic'; label: string; count: number }>
  domesticByType: Array<{ type: string; label: string; count: number }>
  wildlifeTopSpecies: Array<{ name: string; count: number }>
  wildlifeByCondition: Array<{ condition: string; label: string; count: number }>
  rescuerWorkload: Array<{
    email: string
    name: string
    active: number
    completed: number
    total: number
  }>
  outcomes: { success: number; failed: number }
}

const MS_PER_DAY = 86_400_000

function utcDayKey(timestamp: number): string {
  const d = new Date(timestamp)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function reportHasPhotos(report: ReportRow): boolean {
  if (report.photoStorageIds?.length) return true
  if (report.photoDataUrl) return true
  if (report.photoDataUrls?.length) return true
  return false
}

function reportHasGps(report: ReportRow): boolean {
  return report.latitude != null && report.longitude != null
}

export function filterReportsByDays(
  reports: ReportRow[],
  days: AnalyticsDays,
  now = Date.now(),
): ReportRow[] {
  if (days === null) return reports
  const cutoff = now - days * MS_PER_DAY
  return reports.filter((r) => r.createdAt >= cutoff)
}

export function buildReportAnalytics(
  reports: ReportRow[],
  rescuers: RescuerRow[],
  userCount: number,
  days: AnalyticsDays,
  now = Date.now(),
): ReportAnalyticsResult {
  const filtered = filterReportsByDays(reports, days, now)

  const summary = buildSummary(filtered, rescuers.length, userCount)

  return {
    summary,
    reportsOverTime: buildReportsOverTime(filtered),
    byStatus: buildByStatus(filtered),
    byCategory: buildByCategory(filtered),
    domesticByType: buildDomesticByType(filtered),
    wildlifeTopSpecies: buildWildlifeTopSpecies(filtered),
    wildlifeByCondition: buildWildlifeByCondition(filtered),
    rescuerWorkload: buildRescuerWorkload(filtered, rescuers),
    outcomes: buildOutcomes(filtered),
  }
}

function buildSummary(
  reports: ReportRow[],
  totalRescuers: number,
  totalUsers: number,
): ReportAnalyticsSummary {
  let pendingReports = 0
  let activeDispatchReports = 0
  let completedReports = 0
  let wildlifeReports = 0
  let domesticReports = 0
  let unassignedPending = 0
  let reportsWithPhotos = 0
  let reportsWithGps = 0

  for (const r of reports) {
    const status = normalizeReportStatus(r.status)
    if (status === 'pending') {
      pendingReports++
      if (!r.assignedRescuerEmail) unassignedPending++
    }
    if (isActiveDispatchStatus(status)) activeDispatchReports++
    if (isTerminalStatus(status)) completedReports++
    if (r.category === 'wildlife') wildlifeReports++
    if (r.category === 'domestic') domesticReports++
    if (reportHasPhotos(r)) reportsWithPhotos++
    if (reportHasGps(r)) reportsWithGps++
  }

  return {
    totalUsers,
    totalReports: reports.length,
    pendingReports,
    activeDispatchReports,
    completedReports,
    wildlifeReports,
    domesticReports,
    totalRescuers,
    unassignedPending,
    reportsWithPhotos,
    reportsWithGps,
  }
}

function buildReportsOverTime(reports: ReportRow[]) {
  const buckets = new Map<string, { total: number; wildlife: number; domestic: number }>()

  for (const r of reports) {
    const key = utcDayKey(r.createdAt)
    const row = buckets.get(key) ?? { total: 0, wildlife: 0, domestic: 0 }
    row.total++
    if (r.category === 'wildlife') row.wildlife++
    else row.domestic++
    buckets.set(key, row)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))
}

function buildByStatus(reports: ReportRow[]) {
  const counts = new Map<ReportStatus, number>()
  for (const status of Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]) {
    counts.set(status, 0)
  }

  for (const r of reports) {
    const status = normalizeReportStatus(r.status)
    counts.set(status, (counts.get(status) ?? 0) + 1)
  }

  return (Object.keys(REPORT_STATUS_LABELS) as ReportStatus[])
    .map((status) => ({
      status,
      label: REPORT_STATUS_LABELS[status],
      count: counts.get(status) ?? 0,
    }))
    .filter((row) => row.count > 0)
}

function buildByCategory(reports: ReportRow[]) {
  let wildlife = 0
  let domestic = 0
  for (const r of reports) {
    if (r.category === 'wildlife') wildlife++
    else domestic++
  }
  const rows: ReportAnalyticsResult['byCategory'] = []
  if (wildlife > 0) rows.push({ category: 'wildlife', label: 'Wildlife', count: wildlife })
  if (domestic > 0) rows.push({ category: 'domestic', label: 'Domestic', count: domestic })
  return rows
}

function buildDomesticByType(reports: ReportRow[]) {
  const counts = new Map<string, number>()
  for (const r of reports) {
    if (r.category !== 'domestic') continue
    counts.set(r.type, (counts.get(r.type) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      label: DOMESTIC_TYPE_LABELS[type] ?? type,
      count,
    }))
}

function buildWildlifeTopSpecies(reports: ReportRow[], limit = 8) {
  const counts = new Map<string, { display: string; count: number }>()

  for (const r of reports) {
    if (r.category !== 'wildlife') continue
    const trimmed = r.animalName.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    const existing = counts.get(key)
    if (existing) {
      existing.count++
    } else {
      counts.set(key, { display: trimmed, count: 1 })
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ display, count }) => ({ name: display, count }))
}

function buildWildlifeByCondition(reports: ReportRow[]) {
  const counts = new Map<string, number>()
  for (const r of reports) {
    if (r.category !== 'wildlife' || !r.condition) continue
    counts.set(r.condition, (counts.get(r.condition) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([condition, count]) => ({
      condition,
      label: WILDLIFE_CONDITION_LABELS[condition] ?? condition,
      count,
    }))
}

function buildRescuerWorkload(reports: ReportRow[], rescuers: RescuerRow[]) {
  const rescuerNames = new Map(
    rescuers.map((r) => [
      normalizeEmail(r.email),
      `${r.firstName} ${r.lastName}`.trim() || r.email,
    ]),
  )

  const workload = new Map<
    string,
    { active: number; completed: number }
  >()

  for (const r of reports) {
    if (!r.assignedRescuerEmail) continue
    const email = normalizeEmail(r.assignedRescuerEmail)
    const row = workload.get(email) ?? { active: 0, completed: 0 }
    const status = normalizeReportStatus(r.status)
    if (isActiveDispatchStatus(status)) row.active++
    if (status === 'rescue_success' || status === 'rescue_failed') {
      row.completed++
    }
    workload.set(email, row)
  }

  return [...workload.entries()]
    .map(([email, { active, completed }]) => ({
      email,
      name: rescuerNames.get(email) ?? email,
      active,
      completed,
      total: active + completed,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
}

function buildOutcomes(reports: ReportRow[]) {
  let success = 0
  let failed = 0
  for (const r of reports) {
    const status = normalizeReportStatus(r.status)
    if (status === 'rescue_success') success++
    if (status === 'rescue_failed') failed++
  }
  return { success, failed }
}
