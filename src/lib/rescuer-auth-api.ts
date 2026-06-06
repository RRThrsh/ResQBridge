import type { RescuerUser } from '@/types/auth'
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

async function rescuerAuthFetch(
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

export async function sendRescuerOtp(
  email: string,
  password?: string,
): Promise<void> {
  const normalizedEmail = normalizeEmail(email)

  const response = await rescuerAuthFetch(
    '/api/rescuer/auth/send-otp',
    {
      email: normalizedEmail,
      password,
    },
  )

  // Spying on the backend response
  console.log("Backend Response Status:", response.status);

  if (!response.ok) {
    throw new Error(await parseAuthError(response))
  }
}

export async function verifyRescuerOtp(email: string, code: string): Promise<RescuerUser> {
  const normalizedEmail = normalizeEmail(email)

  const response = await rescuerAuthFetch('/api/rescuer/auth/verify-otp', {
    email: normalizedEmail,
    code: code.trim(),
  })

  if (!response.ok) {
    throw new Error(await parseAuthError(response))
  }

  const data = (await response.json()) as {
    user: { email: string; firstName: string; lastName: string; role: 'rescuer' }
  }

  return {
    email: normalizeEmail(data.user.email),
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: 'rescuer',
  }
}
