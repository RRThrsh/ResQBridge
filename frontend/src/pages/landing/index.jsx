import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { SessionProvider } from '../../context/SessionContext'
import SectionTracker from './SectionTracker'
import HeroSection from './HeroSection'
import Carousel from './Carousel'

import Location from './Location'
import NewsEvents from './NewsEvents'
import StatsSection from './StatsSection'
import FAQSection from './FAQSection'
import ContactSection from './ContactSection'
import SuccessStories from './SuccessStories'
import DonateSection from './DonateSection'
import VolunteerSection from './VolunteerSection'
import HowItWorks from './HowItWorks'
import Gallery from './Gallery'
import PartnerLogos from './PartnerLogos'
import Maintenance from './Maintenance'

const API_BASE = '/api/v1'

const EMPTY_CONFIG = {
  hero: {}, stats: [], contact: {}, faq: [], carousel: [],
  howItWorks: { steps: [] },
  successStories: { stories: [] }, gallery: { images: [] },
  donate: { reasons: [], donateLinks: {} },
  volunteer: { roles: [], requirements: [], cta: {} },
  partners: { partners: [] }, location: { center: { lat: 9.799447, lng: 118.693766 } },
  newsEvents: { news: [], events: [] },
}

function fillDefaults(defaults, api) {
  if (api === null || api === undefined || typeof api !== 'object' || Array.isArray(api)) return api ?? defaults
  const result = { ...defaults }
  const keys = new Set([...Object.keys(result), ...Object.keys(api)])
  for (const key of keys) {
    if (api[key] === undefined) continue
    if (typeof api[key] === 'object' && api[key] !== null && !Array.isArray(api[key])) {
      result[key] = fillDefaults(result[key] ?? {}, api[key])
    } else {
      result[key] = api[key]
    }
  }
  return result
}

export default function Landing() {
  const [landingConfig, setLandingConfig] = useState(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('')

  const fetchConfig = () =>
    fetch(`${API_BASE}/landing-config`)
      .then((r) => r.json())
      .then((d) => {
        setLandingConfig(d.config ? fillDefaults(EMPTY_CONFIG, d.config) : null)
        setMaintenanceMode(d.maintenanceMode)
        setMaintenanceEndTime(d.maintenanceEndTime || '')
      })
      .catch(() => {})

  useEffect(() => {
    fetchConfig()
    const id = setInterval(fetchConfig, 30000)
    return () => clearInterval(id)
  }, [])

  if (maintenanceMode) return <Maintenance endTime={maintenanceEndTime} />

  const cfg = landingConfig || EMPTY_CONFIG

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <SessionProvider>
          <SectionTracker name="hero">
            <HeroSection badge={cfg.hero.badge} title={cfg.hero.title} description={cfg.hero.description} />
          </SectionTracker>
          <SectionTracker name="carousel">
            <Carousel slides={cfg.carousel} />
          </SectionTracker>

          <SectionTracker name="how-it-works">
            <HowItWorks title={cfg.howItWorks.title} subtitle={cfg.howItWorks.subtitle} steps={cfg.howItWorks.steps} />
          </SectionTracker>
          <SectionTracker name="success-stories">
            <SuccessStories title={cfg.successStories.title} subtitle={cfg.successStories.subtitle} stories={cfg.successStories.stories} />
          </SectionTracker>
          <SectionTracker name="gallery">
            <Gallery title={cfg.gallery.title} subtitle={cfg.gallery.subtitle} images={cfg.gallery.images} />
          </SectionTracker>
          <SectionTracker name="stats">
            <StatsSection stats={cfg.stats} />
          </SectionTracker>
          <SectionTracker name="donate">
            <DonateSection title={cfg.donate.title} subtitle={cfg.donate.subtitle} reasons={cfg.donate.reasons} donateLinks={cfg.donate.donateLinks} />
          </SectionTracker>
          <SectionTracker name="volunteer">
            <VolunteerSection title={cfg.volunteer.title} subtitle={cfg.volunteer.subtitle} roles={cfg.volunteer.roles} requirements={cfg.volunteer.requirements} cta={cfg.volunteer.cta} />
          </SectionTracker>
          <SectionTracker name="partners">
            <PartnerLogos title={cfg.partners.title} subtitle={cfg.partners.subtitle} partners={cfg.partners.partners} />
          </SectionTracker>
          <SectionTracker name="location">
            <Location title={cfg.location.title} subtitle={cfg.location.subtitle} center={cfg.location.center} />
          </SectionTracker>
          <SectionTracker name="news-events">
            <NewsEvents title={cfg.newsEvents.title} subtitle={cfg.newsEvents.subtitle} news={cfg.newsEvents.news} events={cfg.newsEvents.events} />
          </SectionTracker>
          <SectionTracker name="faq">
            <FAQSection faq={cfg.faq} />
          </SectionTracker>
          <SectionTracker name="contact">
            <ContactSection contact={cfg.contact} />
          </SectionTracker>
        </SessionProvider>
      </main>
      <Footer />
    </div>
  )
}
