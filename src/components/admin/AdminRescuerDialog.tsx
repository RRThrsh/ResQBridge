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

export type RescuerTableRow = {
  email: string
  firstName: string
  lastName: string
  contactPhone: string
  createdAt: number
}

type DialogMode =
  | 'view'
  | 'edit'

type Props = {
  rescuerRow:
    | RescuerTableRow
    | null

  actorEmail: string
  mode: DialogMode
  open: boolean

  onOpenChange: (
    open: boolean,
  ) => void
}

export function AdminRescuerDialog({
  rescuerRow,
  actorEmail,
  mode,
  open,
  onOpenChange,
}: Props) {
  const updateRescuer =
    useMutation(
      api.rescuers
        .updateRescuer,
    )

  const [saving, setSaving] =
    useState(false)

  const [draft, setDraft] =
    useState({
      firstName: '',
      lastName: '',
      contactPhone: '',
      password: '',
    })

  const isView = mode === 'view'

  const draftSyncKey =
    open &&
    !isView &&
    rescuerRow
      ? rescuerRow.email
      : null

  const [
    prevDraftSyncKey,
    setPrevDraftSyncKey,
  ] = useState<
    string | null
  >(null)

  if (
    draftSyncKey !==
      prevDraftSyncKey &&
    rescuerRow
  ) {
    setPrevDraftSyncKey(
      draftSyncKey,
    )

    if (draftSyncKey) {
      setDraft({
        firstName:
          rescuerRow.firstName,
        lastName:
          rescuerRow.lastName,
        contactPhone:
          rescuerRow.contactPhone,
        password: '',
      })
    }
  }

  if (!rescuerRow) return null

  async function handleSave() {
    setSaving(true)

    try {
      await updateRescuer({
        adminEmail:
          normalizeEmail(
            actorEmail,
          ),

        targetEmail:
          rescuerRow!.email,

        firstName:
          draft.firstName,

        lastName:
          draft.lastName,

        contactPhone:
          draft.contactPhone,

        password:
          draft.password.trim() ||
          undefined,
      })

      toast.success(
        'Rescuer updated',
      )

      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update rescuer',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isView
              ? 'View rescuer'
              : 'Edit rescuer'}
          </DialogTitle>

          <DialogDescription>
            {rescuerRow.email}
          </DialogDescription>
        </DialogHeader>

        {isView ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">
                Name
              </dt>

              <dd className="font-medium">
                {
                  rescuerRow.firstName
                }{' '}
                {
                  rescuerRow.lastName
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Email
              </dt>

              <dd>
                {rescuerRow.email}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Contact number
              </dt>

              <dd>
                {rescuerRow.contactPhone ||
                  '—'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Rescuer since
              </dt>

              <dd>
                {formatDateTime(
                  rescuerRow.createdAt,
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                First name
              </label>

              <Input
                value={
                  draft.firstName
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    firstName:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Last name
              </label>

              <Input
                value={
                  draft.lastName
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    lastName:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Contact number
              </label>

              <Input
                type="tel"
                value={
                  draft.contactPhone
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    contactPhone:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                New Password
              </label>

              <Input
                type="password"
                value={
                  draft.password
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    password:
                      e.target.value,
                  }))
                }
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            {isView
              ? 'Close'
              : 'Cancel'}
          </Button>

          {!isView && (
            <Button
              type="button"
              onClick={
                handleSave
              }
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save changes'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
