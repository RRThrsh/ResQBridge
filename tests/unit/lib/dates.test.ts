import {
  formatDate,
  formatDateTime,
  formatDateWithWeekday,
  formatMonthDay,
  parseDate,
  toIsoDateString,
} from '@/lib/dates'

describe('parseDate', () => {
  it('parses ISO date strings in local time', () => {
    const d = parseDate('2026-01-15')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(15)
  })

  it('passes through Date instances', () => {
    const d = new Date(2026, 5, 1)
    expect(parseDate(d)).toBe(d)
  })

  it('parses numeric timestamps', () => {
    const ts = Date.UTC(2026, 0, 1)
    expect(parseDate(ts).getTime()).toBe(ts)
  })
})

describe('formatters', () => {
  const iso = '2026-01-15'

  it('formatDate uses long month names', () => {
    expect(formatDate(iso)).toMatch(/January 15, 2026/)
  })

  it('formatDateWithWeekday includes weekday', () => {
    expect(formatDateWithWeekday(iso, 'short')).toMatch(/Jan/)
    expect(formatDateWithWeekday(iso, 'long')).toMatch(/January/)
  })

  it('formatMonthDay omits year', () => {
    expect(formatMonthDay(iso)).toBe('January 15')
    expect(formatMonthDay(iso)).not.toMatch(/2026/)
  })

  it('formatDateTime includes time', () => {
    expect(formatDateTime(iso)).toMatch(/January 15, 2026/)
  })
})

describe('toIsoDateString', () => {
  it('returns YYYY-MM-DD', () => {
    expect(toIsoDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
