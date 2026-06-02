import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
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
  data: ReportAnalytics['domesticByType']
}

function buildConfig(data: ReportAnalytics['domesticByType']): ChartConfig {
  const config: ChartConfig = {}
  data.forEach((row, index) => {
    config[row.type] = { label: row.label, color: paletteColor(index) }
  })
  return config
}

export function DomesticTypesChart({ data }: Props) {
  const chartConfig = buildConfig(data)

  return (
    <AdminChartCard
      title="Domestic report types"
      description="Missing, found, stray, and injured reports in this period."
      empty={data.length === 0}
      emptyMessage="No domestic reports in this period."
    >
      <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 16, top: 8, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4}>
            {data.map((row, index) => (
              <Cell key={row.type} fill={paletteColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
