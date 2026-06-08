import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import {
  Loader2,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { formatDateTime } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { getReportPhotos } from '@/lib/reportPhotos'
import { toast } from 'sonner'

const PAGE_SIZE = 15

const typeLabels: Record<string, string> = {
  missing: 'Missing',
  found: 'Found',
  stray: 'Stray',
  injured: 'Injured',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  published: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-600 border-red-500/30',
  accepted: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  en_route: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  rescue_success: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  rescue_failed: 'bg-red-500/15 text-red-600 border-red-500/30',
}

function getSender(report: any): string {
  if (report.reporterName?.trim()) return report.reporterName
  if (report.reporterFirstName || report.reporterLastName) {
    const name = [report.reporterFirstName, report.reporterLastName].filter(Boolean).join(' ')
    if (name.trim()) return name
  }
  return report.userEmail ?? 'Unknown'
}

function getContact(report: any): string {
  return report.reporterPhone || report.phone || '—'
}

function getSpecies(report: any): string {
  return report.speciesId || '—'
}

function getSeenAt(report: any): number {
  return report.seenAt ?? report._creationTime
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusColors[status] || 'bg-muted text-muted-foreground'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium whitespace-pre-wrap ${highlight ? 'text-primary' : ''}`}>{value}</dd>
    </div>
  )
}

interface DetailModalProps {
  report: any
  open: boolean
  onClose: () => void
  onApprove: (id: Id<'reports'>) => void
  onReject: (id: Id<'reports'>) => void
  loading: boolean
}

function DetailModal({ report, open, onClose, onApprove, onReject, loading }: DetailModalProps) {
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)

  if (!open || !report) return null

  const photos = getReportPhotos(report)
  const reporterName = getSender(report)
  const contact = getContact(report)
  const mapQuery =
    report.latitude && report.longitude
      ? `${report.latitude},${report.longitude}`
      : encodeURIComponent(report.location || 'Unknown location')

  const canAct = report.status === 'pending'

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-4 pb-4 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-2xl rounded-2xl bg-popover p-0 shadow-lg ring-1 ring-foreground/10 mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-popover px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {report.animalName || 'Domestic Report'}
              </h2>
              <p className="text-xs text-muted-foreground">{report.reportNumber ?? report._id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {photos.length > 0 && (
              <ReportPhotosGallery photos={photos} alt={report.animalName} variant="hero" />
            )}

            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Report Type" value={typeLabels[report.type] || report.type} />
              <DetailRow label="Status" value={report.status.replace(/_/g, ' ')} />
              <DetailRow label="Species" value={getSpecies(report)} />
              {report.animalName && (report.type === 'missing' || report.type === 'found') && (
                <DetailRow label="Animal Name" value={report.animalName} />
              )}
              <DetailRow label="Date & Time Seen" value={formatDateTime(getSeenAt(report))} />
              <DetailRow label="Quantity" value={String(report.quantity ?? 1)} />
              {report.color && <DetailRow label="Color / Markings" value={report.color} />}
              {report.reportedSize && <DetailRow label="Reported Size" value={report.reportedSize} />}
              {report.condition && <DetailRow label="Condition" value={report.condition} />}
              {report.behavior && <DetailRow label="Behavior" value={report.behavior} />}
            </div>

            {report.description && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Reporter</h4>
              <DetailRow label="Name" value={reporterName} />
              <DetailRow label="Contact" value={contact} />
              <DetailRow label="Email" value={report.userEmail || '—'} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Location</h4>
              <DetailRow label="Address / Landmark" value={report.location || 'Unknown location'} />
              {report.latitude && report.longitude && (
                <DetailRow label="GPS Coordinates" value={`${report.latitude}, ${report.longitude}`} />
              )}
              <div className="mt-3 w-full h-48 rounded-xl overflow-hidden border border-border bg-muted">
                <iframe
                  title="Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>
          </div>

          {canAct && (
            <div className="sticky bottom-0 rounded-b-2xl border-t border-border bg-popover px-6 py-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl border-destructive/40 text-sm font-semibold text-destructive hover:bg-destructive/10"
                disabled={loading}
                onClick={() => setConfirmReject(true)}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl bg-emerald-600 text-sm font-semibold hover:bg-emerald-700 text-white"
                disabled={loading}
                onClick={() => setConfirmApprove(true)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-2 h-4 w-4" /> Approve & Publish</>}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve and Publish?"
        description="This will make the domestic report visible on the public feed."
        confirmLabel="Publish Report"
        loading={loading}
        onConfirm={() => { onApprove(report._id); setConfirmApprove(false) }}
      />
      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Reject Report?"
        description="This will decline the report and it will not be shown to the public."
        confirmLabel="Reject Report"
        loading={loading}
        onConfirm={() => { onReject(report._id); setConfirmReject(false) }}
      />
    </>
  )
}

export function DomesticReportsPage() {
  const { domesticApprover } = useDomesticAuth()
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const allReports = useQuery(api.domestic.listAllDomesticReports)

  const publishReport = useMutation(api.domestic.publishReport)
  const rejectReport = useMutation(api.domestic.rejectReport)

  const pendingCount = useMemo(
    () => (allReports ?? []).filter((r) => r.status === 'pending').length,
    [allReports],
  )
  const publishedCount = useMemo(
    () => (allReports ?? []).filter((r) => r.status === 'published').length,
    [allReports],
  )

  const totalPages = Math.max(1, Math.ceil((allReports ?? []).length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedReports = useMemo(
    () => (allReports ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [allReports, safePage],
  )

  async function handleApprove(reportId: Id<'reports'>) {
    if (!domesticApprover) return
    setActionLoading(true)
    try {
      await publishReport({ reportId, approverEmail: domesticApprover.email })
      toast.success('Report published to public feed.')
      setSelectedReport(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not approve report')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(reportId: Id<'reports'>) {
    if (!domesticApprover) return
    setActionLoading(true)
    try {
      await rejectReport({ reportId, approverEmail: domesticApprover.email })
      toast.success('Report rejected.')
      setSelectedReport(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reject report')
    } finally {
      setActionLoading(false)
    }
  }

  const loading = allReports === undefined

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
          Domestic Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, approve, or reject incoming domestic reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <ClipboardList className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{publishedCount}</p>
            <p className="text-xs text-muted-foreground">Total Approved</p>
          </div>
        </div>
      </div>

      {allReports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No domestic reports yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sender</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Species</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date & Time Last Seen</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Contact Number</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Created At</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => (
                  <tr
                    key={report._id}
                    className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-4 py-3 text-foreground font-medium max-w-[140px] truncate">
                      {getSender(report)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium capitalize">
                        {typeLabels[report.type] || report.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{getSpecies(report)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">{formatDateTime(getSeenAt(report))}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getContact(report)}</td>
                    <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">{formatDateTime(report.createdAt || report._creationTime)}</td>
                    <td className="px-4 py-3">
                      {report.status === 'pending' ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedReport(report) }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-colors"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedReport(report) }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-colors"
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(report) }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages} ({allReports.length} total)
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <DetailModal
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  )
}
