import type { Doc, Id } from '../../convex/_generated/dataModel'
import { getReportPhotos, primaryReportPhoto } from '@/lib/reportPhotos'

export const REPORT_STATUSES = [
  'pending',
  'published',
  'rejected',
  'accepted',
  'en_route',
  'rescue_success',
  'rescue_failed',
] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

export type ReportCategory = 'wildlife' | 'domestic'

/** Client-facing report shape (Convex document id as string). */
export interface StoredReport {
  id: string
  userEmail: string
  category: ReportCategory
  type: string
  animalName: string
  location: string
  description?: string
  speciesId?: string
  condition?: string
  behavior?: string
  photoDataUrl?: string
  photoDataUrls: string[]
  photoStorageIds?: Id<'_storage'>[]
  latitude?: number
  longitude?: number
  status: ReportStatus
  reportNumber?: string
  assignedRescuerEmail?: string
  seenAt?: number
  quantity?: number
  reportedSize?: string
  reporterPhone?: string
  createdAt: number
}

export interface AdminStoredReport extends StoredReport {
  reporterFirstName: string
  reporterLastName: string
  assignedRescuerName?: string
}

export interface RescuerStoredReport extends StoredReport {
  reporterFirstName: string
  reporterLastName: string
  assignedRescuerName?: string
}

export function normalizeClientReportStatus(status: string): ReportStatus {
  if (status === 'open') return 'pending'
  if (status === 'resolved') return 'rescue_success'
  if ((REPORT_STATUSES as readonly string[]).includes(status)) {
    return status as ReportStatus
  }
  return 'pending'
}

export function formatReporterName(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`.trim()
  return name || 'Unknown reporter'
}

export function docToStored(doc: Doc<'reports'>): StoredReport {
  return {
    id: doc._id,
    userEmail: doc.userEmail,
    category: doc.category,
    type: doc.type,
    animalName: doc.animalName,
    location: doc.location,
    description: doc.description,
    speciesId: doc.speciesId,
    condition: doc.condition,
    behavior: doc.behavior,
    photoDataUrls: getReportPhotos(doc),
    photoDataUrl: primaryReportPhoto(doc),
    photoStorageIds: doc.photoStorageIds,
    latitude: doc.latitude,
    longitude: doc.longitude,
    status: normalizeClientReportStatus(doc.status),
    reportNumber: doc.reportNumber,
    assignedRescuerEmail: doc.assignedRescuerEmail,
    seenAt: doc.seenAt,
    quantity: doc.quantity,
    reportedSize: doc.reportedSize,
    reporterPhone: doc.reporterPhone,
    createdAt: doc.createdAt,
  }
}

export function adminReportToStored(
  row: Doc<'reports'> & {
    reporterFirstName: string
    reporterLastName: string
    assignedRescuerName?: string
  },
): AdminStoredReport {
  return {
    ...docToStored(row),
    reporterFirstName: row.reporterFirstName,
    reporterLastName: row.reporterLastName,
    assignedRescuerName: row.assignedRescuerName,
  }
}

export function rescuerReportToStored(
  row: Doc<'reports'> & {
    reporterFirstName: string
    reporterLastName: string
    assignedRescuerName?: string
  },
): RescuerStoredReport {
  return adminReportToStored(row)
}

export const DOMESTIC_REPORT_TYPES = [
  { value: 'missing', label: 'Missing' },
  { value: 'found', label: 'Found' },
  { value: 'stray', label: 'Stray' },
  { value: 'injured', label: 'Injured' },
] as const

export const WILDLIFE_CONDITIONS = [
  { value: 'healthy', label: 'Appears healthy / Normal behavior' },
  { value: 'injured', label: 'Injured or wounded' },
  { value: 'trapped', label: 'Trapped or entangled' },
  { value: 'dead', label: 'Deceased' },
] as const

export const WILDLIFE_BEHAVIOR_OTHER = 'other' as const

export const WILDLIFE_BEHAVIORS = [
  {
    value: 'injured',
    label: 'Injured or wounded',
  },
  {
    value: 'sick',
    label: 'Sick or weak-looking',
  },
  {
    value: 'unable-fly',
    label: 'Unable to fly (birds)',
  },
  {
    value: 'unable-walk',
    label: 'Unable to walk or move properly',
  },
  {
    value: 'trapped',
    label: 'Trapped or entangled',
  },
  {
    value: 'orphaned',
    label: 'Orphaned juvenile (separated from parent)',
  },
  {
    value: 'vehicle-hit',
    label: 'Hit by a vehicle',
  },
  {
    value: 'inside-house',
    label: 'Found inside a house or building',
  },
  {
    value: 'unsafe-location',
    label: 'Found in an unsafe or unusual location',
  },
  {
    value: 'abnormal-behavior',
    label: 'Showing abnormal behavior',
  },
  {
    value: 'poisoning',
    label: 'Suspected poisoning',
  },
  {
    value: 'dead',
    label: 'Dead wildlife (for documentation or investigation)',
  },
  {
    value: 'illegal-captivity',
    label: 'Confiscated or rescued from illegal captivity',
  },
  {
    value: 'hunting-trade',
    label: 'Victim of hunting, trapping, or trade',
  },
  {
    value: 'roaming',
    label: 'Just passing through / Roaming',
  },
  {
    value: 'sighting',
    label: 'Wildlife sighting (not injured)',
  },
  {
    value: WILDLIFE_BEHAVIOR_OTHER,
    label: 'Other / Not sure',
  },
] as const

export function isKnownWildlifeBehavior(value: string) {
  return WILDLIFE_BEHAVIORS.some((b) => b.value === value && b.value !== WILDLIFE_BEHAVIOR_OTHER)
}

export function wildlifeBehaviorLabelForValue(value: string) {
  return WILDLIFE_BEHAVIORS.find((b) => b.value === value)?.label ?? ''
}

export function wildlifeBehaviorSelectValue(stored: string | undefined) {
  if (!stored) return ''
  const byLabel = WILDLIFE_BEHAVIORS.find((b) => b.label === stored)
  if (byLabel) return byLabel.value
  if (isKnownWildlifeBehavior(stored)) return stored
  return WILDLIFE_BEHAVIOR_OTHER
}

export function wildlifeBehaviorDisplayText(stored: string | undefined) {
  if (!stored) return ''
  const byValue = WILDLIFE_BEHAVIORS.find(
    (b) => b.value === stored && b.value !== WILDLIFE_BEHAVIOR_OTHER,
  )
  if (byValue) return byValue.label
  const byLabel = WILDLIFE_BEHAVIORS.find((b) => b.label === stored)
  if (byLabel) return byLabel.label
  return stored
}

/** @deprecated Use wildlifeBehaviorDisplayText */
export function wildlifeBehaviorOtherText(stored: string | undefined) {
  return wildlifeBehaviorDisplayText(stored)
}

export function resolveWildlifeBehavior(_behavior: string, behaviorText: string) {
  return behaviorText.trim()
}

export function formatReportType(type: string) {
  return type.replace(/-/g, ' ')
}

export function behaviorLabel(value: string | undefined) {
  if (!value) return 'Not provided'
  const display = wildlifeBehaviorDisplayText(value)
  return display || formatReportType(value)
}

export function statusLabel(status: ReportStatus) {
  switch (status) {
    case 'pending':
      return 'Under Review'
    case 'published':
      return 'Published'
    case 'rejected':
      return 'Rejected'
    case 'accepted':
      return 'Accepted'
    case 'en_route':
      return 'En Route'
    case 'rescue_success':
      return 'Rescue Successful'
    case 'rescue_failed':
      return 'Rescue Failed'
    default:
      return status
  }
}

export function statusBadgeLabel(status: ReportStatus) {
  switch (status) {
    case 'pending':
      return 'PENDING'
    case 'published':
      return 'PUBLISHED'
    case 'rejected':           // 👈 ADD THIS CASE
      return 'REJECTED'
    case 'accepted':
      return 'ACCEPTED'
    case 'en_route':
      return 'EN ROUTE'
    case 'rescue_success':
      return 'RESCUE SUCCESS'
    case 'rescue_failed':
      return 'RESCUE FAILED'
  }
}

export function isActiveDispatchStatus(status: ReportStatus) {
  return status === 'accepted' || status === 'en_route'
}

/** Admin can assign or change rescuer while dispatch is open. */
export function canAdminAssignRescuer(status: ReportStatus) {
  return status === 'pending' || isActiveDispatchStatus(status)
}

export function isTerminalStatus(status: ReportStatus) {
  return status === 'rescue_success' || status === 'rescue_failed'
}

export function statusTone(status: ReportStatus) {
  switch (status) {
    case 'pending':
      return {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
      }
    case 'accepted':
      return {
        badge: 'bg-primary/10 text-primary border-primary/20',
        dot: 'bg-primary',
      }
    case 'en_route':
      return {
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        dot: 'bg-sky-500',
      }
    case 'published':
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
      }
    case 'rescue_success':
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
      }
    case 'rescue_failed':
      return {
        badge: 'bg-destructive/10 text-destructive border-destructive/20',
        dot: 'bg-destructive',
      }
    case 'rejected': // 👈 ADD THIS ENTIRE BLOCK
      return {
        badge: 'bg-destructive/10 text-destructive border-destructive/20',
        dot: 'bg-destructive',
      }
  }
}
