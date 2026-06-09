import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Plus, Search } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { DoubleConfirmation } from '@/components/DoubleConfirmation'
import { AdminTableActions, type AdminRowAction } from '@/components/admin/AdminTableActions'
import { AdminTableActionsCell, AdminTableCell } from '@/components/admin/AdminTableCell'
import { AdminTablePaginationBar } from '@/components/admin/AdminTablePagination'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'
import { AdminWildlifeDialog } from '@/components/admin/AdminWildlifeDialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { WildlifeSpecies } from '@/data/wildlife'
import { statusLabels } from '@/data/wildlife'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type DialogMode = 'view' | 'edit' | 'create'

export function AdminWildlifePage() {
  const { admin } = useAdminAuth()
  const deleteItem = useMutation(api.content.deleteWildlifeItem)
  const rows = useQuery(api.content.listWildlife)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<WildlifeSpecies | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WildlifeSpecies | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = search.trim().toLowerCase()
    
    // --- VERCEL FIX: Map backend image string to frontend images array here ---
    return rows.filter((species) => {
      if (!q) return true
      return (
        species.commonName.toLowerCase().includes(q) ||
        species.scientificName.toLowerCase().includes(q) ||
        species.localName.toLowerCase().includes(q)
      )
    }).map((item: any) => ({
      ...item,
      images: item.images || (item.image ? [item.image] : [])
    })) as WildlifeSpecies[]
  }, [rows, search])

  const pagination = usePaginatedRows(filtered, { resetKey: search })

  function openDialog(species: WildlifeSpecies | null, mode: DialogMode) {
    setSelected(species)
    setDialogMode(mode)
    setDialogOpen(true)
  }

  function handleAction(species: WildlifeSpecies, action: AdminRowAction) {
    if (action === 'delete') {
      setDeleteTarget(species)
      setDeleteOpen(true)
      return
    }
    openDialog(species, action)
  }

  async function confirmDelete() {
    if (!admin || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteItem({
        adminEmail: normalizeEmail(admin.email),
        itemId: deleteTarget.id,
      })
      toast.success('Species deleted')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete species')
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
          Manage wildlife species shown on the public Wildlife Guide.
        </p>
        <Button
          type="button"
          onClick={() => openDialog(null, 'create')}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add species
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search species..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[24%] px-4 py-3 font-medium">Common name</th>
                <th className="w-[30%] px-4 py-3 font-medium">Scientific name</th>
                <th className="w-[14%] px-4 py-3 font-medium">Category</th>
                <th className="w-[20%] px-4 py-3 font-medium">Status</th>
                <th className="w-14 px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No species found.
                  </td>
                </tr>
              ) : (
                pagination.paginatedRows.map((species) => (
                  <tr key={species.id} className="border-b border-border/60">
                    <AdminTableCell className="font-medium" title={species.commonName}>
                      {species.commonName}
                    </AdminTableCell>
                    <AdminTableCell
                      className="italic text-muted-foreground"
                      title={species.scientificName}
                    >
                      {species.scientificName}
                    </AdminTableCell>
                    <AdminTableCell className="capitalize">{species.category}</AdminTableCell>
                    <AdminTableCell>
                      <Badge variant="secondary" className="max-w-full truncate">
                        {statusLabels[species.status]}
                      </Badge>
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminTableActions onAction={(action) => handleAction(species, action)} />
                    </AdminTableActionsCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePaginationBar pagination={pagination} />
      </div>

      <AdminWildlifeDialog
        species={selected}
        adminEmail={normalizeEmail(admin.email)}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <DoubleConfirmation
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        step1={{
          title: "Delete species?",
          description: "Are you sure you want to delete this species?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: "Confirm deletion",
          description: deleteTarget
            ? `Remove "${deleteTarget.commonName}" from the wildlife guide? This cannot be undone.`
            : '',
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
        }}
        confirmVariant="destructive"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
