import type { FunctionReturnType } from 'convex/server'
import type { api } from '../../convex/_generated/api'
import { formatMonthDay, parseDate } from '@/lib/dates'

export type ReportAnalytics = FunctionReturnType<typeof api.admin.getReportAnalytics>
export type AnalyticsDays = 7 | 30 | 90 | null

export const ANALYTICS_DAY_OPTIONS: Array<{ value: AnalyticsDays; label: string }> = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: null, label: 'All time' },
]

export function formatAnalyticsDayLabel(days: AnalyticsDays): string {
  return ANALYTICS_DAY_OPTIONS.find((o) => o.value === days)?.label ?? 'All time'
}

export function formatChartDate(isoDate: string): string {
  return formatMonthDay(parseDate(isoDate))
}

export function percentOf(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}
