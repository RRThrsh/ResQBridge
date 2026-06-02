import type { AuthUser } from '@/types/auth'
import { normalizeEmail } from '@/lib/admin'
import { getAuthApiUrl, parseAuthError } from '@/lib/auth-api-base'

export type AuthMode = 'sign-in' | 'sign-up'

interface SendOtpInput {
  mode: AuthMode
  email: string
  firstName?: string
  lastName?: string
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false
  const message = error.message.toLowerCase()
  return (
    message === 'load failed' ||
    message === 'failed to fetch' ||
    message.includes('network')
  )
}

async function authFetch(path: string, body: Record<string, unknown>): Promise<Response> {
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

export async function sendOtp(input: SendOtpInput): Promise<void> {
  const email = normalizeEmail(input.email)
  const response = await authFetch('/api/auth/send-otp', {
    mode: input.mode,
    email,
    ...(input.mode === 'sign-up'
      ? {
          firstName: input.firstName?.trim() ?? '',
          lastName: input.lastName?.trim() ?? '',
        }
      : {}),
  })

  if (!response.ok) {
    throw new Error(await parseAuthError(response))
  }
}

export async function verifyOtp(
  email: string,
  code: string,
  mode: AuthMode,
): Promise<AuthUser> {
  const normalizedEmail = normalizeEmail(email)
  const response = await authFetch('/api/auth/verify-otp', {
    email: normalizedEmail,
    code: code.trim(),
    mode,
  })

  if (!response.ok) {
    throw new Error(await parseAuthError(response))
  }

  const data = (await response.json()) as { user: AuthUser }
  return {
    email: normalizeEmail(data.user.email),
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: 'user',
  }
}
