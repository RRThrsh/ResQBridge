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

export default function Landing() {
  return (
    <SessionProvider>
      <SectionTracker name="hero">
        <HeroSection />
      </SectionTracker>
      <SectionTracker name="carousel">
        <Carousel />
      </SectionTracker>
      <SectionTracker name="community-board">
        <CommunityBoard />
      </SectionTracker>
      <SectionTracker name="location">
        <Location />
      </SectionTracker>
      <SectionTracker name="news-events">
        <NewsEvents />
      </SectionTracker>
      <SectionTracker name="stats">
        <StatsSection />
      </SectionTracker>
      <SectionTracker name="faq">
        <FAQSection />
      </SectionTracker>
      <SectionTracker name="contact">
        <ContactSection />
      </SectionTracker>
    </SessionProvider>
  )
}
