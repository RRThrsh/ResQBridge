/**
 * Single source of truth for user-facing dates in this app.
 * Display: long month names (January, February, …). Storage/forms: ISO YYYY-MM-DD.
 * Do not call toLocaleDateString / toLocaleString elsewhere — use these helpers.
 */

const LOCALE = 'en-US'

/** Parse ISO date strings (YYYY-MM-DD) in local time to avoid timezone shifts. */
export function parseDate(value: string | number | Date): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

/** e.g. January 15, 2026 */
export function formatDate(value: string | number | Date): string {
  return parseDate(value).toLocaleDateString(LOCALE, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** e.g. Monday, January 15, 2026 (weekday short: Mon, January 15, 2026) */
export function formatDateWithWeekday(
  value: string | number | Date,
  weekday: 'long' | 'short' = 'long',
): string {
  return parseDate(value).toLocaleDateString(LOCALE, {
    weekday,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** e.g. January 15 */
export function formatMonthDay(value: string | number | Date): string {
  return parseDate(value).toLocaleDateString(LOCALE, {
    month: 'long',
    day: 'numeric',
  })
}

/** e.g. January 15, 2026, 3:30 PM */
export function formatDateTime(value: string | number | Date): string {
  return parseDate(value).toLocaleString(LOCALE, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** For `<input type="date">` values and API payloads (YYYY-MM-DD). */
export function toIsoDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
