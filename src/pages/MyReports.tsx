import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { FileText, ArrowRight, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useLanguage } from '@/context/LanguageContext'
import { useUserAuth } from '@/context/UserAuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dates'
import {
  docToStored,
  isTerminalStatus,
  statusLabel,
  type StoredReport,
} from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'
import { ReportDetailDialog } from '@/components/report/ReportDetailDialog'
import { cn } from '@/lib/utils'

export function MyReports() {
  const { t } = useLanguage()
  const { isLoggedIn, user } = useUserAuth()
  const [selectedReport, setSelectedReport] = useState<StoredReport | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const rows = useQuery(
    api.reports.listByUserEmail,
    user ? { userEmail: user.email } : 'skip',
  )

  const reports = useMemo(
    () => (rows ? rows.map(docToStored) : []),
    [rows],
  )

  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />
  }

  const openReport = (report: StoredReport) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedReport(null)
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">{t('myReports.breadcrumbHome')}</Link>
            <span>/</span>
            <span className="text-foreground">{t('myReports.breadcrumbCurrent')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('myReports.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('myReports.desc')}
          </p>
        </div>

        {rows === undefined ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('myReports.emptyTitle')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {t('myReports.emptyDesc')}
            </p>
            <Link to="/report" className="inline-flex items-center text-sm font-medium text-primary hover:opacity-80 transition-opacity">
              {t('myReports.submitLink')} <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => openReport(report)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openReport(report)
                  }
                }}
                className={cn(
                  'bg-card border-border overflow-hidden cursor-pointer transition-colors',
                  'hover:border-primary/40 hover:bg-accent/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <CardContent className="p-0">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {getReportPhotos(report).length > 0 && (
                        <img
                          src={getReportPhotos(report)[0]}
                          alt=""
                          className="hidden sm:block h-16 w-16 shrink-0 rounded-lg object-cover border border-border"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="uppercase text-[10px] tracking-wider border-primary/20 text-primary">
                            {report.type.replace(/-/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {report.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-1">
                          {report.animalName}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {report.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(report.createdAt)}
                      </div>
                      {isTerminalStatus(report.status) ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" />
                          {statusLabel(report.status)}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5" />
                          {statusLabel(report.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ReportDetailDialog
        report={selectedReport}
        userEmail={user.email}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  )
}
