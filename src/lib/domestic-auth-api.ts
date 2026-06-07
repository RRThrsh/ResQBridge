import { normalizeEmail } from '@/lib/admin'
import { getAuthApiUrl, parseAuthError } from '@/lib/auth-api-base'

// You might need to add this type to your '@/types/auth.ts' file later!
export type DomesticUser = {
  email: string
  firstName: string
  lastName: string
  contactPhone?: string
  password?: string
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

export async function sendDomesticOtp(
  identifier: string,
  password?: string,
): Promise<void> {
  const normalized =
    normalizeEmail(identifier)

  const response =
    await domesticAuthFetch(
      '/api/domestic/auth/send-otp',
      {
        email: normalized,
        password,
      },
    )

  await handleAuthResponse(response)
}

export async function verifyDomesticOtp(email: string, code: string): Promise<DomesticUser> {
  const normalizedEmail = normalizeEmail(email)

  const response = await domesticAuthFetch('/api/domestic/auth/verify-otp', {
    email: normalizedEmail,
    code: code.trim(),
  })

  await handleAuthResponse(response)

const data = (await response.json()) as {
  user: {
    email: string
    firstName: string
    lastName: string
    contactPhone?: string
    password?: string
    role: 'admin' | 'domestic_approver'
  }
}

return {
  email: normalizeEmail(data.user.email),
  firstName: data.user.firstName,
  lastName: data.user.lastName,
  contactPhone: data.user.contactPhone,
  password: data.user.password,
  role: data.user.role,
}
}
