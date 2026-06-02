import { Link } from 'react-router-dom'
import { Leaf, MapPin, Phone } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const links = {
  pages: [
    { label: 'Dashboard',    href: '/' },
    { label: 'Wildlife Guide',href: '/wildlife' },
    { label: 'Submit Report', href: '/report' },
    { label: 'News & Events', href: '/#events' },
  ],
  reports: [
    { label: 'Wildlife Sighting',   href: '/report' },
    { label: 'Wildlife Surrender',  href: '/report' },
    { label: 'Stray / Injured',     href: '/report' },
    { label: 'Missing / Found Pet', href: '/report' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Leaf className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>DWARRMS</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Domestic Wildlife Animal Report & Rescue Management System — connecting Palawan
              communities with wildlife rescue authorities.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                <span>Irawan, Puerto Princesa City, Palawan 5300</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                <span>0995-033-8967</span>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pages</p>
            <ul className="space-y-2">
              {links.pages.map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Report types */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Report</p>
            <ul className="space-y-2">
              {links.reports.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 DWARRMS — Palawan Wildlife Rescue & Conservation Center
          </p>
          <p className="text-xs text-muted-foreground">Made for Palawan wildlife 🌿</p>
        </div>
      </div>
    </footer>
  )
}
