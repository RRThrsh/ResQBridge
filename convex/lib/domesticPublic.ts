import { v } from 'convex/values'
import type { Doc } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { resolveReportPhotoUrls } from './reportPhotos'
import { normalizeReportStatus, type ReportStatus } from './reportStatus'

export const publicDomesticReportValidator = v.object({
  id: v.id('reports'),
  type: v.union(
    v.literal('missing'),
    v.literal('found'),
    v.literal('stray'),
    v.literal('injured'),
  ),
  animalName: v.string(),
  species: v.string(),
  color: v.string(),
  location: v.string(),
  description: v.string(),
  contactNumber: v.optional(v.string()),
  image: v.optional(v.string()),
  images: v.array(v.string()),
  createdAt: v.number(),
  status: v.union(v.literal('open'), v.literal('reunited'), v.literal('resolved')),
})

export type PublicDomesticReport = {
  id: Doc<'reports'>['_id']
  type: 'missing' | 'found' | 'stray' | 'injured'
  animalName: string
  species: string
  color: string
  location: string
  description: string
  contactNumber?: string
  image?: string
  images: string[]
  createdAt: number
  status: 'open' | 'reunited' | 'resolved'
}

const DOMESTIC_TYPES = new Set(['missing', 'found', 'stray', 'injured'])

function parseDomesticDescription(description?: string) {
  if (!description?.trim()) {
    return { color: '', body: '' }
  }
  const match = description.match(/^Color\/markings:\s*(.+?)(?:\n\n([\s\S]*))?$/)
  if (match) {
    return {
      color: match[1].trim(),
      body: (match[2] ?? '').trim(),
    }
  }
  return { color: '', body: description.trim() }
}

function normalizeDomesticType(type: string): PublicDomesticReport['type'] {
  if (DOMESTIC_TYPES.has(type)) {
    return type as PublicDomesticReport['type']
  }
  return 'stray'
}

function publicDomesticStatus(
  status: ReportStatus,
  type: PublicDomesticReport['type'],
): PublicDomesticReport['status'] {
  if (status === 'rescue_success' && type === 'missing') {
    return 'reunited'
  }
  if (status === 'rescue_success' || status === 'rescue_failed') {
    return 'resolved'
  }
  return 'open'
}

export async function toPublicDomesticReport(
  ctx: QueryCtx,
  doc: Doc<'reports'>,
): Promise<PublicDomesticReport> {
  const { body } = parseDomesticDescription(doc.description)
  const images = await resolveReportPhotoUrls(ctx, doc)
  const type = normalizeDomesticType(doc.type)

  return {
    id: doc._id,
    type,
    animalName: doc.animalName,
    species: doc.speciesId?.trim() || 'Unknown',
    color: doc.color?.trim() || '',
    location: doc.location,
    description: body || doc.description?.trim() || 'No additional details provided.',
    contactNumber: doc.reporterPhone?.trim() || undefined,
    image: images[0],
    images,
    createdAt: doc.seenAt ?? doc.createdAt,
    status: publicDomesticStatus(normalizeReportStatus(doc.status), type),
  }
}
