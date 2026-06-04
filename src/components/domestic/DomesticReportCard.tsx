import { Link } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { formatDate } from '@/lib/dates'
import { statusLabel, type RescuerStoredReport } from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'
import { cn } from '@/lib/utils'

type Props = {
  report: any // Changed to any to catch raw Convex fields if mapping missed them
  variant?: 'default' | 'compact'
}

export function DomesticReportCard({ report, variant = 'default' }: Props) {
  const isCompact = variant === 'compact'

  // Safety net: Check all common image fields from your database, then fallback to the helper
  const actualPhoto = report.photoUrl || report.imageUrl || (report.photos && report.photos[0]) || getReportPhotos(report)[0]
  
  // Count remaining photos if it's an array
  const photoCount = report.photos?.length || getReportPhotos(report).length
  const extraPhotos = photoCount > 1 ? photoCount - 1 : 0

  return (
    <Link
      to={`/pwrcc/domestic/reports/${report.id || report._id}`}
      className={cn(
        'group flex gap-4 rounded-2xl border border-border bg-card p-3 sm:p-4',
        'transition-all hover:border-primary/30 hover:shadow-sm',
      )}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5',
          isCompact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24',
        )}
      >
        {actualPhoto ? (
          <>
            <img
              src={actualPhoto}
              alt={report.animalName || 'Report photo'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {extraPhotos > 0 ? (
              <span className="absolute bottom-1 right-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                +{extraPhotos}
              </span>
            ) : null}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground bg-muted">
            No photo
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <RescuerStatusBadge status={report.status} compact />
          {report.reportNumber ? (
            <span className="text-[10px] font-mono text-muted-foreground">
              {report.reportNumber}
            </span>
          ) : null}
        </div>

        <h3
          className={cn(
            'truncate font-semibold text-foreground',
            isCompact ? 'text-sm' : 'text-base sm:text-lg',
          )}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {report.animalName || 'Unknown Animal'}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{report.location || 'No location provided'}</span>
        </p>

        <p className="mt-1.5 text-[11px] text-muted-foreground capitalize">
          Domestic Report
          <span className="mx-1.5 text-border">·</span>
          {formatDate(report.seenAt ?? report.createdAt ?? Date.now())}
          <span className="mx-1.5 text-border">·</span>
          {statusLabel(report.status)}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}
