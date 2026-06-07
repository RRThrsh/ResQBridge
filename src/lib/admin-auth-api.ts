import type { AdminUser } from '@/types/auth'
import { normalizeEmail } from '@/lib/admin'
import { getAuthApiUrl, parseAuthError } from '@/lib/auth-api-base'

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false
  const message = error.message.toLowerCase()
  return (
    message === 'load failed' ||
    message === 'failed to fetch' ||
    message.includes('network')
  )
}

async function adminAuthFetch(
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const url = getAuthApiUrl(path)
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    if (isNetworkError(error)) {
      throw new Error(
        import.meta.env.PROD
          ? 'Could not reach the authentication service. Check your connection and try again.'
          : 'Could not reach the auth server. Keep `npm run dev` running and try again.',
        { cause: error },
      )
    }
    throw error
  }
}

// UPDATE: Added password parameter to fix the TS2554 error
async function handleAuthResponse(response: Response): Promise<void> {
  if (!response.ok) {
    if (response.status === 429) {
      window.location.href = '/too-many-request?redirect=' + encodeURIComponent(window.location.pathname)
      await new Promise(() => {})
    }
    if (response.status === 401) {
      window.location.href = '/error/401'
      await new Promise(() => {})
    }
    throw new Error(await parseAuthError(response))
  }
}

export async function sendAdminOtp(email: string, password?: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email)

  const response = await adminAuthFetch('/api/admin/auth/send-otp', {
    email: normalizedEmail,
    password,
  })

  await handleAuthResponse(response)
}

export async function verifyAdminOtp(email: string, code: string): Promise<AdminUser> {
  const normalizedEmail = normalizeEmail(email)

  const response = await adminAuthFetch('/api/admin/auth/verify-otp', {
    email: normalizedEmail,
    code: code.trim(),
  })

  await handleAuthResponse(response)

  const data = (await response.json()) as {
    user: { email: string; firstName: string; lastName: string; role: 'admin' }
  }

  return {
    email: normalizeEmail(data.user.email),
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: 'admin',
  }
}
