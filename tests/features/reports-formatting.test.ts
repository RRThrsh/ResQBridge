import {
  DOMESTIC_REPORT_TYPES,
  WILDLIFE_CONDITIONS,
  formatReportType,
  statusLabel,
} from '@/lib/reports'

describe('reports feature constants and formatting', () => {
  it('exposes all domestic report type options with labels', () => {
    const values = DOMESTIC_REPORT_TYPES.map((t) => t.value)
    expect(values).toEqual(expect.arrayContaining(['missing', 'found', 'stray', 'injured']))
    for (const entry of DOMESTIC_REPORT_TYPES) {
      expect(entry.label.length).toBeGreaterThan(0)
    }
  })

  it('exposes wildlife condition options', () => {
    expect(WILDLIFE_CONDITIONS.some((c) => c.value === 'healthy')).toBe(true)
    expect(WILDLIFE_CONDITIONS.some((c) => c.value === 'dead')).toBe(true)
  })

  it('formats types for display in UI lists', () => {
    expect(formatReportType('critically-endangered')).toBe('critically endangered')
    expect(statusLabel('pending')).toBe('Under Review')
    expect(statusLabel('accepted')).toBe('Accepted')
  })
})
