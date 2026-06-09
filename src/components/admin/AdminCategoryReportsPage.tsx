import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import {
  Bird,
  CheckCircle2,
  Edit,
  FileDown,
  Loader2,
  MapPin,
  Phone,
  Save,
  Search,
  Trash,
  User,
  UserPlus
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { AdminAssignRescuerDialog } from '@/components/admin/AdminAssignRescuerDialog'
import { DoubleConfirmation } from '@/components/DoubleConfirmation'
import { AdminReportDialog } from '@/components/admin/AdminReportDialog'
import { AdminTableActions, type AdminRowAction } from '@/components/admin/AdminTableActions'
import { AdminTableActionsCell, AdminTableCell } from '@/components/admin/AdminTableCell'
import { AdminTablePaginationBar } from '@/components/admin/AdminTablePagination'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate, formatDateTime } from '@/lib/dates'
import {
  DOMESTIC_REPORT_TYPES,
  adminReportToStored,
  canAdminAssignRescuer,
  formatReporterName,
  formatReportType,
  statusLabel,
  type AdminStoredReport,
  type ReportCategory,
} from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'
import { cn } from '@/lib/utils'
import { generateReportPdf } from '@/lib/generateReportPdf'
import { toast } from 'sonner'

type AdminReportDetailProps = {
  report: AdminStoredReport
  category: ReportCategory
  initialMode?: 'view' | 'edit'
  readOnly?: boolean
  onClose?: () => void
  onSave?: (updatedData: Partial<AdminStoredReport>) => Promise<void>
  onAssign?: () => void
  onDelete?: () => void
}

export function AdminReportDetailView({
  report,
  category,
  initialMode = 'view',
  readOnly = false,
  onClose: _onClose,
  onSave,
  onAssign,
  onDelete,
}: AdminReportDetailProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [statusBanner, setStatusBanner] = useState<string | null>(null)

  // Editable state
  const [animalName, setAnimalName] = useState(report.animalName)
  const [location, setLocation] = useState(report.location)
  const [description, setDescription] = useState(report.description || '')

  const reporterName = formatReporterName(report.reporterFirstName, report.reporterLastName)
  const mapQuery = report.latitude && report.longitude 
    ? `${report.latitude},${report.longitude}` 
    : encodeURIComponent(report.location)

  async function handleSave() {
    if (!onSave) return
    setLoading(true)
    try {
      await onSave({
        animalName,
        location,
        description,
      })
      setStatusBanner('Report updated successfully.')
      setMode('view')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const actionFooter = (
    <div className="mx-auto max-w-2xl space-y-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
      {mode === 'edit' ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl text-base font-semibold"
            disabled={loading}
            onClick={() => setMode('view')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl text-base font-semibold"
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          {!readOnly && (
            <Button
              type="button"
              className="h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold hover:bg-emerald-700"
              onClick={onAssign}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Assign Rescuer
            </Button>
          )}
          
          <div className="flex gap-2 flex-1">
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl text-base font-semibold"
                onClick={() => setMode('edit')}
              >
                <Edit className="mr-2 h-5 w-5" />
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl border-destructive/40 text-base font-semibold text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash className="mr-2 h-5 w-5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex min-h-full flex-col bg-muted/10">
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center">
          <Badge
            variant={
              report.status === 'pending' || report.status === 'accepted'
                ? 'default'
                : 'secondary'
            }
            className="mb-4 px-3 py-1 text-sm uppercase tracking-wider"
          >
            {statusLabel(report.status)}
          </Badge>
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

        {/* Details Section */}
        <AdminDetailSection
          title={category === 'wildlife' ? 'Wildlife details' : 'Domestic details'}
          icon={Bird}
        >
          <div className="space-y-1 mb-4">
            <span className="text-xs text-muted-foreground font-medium">Reported Animal</span>
            {mode === 'edit' ? (
              <Input 
                value={animalName} 
                onChange={(e) => setAnimalName(e.target.value)} 
                className="mt-1 font-bold" 
              />
            ) : (
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {report.animalName}
              </p>
            )}
          </div>

          <dl className="space-y-3">
            <DetailRow label="Date & time seen" value={formatDateTime(report.createdAt)} />
            <DetailRow label="Size" value={report.reportedSize ?? 'Not provided'} />
            <DetailRow
              label="Condition / behavior"
              value={report.condition ? report.condition.replace(/-/g, ' ') : 'Not provided'}
              highlight
            />
            
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Additional Details</dt>
              {mode === 'edit' ? (
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="mt-1 resize-none" 
                  rows={3}
                />
              ) : (
                <dd className="mt-0.5 font-medium text-sm leading-relaxed">
                  {report.description || 'None provided'}
                </dd>
              )}
            </div>
          </dl>
        </AdminDetailSection>

        {/* Location Section */}
        <AdminDetailSection title="Location" icon={MapPin}>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Address / Landmark</span>
            {mode === 'edit' ? (
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="mt-1" 
              />
            ) : (
              <p className="font-medium leading-relaxed text-sm">{report.location}</p>
            )}
          </div>
          
          {mode === 'view' && (
            <div className="mt-4 space-y-3">
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-border bg-muted">
                <iframe
                  title="Admin Map Viewport"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}`}
                />
              </div>

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
          )}
        </AdminDetailSection>

        {/* Reporter Section */}
        <AdminDetailSection title="Reporter" icon={User}>
          <dl className="space-y-3">
            <DetailRow label="Name" value={reporterName} />
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Contact</dt>
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
        </AdminDetailSection>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        {actionFooter}
      </div>
    </div>
  )
}

// Sub-components
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
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium ${highlight ? 'text-primary' : ''}`}>{value}</dd>
    </div>
  )
}

function AdminDetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

function domesticTypeLabel(type: string) {
  return DOMESTIC_REPORT_TYPES.find((t) => t.value === type)?.label ?? formatReportType(type)
}

export function AdminCategoryReportsPage({ category }: { category: ReportCategory }) {
  const { admin } = useAdminAuth()
  const deleteReport = useMutation(api.admin.deleteReport)
  const rejectReport = useMutation(api.admin.rejectReport)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'accepted' | 'en_route' | 'completed'
  >('all')
  const [selected, setSelected] = useState<AdminStoredReport | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<AdminStoredReport | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminStoredReport | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<AdminStoredReport | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)

  const rows = useQuery(
    api.admin.listReports,
    admin ? { adminEmail: normalizeEmail(admin.email) } : 'skip',
  )

  const reports = useMemo(
    () =>
      rows
        ? rows.map(adminReportToStored).filter((report) => report.category === category)
        : [],
    [rows, category],
  )

  const isDomestic = category === 'domestic'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reports.filter((report) => {
      if (!isDomestic && statusFilter !== 'all') {
        if (statusFilter === 'completed') {
          if (report.status !== 'rescue_success' && report.status !== 'rescue_failed') {
            return false
          }
        } else if (report.status !== statusFilter) {
          return false
        }
      }
      if (!q) return true
      const reporterName = formatReporterName(
        report.reporterFirstName,
        report.reporterLastName,
      ).toLowerCase()
      return (
        report.animalName.toLowerCase().includes(q) ||
        report.location.toLowerCase().includes(q) ||
        reporterName.includes(q) ||
        report.type.toLowerCase().includes(q)
      )
    })
  }, [reports, search, statusFilter, isDomestic])

  const pagination = usePaginatedRows(filtered, {
    resetKey: isDomestic ? `${category}-${search}` : `${category}-${search}-${statusFilter}`,
  })
  const emptyLabel = isDomestic
    ? 'No domestic reports match your search.'
    : 'No wildlife reports match your filters.'

  function openDialog(report: AdminStoredReport, mode: 'view' | 'edit' = 'view') {
    setSelected(report)
    setDialogMode(isDomestic ? 'view' : mode)
    setDialogOpen(true)
  }

  function handleAction(report: AdminStoredReport, action: AdminRowAction) {
    if (isDomestic) {
      openDialog(report, 'view')
      return
    }
    if (action === 'delete') {
      setDeleteTarget(report)
      setDeleteOpen(true)
      return
    }
    openDialog(report, action)
  }

  function openAssignDialog(report: AdminStoredReport) {
    setAssignTarget(report)
    setAssignOpen(true)
  }

  async function confirmReject() {
    if (!admin || !rejectTarget) return
    try {
      await rejectReport({
        adminEmail: normalizeEmail(admin.email),
        reportId: rejectTarget.id as Id<'reports'>,
      })
      toast.success('Report rejected')
      setRejectOpen(false)
      setRejectTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reject report')
    }
  }

  async function confirmDelete() {
    if (!admin || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteReport({
        adminEmail: normalizeEmail(admin.email),
        reportId: deleteTarget.id as Id<'reports'>,
      })
      toast.success('Report deleted')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete report')
    } finally {
      setDeleting(false)
    }
  }

  function handleDownloadPdf(report: AdminStoredReport) {
    generateReportPdf(report)
  }

  if (!admin || rows === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {isDomestic
          ? 'Missing, found, stray, and injured domestic animal reports from the public site.'
          : 'Wildlife sighting and rescue reports submitted by the public.'}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isDomestic ? 'Search domestic reports...' : 'Search wildlife reports...'
            }
            className="pl-9"
          />
        </div>
        {!isDomestic ? (
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All'],
                ['pending', 'Pending'],
                ['accepted', 'Assign'],
                ['en_route', 'En route'],
                ['completed', 'Completed'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  statusFilter === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[18%] px-4 py-3 font-medium">Animal</th>
                <th className="w-[14%] px-4 py-3 font-medium">Reporter</th>
                {isDomestic ? (
                  <th className="w-[10%] px-4 py-3 font-medium">Type</th>
                ) : null}
                <th className="w-[20%] px-4 py-3 font-medium">Location</th>
                {!isDomestic ? (
                  <th className="w-[14%] px-4 py-3 font-medium">Rescuer</th>
                ) : null}
                <th className="w-[14%] px-4 py-3 font-medium">Status</th>
                <th className="w-[12%] px-4 py-3 font-medium">Date</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                pagination.paginatedRows.map((report) => {
                  const reporterName = formatReporterName(
                    report.reporterFirstName,
                    report.reporterLastName,
                  )

                  const dateLine = formatDate(report.createdAt)

                  return (
                    <tr key={report.id} className="border-b border-border/60">
                      <AdminTableCell className="font-medium" title={report.animalName}>
                        {report.animalName}
                      </AdminTableCell>
                      <AdminTableCell className="text-muted-foreground" title={reporterName}>
                        {reporterName}
                      </AdminTableCell>
                      {isDomestic ? (
                        <AdminTableCell className="capitalize text-muted-foreground">
                          {domesticTypeLabel(report.type)}
                        </AdminTableCell>
                      ) : null}
                      <AdminTableCell className="text-muted-foreground" title={report.location}>
                        {report.location}
                      </AdminTableCell>
                      {!isDomestic ? (
                        <AdminTableCell
                          className="text-muted-foreground"
                          title={report.assignedRescuerName ?? 'Unassigned'}
                        >
                          {report.assignedRescuerName ?? (
                            <span className="text-amber-600 dark:text-amber-400">Unassigned</span>
                          )}
                        </AdminTableCell>
                      ) : null}
                      <AdminTableCell truncate={false}>
                        <Badge
                          variant={
                            report.status === 'pending' || report.status === 'accepted'
                              ? 'default'
                              : 'secondary'
                          }
                          className="shrink-0 whitespace-nowrap"
                        >
                          {statusLabel(report.status)}
                        </Badge>
                      </AdminTableCell>
                      <AdminTableCell className="text-muted-foreground" title={dateLine}>
                        {dateLine}
                      </AdminTableCell>
                      <AdminTableActionsCell>
                        <div className="flex items-center gap-1">
                          <AdminTableActions
                            viewOnly={isDomestic}
                            showAssign={
                              !isDomestic &&
                              report.status !== 'en_route' &&
                              canAdminAssignRescuer(report.status)
                            }
                            showReject={!isDomestic && report.status === 'pending'}
                            onAssign={() => openAssignDialog(report)}
                            onReject={() => {
                              setRejectTarget(report)
                              setRejectOpen(true)
                            }}
                            onAction={(action) => handleAction(report, action)}
                          />
                          {!isDomestic && (
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(report)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Download PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </AdminTableActionsCell>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePaginationBar pagination={pagination} />
      </div>

      <AdminReportDialog
        report={selected}
        adminEmail={admin.email}
        mode={dialogMode}
        readOnly={isDomestic}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {!isDomestic ? (
        <>
          <AdminAssignRescuerDialog
            report={assignTarget}
            adminEmail={admin.email}
            open={assignOpen}
            onOpenChange={setAssignOpen}
          />

          <DoubleConfirmation
            open={rejectOpen}
            onOpenChange={(open) => {
              setRejectOpen(open)
              if (!open) setRejectTarget(null)
            }}
            step1={{
              title: "Reject report?",
              description: "Are you sure you want to reject this report?",
              confirmLabel: "Continue",
              cancelLabel: "Back",
            }}
            step2={{
              title: "Confirm rejection",
              description: rejectTarget
                ? `This will reject the report for "${rejectTarget.animalName}". This action cannot be undone.`
                : '',
              confirmLabel: "Reject",
              cancelLabel: "Cancel",
            }}
            confirmVariant="destructive"
            onConfirm={confirmReject}
          />

          <DoubleConfirmation
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            step1={{
              title: "Delete report?",
              description: "Are you sure you want to delete this report?",
              confirmLabel: "Continue",
              cancelLabel: "Back",
            }}
            step2={{
              title: "Confirm deletion",
              description: deleteTarget
                ? `This will permanently delete the report for "${deleteTarget.animalName}". This action cannot be undone.`
                : '',
              confirmLabel: "Delete",
              cancelLabel: "Cancel",
            }}
            confirmVariant="destructive"
            loading={deleting}
            onConfirm={confirmDelete}
          />
        </>
      ) : null}
    </div>
  )
}
