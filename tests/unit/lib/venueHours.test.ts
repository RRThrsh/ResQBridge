import {
  VENUE_CLOSE_HOUR,
  VENUE_OPEN_HOUR,
  getVenueHoursStatus,
  venueHoursStatusStyles,
} from '@/lib/venueHours'

/** Build a Date at a given Manila local time on a fixed calendar day. */
function manilaTime(hour: number, minute = 0): Date {
  return new Date(
    `2026-05-26T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`,
  )
}

describe('getVenueHoursStatus', () => {
  it('reports open during business hours', () => {
    const snapshot = getVenueHoursStatus(manilaTime(10))
    expect(snapshot.status).toBe('open')
    expect(snapshot.label).toBe('Open now')
  })

  it('reports closed outside business hours', () => {
    const snapshot = getVenueHoursStatus(manilaTime(20))
    expect(snapshot.status).toBe('closed')
    expect(snapshot.label).toBe('Closed')
  })

  it('reports closing_soon within soon window before close', () => {
    const snapshot = getVenueHoursStatus(manilaTime(VENUE_CLOSE_HOUR - 1, 30), 60)
    expect(snapshot.status).toBe('closing_soon')
    expect(snapshot.label).toBe('Closing soon')
  })

  it('reports opening_soon within soon window before open', () => {
    const snapshot = getVenueHoursStatus(manilaTime(VENUE_OPEN_HOUR - 1), 60)
    expect(snapshot.status).toBe('opening_soon')
    expect(snapshot.label).toBe('Opening soon')
  })

  it('includes minutesUntilChange', () => {
    const snapshot = getVenueHoursStatus(manilaTime(10))
    expect(snapshot.minutesUntilChange).toBeGreaterThan(0)
  })
})

describe('venueHoursStatusStyles', () => {
  it('returns badge and dot classes for each status', () => {
    for (const status of ['open', 'closed', 'opening_soon', 'closing_soon'] as const) {
      const styles = venueHoursStatusStyles(status)
      expect(styles.badge).toBeTruthy()
      expect(styles.dot).toBeTruthy()
    }
  })
})
