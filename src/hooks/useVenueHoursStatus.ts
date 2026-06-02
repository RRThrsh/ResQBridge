import { useEffect, useState } from 'react'
import { getVenueHoursStatus, type VenueHoursSnapshot } from '@/lib/venueHours'

/** Recomputes PWRCC open/closed status every minute (Asia/Manila). */
export function useVenueHoursStatus(): VenueHoursSnapshot {
  const [snapshot, setSnapshot] = useState(() => getVenueHoursStatus())

  useEffect(() => {
    const update = () => setSnapshot(getVenueHoursStatus())
    update()

    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return snapshot
}
