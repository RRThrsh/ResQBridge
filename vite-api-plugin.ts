import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { ConvexHttpClient } from 'convex/browser'
import nodemailer from 'nodemailer'
import rateLimit from 'express-rate-limit'
import { api } from './convex/_generated/api'
import type { ServerEmailEnv } from './src/lib/server-email-env'
import type { OtpStoreConfig } from './vite-otp-store'
import {
  consumeOtpRecord,
  deleteOtpRecord,
  formatOtpError,
  logOtpStorageMode,
  saveOtpRecord,
  validateOtpRecord,
  verifyOtpRecord,
  type OtpRecord,
  type OtpScope,
} from './vite-otp-store'

export interface ApiPluginOptions {
  emailEnv: ServerEmailEnv
  otpEnv: OtpStoreConfig
  rateLimit?: {
    windowMs: number
    max: number
  }
}

interface SmtpConfig {
  isGmail: boolean
  host: string
  port: number
  secure: boolean
  requireTls: boolean
  preferIpv4: boolean
  auth: { user: string; pass: string }
  fromName: string
  fromAddress: string
}

interface TransportCandidate {
  label: string
  options: nodemailer.TransportOptions
}

let cachedTransporter: nodemailer.Transporter | null = null
let cachedTransporterKey = ''
let cachedTransportLabel = ''

const PLACEHOLDER_HOSTS = new Set([
  'smtp.example.com',
  'example.com',
  'mail.example.com',
])

function stripQuotes(value: string) {
  return value.replace(/^["']|["']$/g, '').trim()
}

function resolveSmtpConfig(env: ServerEmailEnv): SmtpConfig {
  const user = stripQuotes(env.EMAIL_USER ?? '')
  const pass = stripQuotes(env.EMAIL_PASS ?? '').replace(/\s+/g, '')
  let host = stripQuotes(env.EMAIL_HOST ?? '')

  if (!user || !pass) {
    throw new Error(
      'Email is not configured. Set EMAIL_USER and EMAIL_PASS in .env (Gmail needs an App Password).',
    )
  }

  const isGmail = user.toLowerCase().endsWith('@gmail.com')

  if (!host || PLACEHOLDER_HOSTS.has(host)) {
    if (isGmail) {
      host = 'smtp.gmail.com'
    } else {
      throw new Error(
        'EMAIL_HOST is still a placeholder. Set a real SMTP host in .env (Gmail: smtp.gmail.com).',
      )
    }
  }

  const isGmailHost =
    host === 'smtp.gmail.com' || host === 'smtp.googlemail.com' || isGmail

  const port = parseInt(env.EMAIL_PORT ?? (isGmailHost ? '465' : '587'), 10)

  let secure = env.EMAIL_SECURE === 'true'
  if (port === 465) {
    secure = true
  } else if (port === 587 || port === 25 || port === 2525) {
    if (env.EMAIL_SECURE === 'true') {
      console.warn(
        '[pwrrc-api] EMAIL_SECURE=true with port 587 uses STARTTLS instead (secure=false).',
      )
    }
    secure = false
  }

  const requireTls = !secure && (port === 587 || port === 2525)
  const preferIpv4 = env.EMAIL_FORCE_IPV4 === 'true'

  return {
    isGmail: isGmailHost,
    host,
    port,
    secure,
    requireTls,
    preferIpv4,
    auth: { user, pass },
    fromName: stripQuotes(env.EMAIL_FROM_NAME ?? 'Palawan Wildlife Rescue'),
    fromAddress: stripQuotes(env.EMAIL_FROM ?? user),
  }
}

function transporterCacheKey(config: SmtpConfig) {
  return JSON.stringify({
    isGmail: config.isGmail,
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTls: config.requireTls,
    preferIpv4: config.preferIpv4,
    user: config.auth.user,
    passLength: config.auth.pass.length,
  })
}

const SMTP_TIMEOUTS = {
  connectionTimeout: 25_000,
  greetingTimeout: 25_000,
  socketTimeout: 25_000,
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hostTransportOptions(
  config: SmtpConfig,
  port: number,
  secure: boolean,
  family?: 4,
): nodemailer.TransportOptions {
  const requireTLS = !secure && (port === 587 || port === 2525)
  return {
    host: config.host,
    port,
    secure,
    requireTLS,
    auth: config.auth,
    family,
    ...SMTP_TIMEOUTS,
    tls: {
      minVersion: 'TLSv1.2',
      servername: config.host,
    },
  } as nodemailer.TransportOptions
}

function buildTransportCandidates(config: SmtpConfig): TransportCandidate[] {
  const candidates: TransportCandidate[] = []

  const push = (label: string, options: nodemailer.TransportOptions) => {
    candidates.push({ label, options })
  }

  if (config.isGmail) {
    const profiles =
      config.port === 587
        ? [
            { port: 587, secure: false, tag: '587 STARTTLS' },
            { port: 465, secure: true, tag: '465 SSL' },
          ]
        : [
            { port: 465, secure: true, tag: '465 SSL' },
            { port: 587, secure: false, tag: '587 STARTTLS' },
          ]

    for (const profile of profiles) {
      push(
        `${profile.tag} (default)`,
        hostTransportOptions(config, profile.port, profile.secure),
      )
      if (config.preferIpv4) {
        push(
          `${profile.tag} (IPv4)`,
          hostTransportOptions(config, profile.port, profile.secure, 4),
        )
      } else {
        push(
          `${profile.tag} (IPv4 fallback)`,
          hostTransportOptions(config, profile.port, profile.secure, 4),
        )
      }
    }

    return candidates
  }

  push(
    `${config.host}:${config.port}`,
    hostTransportOptions(config, config.port, config.secure),
  )
  push(
    `${config.host}:${config.port} (IPv4 fallback)`,
    hostTransportOptions(config, config.port, config.secure, 4),
  )
  if (config.preferIpv4) {
    return candidates.slice(1).concat(candidates.slice(0, 1))
  }
  return candidates
}

async function verifyTransporter(
  transporter: nodemailer.Transporter,
  attempts = 3,
): Promise<void> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await transporter.verify()
      return
    } catch (error) {
      lastError = error
      const code =
        error instanceof Error && 'code' in error ? String(error.code) : ''
      const retryable =
        code === 'ESOCKET' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNECTION' ||
        code === 'ECONNRESET'
      if (!retryable || attempt === attempts) break
      await sleep(400 * attempt)
    }
  }
  throw lastError
}

async function ensureSmtpTransporter(config: SmtpConfig): Promise<nodemailer.Transporter> {
  const key = transporterCacheKey(config)
  if (cachedTransporter && cachedTransporterKey === key) {
    return cachedTransporter
  }

  const failures: string[] = []
  for (const candidate of buildTransportCandidates(config)) {
    const transporter = nodemailer.createTransport(candidate.options)
    try {
      await verifyTransporter(transporter)
      cachedTransporter = transporter
      cachedTransporterKey = key
      cachedTransportLabel = candidate.label
      console.log(`[pwrrc-api] SMTP connected via ${candidate.label}`)
      return transporter
    } catch (error) {
      const detail =
        error instanceof Error && 'code' in error
          ? `${String(error.code)}: ${error.message}`
          : String(error)
      failures.push(`${candidate.label} (${detail})`)
      transporter.close()
    }
  }

  throw new Error(failures.join(' | '))
}

function formatSmtpError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Failed to send verification email.'
  }

  const code = 'code' in error ? String(error.code) : ''

  if (code === 'ENOTFOUND') {
    return 'SMTP server not found. Set EMAIL_HOST=smtp.gmail.com in .env for Gmail.'
  }
  if (code === 'EAUTH') {
    return 'SMTP login failed. For Gmail, use an App Password (not your normal password).'
  }
  if (
    code === 'ESOCKET' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNECTION' ||
    code === 'ECONNRESET'
  ) {
    if (error.message.includes('Greeting never received')) {
      return [
        'SMTP connected but got no server greeting (timeout).',
        'For Gmail: use an App Password, EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=465 or leave unset (recommended), restart `npm run dev`.',
        'If it persists, try EMAIL_FORCE_IPV4=true or a different network (some block outbound SMTP).',
      ].join(' ')
    }
    return [
      'Could not connect to the mail server.',
      'Check EMAIL_HOST, EMAIL_PORT (Gmail: 465 with SSL or 587 with STARTTLS), App Password, and firewall/VPN.',
    ].join(' ')
  }

  return error.message
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk))
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return {}
  return JSON.parse(text) as Record<string, unknown>
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function sendVerificationEmail(
  config: SmtpConfig,
  to: string,
  displayName: string,
  code: string,
  subject: string,
) {
  const transporter = await ensureSmtpTransporter(config)
  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromAddress}>`,
    to,
    subject,
    text: `Hello ${displayName},\n\nYour verification code is: ${code}\n\nThis code expires in 5 minutes.`,
    html: `<p>Hello <strong>${displayName}</strong>,</p><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 5 minutes.</p>`,
  })
}

type AuthMode = 'sign-in' | 'sign-up'

interface SendOtpParams {
  email: string
  firstName: string
  lastName: string
  mode: AuthMode
  phone?: string
}

function isEmail(value: string): boolean {
  return value.includes('@')
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('63')) return '0' + digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits
  if (digits.length === 10) return '0' + digits
  return digits
}

async function sendOtpSms(phone: string, code: string) {
  const clean = phone.replace(/\D/g, '')
  const formatted = clean.startsWith('0') && clean.length === 11
    ? '63' + clean.slice(1)
    : clean
  const response = await fetch('https://dashboard.philsms.com/api/v3/sms/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PHILSMS_API_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      recipient: formatted,
      sender_id: 'PhilSMS',
      type: 'plain',
      message: `Your PWRRC verification code is: ${code}`,
    }),
  })
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`PhilSMS API Error: ${response.status} - ${errorData}`)
  }
}

async function executeSendOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  scope: OtpScope,
  subject: string,
  params: SendOtpParams,
) {
  const env = options.emailEnv
  const { email, firstName, lastName, mode, phone } = params

  const code = generateOtp()
  const expiresAt = Date.now() + 5 * 60 * 1000
  const record: OtpRecord = {
    email,
    firstName,
    lastName,
    code,
    expiresAt,
    mode,
    phone,
  }

  try {
    await saveOtpRecord(options.otpEnv, scope, record)
  } catch (error) {
    sendJson(res, 500, { error: formatOtpError(error) })
    return
  }

  try {
    const smtp = resolveSmtpConfig(env)
    await sendVerificationEmail(
      smtp,
      email,
      `${firstName} ${lastName}`,
      code,
      subject,
    )
  } catch (error) {
    await deleteOtpRecord(options.otpEnv, scope, email)
    throw error
  }

  sendJson(res, 200, { success: true })
}

async function handleUserSendOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  body: Record<string, unknown>,
) {
  const identifier = String(body.identifier ?? '').trim().toLowerCase()
  const mode: AuthMode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'
  const firstName = String(body.firstName ?? '').trim()
  const lastName = String(body.lastName ?? '').trim()
  const password = String(body.password ?? '')

  if (!identifier) {
    sendJson(res, 400, { error: 'Email or phone is required.' })
    return
  }

  const convex = getConvexClientForOtp(options.otpEnv)

  if (isEmail(identifier)) {
    const email = identifier

    if (mode === 'sign-up' && (!firstName || !lastName)) {
      sendJson(res, 400, { error: 'First name and last name are required.' })
      return
    }

    const existing = await convex.query(api.users.getByEmail, { email })

    if (mode === 'sign-in') {
      if (!existing) {
        sendJson(res, 400, { error: 'No account found. Please sign up first.' })
        return
      }
      if (password !== 'reset-temp') {
        const loginCheck = await convex.mutation(api.users.validateLoginAttempt, {
          email, password, resetPassword: false,
        })
        if (loginCheck.locked) {
          sendJson(res, 429, {
            error: `Account locked due to too many failed attempts. Try again in ${loginCheck.lockoutMinutes} minutes.`,
          })
          return
        }
        if (!loginCheck.allowed) {
          sendJson(res, 401, {
            error: `Invalid password. ${loginCheck.remainingAttempts} attempt(s) remaining.`,
          })
          return
        }
      } else {
        await convex.mutation(api.users.validateLoginAttempt, {
          email, password: 'reset-temp', resetPassword: true,
        })
      }
      await executeSendOtp(res, options, 'user', 'Your PWRRC verification code', {
        email,
        firstName: existing.firstName,
        lastName: existing.lastName,
        mode,
      })
      return
    }

    if (existing) {
      sendJson(res, 400, { error: 'An account already exists. Please sign in.' })
      return
    }

    await executeSendOtp(res, options, 'user', 'Your PWRRC verification code', {
      email, firstName, lastName, mode,
    })
    return
  }

  // --- Phone flow ---
  const phone = normalizePhone(identifier)
  if (!phone || phone.length < 10) {
    sendJson(res, 400, { error: 'Please enter a valid phone number.' })
    return
  }

  if (mode === 'sign-up' && (!firstName || !lastName)) {
    sendJson(res, 400, { error: 'First name and last name are required.' })
    return
  }

  const existing = await convex.query(api.users.getByEmail, { email: phone })

  if (mode === 'sign-in') {
    if (!existing) {
      sendJson(res, 400, { error: 'No account found. Please sign up first.' })
      return
    }
    if (password !== 'reset-temp') {
      const loginCheck = await convex.mutation(api.users.validateLoginAttempt, {
        email: phone, password, resetPassword: false,
      })
      if (loginCheck.locked) {
        sendJson(res, 429, {
          error: `Account locked due to too many failed attempts. Try again in ${loginCheck.lockoutMinutes} minutes.`,
        })
        return
      }
      if (!loginCheck.allowed) {
        sendJson(res, 401, {
          error: `Invalid password. ${loginCheck.remainingAttempts} attempt(s) remaining.`,
        })
        return
      }
    } else {
      await convex.mutation(api.users.validateLoginAttempt, {
        email: phone, password: 'reset-temp', resetPassword: true,
      })
    }
  } else if (existing) {
    sendJson(res, 400, { error: 'An account already exists. Please sign in.' })
    return
  }

  const finalFirstName = mode === 'sign-in' ? existing!.firstName : firstName
  const finalLastName = mode === 'sign-in' ? existing!.lastName : lastName

  const code = generateOtp()
  const expiresAt = Date.now() + 5 * 60 * 1000
  const record: OtpRecord = {
    email: phone,
    firstName: finalFirstName,
    lastName: finalLastName,
    code,
    expiresAt,
    mode,
    phone,
  }

  try {
    await saveOtpRecord(options.otpEnv, 'user', record)
  } catch (error) {
    sendJson(res, 500, { error: formatOtpError(error) })
    return
  }

  try {
    await sendOtpSms(phone, code)
  } catch (error) {
    await deleteOtpRecord(options.otpEnv, 'user', phone)
    sendJson(res, 500, { error: formatSmtpError(error) })
    return
  }

  sendJson(res, 200, { success: true })
}

function getConvexClientForOtp(config: OtpStoreConfig) {
  if (!config.convexUrl) {
    throw new Error('Convex is not configured. Set VITE_CONVEX_URL in .env.')
  }
  return new ConvexHttpClient(config.convexUrl)
}

async function handleUserVerifyOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  identifier: string,
  code: string,
  mode: AuthMode,
  password: string,
) {
  try {
    const convex = getConvexClientForOtp(options.otpEnv)
    const email = isEmail(identifier) ? identifier : normalizePhone(identifier)

    if (isEmail(identifier)) {
      const isAdmin = await convex.query(api.admin.isAdmin, { email })
      if (isAdmin) {
        sendJson(res, 400, {
          error: 'This email is for admin access only. Please use the admin sign-in page.',
        })
        return
      }

      const isRescuer = await convex.query(api.rescuers.isRescuer, { email })
      if (isRescuer) {
        sendJson(res, 400, {
          error: 'This email is for rescuer access only. Please use the rescuer sign-in page.',
        })
        return
      }
    }

    const profile = await validateOtpRecord(options.otpEnv, 'user', email, code, mode)

    let user: { email: string; firstName: string; lastName: string; role: 'user' }
    if (mode === 'sign-up') {
      user = await convex.mutation(api.users.createUser, {
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        password,
        phone: profile.phone,
      })
    } else {
      const existing = await convex.query(api.users.getByEmail, { email })
      if (!existing) {
        sendJson(res, 400, {
          error: 'No account found. Please sign up first.',
        })
        return
      }
      user = existing
    }

    await consumeOtpRecord(options.otpEnv, 'user', email)
    sendJson(res, 200, { success: true, user })
  } catch (error) {
    sendJson(res, 400, { error: formatOtpError(error) })
  }
}

async function handleAdminSendOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  body: Record<string, unknown>,
) {
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase()
    
  const password = String(body.password ?? '') 

  console.log('BODY:', body)
  console.log('PASSWORD:', password)

  if (!email.includes('@')) {
    sendJson(res, 400, { error: 'Please enter a valid email address.' })
    return
  }

  const convex = getConvexClientForOtp(options.otpEnv) 
  
  await convex.mutation(api.admin.bootstrapAdmins, {})

  const allowed = await convex.query(api.admin.isAdmin, { email })
  if (!allowed) {
    sendJson(res, 400, { error: 'This email is not authorized for admin access.' })
    return
  }

  const profile = await convex.query(api.admin.getAdminForLogin, { email })
  if (!profile) {
    sendJson(res, 400, { error: 'Admin account not found.' })
    return
  }

if (
  password !== 'reset-temp' &&
  profile.password !== password
) {
  sendJson(res, 401, {
    error: 'Incorrect password.',
  })
  return
}

  await executeSendOtp(res, options, 'admin', 'Your PWRRC Admin verification code', {
    email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    mode: 'sign-in',
  })
}

async function handleAdminVerifyOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  email: string,
  code: string,
) {
  try {
    await verifyOtpRecord(options.otpEnv, 'admin', email, code)
    const convex = getConvexClientForOtp(options.otpEnv)
    const admin = await convex.mutation(api.admin.ensureAdminAccount, {
      adminEmail: email,
    })
    sendJson(res, 200, {
      success: true,
      user: {
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'admin' as const,
      },
    })
  } catch (error) {
    sendJson(res, 400, { error: formatOtpError(error) })
  }
}

async function handleRescuerSendOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  body: Record<string, unknown>,
) {
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase()
    
  const password = String(body.password ?? '') 

  if (!email.includes('@')) {
    sendJson(res, 400, { error: 'Please enter a valid email address.' })
    return
  }

  const convex = getConvexClientForOtp(options.otpEnv) 
  
  const allowed = await convex.query(api.rescuers.isRescuer, { email })
  if (!allowed) {
    sendJson(res, 400, { error: 'This email is not authorized for rescuer access.' })
    return
  }

  const profile = await convex.query(api.rescuers.getRescuerForLogin, { email })
  if (!profile) {
    sendJson(res, 400, { error: 'Rescuer account not found.' })
    return
  }

  // ✅ ADDED RESET-TEMP BYPASS HERE
  if (password !== 'reset-temp' && profile.password !== password) {
    sendJson(res, 401, { error: 'Incorrect password.' })
    return
  }

  await executeSendOtp(res, options, 'rescuer', 'Your PWRCC Rescuer verification code', {
    email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    mode: 'sign-in',
  })
}

async function handleRescuerVerifyOtp(
  res: ServerResponse,
  options: ApiPluginOptions,
  email: string,
  code: string,
) {
  try {
    await verifyOtpRecord(options.otpEnv, 'rescuer', email, code)
    const convex = getConvexClientForOtp(options.otpEnv)
    const rescuer = await convex.mutation(api.rescuers.ensureRescuerAccount, {
      rescuerEmail: email,
    })
    sendJson(res, 200, {
      success: true,
      user: {
        email: rescuer.email,
        firstName: rescuer.firstName,
        lastName: rescuer.lastName,
        role: 'rescuer' as const,
      },
    })
  } catch (error) {
    sendJson(res, 400, { error: formatOtpError(error) })
  }
}

async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  options: ApiPluginOptions,
): Promise<boolean> {
  const url = req.url ?? ''
  const pathname = url.split('?')[0]

  if (req.method === 'POST' && pathname === '/api/auth/send-otp') {
    try {
      const body = await readJsonBody(req)
      await handleUserSendOtp(res, options, body)
      return true
    } catch (error) {
      console.error('user send-otp error:', error)
      sendJson(res, 500, { error: formatSmtpError(error) })
      return true
    }
  }

  if (req.method === 'POST' && pathname === '/api/auth/verify-otp') {
    try {
      const body = await readJsonBody(req)
      const identifier = String(body.identifier ?? '')
        .trim()
        .toLowerCase()
      const code = String(body.code ?? '').trim()
      const mode: AuthMode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'
      const password = String(body.password ?? '')

      await handleUserVerifyOtp(res, options, identifier, code, mode, password)
      return true
    } catch (error) {
      console.error('user verify-otp error:', error)
      sendJson(res, 500, { error: formatOtpError(error) })
      return true
    }
  }

  if (req.method === 'POST' && pathname === '/api/admin/auth/send-otp') {
    try {
      const body = await readJsonBody(req)
      await handleAdminSendOtp(res, options, body)
      return true
    } catch (error) {
      console.error('admin send-otp error:', error)
      sendJson(res, 500, { error: formatSmtpError(error) })
      return true
    }
  }

  if (req.method === 'POST' && pathname === '/api/admin/auth/verify-otp') {
    try {
      const body = await readJsonBody(req)
      const email = String(body.email ?? '')
        .trim()
        .toLowerCase()
      const code = String(body.code ?? '').trim()
      await handleAdminVerifyOtp(res, options, email, code)
      return true
    } catch (error) {
      console.error('admin verify-otp error:', error)
      sendJson(res, 500, { error: formatOtpError(error) })
      return true
    }
  }

  if (req.method === 'POST' && pathname === '/api/rescuer/auth/send-otp') {
    try {
      const body = await readJsonBody(req)
      await handleRescuerSendOtp(res, options, body)
      return true
    } catch (error) {
      console.error('rescuer send-otp error:', error)
      sendJson(res, 500, { error: formatSmtpError(error) })
      return true
    }
  }

  if (req.method === 'POST' && pathname === '/api/rescuer/auth/verify-otp') {
    try {
      const body = await readJsonBody(req)
      const email = String(body.email ?? '')
        .trim()
        .toLowerCase()
      const code = String(body.code ?? '').trim()
      await handleRescuerVerifyOtp(res, options, email, code)
      return true
    } catch (error) {
      console.error('rescuer verify-otp error:', error)
      sendJson(res, 500, { error: formatOtpError(error) })
      return true
    }
  }

  return false
}

function attachApiMiddleware(
  middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void },
  options: ApiPluginOptions,
) {
  const authLimiter = options.rateLimit
    ? rateLimit({
        windowMs: options.rateLimit.windowMs,
        max: options.rateLimit.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests. Please wait a moment before trying again.' },
        keyGenerator: (req) => {
          const forwarded = (req.headers['x-forwarded-for'] as string | undefined)
          return forwarded?.split(',')[0]?.trim() ?? req.socket?.remoteAddress ?? 'unknown'
        },
        handler: (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 429
          res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }))
        },
      })
    : null

  if (authLimiter) {
    middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/api/')) {
        authLimiter(req, res, next)
      } else {
        next()
      }
    })
  }

  middlewares.use((req, res, next) => {
    void handleApi(req, res, options).then((handled) => {
      if (!handled) next()
    })
  })
}

async function verifySmtpOnStartup(env: ServerEmailEnv) {
  try {
    const config = resolveSmtpConfig(env)
    await ensureSmtpTransporter(config)
    console.log(
      `[pwrrc-api] SMTP verified: ${cachedTransportLabel} as ${config.auth.user}`,
    )
  } catch (error) {
    const message = error instanceof Error ? formatSmtpError(error) : 'Invalid email configuration'
    console.warn(`[pwrrc-api] SMTP verification failed: ${message}`)
    if (error instanceof Error && error.message.includes('|')) {
      console.warn('[pwrrc-api] SMTP attempts:', error.message)
    }
  }
}

function logSmtpConfig(env: ServerEmailEnv) {
  void verifySmtpOnStartup(env)
}

export function apiPlugin(options: ApiPluginOptions): Plugin {
  return {
    name: 'pwrrc-api',
    configureServer(server) {
      logOtpStorageMode(options.otpEnv)
      logSmtpConfig(options.emailEnv)
      attachApiMiddleware(server.middlewares, options)
    },
    configurePreviewServer(server) {
      logOtpStorageMode(options.otpEnv)
      logSmtpConfig(options.emailEnv)
      attachApiMiddleware(server.middlewares, options)
    },
  }
}
