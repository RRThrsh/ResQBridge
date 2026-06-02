/** SMTP keys read only by the Vite dev/preview API plugin (never bundled for the browser). */
export const SERVER_EMAIL_ENV_KEYS = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'EMAIL_FROM_NAME',
  'EMAIL_FORCE_IPV4',
] as const

export type ServerEmailEnvKey = (typeof SERVER_EMAIL_ENV_KEYS)[number]

export type ServerEmailEnv = Partial<Record<ServerEmailEnvKey, string>>

export function pickServerOtpEnv(source: Record<string, string | undefined>) {
  return {
    convexUrl: source.VITE_CONVEX_URL?.trim() ?? '',
    otpSecret: source.OTP_INTERNAL_SECRET?.replace(/^["']|["']$/g, '').trim() ?? '',
  }
}

export function pickServerEmailEnv(
  source: Record<string, string | undefined>,
): ServerEmailEnv {
  const env: ServerEmailEnv = {}
  for (const key of SERVER_EMAIL_ENV_KEYS) {
    const value = source[key]
    if (value !== undefined && value !== '') {
      env[key] = value
    }
  }
  return env
}

const BLOCKED_VITE_SECRET_PATTERNS = [
  /PASS/i,
  /SECRET/i,
  /TOKEN/i,
  /PRIVATE/i,
  /^VITE_.*KEY$/i,
  /SMTP/i,
  /EMAIL_/i,
]

/** Fail fast if a secret was prefixed with VITE_ (would ship to the browser). */
export function assertClientEnvHasNoSecrets(env: Record<string, string | undefined>) {
  for (const key of Object.keys(env)) {
    if (!key.startsWith('VITE_')) continue
    if (BLOCKED_VITE_SECRET_PATTERNS.some((pattern) => pattern.test(key))) {
      throw new Error(
        `${key} must not use the VITE_ prefix — it is embedded in the client bundle. ` +
          'Keep SMTP credentials as EMAIL_* (server-only) or store secrets in Convex environment variables.',
      )
    }
  }
}
