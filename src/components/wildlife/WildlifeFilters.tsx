import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { categories, type Category } from '@/data/wildlife'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

interface WildlifeFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  activeCategory: Category
  onCategoryChange: (category: Category) => void
}

export function WildlifeFilters({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: WildlifeFiltersProps) {
  const { t } = useLanguage()
  const categoryLabel = (cat: Category): string => {
    const labels: Record<Category, string> = {
      All: t('wildlifeFilters.all'),
      mammal: t('wildlifeFilters.mammal'),
      bird: t('wildlifeFilters.bird'),
      reptile: t('wildlifeFilters.reptile'),
      amphibian: t('wildlifeFilters.amphibian'),
    }
    return labels[cat]
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('wildlifeFilters.searchPlaceholder')}
          className="pl-10 pr-10 h-11 rounded-xl"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('wildlifeFilters.clearSearch')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                : 'bg-primary/5 text-muted-foreground border-border hover:border-primary/40 hover:text-primary hover:bg-primary/10'
            )}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>
    </div>
  )
}
