import type { ChartConfig } from '@/components/ui/chart'

export const CATEGORY_CHART_CONFIG = {
  wildlife: { label: 'Wildlife', color: 'var(--chart-1)' },
  domestic: { label: 'Domestic', color: 'var(--chart-2)' },
} satisfies ChartConfig

export const TIME_SERIES_CHART_CONFIG = {
  total: { label: 'Total', color: 'var(--chart-3)' },
  wildlife: { label: 'Wildlife', color: 'var(--chart-1)' },
  domestic: { label: 'Domestic', color: 'var(--chart-2)' },
} satisfies ChartConfig

export const OUTCOME_CHART_CONFIG = {
  success: { label: 'Success', color: 'var(--chart-1)' },
  failed: { label: 'Failed', color: 'var(--chart-4)' },
} satisfies ChartConfig

export const CHART_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}
