import { normalizeEmail } from './admins'

export type AuthMode = 'sign-in' | 'sign-up'

export type SendOtpParams = {
  email: string
  firstName: string
  lastName: string
  mode: AuthMode
}

export function parseSendOtpParams(
  body: Record<string, unknown>,
  requireMode: boolean,
): SendOtpParams | { error: string } {
  const mode: AuthMode = body.mode === 'sign-in' ? 'sign-in' : 'sign-up'
  const email = normalizeEmail(String(body.email ?? ''))
  const firstName = String(body.firstName ?? '').trim()
  const lastName = String(body.lastName ?? '').trim()

  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  if (requireMode && mode === 'sign-up' && (!firstName || !lastName)) {
    return { error: 'First name and last name are required.' }
  }

  return { email, firstName, lastName, mode }
}
