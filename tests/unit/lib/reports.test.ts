import type { Doc, Id } from '../../../convex/_generated/dataModel'
import {
  adminReportToStored,
  docToStored,
  formatReportType,
  formatReporterName,
  normalizeClientReportStatus,
  resolveWildlifeBehavior,
  statusLabel,
  statusTone,
  wildlifeBehaviorDisplayText,
  wildlifeBehaviorLabelForValue,
  wildlifeBehaviorSelectValue,
} from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'

function mockReport(overrides: Partial<Doc<'reports'>> = {}): Doc<'reports'> {
  return {
    _id: 'report123' as Id<'reports'>,
    _creationTime: 1,
    userEmail: 'user@example.com',
    category: 'domestic',
    type: 'missing',
    animalName: 'Buddy',
    location: 'Park',
    status: 'pending',
    createdAt: 1_700_000_000_000,
    ...overrides,
  }
}

describe('reports lib', () => {
  it('formatReporterName joins names and handles empty', () => {
    expect(formatReporterName('Ada', 'Lovelace')).toBe('Ada Lovelace')
    expect(formatReporterName('', '')).toBe('Unknown reporter')
  })

  it('docToStored maps convex doc to client shape', () => {
    const doc = mockReport()
    const stored = docToStored(doc)
    expect(stored.id).toBe(doc._id)
    expect(stored.userEmail).toBe(doc.userEmail)
    expect(stored.category).toBe('domestic')
    expect(stored.status).toBe('pending')
    expect(stored.photoDataUrls).toEqual([])
  })

  it('docToStored maps photo arrays and legacy single photo', () => {
    expect(
      getReportPhotos(
        mockReport({
          photoDataUrls: ['data:image/png;base64,aaa', 'data:image/png;base64,bbb'],
        }),
      ),
    ).toHaveLength(2)
    expect(getReportPhotos(mockReport({ photoDataUrl: 'data:image/png;base64,legacy' }))).toEqual([
      'data:image/png;base64,legacy',
    ])
  })

  it('docToStored normalizes statuses', () => {
    expect(docToStored(mockReport({ status: 'open' })).status).toBe('pending')
    expect(docToStored(mockReport({ status: 'resolved' })).status).toBe('rescue_success')
    expect(docToStored(mockReport({ status: 'rejected' })).status).toBe('rejected')
  })

  it('adminReportToStored includes reporter fields', () => {
    const row = {
      ...mockReport(),
      reporterFirstName: 'Jane',
      reporterLastName: 'Doe',
    }
    const stored = adminReportToStored(row)
    expect(stored.reporterFirstName).toBe('Jane')
    expect(stored.reporterLastName).toBe('Doe')
  })

  it('formatReportType replaces hyphens with spaces', () => {
    expect(formatReportType('wild-life')).toBe('wild life')
  })

  it('statusLabel maps dispatch statuses', () => {
    expect(statusLabel('pending')).toBe('Under Review')
    expect(statusLabel('accepted')).toBe('Accepted')
    expect(statusLabel('rejected')).toBe('Rejected')
    expect(statusLabel('en_route')).toBe('En Route')
    expect(statusLabel('rescue_success')).toBe('Rescue Successful')
    expect(statusLabel('rescue_failed')).toBe('Rescue Failed')
  })

  it('normalizeClientReportStatus maps legacy values', () => {
    expect(normalizeClientReportStatus('open')).toBe('pending')
    expect(normalizeClientReportStatus('resolved')).toBe('rescue_success')
    expect(normalizeClientReportStatus('rejected')).toBe('rejected')
  })

  it('statusTone provides styling for rejected status', () => {
    const tone = statusTone('rejected')
    expect(tone.badge).toContain('destructive')
    expect(tone.dot).toContain('destructive')
  })

  it('resolveWildlifeBehavior returns the full display text', () => {
    expect(
      resolveWildlifeBehavior('other', '  Hanging near road  '),
    ).toBe('Hanging near road')
    expect(
      resolveWildlifeBehavior(
        'roaming',
        'Just passing through / Roaming',
      ),
    ).toBe('Just passing through / Roaming')
  })

  it('wildlifeBehaviorSelectValue maps labels and custom text', () => {
    expect(wildlifeBehaviorSelectValue('roaming')).toBe('roaming')
    expect(wildlifeBehaviorSelectValue('Just passing through / Roaming')).toBe('roaming')
    expect(wildlifeBehaviorSelectValue('Custom sighting')).toBe('other')
    expect(wildlifeBehaviorDisplayText('Just passing through / Roaming')).toBe(
      'Just passing through / Roaming',
    )
    expect(wildlifeBehaviorDisplayText('Custom sighting')).toBe('Custom sighting')
    expect(wildlifeBehaviorLabelForValue('other')).toBe('Other / Not sure')
  })
})
