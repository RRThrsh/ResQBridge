import {
  pickServerEmailEnv,
  pickServerOtpEnv,
  SERVER_EMAIL_ENV_KEYS,
} from '@/lib/server-email-env'

describe('pickServerEmailEnv', () => {
  it('picks only configured email keys', () => {
    const env = pickServerEmailEnv({
      EMAIL_HOST: 'smtp.example.com',
      EMAIL_PORT: '587',
      UNRELATED: 'ignored',
    })
    expect(env.EMAIL_HOST).toBe('smtp.example.com')
    expect(env.EMAIL_PORT).toBe('587')
    expect(env).not.toHaveProperty('UNRELATED')
  })

  it('omits empty values', () => {
    const env = pickServerEmailEnv({ EMAIL_HOST: '', EMAIL_USER: 'u' })
    expect(env.EMAIL_HOST).toBeUndefined()
    expect(env.EMAIL_USER).toBe('u')
  })

  it('includes all known server email keys in the constant', () => {
    expect(SERVER_EMAIL_ENV_KEYS).toContain('EMAIL_PASS')
    expect(SERVER_EMAIL_ENV_KEYS.length).toBeGreaterThanOrEqual(5)
  })
})

describe('pickServerOtpEnv', () => {
  it('trims convex url and strips quotes from otp secret', () => {
    const env = pickServerOtpEnv({
      VITE_CONVEX_URL: ' https://example.convex.cloud ',
      OTP_INTERNAL_SECRET: '"my-secret"',
    })
    expect(env.convexUrl).toBe('https://example.convex.cloud')
    expect(env.otpSecret).toBe('my-secret')
  })
})
