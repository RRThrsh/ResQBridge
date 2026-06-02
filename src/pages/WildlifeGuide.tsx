import { useState } from 'react'
import { type WildlifeSpecies, type Category } from '@/data/wildlife'
import { useWildlifeContent } from '@/hooks/useSiteContent'
import { SpeciesCard } from '@/components/wildlife/SpeciesCard'
import { SpeciesModal } from '@/components/wildlife/SpeciesModal'
import { WildlifeFilters } from '@/components/wildlife/WildlifeFilters'
import { SafetyGuide } from '@/components/wildlife/SafetyGuide'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WildlifeGuide() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [selectedSpecies, setSelectedSpecies] = useState<WildlifeSpecies | null>(null)

  const wildlifeSpecies = useWildlifeContent()

  const filtered = wildlifeSpecies.filter(s => {
    const matchesSearch =
      s.commonName.toLowerCase().includes(search.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      s.localName?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Wildlife Guide</span>
          </div>

          <div className="max-w-2xl">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              Palawan Wildlife Encyclopedia
            </p>
            <h1
              className="text-4xl sm:text-5xl font-black text-foreground leading-tight mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Wildlife Guide
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Learn about the unique wildlife in Palawan. Discover which animals are protected, 
              understand their ecological roles, and know how to safely navigate encounters.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <div className="mb-8">
          <WildlifeFilters
            search={search}
            onSearchChange={setSearch}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm">
            Showing <span className="text-primary font-medium">{filtered.length}</span> of {wildlifeSpecies.length} species
          </p>
        </div>

        {/* Species Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
            {filtered.map((species, i) => (
              <SpeciesCard
                key={species.id}
                species={species}
                onClick={setSelectedSpecies}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-foreground font-bold text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              No species found
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Try searching for a different name or removing some filters.
            </p>
            <Button
              onClick={() => { setSearch(''); setActiveCategory('All') }}
              variant="outline"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Safety Guide */}
        <SafetyGuide />

        {/* Report CTA */}
        <div className="mt-10 glass-card rounded-3xl p-8 text-center border-primary/20">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Spotted something?
          </p>
          <h3
            className="text-foreground text-2xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Report a Wildlife Sighting
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Help protect Palawan wildlife by reporting sightings and supporting conservation programs.
          </p>
          <Link to="/report">
            <Button className="font-bold px-8 h-11 rounded-xl shadow-lg shadow-primary/20">
              Submit a Report
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Species detail modal */}
      <SpeciesModal
        species={selectedSpecies}
        onClose={() => setSelectedSpecies(null)}
      />
    </div>
  )
}
