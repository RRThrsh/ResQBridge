import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
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
import { Badge } from '@/components/ui/badge'
import { normalizeEmail } from '@/lib/admin'
import { formatDateTime } from '@/lib/dates'
import { useQuery } from 'convex/react'
import { toast } from 'sonner'

type DialogMode = 'view' | 'edit'

type AdminUser = Doc<'users'>

type Props = {
  userRow: AdminUser | null
  adminEmail: string
  mode: DialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUserDialog({
  userRow,
  adminEmail,
  mode,
  open,
  onOpenChange,
}: Props) {
  const updateUser = useMutation(api.admin.updateUser)
  const admins = useQuery(
    api.admin.listAdmins,
    adminEmail ? { adminEmail: normalizeEmail(adminEmail) } : 'skip',
  )
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ firstName: '', lastName: '' })

  const isView = mode === 'view'

  const draftSyncKey = open && !isView && userRow ? userRow._id : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)
  if (draftSyncKey !== prevDraftSyncKey && userRow) {
    setPrevDraftSyncKey(draftSyncKey)
    if (draftSyncKey) {
      setDraft({
        firstName: userRow.firstName,
        lastName: userRow.lastName,
      })
    }
  }

  if (!userRow) return null

  const activeUser = userRow
  const isDbAdmin = admins?.some(
    (admin) => normalizeEmail(admin.email) === normalizeEmail(activeUser.email),
  )
  const role = activeUser.role ?? (isDbAdmin ? 'admin' : 'user')

  async function handleSave() {
    setSaving(true)
    try {
      await updateUser({
        adminEmail: normalizeEmail(adminEmail),
        userId: activeUser._id as Id<'users'>,
        firstName: draft.firstName,
        lastName: draft.lastName,
      })
      toast.success('User updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isView ? 'View user' : 'Edit user'}</DialogTitle>
          <DialogDescription>{userRow.email}</DialogDescription>
        </DialogHeader>

        {isView ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="font-medium">
                {userRow.firstName} {userRow.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>{userRow.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Contact number</dt>
              <dd>{userRow.contactPhone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Role</dt>
              <dd className="mt-1">
                <Badge variant={role === 'admin' ? 'default' : 'outline'}>{role}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Joined</dt>
              <dd>{formatDateTime(userRow.createdAt)}</dd>
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
              Email cannot be changed from the admin panel.
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
