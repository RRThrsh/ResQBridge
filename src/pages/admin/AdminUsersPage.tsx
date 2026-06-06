import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Search } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog'
import { AdminTableActions, type AdminRowAction } from '@/components/admin/AdminTableActions'
import { AdminTableActionsCell, AdminTableCell } from '@/components/admin/AdminTableCell'
import { AdminTablePaginationBar } from '@/components/admin/AdminTablePagination'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'
import { AdminUserDialog } from '@/components/admin/AdminUserDialog'
import { Input } from '@/components/ui/input'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'


type AdminUserRow = Doc<'users'>

export function AdminUsersPage() {
  const { admin } = useAdminAuth()
  const deleteUser = useMutation(api.admin.deleteUser)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminUserRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const rows = useQuery(
    api.admin.listUsers,
    admin ? { adminEmail: normalizeEmail(admin.email) } : 'skip',
  )


const users = useMemo(() => {
  if (!rows) return []

  const q = search.trim().toLowerCase()

  return rows
    .filter((row) => row.role === 'user')
    .filter((row) => {
      if (!q) return true

      const fullName = `${row.firstName} ${row.lastName}`.toLowerCase()

      return row.email.includes(q) || fullName.includes(q)
    })
}, [rows, search])

  const pagination = usePaginatedRows(users, { resetKey: search })

function openDialog(row: AdminUserRow) {
  setSelected(row)
  setDialogOpen(true)
}

  function handleAction(row: AdminUserRow, action: AdminRowAction) {
    if (action === 'delete') {
      setDeleteTarget(row)
      setDeleteOpen(true)
      return
    }
    openDialog(row)
  }

  async function confirmDelete() {
    if (!admin || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser({
        adminEmail: normalizeEmail(admin.email),
        userId: deleteTarget._id as Id<'users'>,
      })
      toast.success('User deleted')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete user')
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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[22%] px-4 py-3 font-medium">Name</th>
                <th className="w-[34%] px-4 py-3 font-medium">Email</th>
<th className="w-[20%] px-4 py-3 font-medium">Joined</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedRows.map((row) => {

                  const isSelf = row.email === admin.email
                  const fullName = `${row.firstName} ${row.lastName}`

                  return (
                    <tr key={row._id} className="border-b border-border/60">
                      <AdminTableCell className="font-medium" title={fullName}>
                        {fullName}
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
  disableDelete={isSelf}
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

      <AdminUserDialog
        userRow={selected}

        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AdminConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user?"
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.email} and all reports they submitted. This cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
