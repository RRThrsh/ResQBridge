import type { Doc, Id } from '../../../convex/_generated/dataModel'
import {
  buildReportAnalytics,
  filterReportsByDays,
} from '../../../convex/lib/reportAnalytics'

const NOW = Date.UTC(2026, 5, 1, 12, 0, 0)

function report(
  overrides: Partial<Doc<'reports'>> & Pick<Doc<'reports'>, 'category' | 'createdAt'>,
): Doc<'reports'> {
  return {
    _id: `reports_${Math.random()}` as Id<'reports'>,
    _creationTime: overrides.createdAt,
    userEmail: 'user@example.com',
    type: overrides.category === 'domestic' ? 'missing' : 'wildlife-sighting',
    animalName: overrides.animalName ?? 'Eagle',
    location: 'Park',
    status: 'pending',
    ...overrides,
  }
}

describe('convex/lib/reportAnalytics', () => {
  it('filterReportsByDays keeps all reports when days is null', () => {
    const reports = [
      report({ category: 'wildlife', createdAt: NOW - 200 * 86_400_000 }),
      report({ category: 'domestic', createdAt: NOW }),
    ]
    expect(filterReportsByDays(reports, null, NOW)).toHaveLength(2)
  })

  it('filterReportsByDays excludes reports older than the window', () => {
    const reports = [
      report({ category: 'wildlife', createdAt: NOW - 10 * 86_400_000 }),
      report({ category: 'domestic', createdAt: NOW - 40 * 86_400_000 }),
    ]
    expect(filterReportsByDays(reports, 30, NOW)).toHaveLength(1)
  })

  it('buildReportAnalytics buckets reports by UTC day', () => {
    const day1 = Date.UTC(2026, 4, 10, 8, 0, 0)
    const day2 = Date.UTC(2026, 4, 11, 8, 0, 0)
    const result = buildReportAnalytics(
      [
        report({ category: 'wildlife', createdAt: day1 }),
        report({ category: 'domestic', createdAt: day1, type: 'found' }),
        report({ category: 'wildlife', createdAt: day2 }),
      ],
      [],
      5,
      null,
      NOW,
    )

    expect(result.reportsOverTime).toEqual([
      { date: '2026-05-10', total: 2, wildlife: 1, domestic: 1 },
      { date: '2026-05-11', total: 1, wildlife: 1, domestic: 0 },
    ])
  })

  it('buildReportAnalytics counts status, category, and summary fields', () => {
    const result = buildReportAnalytics(
      [
        report({
          category: 'wildlife',
          createdAt: NOW,
          status: 'pending',
          condition: 'injured',
          latitude: 1,
          longitude: 2,
          photoStorageIds: ['storage_1' as Id<'_storage'>],
        }),
        report({
          category: 'domestic',
          createdAt: NOW,
          status: 'accepted',
          type: 'missing',
          assignedRescuerEmail: 'rescuer@example.com',
        }),
        report({
          category: 'domestic',
          createdAt: NOW,
          status: 'rescue_success',
          type: 'found',
          assignedRescuerEmail: 'rescuer@example.com',
        }),
      ],
      [
        {
          _id: 'rescuers_1' as Id<'rescuers'>,
          _creationTime: 1,
          email: 'rescuer@example.com',
          firstName: 'R',
          lastName: 'One',
          createdAt: 1,
        },
      ],
      10,
      null,
      NOW,
    )

    expect(result.summary).toMatchObject({
      totalUsers: 10,
      totalReports: 3,
      pendingReports: 1,
      activeDispatchReports: 1,
      completedReports: 1,
      wildlifeReports: 1,
      domesticReports: 2,
      totalRescuers: 1,
      unassignedPending: 1,
      reportsWithPhotos: 1,
      reportsWithGps: 1,
    })

    expect(result.byCategory).toEqual([
      { category: 'wildlife', label: 'Wildlife', count: 1 },
      { category: 'domestic', label: 'Domestic', count: 2 },
    ])

    expect(result.domesticByType).toEqual(
      expect.arrayContaining([
        { type: 'missing', label: 'Missing', count: 1 },
        { type: 'found', label: 'Found', count: 1 },
      ]),
    )

    expect(result.outcomes).toEqual({ success: 1, failed: 0 })
  })

  it('buildReportAnalytics ranks wildlife species case-insensitively', () => {
    const result = buildReportAnalytics(
      [
        report({ category: 'wildlife', createdAt: NOW, animalName: 'Eagle' }),
        report({ category: 'wildlife', createdAt: NOW, animalName: 'eagle' }),
        report({ category: 'wildlife', createdAt: NOW, animalName: 'Hawk' }),
      ],
      [],
      0,
      null,
      NOW,
    )

    expect(result.wildlifeTopSpecies[0]).toEqual({ name: 'Eagle', count: 2 })
    expect(result.wildlifeTopSpecies[1]).toEqual({ name: 'Hawk', count: 1 })
  })

  it('buildReportAnalytics splits rescuer active vs completed workload', () => {
    const result = buildReportAnalytics(
      [
        report({
          category: 'domestic',
          createdAt: NOW,
          status: 'en_route',
          assignedRescuerEmail: 'rescuer@example.com',
        }),
        report({
          category: 'domestic',
          createdAt: NOW,
          status: 'rescue_failed',
          assignedRescuerEmail: 'rescuer@example.com',
        }),
      ],
      [
        {
          _id: 'rescuers_1' as Id<'rescuers'>,
          _creationTime: 1,
          email: 'rescuer@example.com',
          firstName: 'Sam',
          lastName: 'Rescuer',
          createdAt: 1,
        },
      ],
      0,
      null,
      NOW,
    )

    expect(result.rescuerWorkload).toEqual([
      {
        email: 'rescuer@example.com',
        name: 'Sam Rescuer',
        active: 1,
        completed: 1,
        total: 2,
      },
    ])
  })

  it('returns empty chart arrays when no reports match the filter', () => {
    const result = buildReportAnalytics(
      [report({ category: 'wildlife', createdAt: NOW - 100 * 86_400_000 })],
      [],
      3,
      7,
      NOW,
    )

    expect(result.summary.totalReports).toBe(0)
    expect(result.reportsOverTime).toEqual([])
    expect(result.byStatus).toEqual([])
    expect(result.byCategory).toEqual([])
  })
})
