import { Cell, Pie, PieChart } from 'recharts'
import type { ReportAnalytics } from '@/lib/reportAnalytics'
import { percentOf } from '@/lib/reportAnalytics'
import { AdminChartCard } from '@/components/admin/analytics/AdminChartCard'
import { CHART_PALETTE, paletteColor } from '@/components/admin/analytics/analyticsChartConfig'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type Props = {
  data: ReportAnalytics['byStatus']
  totalReports: number
}

function buildStatusConfig(data: ReportAnalytics['byStatus']): ChartConfig {
  const config: ChartConfig = {}
  data.forEach((row, index) => {
    config[row.status] = {
      label: row.label,
      color: paletteColor(index),
    }
  })
  return config
}

export function ReportStatusChart({ data, totalReports }: Props) {
  const chartConfig = buildStatusConfig(data)

  return (
    <AdminChartCard
      title="Report status"
      description="Dispatch pipeline breakdown for filtered reports."
      empty={data.length === 0}
    >
      <ChartContainer config={chartConfig} className="mx-auto min-h-[240px] max-w-md">
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
            {data.map((row, index) => (
              <Cell key={row.status} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {data.map((row, index) => (
          <li key={row.status} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: paletteColor(index) }}
            />
            {row.label}: {row.count} ({percentOf(row.count, totalReports)})
          </li>
        ))}
      </ul>
    </AdminChartCard>
  )
}
