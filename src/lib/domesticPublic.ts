import type { PublicDomesticReport } from '../../convex/lib/domesticPublic'

export type { PublicDomesticReport }

export const reportTypeLabels: Record<PublicDomesticReport['type'], string> = {
  missing: 'Missing Pet',
  found: 'Found Animal',
  stray: 'Stray Animal',
  injured: 'Injured Animal',
}

/** Badges on solid card/dialog backgrounds */
export const reportTypeColors: Record<PublicDomesticReport['type'], string> = {
  missing: 'bg-blue-500/20 text-blue-700 border-blue-500/40 dark:text-blue-300',
  found: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 dark:text-emerald-300',
  stray: 'bg-amber-500/20 text-amber-800 border-amber-500/40 dark:text-amber-300',
  injured: 'bg-red-500/20 text-red-700 border-red-500/40 dark:text-red-300',
}

/** Badges overlaid on report photos — must read on any image brightness */
export const reportTypeOverlayColors: Record<PublicDomesticReport['type'], string> = {
  missing: 'border-blue-400/90',
  found: 'border-emerald-400/90',
  stray: 'border-amber-400/90',
  injured: 'border-red-400/90',
}

export const reportTypeOverlayBase =
  'inline-flex items-center rounded-full border bg-black/75 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm'

export const publicStatusLabels: Record<PublicDomesticReport['status'], string> = {
  open: 'Open',
  reunited: 'Reunited',
  resolved: 'Resolved',
}

export function speciesEmoji(species: string) {
  const value = species.toLowerCase()
  if (value.includes('dog')) return '🐕'
  if (value.includes('cat')) return '🐈'
  if (value.includes('bird')) return '🦜'
  return '🐾'
}
