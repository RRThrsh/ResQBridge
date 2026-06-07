export interface WildlifeSpecies {
  id: string
  commonName: string
  localName: string
  scientificName: string
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'marine'
  status: 'critically-endangered' | 'endangered' | 'vulnerable' | 'protected'
  habitat: string
  diet: string
  activeTime: 'diurnal' | 'nocturnal' | 'crepuscular'
  description: string
  safetyTips: string[]
  ecologicalImportance: string
  images: string[]
  tags: string[]
}

// Emptied out so it relies completely on Admin/Database input.
export const wildlifeSpecies: WildlifeSpecies[] = []

export const categories = ['All', 'mammal', 'bird', 'reptile', 'amphibian'] as const
export type Category = typeof categories[number]

export const statusColors: Record<WildlifeSpecies['status'], string> = {
  'critically-endangered':
    'bg-red-500/15 text-zinc-900 dark:text-zinc-100 border-red-500/40',

  endangered:
    'bg-orange-500/15 text-zinc-900 dark:text-zinc-100 border-orange-500/40',

  vulnerable:
    'bg-yellow-500/15 text-zinc-900 dark:text-zinc-100 border-yellow-500/40',

  protected:
    'bg-emerald-500/15 text-zinc-900 dark:text-zinc-100 border-emerald-500/40',
}

export const statusLabels: Record<WildlifeSpecies['status'], string> = {
  'critically-endangered': 'Critically Endangered',
  'endangered': 'Endangered',
  'vulnerable': 'Vulnerable',
  'protected': 'Protected',
}
