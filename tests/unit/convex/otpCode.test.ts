import { isValidOtpCode, normalizeOtpCode, otpCodesMatch } from '../../../convex/lib/otpCode'

describe('normalizeOtpCode', () => {
  it('keeps six ASCII digits', () => {
    expect(normalizeOtpCode('123456')).toBe('123456')
  })

  it('strips spaces and punctuation from pasted codes', () => {
    expect(normalizeOtpCode('123 456')).toBe('123456')
    expect(normalizeOtpCode('123-456')).toBe('123456')
  })

  it('normalizes fullwidth digits', () => {
    expect(normalizeOtpCode('１２３４５６')).toBe('123456')
  })
})

describe('otpCodesMatch', () => {
  it('matches equivalent formats', () => {
    expect(otpCodesMatch('123456', '123 456')).toBe(true)
  })

  it('rejects different codes', () => {
    expect(otpCodesMatch('123456', '654321')).toBe(false)
  })
})

describe('isValidOtpCode', () => {
  it('requires exactly six digits', () => {
    expect(isValidOtpCode('123456')).toBe(true)
    expect(isValidOtpCode('12345')).toBe(false)
    expect(isValidOtpCode('1234567')).toBe(false)
  })
})
