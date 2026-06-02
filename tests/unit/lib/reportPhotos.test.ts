import {
  MAX_REPORT_PHOTOS,
  MAX_REPORT_PHOTOS_TOTAL_BYTES,
  formatPhotoSizeLimitMessage,
  legacyPhotoDataUrlsForSubmit,
  photoStorageIdsForSubmit,
  remainingPhotoBudgetBytes,
  sumPhotoBytes,
  validateReportPhotosForSubmit,
} from '@/lib/reportPhotos'

describe('reportPhotos lib', () => {
  it('sumPhotoBytes totals sizes', () => {
    expect(sumPhotoBytes([1_000, 2_000])).toBe(3_000)
    expect(sumPhotoBytes([])).toBe(0)
  })

  it('remainingPhotoBudgetBytes never goes negative', () => {
    expect(remainingPhotoBudgetBytes(0)).toBe(MAX_REPORT_PHOTOS_TOTAL_BYTES)
    expect(remainingPhotoBudgetBytes(MAX_REPORT_PHOTOS_TOTAL_BYTES)).toBe(0)
    expect(remainingPhotoBudgetBytes(MAX_REPORT_PHOTOS_TOTAL_BYTES + 1)).toBe(0)
  })

  it('validateReportPhotosForSubmit requires at least one photo', () => {
    expect(validateReportPhotosForSubmit([])).toBe('Please upload at least one photo')
  })

  it('validateReportPhotosForSubmit enforces max count', () => {
    const photos = Array.from({ length: MAX_REPORT_PHOTOS + 1 }, (_, index) => ({
      key: `p-${index}`,
      previewUrl: 'blob:test',
      sizeBytes: 1,
      storageId: `storage_${index}` as never,
    }))
    expect(validateReportPhotosForSubmit(photos)).toBe(
      `You can attach up to ${MAX_REPORT_PHOTOS} photos per report`,
    )
  })

  it('validateReportPhotosForSubmit enforces 50 MB total for storage uploads', () => {
    const overBudget = {
      key: 'big',
      previewUrl: 'blob:test',
      sizeBytes: MAX_REPORT_PHOTOS_TOTAL_BYTES + 1,
      storageId: 'storage_big' as never,
    }
    expect(validateReportPhotosForSubmit([overBudget])).toBe(formatPhotoSizeLimitMessage())
  })

  it('photoStorageIdsForSubmit and legacyPhotoDataUrlsForSubmit partition items', () => {
    const items = [
      {
        key: 's1',
        previewUrl: 'https://cdn.example/a.jpg',
        sizeBytes: 100,
        storageId: 'storage_a' as never,
      },
      {
        key: 'l1',
        previewUrl: 'data:image/png;base64,abc',
        sizeBytes: 0,
        legacyDataUrl: 'data:image/png;base64,abc',
      },
    ]
    expect(photoStorageIdsForSubmit(items)).toEqual(['storage_a'])
    expect(legacyPhotoDataUrlsForSubmit(items)).toEqual(['data:image/png;base64,abc'])
  })
})
