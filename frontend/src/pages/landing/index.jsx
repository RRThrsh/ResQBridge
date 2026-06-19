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
    <>
      <HeroSection />
      <Carousel />
      <CommunityBoard />
      <Location />
      <NewsEvents />
      <StatsSection />
      <FAQSection />
      <ContactSection />
    </>
  )
}
