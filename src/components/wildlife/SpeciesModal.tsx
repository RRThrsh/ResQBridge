import { useState } from 'react'
import { Moon, Sun, Sunset, Leaf, Utensils, MapPin, ShieldAlert, Globe, AlertTriangle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type WildlifeSpecies, statusColors, statusLabels } from '@/data/wildlife'

const activeTimeIcons = {
  nocturnal: { Icon: Moon, label: 'Nocturnal', color: 'text-indigo-500' },
  diurnal: { Icon: Sun, label: 'Diurnal', color: 'text-amber-500' },
  crepuscular: { Icon: Sunset, label: 'Crepuscular', color: 'text-orange-500' },
}

const categoryEmojis: Record<string, string> = {
  mammal: '🦁',
  bird: '🦅',
  reptile: '🦎',
  amphibian: '🐸',
  marine: '🐢',
}

interface SpeciesModalProps {
  species: WildlifeSpecies | null
  onClose: () => void
}

export function SpeciesModal({ species, onClose }: SpeciesModalProps) {
  if (!species) return null
  const [selectedImage, setSelectedImage] = useState(0)
  const { Icon: ActiveIcon, label: activeLabel, color: activeColor } = activeTimeIcons[species.activeTime]
const hideScrollbarStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`
return (
  <>
    <style>{hideScrollbarStyles}</style>

    <Sheet open={!!species} onOpenChange={onClose}>
<SheetContent
  side="right"
  className="w-full sm:w-[520px] bg-background border-l border-border p-0 overflow-y-auto scrollbar-hide"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
>
        {/* Hero image */}
<div className="relative bg-muted flex justify-center">
  <img
    src={species.images?.[selectedImage]}
    alt={species.commonName}
    className="w-full h-[500px] object-contain bg-black/5"
  />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold border ${statusColors[species.status]}`}>
              {statusLabels[species.status]}
            </span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2
              className="text-foreground text-3xl font-black leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {species.commonName}
            </h2>
            {species.localName && (
              <p className="text-primary text-sm italic mt-1 font-medium">"{species.localName}"</p>
            )}
            <p className="text-muted-foreground text-xs italic mt-0.5">{species.scientificName}</p>
          </div>
</div>

{/* Image Gallery */}
<div
  className="flex gap-2 overflow-x-auto overflow-y-hidden p-4 bg-card border-b border-border snap-x snap-mandatory touch-pan-x"
  style={{
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pan-x',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
  onTouchStart={(e) => e.stopPropagation()}
>
  {species.images?.map((img, index) => (
    <button
      key={index}
      onClick={() => setSelectedImage(index)}
      className={`shrink-0 snap-center rounded-lg overflow-hidden border-2 transition-all ${
        selectedImage === index
          ? 'border-primary'
          : 'border-border'
      }`}
    >
      <img
        src={img}
        alt={`${species.commonName}-${index}`}
        className="w-16 h-16 object-cover select-none pointer-events-none"
      />
    </button>
  ))}
</div>

<SheetHeader className="px-6 pt-6 pb-0 sr-only">
          <span>{species.commonName}</span>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{categoryEmojis[species.category]}</div>
              <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">{species.category}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <ActiveIcon className={`w-5 h-5 mx-auto mb-1 ${activeColor}`} />
              <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">{activeLabel}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="flex flex-wrap gap-1 justify-center mb-1">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">{species.tags[0]}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              General Description
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{species.description}</p>
          </div>

          <Separator />

          {/* Habitat & Diet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground text-xs font-semibold uppercase tracking-widest">Habitat</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{species.habitat}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground text-xs font-semibold uppercase tracking-widest">Diet</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{species.diet}</p>
            </div>
          </div>

          <Separator />

          {/* Safety tips */}
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Safety & Encounter Tips
            </h4>
            <div className="space-y-2">
              {species.safetyTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ecological importance */}
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              Ecological Importance
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{species.ecologicalImportance}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2 pb-6">
            {species.tags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-border text-muted-foreground font-semibold"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  )
}
