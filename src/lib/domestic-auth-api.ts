import { normalizeEmail } from '@/lib/admin'
import { getAuthApiUrl, parseAuthError } from '@/lib/auth-api-base'

// You might need to add this type to your '@/types/auth.ts' file later!
export type DomesticUser = {
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'domestic_approver'
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

async function domesticAuthFetch(
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

export async function sendDomesticOtp(email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email)

  const response = await domesticAuthFetch('/api/domestic/auth/send-otp', {
    email: normalizedEmail,
  })

  if (!response.ok) {
    throw new Error(await parseAuthError(response))
  }
}

export async function verifyDomesticOtp(email: string, code: string): Promise<DomesticUser> {
  const normalizedEmail = normalizeEmail(email)

  const response = await domesticAuthFetch('/api/domestic/auth/verify-otp', {
    email: normalizedEmail,
    code: code.trim(),
  })

  if (!response.ok) {
    throw new Error(await parseAuthError(response))
  }

  const data = (await response.json()) as {
    user: { email: string; firstName: string; lastName: string; role: 'admin' | 'domestic_approver' }
  }

  return {
    email: normalizeEmail(data.user.email),
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: data.user.role,
  }
}
