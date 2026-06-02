export function assertOtpInternalSecret(secret: string) {
  const expected = process.env.OTP_INTERNAL_SECRET?.trim()
  const provided = secret.trim()
  if (!expected || provided !== expected) {
    throw new Error('Unauthorized OTP request')
  }
}
