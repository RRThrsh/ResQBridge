import { convexCloudToSiteUrl } from '@/lib/convex-url'

describe('convexCloudToSiteUrl', () => {
  it('converts .convex.cloud to .convex.site', () => {
    expect(convexCloudToSiteUrl('https://happy-animal-123.convex.cloud')).toBe(
      'https://happy-animal-123.convex.site',
    )
  })

  it('preserves .convex.site URLs', () => {
    expect(convexCloudToSiteUrl('https://happy-animal-123.convex.site/')).toBe(
      'https://happy-animal-123.convex.site',
    )
  })
})
