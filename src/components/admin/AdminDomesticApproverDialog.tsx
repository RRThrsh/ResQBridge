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
import type { ApproverTableRow } from '@/pages/admin/AdminDomesticApproversPage'

type DialogMode = 'view' | 'edit'

type Props = {
  approverRow: ApproverTableRow | null
  actorEmail: string
  mode: DialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminDomesticApproverDialog({ approverRow, actorEmail, mode, open, onOpenChange }: Props) {
  // @ts-ignore - Bypassing strict TS check
  const updateApprover = useMutation((api as any).domestic.updateApprover)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ firstName: '', lastName: '', contactPhone: '' })

  const isView = mode === 'view'

  const draftSyncKey = open && !isView && approverRow ? approverRow.email : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)
  
  if (draftSyncKey !== prevDraftSyncKey && approverRow) {
    setPrevDraftSyncKey(draftSyncKey)
    if (draftSyncKey) {
      setDraft({
        firstName: approverRow.firstName,
        lastName: approverRow.lastName,
        contactPhone: approverRow.contactPhone || '',
      })
    }
  }

  if (!approverRow) return null

  async function handleSave() {
    setSaving(true)
    try {
      await updateApprover({
        adminEmail: normalizeEmail(actorEmail),
        targetEmail: approverRow!.email,
        firstName: draft.firstName,
        lastName: draft.lastName,
        contactPhone: draft.contactPhone,
      })
      toast.success('Approver updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update approver')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isView ? 'View Approver' : 'Edit Approver'}</DialogTitle>
          <DialogDescription>{approverRow.email}</DialogDescription>
        </DialogHeader>

        {isView ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="font-medium">
                {approverRow.firstName} {approverRow.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>{approverRow.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Contact number</dt>
              <dd>{approverRow.contactPhone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Added on</dt>
              <dd>{formatDateTime(approverRow.createdAt)}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">First name</label>
              <Input value={draft.firstName} onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Last name</label>
              <Input value={draft.lastName} onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Contact number</label>
              <Input type="tel" value={draft.contactPhone} onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))} required />
            </div>
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
