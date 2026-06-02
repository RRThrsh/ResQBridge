import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import { paletteColor } from '@/components/admin/analytics/analyticsChartConfig'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type Props = {
  data: ReportAnalytics['wildlifeByCondition']
}

function buildConfig(data: ReportAnalytics['wildlifeByCondition']): ChartConfig {
  const config: ChartConfig = {}
  data.forEach((row, index) => {
    config[row.condition] = { label: row.label, color: paletteColor(index) }
  })
  return config
}

export function WildlifeConditionChart({ data }: Props) {
  const chartConfig = buildConfig(data)

  return (
    <AdminChartCard
      title="Wildlife condition"
      description="Health and condition reported on wildlife sightings."
      empty={data.length === 0}
      emptyMessage="No wildlife condition data in this period."
    >
      <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={48}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
        </BarChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
