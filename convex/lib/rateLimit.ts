const store = new Map<string, number[]>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

export function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  let timestamps = store.get(key) ?? []
  timestamps = timestamps.filter((t) => now - t < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((timestamps[0]! + WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter }
  }

  timestamps.push(now)
  store.set(key, timestamps)
  return { allowed: true, retryAfter: 0 }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) return cf
  return 'unknown'
}
