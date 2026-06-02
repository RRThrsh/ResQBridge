import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { VenueHoursStatusBadge } from '@/components/sections/VenueHoursStatusBadge'
import type { VenueHoursSnapshot } from '@/lib/venueHours'

const openSnapshot: VenueHoursSnapshot = {
  status: 'open',
  label: 'Open now',
  detail: 'Closes at 5:00 PM',
  minutesUntilChange: 120,
}

describe('VenueHoursStatusBadge feature', () => {
  it('renders status label', () => {
    render(<VenueHoursStatusBadge snapshot={openSnapshot} />)
    expect(screen.getByText('Open now')).toBeInTheDocument()
  })

  it('shows detail when showDetail is true', () => {
    render(<VenueHoursStatusBadge snapshot={openSnapshot} showDetail />)
    expect(screen.getByText('Closes at 5:00 PM')).toBeInTheDocument()
  })

  it('hides detail by default', () => {
    render(<VenueHoursStatusBadge snapshot={openSnapshot} />)
    expect(screen.queryByText('Closes at 5:00 PM')).not.toBeInTheDocument()
  })
})
