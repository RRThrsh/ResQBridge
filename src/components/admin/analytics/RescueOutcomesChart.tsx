import { Cell, Pie, PieChart } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { percentOf } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import { OUTCOME_CHART_CONFIG } from '@/components/admin/analytics/analyticsChartConfig'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type Props = {
  outcomes: ReportAnalytics['outcomes']
}

export function RescueOutcomesChart({ outcomes }: Props) {
  const total = outcomes.success + outcomes.failed
  const data = [
    { key: 'success', label: 'Rescue success', count: outcomes.success },
    { key: 'failed', label: 'Rescue failed', count: outcomes.failed },
  ].filter((row) => row.count > 0)

  return (
    <AdminChartCard
      title="Rescue outcomes"
      description="Completed rescues: success vs failed."
      empty={total === 0}
      emptyMessage="No completed rescues in this period."
    >
      <ChartContainer config={OUTCOME_CHART_CONFIG} className="mx-auto min-h-[240px] max-w-md">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => {
                  const count = Number(value)
                  const label = item.payload?.label ?? item.name
                  return (
                    <span className="font-mono">
                      {label}: {count} ({percentOf(count, total)})
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
              <Cell key={row.key} fill={`var(--color-${row.key})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </AdminChartCard>
  )
}
