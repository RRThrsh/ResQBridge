import type { Doc } from '../../../convex/_generated/dataModel'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

import { formatDateTime } from '@/lib/dates'


type AdminUser = Doc<'users'>

type Props = {
  userRow: AdminUser | null
  adminEmail: string
  open: boolean
  onOpenChange: (
    open: boolean,
  ) => void
}

export function AdminUserDialog({
  userRow,
  open,
  onOpenChange,
}: Props){
  if (!userRow) return null

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
            View user
          </DialogTitle>

          <DialogDescription>
            {userRow.email}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">
              Name
            </dt>

            <dd className="font-medium">
              {userRow.firstName}{' '}
              {userRow.lastName}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Email
            </dt>

            <dd>
              {userRow.email}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Contact number
            </dt>

            <dd>
              {userRow.contactPhone ||
                '—'}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Joined
            </dt>

            <dd>
              {formatDateTime(
                userRow.createdAt,
              )}
            </dd>
          </div>
        </dl>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(
                false,
              )
            }
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

