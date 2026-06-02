import type { Id } from '../../../convex/_generated/dataModel'
import type { MutationCtx } from '../../../convex/_generated/server'
import {
  MAX_REPORT_PHOTOS,
  MAX_REPORT_PHOTOS_TOTAL_BYTES,
  normalizePhotoDataUrls,
  sumPhotoBytes,
  validatePhotoStorageIds,
} from '../../../convex/lib/reportPhotos'

function mockMutationCtx(storageById: Record<string, { size: number } | null>): MutationCtx {
  return {
    db: {
      system: {
        get: async (_table: '_storage', id: Id<'_storage'>) => {
          const row = storageById[id]
          if (!row) return null
          return { _id: id, size: row.size }
        },
      },
    },
  } as unknown as MutationCtx
}

describe('convex reportPhotos lib', () => {
  it('normalizePhotoDataUrls dedupes and validates count', () => {
    const urls = normalizePhotoDataUrls([' data:a ', 'data:a'], 'data:b')
    expect(urls).toEqual(['data:a', 'data:b'])
  })

  it('validatePhotoStorageIds enforces count and total bytes', async () => {
    const idA = 'storage_a' as Id<'_storage'>
    const idB = 'storage_b' as Id<'_storage'>
    const ctx = mockMutationCtx({
      [idA]: { size: MAX_REPORT_PHOTOS_TOTAL_BYTES },
      [idB]: { size: 1 },
    })

    await expect(validatePhotoStorageIds(ctx, [idA, idB])).rejects.toThrow(
      'Photos must be 50 MB or smaller in total',
    )
  })

  it('validatePhotoStorageIds accepts only the first five photos when more are sent', async () => {
    const ids = Array.from(
      { length: MAX_REPORT_PHOTOS + 2 },
      (_, index) => `storage_${index}` as Id<'_storage'>,
    )
    const ctx = mockMutationCtx(
      Object.fromEntries(ids.map((id) => [id, { size: 1 }])),
    )

    const accepted = await validatePhotoStorageIds(ctx, ids)
    expect(accepted).toHaveLength(MAX_REPORT_PHOTOS)
    expect(accepted).toEqual(ids.slice(0, MAX_REPORT_PHOTOS))
  })

  it('sumPhotoBytes matches client helper', () => {
    expect(sumPhotoBytes([1024, 2048])).toBe(3072)
  })
})
