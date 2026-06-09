import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Plus, Search } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { DoubleConfirmation } from '@/components/DoubleConfirmation'
import { AdminTableActions, type AdminRowAction } from '@/components/admin/AdminTableActions'
import { AdminTableActionsCell, AdminTableCell } from '@/components/admin/AdminTableCell'
import { AdminTablePaginationBar } from '@/components/admin/AdminTablePagination'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'
import { AdminAddDomesticApproverDialog } from '@/components/admin/AdminAddDomesticApproverDialog'
import { AdminDomesticApproverDialog } from '@/components/admin/AdminDomesticApproverDialog'

export type ApproverTableRow = {
  email: string
  firstName: string
  lastName: string
  contactPhone: string
  createdAt: number
}

type DialogMode = 'view' | 'edit'

export function AdminDomesticApproversPage() {
  const { admin } = useAdminAuth()
  
  const removeApprover = useMutation((api as any).domestic.removeApprover)
  
  const approvers = useQuery(
    (api as any).domestic.listApprovers,
    admin ? { adminEmail: normalizeEmail(admin.email) } : 'skip',
  ) as ApproverTableRow[] | undefined

  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<ApproverTableRow | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ApproverTableRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!approvers) return []
    const q = search.trim().toLowerCase()
    return approvers.filter((row) => {
      if (!q) return true
      const fullName = `${row.firstName} ${row.lastName}`.toLowerCase()
      return row.email.includes(q) || fullName.includes(q)
    })
  }, [approvers, search])

  const pagination = usePaginatedRows(filtered, { resetKey: search })

  function openDialog(row: ApproverTableRow, mode: DialogMode) {
    setSelected(row)
    setDialogMode(mode)
    setDialogOpen(true)
  }

  function handleAction(row: ApproverTableRow, action: AdminRowAction) {
    if (action === 'delete') {
      setDeleteTarget(row)
      setDeleteOpen(true)
      return
    }
    openDialog(row, action)
  }

  async function confirmDelete() {
    if (!admin || !deleteTarget) return
    setDeleting(true)
    try {
      await removeApprover({
        adminEmail: normalizeEmail(admin.email),
        targetEmail: deleteTarget.email,
      })
      toast.success('Approver removed')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove approver')
    } finally {
      setDeleting(false)
    }
  }

  if (!admin || approvers === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domestic approvers..."
            className="pl-9"
          />
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Approver
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[30%] px-4 py-3 font-medium">Name</th>
                <th className="w-[35%] px-4 py-3 font-medium">Email</th>
                <th className="w-[20%] px-4 py-3 font-medium">Added</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No domestic approvers match your search.
                  </td>
                </tr>
              ) : (
                pagination.paginatedRows.map((row) => {
                  const name = `${row.firstName} ${row.lastName}`
                  return (
                    <tr key={row.email} className="border-b border-border/60">
                      <AdminTableCell className="font-medium" title={name}>
                        {name}
                      </AdminTableCell>
                      <AdminTableCell className="text-muted-foreground" title={row.email}>
                        {row.email}
                      </AdminTableCell>
                      <AdminTableCell className="text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </AdminTableCell>
                      <AdminTableActionsCell>
                        <AdminTableActions
  onAction={(action) =>
    handleAction(row, action)
  }
  disableEdit
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

      <AdminAddDomesticApproverDialog
        adminEmail={admin.email}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <AdminDomesticApproverDialog
        approverRow={selected}
        actorEmail={admin.email}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <DoubleConfirmation
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        step1={{
          title: "Remove domestic approver?",
          description: "Are you sure you want to remove this approver?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm removal",
          description: deleteTarget
            ? `Remove access for ${deleteTarget.email}? They will no longer be able to log in to the Domestic Portal.`
            : '',
          confirmLabel: "Remove",
          cancelLabel: "Cancel",
        }}
        confirmVariant="destructive"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
