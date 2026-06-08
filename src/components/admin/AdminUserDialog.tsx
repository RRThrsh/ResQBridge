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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUserDialog({
  userRow,
  open,
  onOpenChange,
}: Props) {
  if (!userRow) return null

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            View User
          </DialogTitle>

          <DialogDescription>
            User account details
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">
              Full name
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
              Role
            </dt>

            <dd className="capitalize">
              {userRow.role || 'user'}
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
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
