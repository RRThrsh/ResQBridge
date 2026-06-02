import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Search } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog'
import { AdminAssignRescuerDialog } from '@/components/admin/AdminAssignRescuerDialog'
import { AdminReportDialog } from '@/components/admin/AdminReportDialog'
import { AdminTableActions, type AdminRowAction } from '@/components/admin/AdminTableActions'
import { AdminTableActionsCell, AdminTableCell } from '@/components/admin/AdminTableCell'
import { AdminTablePaginationBar } from '@/components/admin/AdminTablePagination'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type DialogMode = 'view' | 'edit'

type Props = {
  category: ReportCategory
}

function domesticTypeLabel(type: string) {
  return DOMESTIC_REPORT_TYPES.find((t) => t.value === type)?.label ?? formatReportType(type)
}

export function AdminCategoryReportsPage({ category }: Props) {
  const { admin } = useAdminAuth()
  const deleteReport = useMutation(api.admin.deleteReport)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'accepted' | 'en_route' | 'completed'
  >('all')
  const [selected, setSelected] = useState<AdminStoredReport | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<AdminStoredReport | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminStoredReport | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  function openDialog(report: AdminStoredReport, mode: DialogMode = 'view') {
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
                ['accepted', 'Accepted'],
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
                <th className="w-[14%] px-4 py-3 font-medium">Rescuer</th>
                <th className="w-[14%] px-4 py-3 font-medium">Status</th>
                <th className="w-[12%] px-4 py-3 font-medium">Date</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isDomestic ? 8 : 7}
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
                  const dateLine = isDomestic
                    ? formatDate(report.createdAt)
                    : `${formatDate(report.createdAt)} · ${formatReportType(report.type)}`

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
                      <AdminTableCell
                        className="text-muted-foreground"
                        title={report.assignedRescuerName ?? 'Unassigned'}
                      >
                        {report.assignedRescuerName ?? (
                          <span className="text-amber-600 dark:text-amber-400">Unassigned</span>
                        )}
                      </AdminTableCell>
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
                        <AdminTableActions
                          viewOnly={isDomestic}
                          showAssign={!isDomestic && canAdminAssignRescuer(report.status)}
                          onAssign={() => openAssignDialog(report)}
                          onAction={(action) => handleAction(report, action)}
                        />
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

          <AdminConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete report?"
            description={
              deleteTarget
                ? `This will permanently delete the report for "${deleteTarget.animalName}". This action cannot be undone.`
                : ''
            }
            loading={deleting}
            onConfirm={confirmDelete}
          />
        </>
      ) : null}
    </div>
  )
}
