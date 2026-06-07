import { Link } from 'react-router-dom'
import { MapPin, Phone, Globe } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/context/LanguageContext'

const links = {
  pages: [
    { label: 'Dashboard', href: '/', key: 'footer.dashboard' },
    { label: 'Wildlife Guide', href: '/wildlife', key: 'footer.wildlifeGuide' },
    { label: 'Submit Report', href: '/report', key: 'footer.submitReport' },
    { label: 'News & Events', href: '/#events', key: 'footer.newsEvents' },
  ],
  reports: [
    { label: 'Wildlife Sighting', href: '/report', key: 'footer.wildlifeSighting' },
    { label: 'Wildlife Surrender', href: '/report', key: 'footer.wildlifeSurrender' },
    { label: 'Stray / Injured', href: '/report', key: 'footer.strayInjured' },
    { label: 'Missing / Found Pet', href: '/report', key: 'footer.missingFoundPet' },
  ],
}

export function Footer() {
  const { t, lang, setLang } = useLanguage()

  const toggleLang = () => {
    setLang(lang === 'en' ? 'fil' : 'en')
  }

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden">
              <img
                src="/resq.png"
                alt="ResQBridge Logo"
                className="h-5 w-5 object-contain"
              />
            </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>ResQBridge</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>

            <div className="space-y-4">

              {/* Wildlife Shelter */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t('footer.wildlifeShelter')}
                </p>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                  <span>Irawan, Puerto Princesa City, Palawan 5300</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>0995-033-8967</span>
                </div>
              </div>

              {/* Domestic Shelter */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t('footer.domesticShelter')}
                </p>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                  <span>
                    Sitio Baruang, Bgy. Macarascas, Puerto Princesa,
                    Philippines, 5300
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>0938 927 0317</span>
                </div>
              </div>

            </div>
          </div>

          {/* Pages */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('footer.pages')}</p>
            <ul className="space-y-2">
              {links.pages.map(l => (
                <li key={l.key}>
                  <Link to={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t(l.key, l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Report types */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('footer.report')}</p>
            <ul className="space-y-2">
              {links.reports.map(l => (
                <li key={l.key}>
                  <Link to={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t(l.key, l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
          <p className="text-xs text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="font-medium">{lang === 'en' ? 'English' : 'Filipino'}</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
