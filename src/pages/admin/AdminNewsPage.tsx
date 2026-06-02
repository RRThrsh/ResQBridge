import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Plus, Search } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog'
import { AdminNewsDialog } from '@/components/admin/AdminNewsDialog'
import { AdminTableActions, type AdminRowAction } from '@/components/admin/AdminTableActions'
import { AdminTableActionsCell, AdminTableCell } from '@/components/admin/AdminTableCell'
import { AdminTablePaginationBar } from '@/components/admin/AdminTablePagination'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { NewsEvent } from '@/data/events'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type DialogMode = 'view' | 'edit' | 'create'

export function AdminNewsPage() {
  const { admin } = useAdminAuth()
  const deleteItem = useMutation(api.content.deleteNewsItem)
  const rows = useQuery(api.content.listNews)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<NewsEvent | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<NewsEvent | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = search.trim().toLowerCase()
    return rows.filter((item) => {
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q)
      )
    })
  }, [rows, search])

  const pagination = usePaginatedRows(filtered, { resetKey: search })

  function openDialog(item: NewsEvent | null, mode: DialogMode) {
    setSelected(item)
    setDialogMode(mode)
    setDialogOpen(true)
  }

  function handleAction(item: NewsEvent, action: AdminRowAction) {
    if (action === 'delete') {
      setDeleteTarget(item)
      setDeleteOpen(true)
      return
    }
    openDialog(item, action)
  }

  async function confirmDelete() {
    if (!admin || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteItem({
        adminEmail: normalizeEmail(admin.email),
        itemId: deleteTarget.id,
      })
      toast.success('Item deleted')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete item')
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Manage news and events displayed on the public site.
        </p>
        <Button
          type="button"
          onClick={() => openDialog(null, 'create')}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add news or event
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news & events..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[38%] px-4 py-3 font-medium">Title</th>
                <th className="w-[12%] px-4 py-3 font-medium">Type</th>
                <th className="w-[18%] px-4 py-3 font-medium">Category</th>
                <th className="w-[14%] px-4 py-3 font-medium">Date</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No items found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedRows.map((item) => (
                  <tr key={item.id} className="border-b border-border/60">
                    <AdminTableCell className="font-medium" title={item.title}>
                      {item.title}
                    </AdminTableCell>
                    <AdminTableCell className="capitalize">{item.type}</AdminTableCell>
                    <AdminTableCell>
                      <Badge variant="outline" className="max-w-full truncate">
                        {item.category}
                      </Badge>
                    </AdminTableCell>
                    <AdminTableCell className="text-muted-foreground">
                      {formatDate(item.date)}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminTableActions onAction={(action) => handleAction(item, action)} />
                    </AdminTableActionsCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePaginationBar pagination={pagination} />
      </div>

      <AdminNewsDialog
        item={selected}
        adminEmail={normalizeEmail(admin.email)}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AdminConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete item?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}" from the site? This cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
