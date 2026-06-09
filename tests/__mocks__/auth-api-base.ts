export function getAuthApiUrl(path: string): string {
  return path
}

export async function parseAuthError(response: Response): Promise<string> {
  if (response.status === 429) {
    return 'Too many requests. Please wait a moment before trying again.'
  }
  if (response.status === 401) {
    return 'Your session has expired. Please sign in again.'
  }
  const text = await response.text()
  if (!text) {
    if (response.status === 404) {
      return 'Authentication service is unavailable. Deploy Convex HTTP routes and try again.'
    }
    return `Request failed (${response.status})`
  }
  try {
    const data = JSON.parse(text) as { error?: string }
    return data.error ?? 'Request failed'
  } catch {
    return text.length > 200 ? 'Request failed' : text
  }
}
