import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

type Props = {
  photos: string[]
  alt?: string
  variant?: 'hero' | 'thumbs' | 'card'
  className?: string
}

export function ReportPhotosGallery({
  photos,
  alt = 'Report photo',
  variant = 'hero',
  className,
}: Props) {
  const { t } = useLanguage()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (photos.length === 0) return null

  const activeIndex = expandedIndex ?? 0

  function openAt(index: number) {
    setExpandedIndex(index)
  }

  function close() {
    setExpandedIndex(null)
  }

  function showPrev() {
    setExpandedIndex((current) => {
      const index = current ?? 0
      return index === 0 ? photos.length - 1 : index - 1
    })
  }

  function showNext() {
    setExpandedIndex((current) => {
      const index = current ?? 0
      return index === photos.length - 1 ? 0 : index + 1
    })
  }

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={() => openAt(0)}
          className={cn('relative block overflow-hidden rounded-lg', className)}
        >
          <img src={photos[0]} alt={alt} className="h-20 w-20 object-cover" />
          {photos.length > 1 ? (
            <span className="absolute bottom-1 right-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
              +{photos.length - 1}
            </span>
          ) : null}
        </button>
        {expandedIndex !== null ? (
          <PhotoLightbox
            photos={photos}
            alt={alt}
            index={activeIndex}
            onClose={close}
            onPrev={showPrev}
            onNext={showNext}
            t={t}
          />
        ) : null}
      </>
    )
  }

  if (variant === 'thumbs') {
    return (
      <>
        <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
          {photos.map((photo, index) => (
            <button
              key={`${index}-${photo.slice(0, 16)}`}
              type="button"
              onClick={() => openAt(index)}
              className="shrink-0 overflow-hidden rounded-lg border border-border"
            >
              <img
                src={photo}
                alt={`${alt} ${index + 1}`}
                className="h-16 w-16 object-cover"
              />
            </button>
          ))}
        </div>
        {expandedIndex !== null ? (
          <PhotoLightbox
            photos={photos}
            alt={alt}
            index={activeIndex}
            onClose={close}
            onPrev={showPrev}
            onNext={showNext}
            t={t}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      <div className={className}>
        <button
          type="button"
          onClick={() => openAt(0)}
          className="relative block w-full overflow-hidden rounded-2xl border border-border ring-1 ring-foreground/5"
        >
          <img
            src={photos[0]}
            alt={alt}
            className="aspect-[4/3] w-full object-cover"
          />
          {photos.length > 1 ? (
            <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
              {photos.length} {t('reportPhotos.label')}
            </span>
          ) : null}
        </button>
        {photos.length > 1 ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, index) => (
              <button
                key={`${index}-${photo.slice(0, 16)}`}
                type="button"
                onClick={() => openAt(index)}
                className="shrink-0 overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={photo}
                  alt={`${alt} ${index + 1}`}
                  className="h-14 w-14 object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Search className="h-3 w-3" />
          {t('reportPhotos.tapToExpand')}{photos.length > 1 ? <>&nbsp;· {t('reportPhotos.swipeHint')}</> : ''}
        </p>
      </div>
      {expandedIndex !== null ? (
        <PhotoLightbox
          photos={photos}
          alt={alt}
          index={activeIndex}
          onClose={close}
          onPrev={showPrev}
          onNext={showNext}
          t={t}
        />
      ) : null}
    </>
  )
}

function PhotoLightbox({
  photos,
  alt,
  index,
  onClose,
  onPrev,
  onNext,
  t,
}: {
  photos: string[]
  alt: string
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  t: (key: string) => string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('reportPhotos.expandedLabel')}
    >
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label={t('reportPhotos.closeLabel')}
      />
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            aria-label={t('reportPhotos.prevLabel')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            aria-label={t('reportPhotos.nextLabel')}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
            {index + 1} / {photos.length}
          </p>
        </>
      ) : null}
      <img
        src={photos[index]}
        alt={`${alt} ${index + 1}`}
        className="relative z-[1] max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  )
}
