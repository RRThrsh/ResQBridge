import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { formatDate } from '@/lib/dates'
import { statusLabel } from '@/lib/reports'
import { cn } from '@/lib/utils'

type Props = {
  report: any
  variant?: 'default' | 'compact'
}

export function DomesticReportCard({ report, variant = 'default' }: Props) {
  const isCompact = variant === 'compact'
  const rawData = report as any
  const [openImage, setOpenImage] = useState(false)

  // ---------------------------------------------------------
  // 1. EXACT SAME PHOTO LOGIC AS THE DETAIL PAGE
  // ---------------------------------------------------------
let allPhotos: string[] = []

if (rawData.photoDataUrls && Array.isArray(rawData.photoDataUrls)) {
  allPhotos = rawData.photoDataUrls
} else if (rawData.photos && Array.isArray(rawData.photos)) {
  allPhotos = rawData.photos
} else if (rawData.photoUrl) {
  allPhotos = [rawData.photoUrl]
}

  // Grab the first photo for the card cover
  const finalPhotoUrl = allPhotos.length > 0 ? allPhotos[0] : null
  
  // Calculate how many EXTRA photos there are for the +2 badge
  const extraPhotos = allPhotos.length > 1 ? allPhotos.length - 1 : 0

return (
  <>
    <Link
      to={`/pwrcc/domestic/reports/${rawData._id}`}
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
        {finalPhotoUrl ? (
          <>
            <img
              src={finalPhotoUrl}
              alt={rawData.animalName || 'Report photo'}
              className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpenImage(true)
              }}
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
          <RescuerStatusBadge status={rawData.status} compact />
          {rawData.reportNumber ? (
            <span className="text-[10px] font-mono text-muted-foreground">
              {rawData.reportNumber}
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
          {rawData.type === 'missing'
            ? 'Missing Pet'
            : rawData.type === 'found'
            ? 'Found Animal'
            : rawData.type === 'stray'
            ? 'Stray Animal'
            : rawData.type === 'injured'
            ? 'Injured Animal'
            : 'Domestic Report'}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{rawData.location || 'No location provided'}</span>
        </p>

        <p className="mt-1.5 text-[11px] text-muted-foreground capitalize">
          Domestic Report
          <span className="mx-1.5 text-border">·</span>
          {formatDate(rawData.seenAt ?? rawData.createdAt ?? rawData._creationTime ?? Date.now())}
          <span className="mx-1.5 text-border">·</span>
          {statusLabel(rawData.status)}
        </p>
      </div>
      

      <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
        <Dialog
      open={openImage}
      onOpenChange={setOpenImage}
    >
      <DialogContent className="w-full max-w-6xl border-none bg-transparent p-0 shadow-none">
        <div className="flex items-center justify-center">
          <img
            src={finalPhotoUrl || ''}
            alt="Expanded report"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
