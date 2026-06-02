import { assertOtpInternalSecret } from '../../../convex/lib/otpInternal'

describe('Convex OTP internal auth integration', () => {
  const original = process.env.OTP_INTERNAL_SECRET

  afterEach(() => {
    if (original === undefined) {
      delete process.env.OTP_INTERNAL_SECRET
    } else {
      process.env.OTP_INTERNAL_SECRET = original
    }
  })

  it('accepts matching secret', () => {
    process.env.OTP_INTERNAL_SECRET = 'server-secret'
    expect(() => assertOtpInternalSecret('server-secret')).not.toThrow()
  })

  it('rejects wrong secret', () => {
    process.env.OTP_INTERNAL_SECRET = 'server-secret'
    expect(() => assertOtpInternalSecret('wrong')).toThrow('Unauthorized OTP request')
  })

  it('rejects when env secret is unset', () => {
    delete process.env.OTP_INTERNAL_SECRET
    expect(() => assertOtpInternalSecret('anything')).toThrow('Unauthorized OTP request')
  })
})
