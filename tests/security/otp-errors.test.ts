import { formatOtpError } from '../../vite-otp-store'

describe('formatOtpError', () => {
  it('returns generic message for non-Error values', () => {
    expect(formatOtpError(null)).toBe('Verification failed.')
  })

  it('extracts Uncaught Error messages from Convex', () => {
    const err = new Error('Request failed: Uncaught Error: Invalid code\n    at handler')
    expect(formatOtpError(err)).toBe('Invalid code')
  })

  it('maps unauthorized OTP to configuration guidance without exposing secret', () => {
    const err = new Error('Unauthorized OTP request')
    const message = formatOtpError(err)
    expect(message).toContain('OTP_INTERNAL_SECRET')
    expect(message).not.toMatch(/secret-value|actual-secret/i)
  })

  it('returns the original message for other errors', () => {
    expect(formatOtpError(new Error('Network timeout'))).toBe('Network timeout')
  })
})
