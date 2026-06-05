import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HeroSection({ onReportClick }: { onReportClick: () => void }) {
  return (
    <section id="home" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 sm:px-6">

      {/* Single ambient glow — very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--primary) 7%, transparent) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-3xl pt-24 pb-20 text-center">
        {/* Eyebrow */}
        <div className="animate-fade-up mb-8 flex justify-center">
          <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary text-xs font-medium px-3 py-1 rounded-full">
            <img
  src="/resq.png"
  alt="PWRRC Logo"
  className="h-4 w-4 object-contain"
/>
            Palawan Wildlife Rescue & Conservation Center
          </Badge>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-black text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Helping Animals,{' '}
          <span className="text-gradient">Protecting Nature</span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
          Submit reports for wildlife sightings, stray animals, rescue emergencies,
          and animal welfare concerns across Palawan communities.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={onReportClick}
            size="lg"
            className="group h-11 px-7 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-semibold"
          >
            Report an Animal
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Link to="/wildlife">
            <Button variant="outline" size="lg"
              className="h-11 px-7 rounded-xl border-border text-foreground hover:bg-accent font-semibold shadow-none">
              <BookOpen className="mr-2 h-4 w-4" />
              Wildlife Guide
            </Button>
          </Link>
        </div>

        {/* Stat strip */}
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-28"
        style={{ background: 'linear-gradient(to top, var(--background), transparent)' }}
      />
    </section>
  )
}
