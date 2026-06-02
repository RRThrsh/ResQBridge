/** PWRCC visitor hours — Monday through Sunday, Asia/Manila */
export const VENUE_TIMEZONE = 'Asia/Manila'
export const VENUE_HOURS_LABEL = 'Monday – Sunday · 8 AM – 5 PM'
export const VENUE_OPEN_HOUR = 8
export const VENUE_CLOSE_HOUR = 17
/** Minutes before open/close to show "soon" status */
export const VENUE_SOON_MINUTES = 60

export type VenueHoursStatus = 'open' | 'closed' | 'opening_soon' | 'closing_soon'

export type VenueHoursSnapshot = {
  status: VenueHoursStatus
  label: string
  detail: string
  minutesUntilChange: number
}

const OPEN_MINUTES = VENUE_OPEN_HOUR * 60
const CLOSE_MINUTES = VENUE_CLOSE_HOUR * 60

const manilaTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: VENUE_TIMEZONE,
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
})

const manilaTimeLabelFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: VENUE_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

function getManilaMinutesSinceMidnight(now: Date): number {
  const parts = manilaTimeFormatter.formatToParts(now)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

function formatManilaClockTime(hour: number, minute = 0): string {
  const ref = new Date(
    `2026-01-15T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`,
  )
  return manilaTimeLabelFormatter.format(ref)
}

const OPEN_TIME_LABEL = formatManilaClockTime(VENUE_OPEN_HOUR)
const CLOSE_TIME_LABEL = formatManilaClockTime(VENUE_CLOSE_HOUR)

function formatMinutesUntil(minutes: number): string {
  if (minutes < 1) return 'less than a minute'
  if (minutes === 1) return '1 minute'
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (remainder === 0) return hours === 1 ? '1 hour' : `${hours} hours`
  return `${hours}h ${remainder}m`
}

export function getVenueHoursStatus(
  now: Date = new Date(),
  soonMinutes: number = VENUE_SOON_MINUTES,
): VenueHoursSnapshot {
  const minutesNow = getManilaMinutesSinceMidnight(now)

  if (minutesNow >= OPEN_MINUTES && minutesNow < CLOSE_MINUTES) {
    const minutesUntilClose = CLOSE_MINUTES - minutesNow
    if (minutesUntilClose <= soonMinutes) {
      return {
        status: 'closing_soon',
        label: 'Closing soon',
        detail: `Closes at ${CLOSE_TIME_LABEL} (${formatMinutesUntil(minutesUntilClose)})`,
        minutesUntilChange: minutesUntilClose,
      }
    }
    return {
      status: 'open',
      label: 'Open now',
      detail: `Closes at ${CLOSE_TIME_LABEL}`,
      minutesUntilChange: minutesUntilClose,
    }
  }

  const minutesUntilOpen =
    minutesNow < OPEN_MINUTES
      ? OPEN_MINUTES - minutesNow
      : 24 * 60 - minutesNow + OPEN_MINUTES

  if (minutesUntilOpen <= soonMinutes) {
    return {
      status: 'opening_soon',
      label: 'Opening soon',
      detail: `Opens at ${OPEN_TIME_LABEL} (${formatMinutesUntil(minutesUntilOpen)})`,
      minutesUntilChange: minutesUntilOpen,
    }
  }

  return {
    status: 'closed',
    label: 'Closed',
    detail: `Opens at ${OPEN_TIME_LABEL}`,
    minutesUntilChange: minutesUntilOpen,
  }
}

export function venueHoursStatusStyles(status: VenueHoursStatus): {
  badge: string
  dot: string
} {
  switch (status) {
    case 'open':
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400',
        dot: 'bg-emerald-500',
      }
    case 'closing_soon':
      return {
        badge: 'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400',
        dot: 'bg-amber-500',
      }
    case 'opening_soon':
      return {
        badge: 'bg-sky-500/10 text-sky-600 border-sky-500/25 dark:text-sky-400',
        dot: 'bg-sky-500',
      }
    case 'closed':
      return {
        badge: 'bg-muted text-muted-foreground border-border',
        dot: 'bg-muted-foreground/50',
      }
  }
}
