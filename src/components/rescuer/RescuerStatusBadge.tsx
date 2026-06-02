import { statusBadgeLabel, statusTone, type ReportStatus } from '@/lib/reports'
import { cn } from '@/lib/utils'

type Props = {
  status: ReportStatus
  className?: string
  compact?: boolean
}

export function RescuerStatusBadge({ status, className, compact }: Props) {
  const tone = statusTone(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        compact ? 'px-2 py-0.5 text-[10px] uppercase tracking-wide' : 'px-2.5 py-1 text-xs',
        tone.badge,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)} />
      {statusBadgeLabel(status)}
    </span>
  )
}
