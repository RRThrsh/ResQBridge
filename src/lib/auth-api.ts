import type { AuthUser } from '@/types/auth'
import { getAuthApiUrl, parseAuthError } from '@/lib/auth-api-base'

export type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password'

interface SendOtpInput {
  mode: AuthMode
  identifier: string
  password?: string
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

async function handleAuthResponse(response: Response): Promise<void> {
  if (!response.ok) {
    if (response.status === 429) {
      window.location.href = '/error/401'
      await new Promise(() => {}) // halt
    }
    throw new Error(await parseAuthError(response))
  }
}

export async function sendOtp(input: SendOtpInput): Promise<void> {
  const identifier = input.identifier.trim().toLowerCase()

  const response = await authFetch('/api/auth/send-otp', {
    identifier,
    mode: input.mode,
    password: input.password,
    ...(input.mode === 'sign-up'
      ? {
          firstName: input.firstName?.trim() ?? '',
          lastName: input.lastName?.trim() ?? '',
        }
      : {}),
  })

  await handleAuthResponse(response)
}

export async function verifyOtp(
  identifier: string,
  code: string,
  mode: AuthMode,
  password?: string,
): Promise<AuthUser> {
  const normalizedId = identifier.trim().toLowerCase()

  const response = await authFetch('/api/auth/verify-otp', {
    identifier: normalizedId,
    code: code.trim(),
    mode,
    password,
  })

  await handleAuthResponse(response)

  const data = (await response.json()) as { user: AuthUser }
  return {
    email: data.user.email ?? '',
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: 'user',
  }
}

export async function resetUserPassword(email: string, newPassword: string): Promise<void> {
  const response = await authFetch('/api/auth/reset-password', {
    email: email.trim().toLowerCase(),
    newPassword,
  })

  await handleAuthResponse(response)
}
