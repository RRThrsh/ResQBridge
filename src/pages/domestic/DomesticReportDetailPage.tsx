import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
  Check,
  X,
} from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

import { DoubleConfirmation } from '@/components/DoubleConfirmation'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { RescuerDetailSection } from '@/components/rescuer/RescuerDetailSection'
import { DomesticLayout } from '@/components/domestic/DomesticLayout'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { formatDateTime } from '@/lib/dates'
import { formatReporterName } from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function DomesticReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { domesticApprover } = useDomesticAuth()

  const [loading, setLoading] = useState(false)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)

  // @ts-ignore
  const publishReport = useMutation((api as any).domestic.publishReport)

  // @ts-ignore
  const rejectReport = useMutation((api as any).domestic.rejectReport)

  // @ts-ignore
  const row = useQuery(
    (api as any).reports.getReportById,
    reportId ? { reportId: reportId as Id<'reports'> } : 'skip'
  )

  const report = row as any
  const reporterEmail = report?.userEmail || report?.email

  const reporterProfile = useQuery(
    (api as any).users.getProfile,
    reporterEmail ? { email: reporterEmail } : 'skip'
  )

  if (!domesticApprover || row === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!report) {
    return (
      <DomesticLayout title="Report" backTo="/pwrcc/domestic">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Report not found.
        </p>
      </DomesticLayout>
    )
  }

  let reporterName = formatReporterName(
    report.reporterFirstName || reporterProfile?.firstName,
    report.reporterLastName || reporterProfile?.lastName
  )

  if (!reporterName || reporterName.trim() === '' || reporterName === 'Unknown') {
    reporterName =
      report.reporterName ||
      reporterProfile?.name ||
      report.userName ||
      report.name ||
      reporterEmail?.split('@')[0] ||
      'Unknown Reporter'
  }

  const finalPhone =
    report.reporterPhone ||
    report.phone ||
    reporterProfile?.contactPhone ||
    reporterProfile?.phone

  const reportColor = (() => {
    if (report.color?.trim()) return report.color.trim()
    const match = report.description?.match(/^Color\/markings:\s*(.+?)(?:\n\n|$)/)
    return match?.[1]?.trim()
  })()

  const mapQuery =
    report.latitude && report.longitude
      ? `${report.latitude},${report.longitude}`
      : encodeURIComponent(report.location || 'Unknown location')

  const canAct =
    report.status === 'pending' &&
    (report.type === 'missing' || report.type === 'found')

  async function handleStatusChange(newStatus: 'published' | 'rejected') {
    if (!domesticApprover || !report) return

    setLoading(true)

    try {
      if (newStatus === 'published') {
        if (report.type !== 'missing' && report.type !== 'found') {
          toast.error('Only missing and found reports can be published.')
          return
        }

        await publishReport({
          reportId: report._id,
          approverEmail: domesticApprover.email,
        })

        toast.success('Report published to public feed.')
      } else {
        await rejectReport({
          reportId: report._id,
          approverEmail: domesticApprover.email,
        })

        toast.success('Report rejected.')
      }

      setConfirmApprove(false)
      setConfirmReject(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update report status'
      )
    } finally {
      setLoading(false)
    }
  }

  const actionFooter = canAct ? (
    <div className="mx-auto max-w-2xl space-y-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 flex gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-12 flex-1 rounded-xl border-destructive/40 text-base font-semibold text-destructive hover:bg-destructive/10"
        disabled={loading}
        onClick={() => setConfirmReject(true)}
      >
        <X className="mr-2 h-5 w-5" />
        Reject
      </Button>

      <Button
        type="button"
        className="h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold hover:bg-emerald-700 text-white"
        disabled={loading}
        onClick={() => setConfirmApprove(true)}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Check className="mr-2 h-5 w-5" />
            Approve & Publish
          </>
        )}
      </Button>
    </div>
  ) : undefined

  return (
    <DomesticLayout
      title={
        report.type === 'missing'
          ? 'Missing Pet'
          : report.type === 'found'
          ? 'Found Animal'
          : report.type === 'stray'
          ? 'Stray Animal'
          : report.type === 'injured'
          ? 'Injured Animal'
          : 'Domestic Report'
      }
      subtitle={report.reportNumber ?? undefined}
      backTo="/pwrcc/domestic"
      footer={actionFooter}
    >
      <div className="space-y-6 pb-2">
        <div className="text-center">
          <RescuerStatusBadge status={report.status as any} className="mb-4" />

          <p className="text-xs font-mono text-muted-foreground">
            {report.reportNumber ?? report._id}
          </p>
        </div>

        {getReportPhotos(report).length > 0 ? (
          <ReportPhotosGallery
            photos={getReportPhotos(report)}
            alt={report.animalName || 'Report Image'}
            variant="hero"
          />
        ) : null}

        <RescuerDetailSection title="Domestic Report Details" icon={CheckCircle2}>
          <dl className="space-y-3">
            <DetailRow
              label="Date & time seen"
              value={formatDateTime(report.seenAt ?? report._creationTime)}
            />

            <DetailRow
              label="Report Type"
              value={report.type || report.animalType || 'Not specified'}
              className="capitalize"
            />

            <DetailRow label="Species" value={report.speciesId || 'Not specified'} />

            {/* Render conditional fields mapping exactly to the Domestic Form structure */}
            
            {report.type === 'missing' && (
              <>
                {report.animalName && <DetailRow label="Pet Name" value={report.animalName} />}
                {reportColor && <DetailRow label="Color / Markings" value={reportColor} />}
                {report.reportedSize && <DetailRow label="Size" value={report.reportedSize} className="capitalize" />}
                {report.description && <DetailRow label="Details" value={report.description} />}
              </>
            )}

            {report.type === 'found' && (
              <>
                {report.animalName && <DetailRow label="Name" value={report.animalName} />}
                {reportColor && <DetailRow label="Color / Markings" value={reportColor} />}
                {report.reportedSize && <DetailRow label="Size" value={report.reportedSize} className="capitalize" />}
                {report.description && <DetailRow label="Details" value={report.description} />}
              </>
            )}

            {report.type === 'stray' && (
              <>
                {reportColor && <DetailRow label="Color / Markings" value={reportColor} />}
                {report.reportedSize && <DetailRow label="Size" value={report.reportedSize} className="capitalize" />}
                {report.description && <DetailRow label="Details" value={report.description} />}
              </>
            )}

            {report.type === 'injured' && (
              <>
                {report.condition && <DetailRow label="Nature of Injury" value={report.condition} highlight />}
                {report.behavior && <DetailRow label="Severity of Injury" value={report.behavior} highlight className="capitalize" />}
                {report.reportedSize && <DetailRow label="Current Condition" value={report.reportedSize} className="capitalize" />}
                {reportColor && <DetailRow label="Color / Markings" value={reportColor} />}
                {report.description && <DetailRow label="Additional Information" value={report.description} />}
              </>
            )}

            <DetailRow label="Location" value={report.location || 'Not provided'} />

            {report.latitude && report.longitude ? (
              <DetailRow
                label="GPS Coordinates"
                value={`${report.latitude}, ${report.longitude}`}
              />
            ) : null}
          </dl>
        </RescuerDetailSection>

        <RescuerDetailSection title="Location" icon={MapPin}>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Address / Landmark
            </span>

            <p className="font-medium leading-relaxed text-sm">
              {report.location || 'Unknown location'}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-border bg-muted">
              <iframe
                title="Map Viewport"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            <a
              href={`https://maps.google.com/maps?q=${mapQuery}`}
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
                {finalPhone ? (
                  <a
                    href={`tel:${finalPhone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 text-primary hover:opacity-80"
                  >
                    {finalPhone}
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

      <DoubleConfirmation
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        step1={{
          title: "Approve and Publish?",
          description: "Are you sure you want to proceed?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm publishing",
          description: "This will make the domestic report visible on the public feed.",
          confirmLabel: "Publish Report",
          cancelLabel: "Cancel",
        }}
        confirmVariant="default"
        loading={loading}
        onConfirm={() => handleStatusChange('published')}
      />

      <DoubleConfirmation
        open={confirmReject}
        onOpenChange={setConfirmReject}
        step1={{
          title: "Reject Report?",
          description: "Are you sure you want to reject this report?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm rejection",
          description: "This will decline the report and it will not be shown to the public.",
          confirmLabel: "Reject Report",
          cancelLabel: "Cancel",
        }}
        confirmVariant="destructive"
        loading={loading}
        onConfirm={() => handleStatusChange('rejected')}
      />
    </DomesticLayout>
  )
}

function DetailRow({
  label,
  value,
  highlight,
  className,
}: {
  label: string
  value: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>

      <dd
        className={`mt-0.5 font-medium whitespace-pre-wrap ${
          highlight ? 'text-primary' : ''
        } ${className || ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
