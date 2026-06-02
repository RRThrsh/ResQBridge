import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export const MAX_REPORT_PHOTOS = 5
export const MAX_REPORT_PHOTOS_TOTAL_BYTES = 50 * 1024 * 1024
export const MAX_PHOTO_DATA_URL_LENGTH = 900_000

export const photoDataUrlsValidator = v.array(v.string())
export const photoStorageIdsValidator = v.array(v.id('_storage'))

type ReportPhotoDoc = {
  photoDataUrls?: string[]
  photoDataUrl?: string
  photoStorageIds?: Id<'_storage'>[]
}

type StorageMetadata = {
  _id: Id<'_storage'>
  size: number
}

export function sumPhotoBytes(sizes: number[]): number {
  return sizes.reduce((total, size) => total + size, 0)
}

export function getReportPhotoDataUrls(doc: ReportPhotoDoc): string[] {
  if (doc.photoDataUrls?.length) {
    return doc.photoDataUrls
  }
  if (doc.photoDataUrl?.trim()) {
    return [doc.photoDataUrl.trim()]
  }
  return []
}

export function getReportPhotoStorageIds(doc: ReportPhotoDoc): Id<'_storage'>[] {
  return doc.photoStorageIds ?? []
}

export async function resolveReportPhotoUrls(
  ctx: QueryCtx,
  doc: ReportPhotoDoc,
): Promise<string[]> {
  if (doc.photoStorageIds?.length) {
    const urls: string[] = []
    for (const id of doc.photoStorageIds) {
      const url = await ctx.storage.getUrl(id)
      if (url) urls.push(url)
    }
    return urls
  }
  return getReportPhotoDataUrls(doc)
}

export async function withResolvedReportPhotos<T extends ReportPhotoDoc>(
  ctx: QueryCtx,
  doc: T,
): Promise<T & { photoDataUrls: string[]; photoDataUrl?: string }> {
  const photoDataUrls = await resolveReportPhotoUrls(ctx, doc)
  return {
    ...doc,
    photoDataUrls,
    photoDataUrl: photoDataUrls[0],
  }
}

export function capReportPhotoIds<T>(ids: T[]): T[] {
  return [...new Set(ids)].slice(0, MAX_REPORT_PHOTOS)
}

export async function validatePhotoStorageIds(
  ctx: MutationCtx,
  ids: Id<'_storage'>[],
): Promise<Id<'_storage'>[]> {
  const unique = capReportPhotoIds(ids)
  if (unique.length === 0) {
    throw new Error('At least one photo is required.')
  }

  const sizes: number[] = []
  for (const id of unique) {
    const metadata = (await ctx.db.system.get('_storage', id)) as StorageMetadata | null
    if (!metadata) {
      throw new Error('One or more photos could not be found. Please re-upload.')
    }
    sizes.push(metadata.size)
  }

  if (sumPhotoBytes(sizes) > MAX_REPORT_PHOTOS_TOTAL_BYTES) {
    throw new Error('Photos must be 50 MB or smaller in total.')
  }

  return unique
}

export function normalizePhotoDataUrls(
  photoDataUrls: string[] | undefined,
  legacyPhotoDataUrl?: string,
): string[] {
  const merged = [
    ...(photoDataUrls ?? []).map((url) => url.trim()).filter(Boolean),
    ...(legacyPhotoDataUrl?.trim() ? [legacyPhotoDataUrl.trim()] : []),
  ]

  const unique: string[] = []
  for (const url of merged) {
    if (unique.includes(url)) continue
    if (url.length > MAX_PHOTO_DATA_URL_LENGTH) {
      throw new Error('One or more photos are too large. Use smaller images.')
    }
    unique.push(url)
  }

  if (unique.length === 0) {
    throw new Error('At least one photo is required.')
  }

  return unique.slice(0, MAX_REPORT_PHOTOS)
}

export async function normalizeReportPhotos(
  ctx: MutationCtx,
  args: {
    photoStorageIds?: Id<'_storage'>[]
    photoDataUrls?: string[]
    photoDataUrl?: string
  },
): Promise<
  | { mode: 'storage'; photoStorageIds: Id<'_storage'>[] }
  | { mode: 'legacy'; photoDataUrls: string[] }
> {
  if (args.photoStorageIds !== undefined) {
    const photoStorageIds = await validatePhotoStorageIds(ctx, args.photoStorageIds)
    return { mode: 'storage', photoStorageIds }
  }

  const urls = normalizePhotoDataUrls(args.photoDataUrls, args.photoDataUrl)
  return { mode: 'legacy', photoDataUrls: urls }
}

export function photoFieldsForInsert(urls: string[]) {
  return {
    photoDataUrls: urls,
    photoDataUrl: urls[0],
    photoStorageIds: undefined,
  }
}

export function photoStorageFieldsForInsert(ids: Id<'_storage'>[]) {
  return {
    photoStorageIds: ids,
    photoDataUrls: undefined,
    photoDataUrl: undefined,
  }
}

export function photoFieldsFromNormalized(
  normalized:
    | { mode: 'storage'; photoStorageIds: Id<'_storage'>[] }
    | { mode: 'legacy'; photoDataUrls: string[] },
) {
  if (normalized.mode === 'storage') {
    return photoStorageFieldsForInsert(normalized.photoStorageIds)
  }
  return photoFieldsForInsert(normalized.photoDataUrls)
}
