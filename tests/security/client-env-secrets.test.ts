import { assertClientEnvHasNoSecrets } from '@/lib/server-email-env'

describe('assertClientEnvHasNoSecrets', () => {
  it('allows safe VITE_ variables', () => {
    expect(() =>
      assertClientEnvHasNoSecrets({
        VITE_CONVEX_URL: 'https://example.convex.cloud',
        VITE_APP_NAME: 'PWRRC',
      }),
    ).not.toThrow()
  })

  it('blocks VITE_ keys that look like secrets (PASS)', () => {
    expect(() =>
      assertClientEnvHasNoSecrets({ VITE_EMAIL_PASS: 'leaked' }),
    ).toThrow(/must not use the VITE_ prefix/)
  })

  it('blocks VITE_ keys that look like secrets (SECRET)', () => {
    expect(() =>
      assertClientEnvHasNoSecrets({ VITE_OTP_SECRET: 'leaked' }),
    ).toThrow(/must not use the VITE_ prefix/)
  })

  it('blocks VITE_ keys that look like SMTP/email server config', () => {
    expect(() =>
      assertClientEnvHasNoSecrets({ VITE_EMAIL_HOST: 'smtp.example.com' }),
    ).toThrow(/must not use the VITE_ prefix/)
  })

  it('blocks VITE_*KEY patterns', () => {
    expect(() =>
      assertClientEnvHasNoSecrets({ VITE_API_KEY: 'abc' }),
    ).toThrow(/must not use the VITE_ prefix/)
  })

  it('ignores non-VITE keys even if they contain PASS', () => {
    expect(() =>
      assertClientEnvHasNoSecrets({ EMAIL_PASS: 'server-only' }),
    ).not.toThrow()
  })
})
