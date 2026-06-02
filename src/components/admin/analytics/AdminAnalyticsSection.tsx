import { BarChart3, Loader2 } from 'lucide-react'
import type { ReportAnalytics, AnalyticsDays } from '@/lib/reportAnalytics'
import { AdminAnalyticsDateRange } from '@/components/admin/analytics/AdminAnalyticsDateRange'
import { CategoryBreakdownChart } from '@/components/admin/analytics/CategoryBreakdownChart'
import { DomesticTypesChart } from '@/components/admin/analytics/DomesticTypesChart'
import { ReportStatusChart } from '@/components/admin/analytics/ReportStatusChart'
import { ReportsOverTimeChart } from '@/components/admin/analytics/ReportsOverTimeChart'
import { RescueOutcomesChart } from '@/components/admin/analytics/RescueOutcomesChart'
import { RescuerWorkloadChart } from '@/components/admin/analytics/RescuerWorkloadChart'
import { WildlifeConditionChart } from '@/components/admin/analytics/WildlifeConditionChart'
import { WildlifeSpeciesChart } from '@/components/admin/analytics/WildlifeSpeciesChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  analytics: ReportAnalytics | undefined
  days: AnalyticsDays
  onDaysChange: (days: AnalyticsDays) => void
  isLoading?: boolean
}

export function AdminAnalyticsSection({
  analytics,
  days,
  onDaysChange,
  isLoading = false,
}: Props) {
  const totalReports = analytics?.summary.totalReports ?? 0

  return (
    <section className="space-y-4" aria-labelledby="admin-analytics-heading">
      <Card className="border-border">
        <CardHeader className="flex flex-col gap-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle
            id="admin-analytics-heading"
            className="flex items-center gap-2 text-base"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            Analytics
          </CardTitle>
          <AdminAnalyticsDateRange days={days} onDaysChange={onDaysChange} />
        </CardHeader>
        {isLoading ? (
          <CardContent className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading analytics" />
          </CardContent>
        ) : analytics ? (
          <CardContent className="pt-0">
            <p className="mb-4 text-sm text-muted-foreground">
              Showing {totalReports} report{totalReports === 1 ? '' : 's'} for the selected period.
              KPI cards above reflect the same filter.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <ReportsOverTimeChart
                data={analytics.reportsOverTime}
                totalReports={totalReports}
              />
              <ReportStatusChart data={analytics.byStatus} totalReports={totalReports} />
              <CategoryBreakdownChart
                data={analytics.byCategory}
                totalReports={totalReports}
              />
              <RescueOutcomesChart outcomes={analytics.outcomes} />
              <DomesticTypesChart data={analytics.domesticByType} />
              <WildlifeSpeciesChart data={analytics.wildlifeTopSpecies} />
              <WildlifeConditionChart data={analytics.wildlifeByCondition} />
              <RescuerWorkloadChart data={analytics.rescuerWorkload} />
            </div>
          </CardContent>
        ) : null}
      </Card>
    </section>
  )
}
