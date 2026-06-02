import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TextCellProps = {
  children: ReactNode
  className?: string
  title?: string
  /** When false, cell content (e.g. badges) is not clipped by truncate. Default true. */
  truncate?: boolean
}

export function AdminTableCell({
  children,
  className,
  title,
  truncate = true,
}: TextCellProps) {
  const label =
    title ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined)

  return (
    <td className={cn(truncate && 'max-w-0', 'px-4 py-3', className)}>
      {truncate ? (
        <span className="block truncate whitespace-nowrap" title={label}>
          {children}
        </span>
      ) : (
        <div className="flex min-w-0 items-center" title={label}>
          {children}
        </div>
      )}
    </td>
  )
}

export function AdminTableActionsCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <td className={cn('w-14 shrink-0 px-4 py-3', className)}>{children}</td>
}
