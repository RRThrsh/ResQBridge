/** Normalize user input or stored OTP to exactly six ASCII digits. */
export function normalizeOtpCode(code: string): string {
  return code
    .trim()
    .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30))
    .replace(/\D/g, '')
}

export function isValidOtpCode(code: string): boolean {
  return /^\d{6}$/.test(normalizeOtpCode(code))
}

export function otpCodesMatch(stored: string, provided: string): boolean {
  return normalizeOtpCode(stored) === normalizeOtpCode(provided)
}
