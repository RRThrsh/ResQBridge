export interface WildlifeSpecies {
  id: string
  commonName: string
  localName: string
  scientificName: string
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian'
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
    'bg-red-600/80 text-red-600 dark:bg-red-400/30 dark:text-red-400 border-red-500/30',

  endangered:
    'bg-orange-600/80 text-orange-600 dark:bg-orange-400/30 dark:text-orange-400 border-orange-500/30',

  vulnerable:
    'bg-yellow-600/80 text-yellow-600 dark:bg-yellow-400/30 dark:text-yellow-400 border-yellow-500/30',

  protected:
    'bg-emerald-600/80 text-emerald-600 dark:bg-emerald-400/30 dark:text-emerald-400 border-emerald-500/30',
}

export const statusLabels: Record<WildlifeSpecies['status'], string> = {
  'critically-endangered': 'Critically Endangered',
  'endangered': 'Endangered',
  'vulnerable': 'Vulnerable',
  'protected': 'Protected',
}
