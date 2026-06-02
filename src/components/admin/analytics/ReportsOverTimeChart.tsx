import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { formatChartDate } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import { TIME_SERIES_CHART_CONFIG } from '@/components/admin/analytics/analyticsChartConfig'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type Props = {
  data: ReportAnalytics['reportsOverTime']
  totalReports: number
}

export function ReportsOverTimeChart({ data, totalReports }: Props) {
  const chartData = data.map((row) => ({
    ...row,
    label: formatChartDate(row.date),
  }))

  return (
    <AdminChartCard
      title="Reports over time"
      description="Daily report volume by category for the selected period."
      empty={totalReports === 0}
    >
      <ChartContainer config={TIME_SERIES_CHART_CONFIG} className="min-h-[240px] w-full">
        <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="wildlife"
            stackId="reports"
            fill="var(--color-wildlife)"
            stroke="var(--color-wildlife)"
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="domestic"
            stackId="reports"
            fill="var(--color-domestic)"
            stroke="var(--color-domestic)"
            fillOpacity={0.5}
          />
        </AreaChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
