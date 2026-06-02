import { cn } from '@/lib/utils'
import { venueHoursStatusStyles, type VenueHoursSnapshot } from '@/lib/venueHours'

type Props = {
  snapshot: VenueHoursSnapshot
  className?: string
  showDetail?: boolean
}

export function VenueHoursStatusBadge({
  snapshot,
  className,
  showDetail = false,
}: Props) {
  const { status, label, detail } = snapshot
  const styles = venueHoursStatusStyles(status)

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
          styles.badge,
        )}
      >
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', styles.dot)} aria-hidden />
        {label}
      </span>
      {showDetail && (
        <span className="text-[11px] text-muted-foreground leading-relaxed">{detail}</span>
      )}
    </div>
  )
}
