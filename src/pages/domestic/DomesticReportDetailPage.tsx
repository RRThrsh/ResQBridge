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

import { ConfirmDialog } from '@/components/ConfirmDialog'
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
  const updateStatus = useMutation((api as any).reports.update)

  // @ts-ignore
  const row = useQuery(
    (api as any).reports.getReportById,
    reportId ? { reportId: reportId as Id<'reports'> } : 'skip'
  )

  const report = row as any
  const reporterEmail = report?.userEmail || report?.email

  // Fallback to fetch from user profile if data isn't in the report doc
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

  // --- NAME RESOLUTION ---
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

  // --- PHONE RESOLUTION ---
  const finalPhone = 
    report.reporterPhone || 
    report.phone || 
    reporterProfile?.contactPhone || 
    reporterProfile?.phone

  // --- MAP RESOLUTION ---
  const mapQuery = report.latitude && report.longitude 
    ? `${report.latitude},${report.longitude}` 
    : encodeURIComponent(report.location || 'Unknown location')

  const canAct = report.status === 'pending'

  async function handleStatusChange(newStatus: 'published' | 'rejected') {
    if (!domesticApprover || !report) return
    setLoading(true)
    try {
      await updateStatus({
        reportId: report._id as Id<'reports'>,
        userEmail: report.userEmail || report.email,
        animalName: report.animalName,
        location: report.location,
        type: report.type || report.animalType,
        status: newStatus as any,
      })
      toast.success(newStatus === 'published' ? 'Report published to public feed.' : 'Report rejected.')
      setConfirmApprove(false)
      setConfirmReject(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update report status')
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
      title={report.animalName || 'Domestic Report'}
      subtitle={report.reportNumber ?? undefined}
      backTo="/pwrcc/domestic"
      footer={actionFooter}
    >
      <div className="space-y-6 pb-2">

        <div className="text-center">
          <RescuerStatusBadge
            status={report.status as any}
            className="mb-4"
          />
          <p className="text-xs font-mono text-muted-foreground">
            {report.reportNumber ?? report._id}
          </p>
        </div>

        {getReportPhotos(report).length > 0 ? (
          <ReportPhotosGallery
            photos={getReportPhotos(report)}
            alt={report.animalName}
            variant="hero"
          />
        ) : null}

        <RescuerDetailSection
          title="Domestic Report Details"
          icon={CheckCircle2}
        >
          <div className="space-y-1 mb-3">
            <span className="text-xs text-muted-foreground font-medium">Reported Animal</span>
            <p className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {report.animalName || 'Unknown Animal'}
            </p>
          </div>

<dl className="space-y-3">

  <DetailRow
    label="Date & time seen"
    value={formatDateTime(report.seenAt ?? report._creationTime)}
  />

  <DetailRow
    label="Report Type"
    value={report.type || report.animalType || 'Not specified'}
  />

  <DetailRow
    label="Species"
    value={report.speciesId || 'Not specified'}
  />

  {(report.type === 'missing' || report.type === 'found') && (
    <DetailRow
      label="Animal Name"
      value={report.animalName || 'Not specified'}
    />
  )}

  {/* ========================= */}
  {/* INJURED REPORT */}
  {/* ========================= */}
  {report.type === 'injured' ? (
    <>

      {report.condition ? (
        <DetailRow
          label="Nature of Injury"
          value={report.condition}
          highlight
        />
      ) : null}

      {report.behavior ? (
        <DetailRow
          label="Severity of Injury"
          value={report.behavior}
          highlight
        />
      ) : null}

      {report.reportedSize ? (
        <DetailRow
          label="Animal Current Condition"
          value={report.reportedSize}
        />
      ) : null}

      {report.color ? (
        <DetailRow
          label="Rescue Assistance Priority"
          value={report.color}
        />
      ) : null}

      {report.description ? (
        <DetailRow
          label="Additional Information"
          value={report.description}
        />
      ) : null}

    </>
  ) : (
    <>
      {/* ========================= */}
      {/* MISSING / FOUND / STRAY */}
      {/* ========================= */}

      {report.color ? (
        <DetailRow
          label="Color / Markings"
          value={report.color}
        />
      ) : null}

      <DetailRow
        label="Quantity"
        value={String(report.quantity ?? 1)}
      />

      {report.reportedSize ? (
        <DetailRow
          label="Reported Size"
          value={report.reportedSize}
        />
      ) : null}

      {report.description ? (
        <DetailRow
          label="Description & Details"
          value={report.description}
        />
      ) : null}
    </>
  )}

  {/* ========================= */}
  {/* LOCATION */}
  {/* ========================= */}

  <DetailRow
    label="Location"
    value={report.location || 'Not provided'}
  />

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
            <span className="text-xs text-muted-foreground font-medium">Address / Landmark</span>
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
            <DetailRow
              label="Name"
              value={reporterName}
            />

            <div>
              <dt className="text-xs text-muted-foreground">
                Contact
              </dt>
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

      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve and Publish?"
        description="This will make the domestic report visible on the public feed."
        confirmLabel="Publish Report"
        confirmVariant="default"
        loading={loading}
        onConfirm={() => handleStatusChange('published')}
      />

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Reject Report?"
        description="This will decline the report and it will not be shown to the public."
        confirmLabel="Reject Report"
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
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium whitespace-pre-wrap ${highlight ? 'text-primary' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
