import { useNavigate } from 'react-router-dom'
import { HeroSection } from '@/components/sections/HeroSection'
import { DomesticReports } from '@/components/sections/DomesticReports'
import { MapSection } from '@/components/sections/MapSection'
import { EventsSection } from '@/components/sections/EventsSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { useUserAuth } from '@/context/UserAuthContext'

interface DashboardProps {
  onLoginRequest: () => void
}

export function Dashboard({ onLoginRequest }: DashboardProps) {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserAuth()

  const handleReportClick = () => {
    if (isLoggedIn) {
      navigate('/report')
    } else {
      onLoginRequest()
    }
  }

  return (
    <>
      <HeroSection onReportClick={handleReportClick} />
      <div className="section-divider" />
      <DomesticReports />
      <div className="section-divider" />
      <MapSection />
      <div className="section-divider" />
      <EventsSection />
      <div className="section-divider" />
      <AboutSection />
    </>
  )
}
