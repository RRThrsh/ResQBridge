import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeEmail } from '@/lib/admin'
import { formatDateTime } from '@/lib/dates'
import { toast } from 'sonner'

export type AdminTableRow = {
  email: string
  firstName: string
  lastName: string
  createdAt: number
}

type DialogMode = 'view' | 'edit'

type Props = {
  adminRow: AdminTableRow | null
  actorEmail: string
  mode: DialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdatedSelf?: (patch: Pick<AdminTableRow, 'firstName' | 'lastName'>) => void
}

export function AdminAdminDialog({
  adminRow,
  actorEmail,
  mode,
  open,
  onOpenChange,
  onUpdatedSelf,
}: Props) {
  const updateAdmin = useMutation(api.admin.updateAdmin)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ firstName: '', lastName: '' })

  const isView = mode === 'view'

  const draftSyncKey = open && !isView && adminRow ? adminRow.email : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)
  if (draftSyncKey !== prevDraftSyncKey && adminRow) {
    setPrevDraftSyncKey(draftSyncKey)
    if (draftSyncKey) {
      setDraft({
        firstName: adminRow.firstName,
        lastName: adminRow.lastName,
      })
    }
  }

  if (!adminRow) return null

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateAdmin({
        adminEmail: normalizeEmail(actorEmail),
        targetEmail: adminRow!.email,
        firstName: draft.firstName,
        lastName: draft.lastName,
      })

      if (normalizeEmail(adminRow!.email) === normalizeEmail(actorEmail)) {
        onUpdatedSelf?.({
          firstName: updated.firstName,
          lastName: updated.lastName,
        })
      }

      toast.success('Admin updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update admin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isView ? 'View admin' : 'Edit admin'}</DialogTitle>
          <DialogDescription>{adminRow.email}</DialogDescription>
        </DialogHeader>

        {isView ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="font-medium">
                {adminRow.firstName} {adminRow.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>{adminRow.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Admin since</dt>
              <dd>{formatDateTime(adminRow.createdAt)}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">First name</label>
              <Input
                value={draft.firstName}
                onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Last name</label>
              <Input
                value={draft.lastName}
                onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Remove and re-add the admin to use a different email.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {isView ? 'Close' : 'Cancel'}
          </Button>
          {!isView ? (
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
