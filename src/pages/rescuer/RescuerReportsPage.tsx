import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import {
  AlertTriangle,
  Bird,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PawPrint,
  Phone,
  Sparkles,
  Truck,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { normalizeEmail } from '@/lib/admin'
import {
  behaviorLabel,
  formatReporterName,
  isActiveDispatchStatus,
  rescuerReportToStored,
  type RescuerStoredReport,
} from '@/lib/reports'
import { formatDateTime } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { DoubleConfirmation } from '@/components/DoubleConfirmation'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { getReportPhotos } from '@/lib/reportPhotos'
import { toast } from 'sonner'

type Tab = 'active' | 'rescued' | 'failed'

const PAGE_SIZE = 15

const statusLabels: Record<string, string> = {
  accepted: 'Accepted',
  en_route: 'En Route',
  rescue_success: 'Rescued',
  rescue_failed: 'Failed',
}

const statusColors: Record<string, string> = {
  accepted: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  en_route: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  rescue_success: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  rescue_failed: 'bg-red-500/15 text-red-600 border-red-500/30',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusColors[status] || 'bg-muted text-muted-foreground'}`}>
      {statusLabels[status] || status.replace(/_/g, ' ')}
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

function DetailModal({ report, onClose }: { report: RescuerStoredReport | null; onClose: () => void }) {
  const { rescuer } = useRescuerAuth()
  const [loading, setLoading] = useState(false)
  const [confirmEnRoute, setConfirmEnRoute] = useState(false)
  const [pendingOutcome, setPendingOutcome] = useState<'rescue_success' | 'rescue_failed' | null>(null)
  const [statusBanner, setStatusBanner] = useState<string | null>(null)

  const markEnRoute = useMutation(api.rescuers.markEnRoute)
  const completeRescue = useMutation(api.rescuers.completeRescue)

  if (!report) return null

  const r = report
  const photos = getReportPhotos(r)
  const reporterName = formatReporterName(r.reporterFirstName, r.reporterLastName)
  const canAct = isActiveDispatchStatus(r.status)
  const mapQuery =
    r.latitude && r.longitude
      ? `${r.latitude},${r.longitude}`
      : encodeURIComponent(r.location)

  async function handleMarkEnRoute() {
    if (!rescuer) return
    setLoading(true)
    try {
      await markEnRoute({
        rescuerEmail: normalizeEmail(rescuer.email),
        reportId: r.id as Id<'reports'>,
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
        reportId: r.id as Id<'reports'>,
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-4 pb-4 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-2xl rounded-2xl bg-popover p-0 shadow-lg ring-1 ring-foreground/10 mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-popover px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {report.animalName}
              </h2>
              <p className="text-xs text-muted-foreground">{report.reportNumber ?? report.id}</p>
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
            {statusBanner && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {statusBanner}
              </div>
            )}

            {photos.length > 0 && (
              <ReportPhotosGallery photos={photos} alt={report.animalName} variant="hero" />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Reported Animal</span>
                <p className="text-base font-bold text-foreground mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  {report.animalName}
                </p>
              </div>
              <DetailRow label="Category" value={report.category === 'wildlife' ? 'Wildlife' : 'Domestic'} />
              <DetailRow label="Type" value={report.type.replace(/-/g, ' ')} />
              <DetailRow label="Date & Time Seen" value={formatDateTime(report.seenAt ?? report.createdAt)} />
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
              {report.description && (
                <div className="col-span-2">
                  <DetailRow label="Additional Details" value={report.description} />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Location</h4>
              <DetailRow label="Address / Landmark" value={report.location} />
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
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted shadow-sm"
              >
                <MapPin className="h-4 w-4 text-primary" />
                View on Google Maps
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Reporter</h4>
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
            </div>
          </div>

          {canAct && (
            <div className="sticky bottom-0 rounded-b-2xl border-t border-border bg-popover px-6 py-4 flex flex-col gap-2">
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
          )}
        </div>
      </div>

      <DoubleConfirmation
        open={confirmEnRoute}
        onOpenChange={setConfirmEnRoute}
        step1={{
          title: "Mark team en route?",
          description: "Are you sure you want to proceed?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm en route",
          description: "This notifies PWRCC that your team is on the way.",
          confirmLabel: "Confirm en route",
          cancelLabel: "Cancel",
        }}
        confirmVariant="default"
        loading={loading}
        onConfirm={handleMarkEnRoute}
      />
      <DoubleConfirmation
        open={pendingOutcome === 'rescue_success'}
        onOpenChange={(open) => !open && setPendingOutcome(null)}
        step1={{
          title: "Mark rescue successful?",
          description: "Are you sure you want to mark the rescue as successful?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm successful rescue",
          description: "This will close the dispatch as a successful rescue.",
          confirmLabel: "Rescue successful",
          cancelLabel: "Cancel",
        }}
        confirmVariant="default"
        loading={loading}
        onConfirm={() => handleComplete('rescue_success')}
      />
      <DoubleConfirmation
        open={pendingOutcome === 'rescue_failed'}
        onOpenChange={(open) => !open && setPendingOutcome(null)}
        step1={{
          title: "Mark rescue failed?",
          description: "Are you sure you want to mark the rescue as failed?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm failed rescue",
          description: "This will close the dispatch as unsuccessful.",
          confirmLabel: "Rescue failed",
          cancelLabel: "Cancel",
        }}
        confirmVariant="destructive"
        loading={loading}
        onConfirm={() => handleComplete('rescue_failed')}
      />
    </>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: typeof Clock
  active?: boolean
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex flex-1 flex-col items-start rounded-2xl border p-4 text-left transition-all ${
        active
          ? 'border-primary/40 bg-primary/5 shadow-sm'
          : 'border-border bg-card/60 hover:border-border/80'
      }`}
    >
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
        active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </Comp>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        {tab === 'active' ? (
          <Clock className="h-6 w-6 text-primary" />
        ) : (
          <PawPrint className="h-6 w-6 text-primary" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {tab === 'active'
          ? 'No active dispatches'
          : tab === 'rescued'
            ? 'No rescued animals yet'
            : 'No failed reports'}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        {tab === 'active'
          ? 'When admin assigns you a report, it will appear here for response.'
          : tab === 'rescued'
            ? 'Completed successful rescues will appear here.'
            : 'Reports marked as unsuccessful will appear here.'}
      </p>
    </div>
  )
}

export function RescuerReportsPage() {
  const { rescuer } = useRescuerAuth()
  const [tab, setTab] = useState<Tab>('active')
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<RescuerStoredReport | null>(null)
  const email = rescuer ? normalizeEmail(rescuer.email) : ''

  const activeRows = useQuery(
    api.rescuers.listAssignedReports,
    rescuer ? { rescuerEmail: email } : 'skip',
  )
  const completedRows = useQuery(
    api.rescuers.listCompletedReports,
    rescuer ? { rescuerEmail: email } : 'skip',
  )

  const active = useMemo(
    () => (activeRows ? activeRows.map(rescuerReportToStored) : []),
    [activeRows],
  )
  const completed = useMemo(
    () => (completedRows ? completedRows.map(rescuerReportToStored) : []),
    [completedRows],
  )

  const rescued = useMemo(
    () => completed.filter((r) => r.status === 'rescue_success'),
    [completed],
  )
  const failed = useMemo(
    () => completed.filter((r) => r.status === 'rescue_failed'),
    [completed],
  )

  const loading = activeRows === undefined || completedRows === undefined
  const list = tab === 'active' ? active : tab === 'rescued' ? rescued : failed

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <section className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Field dashboard</span>
        </div>
        <h2
          className="text-2xl font-bold text-foreground sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {rescuer ? `Hello, ${rescuer.firstName}` : 'Rescuer dashboard'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Manage active dispatches and review animals you have already rescued.
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="mb-8 flex gap-3">
            <StatCard
              label="Active now"
              value={active.length}
              icon={Clock}
              active={tab === 'active'}
              onClick={() => { setTab('active'); setPage(1) }}
            />
            <StatCard
              label="Rescued"
              value={rescued.length}
              icon={CheckCircle2}
              active={tab === 'rescued'}
              onClick={() => { setTab('rescued'); setPage(1) }}
            />
            <StatCard
              label="Failed"
              value={failed.length}
              icon={PawPrint}
              active={tab === 'failed'}
              onClick={() => { setTab('failed'); setPage(1) }}
            />
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              {(
                [
                  ['active', 'Active'],
                  ['rescued', 'Rescued'],
                  ['failed', 'Failed'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setTab(value); setPage(1) }}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                    tab === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums text-muted-foreground">
                    ({value === 'active'
                      ? active.length
                      : value === 'rescued'
                        ? rescued.length
                        : failed.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Report #</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Animal</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="px-4 py-3 text-foreground font-mono text-[12px]">
                          {report.reportNumber || report.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium max-w-[140px] truncate">
                          {report.animalName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{report.type}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{report.location}</td>
                        <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground text-[12px] whitespace-nowrap">{formatDateTime(report.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedReport(report) }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Page {safePage} of {totalPages} ({list.length} total)
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
        </>
      )}

      <DetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </>
  )
}
