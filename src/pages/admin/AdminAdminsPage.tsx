import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Plus, Search } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { AdminAddAdminDialog } from '@/components/admin/AdminAddAdminDialog'
import {
  AdminAdminDialog,
  type AdminTableRow,
} from '@/components/admin/AdminAdminDialog'
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog'
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

type DialogMode = 'view' | 'edit'

export function AdminAdminsPage() {
  const { admin, updateAdmin: updateSessionAdmin } = useAdminAuth()
  const removeAdmin = useMutation(api.admin.removeAdmin)
  const admins = useQuery(
    api.admin.listAdmins,
    admin ? { adminEmail: normalizeEmail(admin.email) } : 'skip',
  )
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<AdminTableRow | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminTableRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!admins) return []
    const q = search.trim().toLowerCase()
    return admins.filter((row) => {
      if (!q) return true
      const fullName = `${row.firstName} ${row.lastName}`.toLowerCase()
      return row.email.includes(q) || fullName.includes(q)
    })
  }, [admins, search])

  const pagination = usePaginatedRows(filtered, { resetKey: search })

  function openDialog(row: AdminTableRow, mode: DialogMode) {
    setSelected(row)
    setDialogMode(mode)
    setDialogOpen(true)
  }

  function handleAction(row: AdminTableRow, action: AdminRowAction) {
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
      await removeAdmin({
        adminEmail: normalizeEmail(admin.email),
        targetEmail: deleteTarget.email,
      })
      toast.success('Admin access removed')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove admin')
    } finally {
      setDeleting(false)
    }
  }

  if (!admin || admins === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const selfEmail = normalizeEmail(admin.email)
  const onlyOneAdmin = admins.length <= 1

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Admins can sign in with OTP, manage site content, reports, and users.
        </p>
        <Button type="button" onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add admin
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search admins..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[28%] px-4 py-3 font-medium">Name</th>
                <th className="w-[38%] px-4 py-3 font-medium">Email</th>
                <th className="w-[18%] px-4 py-3 font-medium">Admin since</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No admins found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedRows.map((row) => {
                  const isSelf = normalizeEmail(row.email) === selfEmail
                  const fullName = `${row.firstName} ${row.lastName}`

                  return (
                    <tr key={row.email} className="border-b border-border/60">
                      <AdminTableCell className="font-medium" title={fullName}>
                        {fullName}
                        {isSelf ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </AdminTableCell>
                      <AdminTableCell className="text-muted-foreground" title={row.email}>
                        {row.email}
                      </AdminTableCell>
                      <AdminTableCell className="text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </AdminTableCell>
                      <AdminTableActionsCell>
                        <AdminTableActions
                          onAction={(action) => handleAction(row, action)}
                          disableDelete={isSelf || onlyOneAdmin}
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

      <AdminAdminDialog
        adminRow={selected}
        actorEmail={admin.email}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdatedSelf={updateSessionAdmin}
      />

      <AdminAddAdminDialog
        adminEmail={admin.email}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <AdminConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove admin access?"
        description={
          deleteTarget
            ? `${deleteTarget.firstName} ${deleteTarget.lastName} (${deleteTarget.email}) will no longer be able to sign in to the admin panel.`
            : ''
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
