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
import SuccessStories from './SuccessStories'
import DonateSection from './DonateSection'
import VolunteerSection from './VolunteerSection'
import HowItWorks from './HowItWorks'
import Gallery from './Gallery'
import PartnerLogos from './PartnerLogos'
import Maintenance from './Maintenance'

const API_BASE = '/api/v1'

const FALLBACK_CONFIG = {
  hero: { badge: 'Palawan Wildlife Rescue & Conservation Center', title: 'Helping Animals, Protecting Nature', description: 'Submit reports for wildlife sightings, stray animals, rescue emergencies, and animal welfare concerns across Palawan communities.' },
  stats: [{ label: 'Rescues', value: '12K+' }, { label: 'Teams', value: '500+' }, { label: 'Countries', value: '30+' }, { label: 'Response Time', value: '<5m' }],
  contact: { emergencyHotline: '+63 (48) 123-4567', phone: '+63 (48) 434-1234', email: 'rescue@palawanwildlife.org', address: 'Irawan, Puerto Princesa City, Palawan 5300, Philippines', hours: 'Monday – Sunday, 8:00 AM – 5:00 PM', social: { facebook: 'https://facebook.com/palawanwildlife', instagram: 'https://instagram.com/palawanwildlife', twitter: 'https://twitter.com/palawanwildlife' } },
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
  howItWorks: { title: 'How It Works', subtitle: 'From alert to rescue — here is how the process unfolds.', steps: [
    { title: 'Report', desc: 'Submit a report via our hotline, app, or website with the animal\'s location, species, and condition.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { title: 'Assess', desc: 'Our team evaluates the situation, dispatches the nearest trained responders, and prepares necessary equipment.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { title: 'Rescue', desc: 'Responders safely secure the animal, provide emergency first aid, and transport it to our rehabilitation center.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { title: 'Rehabilitate', desc: 'Veterinarians and caretakers nurse the animal back to health through medical treatment, nutrition, and enclosure care.', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { title: 'Release', desc: 'Once fully recovered, the animal is returned to its natural habitat and monitored post-release for adaptation.', icon: 'M5 13l4 4L19 7' },
  ] },
  successStories: { title: 'Success Stories', subtitle: 'Real rescues made possible by our community and team.', stories: [
    { species: 'Hawksbill Turtle', quote: 'She was completely entangled — we almost gave up.', result: 'Successfully rehabilitated and released at Tubbataha Reef after 8 months of care.', fullStory: 'A juvenile hawksbill turtle was found entangled in a discarded fishing net off the coast of El Nido. Her front flipper was severely lacerated and infected. Our veterinary team performed multiple surgeries and months of physical therapy. In June 2026, she was released back into the protected waters of Tubbataha Reefs Natural Park, fitted with a satellite tag for post-release monitoring.', name: 'Dr. Maria Santos', role: 'Head Veterinarian' },
    { species: 'Philippine Eagle', quote: 'Seeing her soar again was worth every sleepless night.', result: 'Rescued from a snare, fully recovered and released into the wild.', fullStory: 'A juvenile Philippine Eagle was found by a local farmer with a snare tightly wrapped around its left leg. The injury was severe, and amputation seemed likely. After three months of intensive care, physical therapy, and feather conditioning, the eagle regained full mobility. She was released at Mount Mantalingajan Protected Landscape.', name: 'Joel Fernandez', role: 'Wildlife Rescuer' },
    { species: 'Palawan Bearcat', quote: 'He was just a pup when they brought him in.', result: 'Orphaned cub raised and released into the forest reserve.', fullStory: 'An orphaned Palawan Bearcat cub was found alone near Cleopatra Needle Forest Reserve, dehydrated and malnourished. Our team bottle-fed and cared for him for over 6 months, slowly introducing natural foraging behaviors. He was successfully released into a protected area and has been sighted multiple times since.', name: 'Anna Reyes', role: 'Animal Caretaker' },
    { species: 'Dugong', quote: 'She kept trying to swim back to sea — that fight saved her.', result: 'Stranded dugong rescued, rehabilitated, and released in 4 months.', fullStory: 'A juvenile dugong was found stranded in the mangroves of Port Barton, emaciated and covered in barnacles. The team worked around the clock to stabilize her, treat skin infections, and reintroduce seagrass feeding. After four months of rehabilitation, she was transported by boat and released into a protected seagrass meadow.', name: 'Capt. Rico Dimagiba', role: 'Marine Rescue Lead' },
  ] },
  gallery: { title: 'Gallery', subtitle: 'Moments from our rescue missions, community events, and conservation work.', images: [
    { title: 'Coastal Clean-Up Drive', label: 'Community Event', desc: 'Over 200 volunteers joined our coastal clean-up at Sabang Beach, collecting more than 500 kg of waste.', date: 'May 2026' },
    { title: 'Sea Turtle Release', label: 'Rescue Mission', desc: 'A green sea turtle released at El Nido after three months of rehabilitation for a healed flipper injury.', date: 'Apr 2026' },
    { title: 'Community Education Workshop', label: 'Education', desc: 'Our team conducted a wildlife awareness seminar at a local elementary school in Irawan.', date: 'Mar 2026' },
    { title: 'Mangrove Planting', label: 'Conservation', desc: 'Partners and volunteers planted over 3,000 mangrove seedlings along the Puerto Princesa coastline.', date: 'Feb 2026' },
    { title: 'Rescue Team Training', label: 'Training', desc: 'Annual wildlife first-responder training with hands-on simulation exercises.', date: 'Jan 2026' },
    { title: 'Facility Tour', label: 'Community Event', desc: 'Open house event where the public toured the rescue center and met the animal residents.', date: 'Dec 2025' },
  ] },
  donate: { title: 'Support Our Mission', subtitle: 'Every contribution helps us rescue, rehabilitate, and release more animals across Palawan.', reasons: [
    { stat: '12K+', label: 'Animals Rescued', desc: 'Since 2015, we have rescued over 12,000 animals in need.' },
    { stat: '85%', label: 'Release Rate', desc: 'The majority of animals we rescue are successfully returned to the wild.' },
    { stat: '500+', label: 'Active Volunteers', desc: 'Our community of volunteers makes every rescue possible.' },
  ], donateLinks: { note: '100% of donations go directly to animal care and conservation programs.', donateUrl: 'https://palawanwildlife.org/donate', monthlyUrl: 'https://palawanwildlife.org/monthly' } },
  volunteer: { title: 'Volunteer With Us', subtitle: 'Join our team and make a direct impact on wildlife conservation in Palawan.', roles: [
    { title: 'Animal Caretaker', desc: 'Assist with daily feeding, enclosure cleaning, and enrichment activities for recovering animals.' },
    { title: 'Rescue Responder', desc: 'Join our rapid response team to safely retrieve and transport injured or stranded animals.' },
    { title: 'Community Educator', desc: 'Lead workshops and awareness campaigns in local schools and barangays.' },
    { title: 'Admin Support', desc: 'Help with data entry, documentation, and coordination of rescue operations.' },
    { title: 'Fundraising & Events', desc: 'Organize and promote events, campaigns, and donation drives for the center.' },
    { title: 'Marine Patrol', desc: 'Assist in monitoring coastal areas and responding to marine animal strandings.' },
  ], requirements: ['At least 18 years old (16+ with parental consent)', 'Willing to undergo basic wildlife handling training', 'Able to commit to at least 4 hours per week', 'Comfortable working outdoors in tropical conditions', 'No prior experience needed — training is provided', 'Pass a background check for roles involving direct animal contact'], cta: { label: 'Apply to Volunteer', link: '/report' } },
  partners: { title: 'Our Partners', subtitle: 'We work alongside these organizations to protect Palawan\'s wildlife.', partners: [
    { name: 'DENR Palawan', type: 'Government Agency' },
    { name: 'Tubbataha Management Office', type: 'Protected Area' },
    { name: 'Palawan Council for Sustainable Development', type: 'Government Agency' },
    { name: 'Philippine Eagle Foundation', type: 'Non-Profit' },
    { name: 'Coastal Conservation Education Foundation', type: 'Non-Profit' },
    { name: 'Puerto Princesa City Government', type: 'Local Government' },
    { name: 'El Nido Foundation', type: 'Non-Profit' },
    { name: 'WWF Philippines', type: 'International NGO' },
    { name: 'OceanCare', type: 'International NGO' },
    { name: 'Palawan State University', type: 'Academic Institution' },
  ] },
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

  function deepMerge(target, source) {
    const result = { ...target }
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }

  const fetchConfig = () =>
    fetch(`${API_BASE}/landing-config`)
      .then((r) => r.json())
      .then((d) => {
        setLandingConfig(d.config ? deepMerge(FALLBACK_CONFIG, d.config) : null)
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
