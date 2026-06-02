import { Cell, Pie, PieChart } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { percentOf } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import { CATEGORY_CHART_CONFIG } from '@/components/admin/analytics/analyticsChartConfig'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type Props = {
  data: ReportAnalytics['byCategory']
  totalReports: number
}

export function CategoryBreakdownChart({ data, totalReports }: Props) {
  return (
    <AdminChartCard
      title="Wildlife vs domestic"
      description="Share of reports by category."
      empty={data.length === 0}
    >
      <ChartContainer config={CATEGORY_CHART_CONFIG} className="mx-auto min-h-[240px] max-w-md">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => {
                  const count = Number(value)
                  const label = item.payload?.label ?? item.name
                  return (
                    <span className="font-mono">
                      {label}: {count} ({percentOf(count, totalReports)})
                    </span>
                  )
                }}
              />
            }
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((row) => (
              <Cell
                key={row.category}
                fill={`var(--color-${row.category})`}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
