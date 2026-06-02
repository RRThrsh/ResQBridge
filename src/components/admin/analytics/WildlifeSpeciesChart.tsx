import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type Props = {
  data: ReportAnalytics['wildlifeTopSpecies']
}

const chartConfig = {
  count: { label: 'Reports', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function WildlifeSpeciesChart({ data }: Props) {
  return (
    <AdminChartCard
      title="Top wildlife species"
      description="Most reported animals in wildlife sightings (top 8)."
      empty={data.length === 0}
      emptyMessage="No wildlife reports in this period."
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
            dataKey="name"
            width={100}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
