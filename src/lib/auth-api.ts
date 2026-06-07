import type { AuthUser } from '@/types/auth'
import { normalizeEmail } from '@/lib/admin'
import { getAuthApiUrl, parseAuthError } from '@/lib/auth-api-base'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'

const convex = new ConvexHttpClient(
  import.meta.env.VITE_CONVEX_URL,
)

export async function resetUserPassword(
  email: string,
  newPassword: string,
) {
  return await convex.mutation(
    api.users.resetUserPassword,
    {
      email,
      newPassword,
    },
  )
}

export type AuthMode = 'sign-in' | 'sign-up'

interface SendOtpInput {
  mode: AuthMode
  identifier: string
  type: 'email' | 'phone'
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
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
      window.location.href = '/too-many-request?redirect=' + encodeURIComponent(window.location.pathname)
      await new Promise(() => {}) // halt
    }
    if (response.status === 401) {
      window.location.href = '/error/401'
      await new Promise(() => {}) // halt
    }
    throw new Error(await parseAuthError(response))
  }
}

export async function sendOtp(input: SendOtpInput): Promise<void> {
  // Only normalize if it's an email, otherwise just trim the phone number
  const normalizedId = input.type === 'email' 
    ? normalizeEmail(input.identifier) 
    : input.identifier.trim()

  const response = await authFetch('/api/auth/send-otp', {
    mode: input.mode,
    email: normalizedId,
    password: input.password,
    ...(input.mode === 'sign-up'
      ? {
          firstName: input.firstName?.trim() ?? '',
          lastName: input.lastName?.trim() ?? '',
          phone: input.phone?.trim() ?? '',
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
  // Check if it's an email so we don't accidentally break a phone number string
  const isEmail = identifier.includes('@')
  const normalizedId = isEmail ? normalizeEmail(identifier) : identifier.trim()

  const response = await authFetch('/api/auth/verify-otp', {
    email: normalizedId,
    code: code.trim(),
    mode,
    password,
  })

  await handleAuthResponse(response)

  const data = (await response.json()) as { user: AuthUser }
  return {
    // Fallback to empty string if they logged in with phone and have no email attached yet
    email: data.user.email ? normalizeEmail(data.user.email) : '',
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: 'user',
  }
}
