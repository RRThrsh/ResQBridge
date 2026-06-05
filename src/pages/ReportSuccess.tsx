import { Link, Navigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { CheckCircle2, ArrowRight, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserAuth } from '@/context/UserAuthContext'
import { api } from '../../convex/_generated/api'
import { formatDateTime } from '@/lib/dates'
import { docToStored } from '@/lib/reports'

export function ReportSuccess() {
  const { user } = useUserAuth()

  const rows = useQuery(
    api.reports.listByUserEmail,
    user ? { userEmail: user.email } : 'skip',
  )

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (rows === undefined) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

 let latestReport = null

try {
  latestReport =
    rows && rows.length > 0
      ? docToStored(rows[0])
      : null
} catch (error) {
  console.error('Failed to parse latest report:', error)
}

if (!latestReport) {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground mb-2">
          No Report Found
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Your report may still be processing.
        </p>

        <Link to="/">
          <Button>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-md px-4 sm:px-6 w-full text-center">

        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" />
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Report Submitted
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Thank you for reporting. Your submission has been securely transmitted to the Palawan Wildlife Rescue and Conservation Center.
        </p>

        <div className="bg-card border border-border rounded-2xl p-5 mb-10 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Submission Details</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Tracking ID</span>
              <span className="font-mono text-foreground text-right">{latestReport._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Type</span>
              <span className="text-foreground capitalize text-right">{latestReport.type.replace(/-/g, ' ')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Submitted</span>
              <span className="text-foreground text-right">
                {formatDateTime(latestReport.createdAt)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Status</span>
              <span className="text-amber-500 font-medium flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Under Review
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/my-reports" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-none">
              <FileText className="w-4 h-4 mr-2" />
              View My Reports
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-xl border-border text-foreground hover:bg-accent font-semibold shadow-none">
              Return Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
