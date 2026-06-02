import { Link } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { formatDate } from '@/lib/dates'
import { statusLabel, type RescuerStoredReport } from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'
import { cn } from '@/lib/utils'

type Props = {
  report: RescuerStoredReport
  variant?: 'default' | 'compact'
}

export function RescuerReportCard({ report, variant = 'default' }: Props) {
  const isCompact = variant === 'compact'

  return (
    <Link
      to={`/pwrcc/rescuer/reports/${report.id}`}
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
        {getReportPhotos(report).length > 0 ? (
          <>
            <img
              src={getReportPhotos(report)[0]}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {getReportPhotos(report).length > 1 ? (
              <span className="absolute bottom-1 right-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                +{getReportPhotos(report).length - 1}
              </span>
            ) : null}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground">
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
          {report.animalName}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{report.location}</span>
        </p>

        <p className="mt-1.5 text-[11px] text-muted-foreground capitalize">
          {report.category}
          <span className="mx-1.5 text-border">·</span>
          {formatDate(report.seenAt ?? report.createdAt)}
          <span className="mx-1.5 text-border">·</span>
          {statusLabel(report.status)}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}
