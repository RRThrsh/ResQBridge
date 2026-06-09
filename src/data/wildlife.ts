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
    'bg-red-600/80 text-red-200 dark:bg-red-200/50 dark:text-red-600 border-red-200/50',

  endangered:
    'bg-orange-600/80 text-orange-200 dark:bg-orange-200/50 dark:text-orange-600 border-orange-200/50',

  vulnerable:
    'bg-yellow-600/80 text-yellow-200 dark:bg-yellow-200/50 dark:text-yellow-600 border-yellow-200/50',

  protected:
    'bg-emerald-600/80 text-emerald-200 dark:bg-emerald-200/50 dark:text-emerald-600 border-emerald-200/50',
}

export const statusLabels: Record<WildlifeSpecies['status'], string> = {
  'critically-endangered': 'Critically Endangered',
  'endangered': 'Endangered',
  'vulnerable': 'Vulnerable',
  'protected': 'Protected',
}
