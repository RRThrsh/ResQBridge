import { Eye, MoreHorizontal, Trash2, UserPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type AdminRowAction = 'view' | 'delete'

type Props = {
  onAction: (action: AdminRowAction) => void
  onAssign?: () => void
  disableDelete?: boolean
  disableEdit?: boolean
  showAssign?: boolean
  viewOnly?: boolean
  className?: string
}

export function AdminTableActions({
  onAction,
  onAssign,
  disableDelete = false,
  showAssign = false,
  viewOnly = false,
  className,
}: Props) {
  if (viewOnly) {
    return (
      <button
        type="button"
        onClick={() => onAction('view')}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        aria-label="View report"
      >
        <Eye className="h-4 w-4" />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-40">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onAction('view')}
        >
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        {showAssign && onAssign ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={onAssign}
          >
            <UserPlus className="h-4 w-4" />
            Assign rescuer
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          disabled={disableDelete}
          onClick={() => onAction('delete')}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
