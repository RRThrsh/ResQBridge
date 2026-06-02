import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type Props = {
  data: ReportAnalytics['rescuerWorkload']
}

const chartConfig = {
  active: { label: 'Active dispatch', color: 'var(--chart-3)' },
  completed: { label: 'Completed', color: 'var(--chart-1)' },
}

export function RescuerWorkloadChart({ data }: Props) {
  const chartData = data.map((row) => ({
    ...row,
    shortName: row.name.length > 16 ? `${row.name.slice(0, 14)}…` : row.name,
  }))

  return (
    <AdminChartCard
      title="Rescuer workload"
      description="Active vs completed assignments per rescuer (top 10)."
      empty={data.length === 0}
      emptyMessage="No rescuer assignments in this period."
    >
      <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="shortName"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={56}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="active" fill="var(--color-active)" stackId="workload" radius={[0, 0, 0, 0]} />
          <Bar
            dataKey="completed"
            fill="var(--color-completed)"
            stackId="workload"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
