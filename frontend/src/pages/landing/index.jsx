import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { SessionProvider } from '../../context/SessionContext'
import SectionTracker from './SectionTracker'
import HeroSection from './HeroSection'
import Carousel from './Carousel'
import CommunityBoard from './CommunityBoard'
import Location from './Location'
import NewsEvents from './NewsEvents'
import StatsSection from './StatsSection'
import FAQSection from './FAQSection'
import ContactSection from './ContactSection'
import Maintenance from './Maintenance'

const API_BASE = '/api/v1'

const FALLBACK_CONFIG = {
  hero: { badge: 'Palawan Wildlife Rescue & Conservation Center', title: 'Helping Animals, Protecting Nature', description: 'Submit reports for wildlife sightings, stray animals, rescue emergencies, and animal welfare concerns across Palawan communities.' },
  stats: [{ label: 'Rescues', value: '12K+' }, { label: 'Teams', value: '500+' }, { label: 'Countries', value: '30+' }, { label: 'Response Time', value: '<5m' }],
  contact: { emergencyHotline: '+63 (48) 123-4567', phone: '+63 (48) 434-1234', email: 'rescue@palawanwildlife.org', address: 'Irawan, Puerto Princesa City, Palawan 5300, Philippines', hours: 'Monday – Sunday, 8:00 AM – 5:00 PM' },
  faq: [
    { q: 'How do I report a wildlife emergency?', a: "Call our 24/7 hotline at +63 (48) 123-4567 or use the Report an Animal button on our homepage. Provide the location, species if known, and a description of the animal's condition." },
    { q: 'What should I do if I find an injured animal?', a: 'Keep your distance, observe from a safe spot, and call our rescue hotline immediately. Do not attempt to feed, touch, or move the animal unless instructed by our team.' },
    { q: 'Can I volunteer at the rescue center?', a: 'Yes. We welcome volunteers for animal care, clean-up drives, and community education programs. Fill out the Contact form and select Volunteer as the subject.' },
    { q: 'How are donated funds used?', a: 'Donations go directly toward veterinary supplies, animal feed, facility maintenance, and community conservation programs. We publish annual transparency reports.' },
    { q: 'Do you accept drop-off donations?', a: 'Yes. In-kind donations like animal feed, cleaning materials, and office supplies can be dropped off during operating hours (Mon–Sun, 8 AM – 5 PM) at our Irawan center.' },
  ],
  carousel: [
    { title: 'Wildlife Rescue', desc: "Responding to injured and stranded animals across Palawan's forests and coastlines.", image: '' },
    { title: 'Community Education', desc: 'Teaching local communities about wildlife protection and sustainable coexistence.', image: '' },
    { title: 'Habitat Conservation', desc: "Preserving critical habitats for Palawan's endemic and endangered species.", image: '' },
    { title: 'Marine Protection', desc: 'Safeguarding sea turtles, dugongs, and coral reefs through active patrols.', image: '' },
  ],
  communityBoard: { title: 'Community Board', subtitle: 'Recent wildlife reports from across Palawan.' },
  location: { title: 'Location', subtitle: 'Visit us at our rescue center in Palawan.', center: { lat: 9.799447, lng: 118.693766 } },
  newsEvents: {
    title: 'News & Events',
    subtitle: 'Stay updated on rescues, releases, and upcoming community activities.',
    news: [
      { date: 'Jun 8, 2026', title: 'Rescue Center Reaches 12K Milestone', category: 'Milestone', desc: 'The center has successfully rescued and rehabilitated over 12,000 animals since opening its doors in 2015.' },
      { date: 'May 22, 2026', title: 'New Mangrove Nursery Established', category: 'Conservation', desc: 'A partnership with local communities has planted 3,000 mangrove seedlings along Puerto Princesa coastline.' },
      { date: 'Apr 14, 2026', title: 'Hawkbill Turtle Release at Tubbataha', category: 'Release', desc: 'After six months of rehabilitation, a juvenile hawksbill turtle was released back into the protected reef.' },
    ],
    events: [
      { date: 'Jul 15, 2026', title: 'Wildlife First-Responder Training', location: 'Rescue Center Auditorium', desc: 'A hands-on workshop covering basic wildlife handling, emergency triage, and safe transport techniques.' },
      { date: 'Aug 5, 2026', title: 'Coastal Clean-Up Drive', location: 'Sabang Beach', desc: 'Join volunteers for a morning of coastal cleanup followed by a short seminar on marine debris impact.' },
      { date: 'Sep 12, 2026', title: 'Community Appreciation Day', location: 'Rescue Center Grounds', desc: 'Open house with guided tours, wildlife exhibits, kids activities, and a chance to meet the rescue team.' },
    ],
  },
}

export default function Landing() {
  const [landingConfig, setLandingConfig] = useState(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('')

  const fetchConfig = () =>
    fetch(`${API_BASE}/landing-config`)
      .then((r) => r.json())
      .then((d) => {
        setLandingConfig(d.config)
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

  const cfg = landingConfig || FALLBACK_CONFIG

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
          <SectionTracker name="community-board">
            <CommunityBoard title={cfg.communityBoard.title} subtitle={cfg.communityBoard.subtitle} />
          </SectionTracker>
          <SectionTracker name="location">
            <Location title={cfg.location.title} subtitle={cfg.location.subtitle} center={cfg.location.center} />
          </SectionTracker>
          <SectionTracker name="news-events">
            <NewsEvents title={cfg.newsEvents.title} subtitle={cfg.newsEvents.subtitle} news={cfg.newsEvents.news} events={cfg.newsEvents.events} />
          </SectionTracker>
          <SectionTracker name="stats">
            <StatsSection stats={cfg.stats} />
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
