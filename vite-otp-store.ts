import { ConvexHttpClient } from 'convex/browser'
import { api } from './convex/_generated/api'
import { normalizeOtpCode } from './convex/lib/otpCode'

export type OtpScope = 'admin' | 'user' | 'rescuer'

export interface OtpRecord {
  email: string
  firstName: string
  lastName: string
  code: string
  expiresAt: number
  mode: 'sign-in' | 'sign-up'
  phone?: string
}

export interface OtpStoreConfig {
  convexUrl: string
  otpSecret: string
}

const globalOtp = globalThis as typeof globalThis & {
  __pwrrcUserOtp?: Map<string, OtpRecord>
  __pwrrcAdminOtp?: Map<string, OtpRecord>
  __pwrrcRescuerOtp?: Map<string, OtpRecord>
}

function memoryStore(scope: OtpScope) {
  if (scope === 'admin') {
    if (!globalOtp.__pwrrcAdminOtp) {
      globalOtp.__pwrrcAdminOtp = new Map()
    }
    return globalOtp.__pwrrcAdminOtp
  }
  if (scope === 'rescuer') {
    if (!globalOtp.__pwrrcRescuerOtp) {
      globalOtp.__pwrrcRescuerOtp = new Map()
    }
    return globalOtp.__pwrrcRescuerOtp
  }
  if (!globalOtp.__pwrrcUserOtp) {
    globalOtp.__pwrrcUserOtp = new Map()
  }
  return globalOtp.__pwrrcUserOtp
}

function usesConvex(config: OtpStoreConfig) {
  return Boolean(config.convexUrl && config.otpSecret)
}

function getConvexClient(config: OtpStoreConfig) {
  return new ConvexHttpClient(config.convexUrl)
}

export function logOtpStorageMode(config: OtpStoreConfig) {
  if (usesConvex(config)) {
    console.log('[pwrrc-api] OTP codes stored in Convex (survives server restarts)')
    return
  }
  console.warn(
    '[pwrrc-api] OTP codes stored in memory only. Set VITE_CONVEX_URL and OTP_INTERNAL_SECRET in .env, ' +
      'and run `npx convex env set OTP_INTERNAL_SECRET <same-value>` so admin codes persist.',
  )
}

export function formatOtpError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Verification failed.'
  }
  const uncaught = error.message.match(/Uncaught Error: ([^\n]+)/)
  if (uncaught?.[1]) {
    return uncaught[1]
  }
  if (error.message.includes('Unauthorized OTP request')) {
    return (
      'OTP server misconfigured. Set OTP_INTERNAL_SECRET in .env to match ' +
      '`npx convex env set OTP_INTERNAL_SECRET`.'
    )
  }
  return error.message
}

function validateMemoryRecord(
  record: OtpRecord | undefined,
  normalizedCode: string,
  scope: OtpScope,
  normalizedEmail: string,
  mode?: OtpRecord['mode'],
): Pick<OtpRecord, 'email' | 'firstName' | 'lastName' | 'phone'> {
  if (!record) {
    throw new Error('No verification code found. Please request a new one.')
  }
  if (mode && record.mode !== mode) {
    throw new Error(
      'This code was issued for a different sign-in step. Request a new code and try again.',
    )
  }
  if (normalizeOtpCode(record.code) !== normalizedCode) {
    throw new Error('Invalid verification code.')
  }
  if (Date.now() > record.expiresAt) {
    memoryStore(scope).delete(normalizedEmail)
    throw new Error('Verification code has expired. Please request a new one.')
  }
  return {
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    phone: record.phone,
  }
}

export async function saveOtpRecord(
  config: OtpStoreConfig,
  scope: OtpScope,
  record: OtpRecord,
): Promise<void> {
  const normalizedRecord = {
    ...record,
    email: record.email.trim().toLowerCase(),
    code: normalizeOtpCode(record.code),
  }

  if (usesConvex(config)) {
    const client = getConvexClient(config)
    await client.mutation(api.otp.saveVerificationCode, {
      secret: config.otpSecret,
      email: normalizedRecord.email,
      scope,
      code: normalizedRecord.code,
      firstName: normalizedRecord.firstName,
      lastName: normalizedRecord.lastName,
      mode: normalizedRecord.mode,
      expiresAt: normalizedRecord.expiresAt,
      phone: normalizedRecord.phone,
    })
    return
  }

  memoryStore(scope).set(normalizedRecord.email, normalizedRecord)
}

export async function deleteOtpRecord(
  config: OtpStoreConfig,
  scope: OtpScope,
  email: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()

  if (usesConvex(config)) {
    const client = getConvexClient(config)
    await client.mutation(api.otp.deleteVerificationCode, {
      secret: config.otpSecret,
      email: normalizedEmail,
      scope,
    })
    return
  }

  memoryStore(scope).delete(normalizedEmail)
}

export async function validateOtpRecord(
  config: OtpStoreConfig,
  scope: OtpScope,
  email: string,
  code: string,
  mode?: OtpRecord['mode'],
): Promise<Pick<OtpRecord, 'email' | 'firstName' | 'lastName' | 'phone'>> {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = normalizeOtpCode(code)

  if (normalizedCode.length !== 6) {
    throw new Error('Invalid verification code.')
  }

  if (usesConvex(config)) {
    const client = getConvexClient(config)
    return await client.mutation(api.otp.validateVerificationCode, {
      secret: config.otpSecret,
      email: normalizedEmail,
      scope,
      code: normalizedCode,
      ...(mode ? { mode } : {}),
    })
  }

  const record = memoryStore(scope).get(normalizedEmail)
  return validateMemoryRecord(record, normalizedCode, scope, normalizedEmail, mode)
}

export async function consumeOtpRecord(
  config: OtpStoreConfig,
  scope: OtpScope,
  email: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()

  if (usesConvex(config)) {
    const client = getConvexClient(config)
    await client.mutation(api.otp.consumeVerificationCode, {
      secret: config.otpSecret,
      email: normalizedEmail,
      scope,
    })
    return
  }

  memoryStore(scope).delete(normalizedEmail)
}

export async function verifyOtpRecord(
  config: OtpStoreConfig,
  scope: OtpScope,
  email: string,
  code: string,
  mode?: OtpRecord['mode'],
): Promise<Pick<OtpRecord, 'email' | 'firstName' | 'lastName' | 'phone'>> {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = normalizeOtpCode(code)

  if (normalizedCode.length !== 6) {
    throw new Error('Invalid verification code.')
  }

  if (usesConvex(config)) {
    const client = getConvexClient(config)
    return await client.mutation(api.otp.verifyVerificationCode, {
      secret: config.otpSecret,
      email: normalizedEmail,
      scope,
      code: normalizedCode,
      ...(mode ? { mode } : {}),
    })
  }

  const record = memoryStore(scope).get(normalizedEmail)
  const profile = validateMemoryRecord(record, normalizedCode, scope, normalizedEmail, mode)
  memoryStore(scope).delete(normalizedEmail)
  return profile
}
