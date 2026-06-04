import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { CheckCircle2, Loader2, MapPin, Phone, User, Check, X } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { RescuerDetailSection } from '@/components/rescuer/RescuerDetailSection'
import { DomesticLayout } from '@/components/domestic/DomesticLayout'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { formatDateTime } from '@/lib/dates'
import { formatReporterName, rescuerReportToStored } from '@/lib/reports'
import { Button } from '@/components/ui/button'
import { getReportPhotos } from '@/lib/reportPhotos'
import { toast } from 'sonner'

export function DomesticReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { domesticApprover } = useDomesticAuth()
  const [loading, setLoading] = useState(false)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)

  // @ts-ignore - Bypassing strict TS check for missing generated types
  const updateStatus = useMutation((api as any).reports.update)

  // @ts-ignore - Bypassing strict TS check for missing generated types
  const row = useQuery(
    (api as any).reports.getReportById,
    reportId ? { reportId: reportId as Id<'reports'> } : 'skip'
  )

  const report = row ? rescuerReportToStored(row) : null

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

  const reporterName = formatReporterName(report.reporterFirstName, report.reporterLastName)
  const canAct = report.status === 'pending'

  async function handleStatusChange(newStatus: 'published' | 'rejected') {
    if (!domesticApprover || !report) return
    setLoading(true)
    try {
      await updateStatus({
        reportId: report.id as Id<'reports'>,
        userEmail: report.userEmail, 
        animalName: report.animalName,
        location: report.location,
        type: report.type,
        status: newStatus as any, // Bypassing TS strict string assignment
      })
      toast.success(`Report ${newStatus === 'published' ? 'published to public feed' : 'rejected'}.`)
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
      title={report.animalName}
      subtitle={report.reportNumber ?? undefined}
      backTo="/pwrcc/domestic"
      footer={actionFooter}
    >
      <div className="space-y-6 pb-2">
        <div className="text-center">
          <RescuerStatusBadge status={report.status as any} className="mb-4" />
          <p className="text-xs font-mono text-muted-foreground">
            {report.reportNumber ?? report.id}
          </p>
        </div>

        {getReportPhotos(report).length > 0 ? (
          <ReportPhotosGallery
            photos={getReportPhotos(report)}
            alt={report.animalName}
            variant="hero"
          />
        ) : null}

        <RescuerDetailSection title="Domestic Report Details" icon={CheckCircle2}>
          <dl className="space-y-3">
            <DetailRow label="Date & time seen" value={formatDateTime(report.seenAt ?? report.createdAt)} />
            <DetailRow label="Animal Type" value={report.type} />
            <DetailRow
              label="Condition"
              value={report.condition ? report.condition.replace(/-/g, ' ') : 'Not provided'}
              highlight
            />
            {report.description ? (
              <DetailRow label="Description" value={report.description} />
            ) : null}
          </dl>
        </RescuerDetailSection>

        <RescuerDetailSection title="Location" icon={MapPin}>
          <div className="space-y-1">
            <p className="font-medium leading-relaxed text-sm">{report.location}</p>
          </div>
        </RescuerDetailSection>

        <RescuerDetailSection title="Reporter" icon={User}>
          <dl className="space-y-3">
            <DetailRow label="Name" value={reporterName} />
            <div>
              <dt className="text-xs text-muted-foreground">Contact</dt>
              <dd className="mt-1 font-medium">
                {report.reporterPhone ? (
                  <a href={`tel:${report.reporterPhone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-primary hover:opacity-80">
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

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium ${highlight ? 'text-primary' : ''}`}>{value}</dd>
    </div>
  )
}
