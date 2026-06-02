import schema from '../../convex/schema'
import { DEFAULT_ADMIN } from '../../convex/lib/admins'
import {
  DOMESTIC_REPORT_TYPES,
  WILDLIFE_CONDITIONS,
} from '@/lib/reports'
import { VENUE_HOURS_LABEL, VENUE_TIMEZONE } from '@/lib/venueHours'

describe('project sanity', () => {
  it('exports a Convex schema with expected tables', () => {
    const tables = schema.tables
    expect(tables).toHaveProperty('admins')
    expect(tables).toHaveProperty('users')
    expect(tables).toHaveProperty('reports')
    expect(tables).toHaveProperty('verificationCodes')
    expect(tables).toHaveProperty('siteContent')
  })

  it('has a default admin seed configuration', () => {
    expect(DEFAULT_ADMIN.email).toMatch(/@/)
    expect(DEFAULT_ADMIN.firstName.length).toBeGreaterThan(0)
    expect(DEFAULT_ADMIN.lastName.length).toBeGreaterThan(0)
  })

  it('defines domestic report types and wildlife conditions', () => {
    expect(DOMESTIC_REPORT_TYPES.length).toBeGreaterThanOrEqual(3)
    expect(WILDLIFE_CONDITIONS.length).toBeGreaterThanOrEqual(3)
  })

  it('defines venue hours constants', () => {
    expect(VENUE_TIMEZONE).toBe('Asia/Manila')
    expect(VENUE_HOURS_LABEL).toContain('8 AM')
  })

  it('can import core app modules without throwing', async () => {
    await expect(import('@/lib/admin')).resolves.toBeDefined()
    await expect(import('@/lib/dates')).resolves.toBeDefined()
    await expect(import('@/lib/reports')).resolves.toBeDefined()
    await expect(import('@/hooks/usePaginatedRows')).resolves.toBeDefined()
  })
})
