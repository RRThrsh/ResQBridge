/** Map Convex client URL (.cloud) to HTTP actions URL (.site). */
export function convexCloudToSiteUrl(convexUrl: string): string {
  const trimmed = convexUrl.trim().replace(/\/$/, '')
  if (trimmed.includes('.convex.site')) return trimmed
  return trimmed.replace('.convex.cloud', '.convex.site')
}
