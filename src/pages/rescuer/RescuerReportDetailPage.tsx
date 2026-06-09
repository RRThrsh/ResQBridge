import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import {
  AlertTriangle,
  Bird,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Truck,
  User,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { RescuerDetailSection } from '@/components/rescuer/RescuerDetailSection'
import { RescuerLayout } from '@/components/rescuer/RescuerLayout'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDateTime } from '@/lib/dates'
import {
  behaviorLabel,
  formatReporterName,
  isActiveDispatchStatus,
  rescuerReportToStored,
} from '@/lib/reports'
import { Button } from '@/components/ui/button'
import { getReportPhotos } from '@/lib/reportPhotos'
import { toast } from 'sonner'

export function RescuerReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { rescuer } = useRescuerAuth()
  const [statusBanner, setStatusBanner] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmEnRoute, setConfirmEnRoute] = useState(false)
  const [pendingOutcome, setPendingOutcome] = useState<
    'rescue_success' | 'rescue_failed' | null
  >(null)

  const markEnRoute = useMutation(api.rescuers.markEnRoute)
  const completeRescue = useMutation(api.rescuers.completeRescue)

  const row = useQuery(
    api.rescuers.getAssignedReport,
    rescuer && reportId
      ? {
          rescuerEmail: normalizeEmail(rescuer.email),
          reportId: reportId as Id<'reports'>,
        }
      : 'skip',
  )

  const report = row ? rescuerReportToStored(row) : null

  if (!rescuer || row === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!report) {
    return (
      <RescuerLayout title="Report" backTo="/pwrcc/rescuer">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Report not found or not assigned to you.
        </p>
      </RescuerLayout>
    )
  }

  const reporterName = formatReporterName(report.reporterFirstName, report.reporterLastName)
  const canAct = isActiveDispatchStatus(report.status)

  // Use exact coordinates for the map if they exist, otherwise fallback to the text location
  const mapQuery = report.latitude && report.longitude 
    ? `${report.latitude},${report.longitude}` 
    : encodeURIComponent(report.location)

  async function handleMarkEnRoute() {
    if (!rescuer) return
    setLoading(true)
    try {
      await markEnRoute({
        rescuerEmail: normalizeEmail(rescuer.email),
        reportId: report!.id as Id<'reports'>,
      })
      setStatusBanner('Status updated — you are en route.')
      toast.success('Team is en route')
      setConfirmEnRoute(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update status')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(outcome: 'rescue_success' | 'rescue_failed') {
    if (!rescuer) return
    setLoading(true)
    try {
      await completeRescue({
        rescuerEmail: normalizeEmail(rescuer.email),
        reportId: report!.id as Id<'reports'>,
        outcome,
      })
      setStatusBanner('Rescue outcome recorded.')
      toast.success(outcome === 'rescue_success' ? 'Rescue marked successful' : 'Rescue marked failed')
      setPendingOutcome(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update status')
    } finally {
      setLoading(false)
    }
  }

  const actionFooter = canAct ? (
    <div className="mx-auto max-w-2xl space-y-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
      {report.status === 'accepted' ? (
        <Button
          type="button"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={loading}
          onClick={() => setConfirmEnRoute(true)}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Truck className="mr-2 h-5 w-5" />
              Team is en route (OTW)
            </>
          )}
        </Button>
      ) : (
        <>
          <Button
            type="button"
            className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold hover:bg-emerald-700"
            disabled={loading}
            onClick={() => setPendingOutcome('rescue_success')}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Bird className="mr-2 h-5 w-5" />
                Rescue successful
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-destructive/40 text-base font-semibold text-destructive hover:bg-destructive/10"
            disabled={loading}
            onClick={() => setPendingOutcome('rescue_failed')}
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            Rescue failed
          </Button>
        </>
      )}
    </div>
  ) : undefined

  return (
    <RescuerLayout
      title={report.animalName}
      subtitle={report.reportNumber ?? undefined}
      backTo="/pwrcc/rescuer"
      footer={actionFooter}
    >
      <div className="space-y-6 pb-2">
        <div className="text-center">
          <RescuerStatusBadge status={report.status} className="mb-4" />
          <p className="text-xs font-mono text-muted-foreground">
            {report.reportNumber ?? report.id}
          </p>
        </div>

        {statusBanner ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {statusBanner}
          </div>
        ) : null}

        {getReportPhotos(report).length > 0 ? (
          <ReportPhotosGallery
            photos={getReportPhotos(report)}
            alt={report.animalName}
            variant="hero"
          />
        ) : null}

        <RescuerDetailSection
          title={report.category === 'wildlife' ? 'Wildlife details' : 'Report details'}
          icon={Bird}
        >
          <div className="space-y-1 mb-3">
            <span className="text-xs text-muted-foreground font-medium">Reported Animal</span>
            <p className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {report.animalName}
            </p>
          </div>

          <dl className="space-y-3">
            <DetailRow label="Date & time seen" value={formatDateTime(report.seenAt ?? report.createdAt)} />
            {report.category === 'wildlife' && <DetailRow label="Quantity" value={String(report.quantity ?? 1)} />}
            <DetailRow label="Size" value={report.reportedSize ?? 'Not provided'} />
            <DetailRow
              label="Condition / behavior"
              value={
                behaviorLabel(report.behavior) !== 'Not provided'
                  ? behaviorLabel(report.behavior)
                  : report.condition
                    ? report.condition.replace(/-/g, ' ')
                    : 'Not provided'
              }
              highlight
            />
            {report.description ? (
              <DetailRow label="Additional Details" value={report.description} />
            ) : null}
          </dl>
        </RescuerDetailSection>

        <RescuerDetailSection title="Location" icon={MapPin}>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Address / Landmark</span>
            <p className="font-medium leading-relaxed text-sm">{report.location}</p>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-border bg-muted">
              <iframe
                title="Animal Rescue Map Viewport"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            {/* Button opens native Google Maps app using exact coordinates */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted shadow-sm"
            >
              <MapPin className="h-4 w-4 text-primary" />
              View on Google Maps
            </a>
          </div>
        </RescuerDetailSection>

        <RescuerDetailSection title="Reporter" icon={User}>
          <dl className="space-y-3">
            <DetailRow label="Name" value={reporterName} />
            <div>
              <dt className="text-xs text-muted-foreground">Contact</dt>
              <dd className="mt-1 font-medium">
                {report.reporterPhone ? (
                  <a
                    href={`tel:${report.reporterPhone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 text-primary hover:opacity-80"
                  >
                    {report.reporterPhone}
                    <Phone className="h-4 w-4" />
                  </a>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
          </dl>
        </RescuerDetailSection>
      </div>

      <ConfirmDialog
        open={confirmEnRoute}
        onOpenChange={setConfirmEnRoute}
        title="Mark team en route?"
        description="This notifies PWRCC that your team is on the way. You can still record the rescue outcome when you arrive."
        confirmLabel="Confirm en route"
        confirmVariant="default"
        loading={loading}
        onConfirm={handleMarkEnRoute}
      />

      <ConfirmDialog
        open={pendingOutcome === 'rescue_success'}
        onOpenChange={(open) => !open && setPendingOutcome(null)}
        title="Mark rescue successful?"
        description="This will close the dispatch as a successful rescue. This action cannot be undone."
        confirmLabel="Rescue successful"
        confirmVariant="default"
        loading={loading}
        onConfirm={() => handleComplete('rescue_success')}
      />

      <ConfirmDialog
        open={pendingOutcome === 'rescue_failed'}
        onOpenChange={(open) => !open && setPendingOutcome(null)}
        title="Mark rescue failed?"
        description="This will close the dispatch as unsuccessful. Only confirm if the rescue could not be completed."
        confirmLabel="Rescue failed"
        loading={loading}
        onConfirm={() => handleComplete('rescue_failed')}
      />

    </RescuerLayout>
  )
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium ${highlight ? 'text-primary' : ''}`}>{value}</dd>
    </div>
  )
}
