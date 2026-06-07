import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import {
  CheckCircle2,
  FileText,
  Leaf,
  Loader2,
  MapPin,
  Newspaper,
  PawPrint,
  Shield,
  Truck,
  Users,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { AdminAnalyticsSection } from '@/components/admin/analytics/AdminAnalyticsSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import type { AnalyticsDays } from '@/lib/reportAnalytics'

export function AdminDashboard() {
  const { admin } = useAdminAuth()
  const [days, setDays] = useState<AnalyticsDays>(30)
  const adminEmail = admin ? normalizeEmail(admin.email) : null

  const analytics = useQuery(
    api.admin.getReportAnalytics,
    adminEmail ? { adminEmail, days } : 'skip',
  )
  const wildlife = useQuery(api.content.listWildlife)
  const news = useQuery(api.content.listNews)

  const contentLoading = wildlife === undefined || news === undefined
  const analyticsLoading = admin != null && analytics === undefined

  if (!admin) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (contentLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const eventCount = news.filter((item) => item.type === 'event').length
  const newsCount = news.filter((item) => item.type === 'news').length
  const summary = analytics?.summary

  const cards = summary
    ? [
        { label: 'Total users', value: summary.totalUsers, icon: Users },
        { label: 'Total reports', value: summary.totalReports, icon: FileText },
        { label: 'Pending review', value: summary.pendingReports, icon: FileText },
        { label: 'Unassigned pending', value: summary.unassignedPending, icon: FileText },
        { label: 'Active dispatch', value: summary.activeDispatchReports, icon: FileText },
        { label: 'Completed', value: summary.completedReports, icon: CheckCircle2 },
        { label: 'Wildlife reports', value: summary.wildlifeReports, icon: Leaf },
        { label: 'Domestic reports', value: summary.domesticReports, icon: PawPrint },
        { label: 'Rescuers', value: summary.totalRescuers, icon: Truck },

      ]
    : []

  const quickLinks = [
    { to: '/pwrcc/admin/reports/wildlife', label: 'Wildlife reports' },
    { to: '/pwrcc/admin/reports/domestic', label: 'Domestic reports' },
    { to: '/pwrcc/admin/wildlife', label: 'Wildlife guide' },
    { to: '/pwrcc/admin/news', label: 'News & events' },
    { to: '/pwrcc/admin/rescuers', label: 'Rescuers' },
    { to: '/pwrcc/admin/admins', label: 'Admin accounts' },
    { to: '/pwrcc/admin/profile', label: 'My profile' },
  ] as const

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Welcome, {admin.firstName}. Use the sidebar to manage reports, user accounts, and
        reference content for the public site.
      </p>

      {analyticsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AdminAnalyticsSection
        analytics={analytics ?? undefined}
        days={days}
        onDaysChange={setDays}
        isLoading={analyticsLoading}
      />

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Quick actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickLinks.map(({ to, label }) => (
            <Button key={to} variant="outline" size="sm" nativeButton={false} render={<Link to={to} />}>
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
