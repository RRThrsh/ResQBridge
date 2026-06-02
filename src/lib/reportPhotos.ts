import type { Id } from '../../convex/_generated/dataModel'

export type ReportPhotoStorageId = Id<'_storage'> | string

export const MAX_REPORT_PHOTOS = 5
export const MAX_REPORT_PHOTOS_TOTAL_BYTES = 50 * 1024 * 1024

/** Legacy inline data URLs (~900 KB encoded each). */
export const MAX_PHOTO_DATA_URL_LENGTH = 900_000

export const REPORT_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'

export type ReportPhotoSource = {
  photoDataUrls?: string[]
  photoDataUrl?: string
  photoStorageIds?: ReportPhotoStorageId[]
}

export type ReportPhotoItem = {
  key: string
  previewUrl: string
  sizeBytes: number
  storageId?: Id<'_storage'>
  /** Existing report photo kept as inline data URL (legacy). */
  legacyDataUrl?: string
}

export function sumPhotoBytes(sizes: number[]): number {
  return sizes.reduce((total, size) => total + size, 0)
}

export function remainingPhotoBudgetBytes(
  currentTotal: number,
  maxTotal = MAX_REPORT_PHOTOS_TOTAL_BYTES,
): number {
  return Math.max(0, maxTotal - currentTotal)
}

export function formatPhotoSizeMb(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 10) return mb.toFixed(0)
  if (mb >= 1) return mb.toFixed(1)
  return mb.toFixed(2)
}

export function formatPhotoSizeLimitMessage(): string {
  return 'Photos must be 50 MB or smaller in total'
}

export function getReportPhotos(report: ReportPhotoSource): string[] {
  if (report.photoDataUrls?.length) {
    return report.photoDataUrls
  }
  if (report.photoDataUrl?.trim()) {
    return [report.photoDataUrl.trim()]
  }
  return []
}

export function primaryReportPhoto(report: ReportPhotoSource): string | undefined {
  return getReportPhotos(report)[0]
}

export function reportPhotosFromStored(report: ReportPhotoSource): ReportPhotoItem[] {
  const urls = getReportPhotos(report)
  const storageIds = report.photoStorageIds ?? []

  if (storageIds.length > 0) {
    return storageIds.map((storageId, index) => ({
      key: String(storageId),
      storageId: storageId as Id<'_storage'>,
      previewUrl: urls[index] ?? '',
      sizeBytes: 0,
    }))
  }

  return urls.map((url, index) => ({
    key: `legacy-${index}-${url.slice(0, 24)}`,
    previewUrl: url,
    sizeBytes: 0,
    legacyDataUrl: url,
  }))
}

export function validateReportPhotosForSubmit(photos: ReportPhotoItem[]): string | null {
  if (photos.length === 0) {
    return 'Please upload at least one photo'
  }
  if (photos.length > MAX_REPORT_PHOTOS) {
    return `You can attach up to ${MAX_REPORT_PHOTOS} photos per report`
  }

  const trackedBytes = photos.filter((p) => p.storageId).map((p) => p.sizeBytes)
  if (trackedBytes.length > 0) {
    if (sumPhotoBytes(trackedBytes) > MAX_REPORT_PHOTOS_TOTAL_BYTES) {
      return formatPhotoSizeLimitMessage()
    }
    return null
  }

  for (const photo of photos) {
    const dataUrl = photo.legacyDataUrl ?? photo.previewUrl
    if (dataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
      return 'One or more photos are too large. Use smaller images.'
    }
  }
  return null
}

export function photoStorageIdsForSubmit(photos: ReportPhotoItem[]): Id<'_storage'>[] {
  const ids = photos.flatMap((photo) => (photo.storageId ? [photo.storageId] : []))
  return ids.slice(0, MAX_REPORT_PHOTOS)
}

export function legacyPhotoDataUrlsForSubmit(photos: ReportPhotoItem[]): string[] {
  return photos.flatMap((photo) => {
    if (photo.storageId) return []
    const url = photo.legacyDataUrl ?? photo.previewUrl
    return url.trim() ? [url.trim()] : []
  })
}
