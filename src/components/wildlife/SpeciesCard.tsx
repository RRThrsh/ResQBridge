import { Moon, Sun, Sunset, Clock, Leaf } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type WildlifeSpecies, statusColors, statusLabels } from '@/data/wildlife'

const activeTimeIcons = {
  nocturnal: Moon,
  diurnal: Sun,
  crepuscular: Sunset,
}

const categoryEmojis: Record<string, string> = {
  mammal: '🦁',
  bird: '🦅',
  reptile: '🦎',
  amphibian: '🐸',
}

interface SpeciesCardProps {
  species: WildlifeSpecies
  onClick: (species: WildlifeSpecies) => void
  index: number
}

export function SpeciesCard({ species, onClick, index }: SpeciesCardProps) {
  const ActiveIcon = activeTimeIcons[species.activeTime]

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 group animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onClick(species)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(species)}
      aria-label={`View details for ${species.commonName}`}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-muted">
        <img
         src={species.images?.[0]}
          alt={species.commonName}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }}
        />
        {/* Fallback */}
        <div className="hidden absolute inset-0 flex items-center justify-center bg-primary/10">
          <span className="text-6xl">{categoryEmojis[species.category]}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColors[species.status]}`}>
            {statusLabels[species.status]}
          </span>
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-base">
          {categoryEmojis[species.category]}
        </div>

        {/* Active time indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <ActiveIcon className="w-3 h-3 text-amber-500" />
          <span className="text-foreground/80 text-[10px] capitalize">{species.activeTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3
            className="text-foreground font-bold text-lg leading-tight group-hover:text-primary transition-colors"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {species.commonName}
          </h3>
          {species.localName && (
            <p className="text-primary/80 text-xs mt-0.5 italic">"{species.localName}"</p>
          )}
          <p className="text-muted-foreground text-xs mt-1 italic">{species.scientificName}</p>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
          {species.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {species.tags.slice(0, 3).map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] capitalize"
            >
              <Leaf className="w-2.5 h-2.5 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Habitat preview */}
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-muted-foreground text-xs line-clamp-1">{species.habitat}</p>
        </div>
      </div>
    </div>
  )
}
