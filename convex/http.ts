import { httpRouter } from 'convex/server'
import { httpAction, type ActionCtx } from './_generated/server'
import { api, internal } from './_generated/api'
import { normalizeEmail } from './lib/admins'
import { generateOtp } from './lib/generateOtp'
import {
  formatHandlerError,
  getOtpSecret,
  jsonResponse,
  optionsResponse,
  readJsonBody,
} from './lib/httpResponses'
import { type AuthMode } from './lib/authParse'
import { normalizeOtpCode } from './lib/otpCode'
import { checkRateLimit, getClientIp } from './lib/rateLimit'

function withRateLimit(
  handler: (ctx: ActionCtx, request: Request) => Promise<Response>,
  prefix: string,
) {
  return httpAction(async (ctx, request) => {
    const ip = getClientIp(request)
    const { allowed, retryAfter } = checkRateLimit(`${prefix}:${ip}`)
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    return handler(ctx, request)
  })
}

const http = httpRouter()

const OTP_TTL_MS = 5 * 60 * 1000

// --- EMAIL SENDER ---
async function sendOtpEmail(
  ctx: ActionCtx,
  args: { email: string; firstName: string; lastName: string; subject: string; code: string }
) {
  await ctx.runAction(internal.email.sendVerificationEmail, {
    to: args.email,
    displayName: `${args.firstName} ${args.lastName}`.trim() || args.email,
    code: args.code,
    subject: args.subject,
  })
}

// --- SMS SENDER ---
async function sendOtpSms(phone: string, code: string) {
  const clean = phone.replace(/\D/g, '')
  const formatted = clean.startsWith('0') && clean.length === 11
    ? '+63' + clean.slice(1)
    : '+' + clean

  const response = await fetch('https://dashboard.philsms.com/api/v3/sms/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PHILSMS_API_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      recipient: formatted.replace('+', ''),
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

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('63')) return '0' + digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits
  if (digits.length === 10) return '0' + digits
  return digits
}

function isEmail(value: string): boolean {
  return value.includes('@')
}

// --- USER SEND OTP ---
const userSendOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)

    const identifier = String(body.identifier ?? body.email ?? body.phone ?? '').trim().toLowerCase()
    const mode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'
    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const password = String(body.password ?? '')

    if (!identifier) return jsonResponse({ error: 'Email is required.' }, 400)

    const otpEnabled = await ctx.runQuery(api.config.get, { key: 'otpEnabled' })

    const secret = getOtpSecret()

    if (isEmail(identifier)) {
      const email = identifier

      const isAdmin = await ctx.runQuery(api.admin.isAdmin, { email })
      if (isAdmin) return jsonResponse({ error: 'This email is for admin access only.' }, 400)

      const isRescuer = await ctx.runQuery(api.rescuers.isRescuer, { email })
      if (isRescuer) return jsonResponse({ error: 'This email is for rescuer access only.' }, 400)

      const existing = await ctx.runQuery(api.users.getByEmail, { email })
      let finalFirstName = firstName
      let finalLastName = lastName

      if (mode === 'sign-in') {
        if (!existing) return jsonResponse({ error: 'No account found. Please sign up first.' }, 400)

        if (password !== 'reset-temp') {
          const loginCheck = await ctx.runMutation(api.users.validateLoginAttempt, {
            email, password, resetPassword: false,
          })
          if (loginCheck.locked) {
            return jsonResponse({
              error: `Account locked due to too many failed attempts. Try again in ${loginCheck.lockoutMinutes} minutes.`,
            }, 429)
          }
          if (!loginCheck.allowed) {
            return jsonResponse({
              error: `Invalid Password`,
            }, 400)
          }
        } else {
          await ctx.runMutation(api.users.validateLoginAttempt, {
            email, password: 'reset-temp', resetPassword: true,
          })
        }

        finalFirstName = existing.firstName
        finalLastName = existing.lastName
      } else if (existing) {
        return jsonResponse({ error: 'An account already exists. Please sign in.' }, 400)
      }

      const code = otpEnabled === false ? '000000' : generateOtp()
      await ctx.runMutation(api.otp.saveVerificationCode, {
        secret,
        email,
        scope: 'user',
        code,
        firstName: finalFirstName,
        lastName: finalLastName,
        mode,
        expiresAt: Date.now() + OTP_TTL_MS,
      })

      if (otpEnabled !== false) {
        try {
          await sendOtpEmail(ctx, {
            email,
            firstName: finalFirstName,
            lastName: finalLastName,
            subject: 'Your verification code',
            code,
          })
        } catch (error) {
          await ctx.runMutation(api.otp.deleteVerificationCode, { secret, email, scope: 'user' })
          return jsonResponse({ error: formatHandlerError(error) }, 500)
        }
      }

      return jsonResponse({ success: true, ...(otpEnabled === false ? { otpDisabled: true } : {}) }, 200)
    }

    // --- Phone flow ---
    const phone = normalizePhone(identifier)
    if (!phone) return jsonResponse({ error: 'Please enter a valid phone number.' }, 400)

    const existing = await ctx.runQuery(api.users.getByEmail, { email: phone })
    let finalFirstName = firstName
    let finalLastName = lastName

    if (mode === 'sign-in') {
      if (!existing) return jsonResponse({ error: 'No account found. Please sign up first.' }, 400)

      if (password !== 'reset-temp') {
        const loginCheck = await ctx.runMutation(api.users.validateLoginAttempt, {
          email: phone, password, resetPassword: false,
        })
        if (loginCheck.locked) {
          return jsonResponse({
            error: `Account locked due to too many failed attempts. Try again in ${loginCheck.lockoutMinutes} minutes.`,
          }, 429)
        }
        if (!loginCheck.allowed) {
          return jsonResponse({
            error: `Invalid Password`,
          }, 400)
        }
      } else {
        await ctx.runMutation(api.users.validateLoginAttempt, {
          email: phone, password: 'reset-temp', resetPassword: true,
        })
      }

      finalFirstName = existing.firstName
      finalLastName = existing.lastName
    } else if (existing) {
      return jsonResponse({ error: 'An account already exists. Please sign in.' }, 400)
    }

    const code = otpEnabled === false ? '000000' : generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret,
      email: phone,
      scope: 'user',
      code,
      firstName: finalFirstName,
      lastName: finalLastName,
      mode,
      expiresAt: Date.now() + OTP_TTL_MS,
      phone,
    })

    if (otpEnabled !== false) {
      try {
        await sendOtpSms(phone, code)
      } catch (error) {
        await ctx.runMutation(api.otp.deleteVerificationCode, { secret, email: phone, scope: 'user' })
        return jsonResponse({ error: formatHandlerError(error) }, 500)
      }
    }

    return jsonResponse({ success: true, ...(otpEnabled === false ? { otpDisabled: true } : {}) }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
}

// --- USER VERIFY OTP ---
const userVerifyOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const identifier = String(body.identifier ?? '').trim().toLowerCase()
    const code = normalizeOtpCode(String(body.code ?? ''))
    const mode: AuthMode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'
    const password = String(body.password ?? '')

    if (!identifier) return jsonResponse({ error: 'Email is required.' }, 400)

    const secret = getOtpSecret()
    const email = isEmail(identifier) ? identifier : normalizePhone(identifier)

    if (isEmail(identifier)) {
      const isAdmin = await ctx.runQuery(api.admin.isAdmin, { email })
      if (isAdmin) return jsonResponse({ error: 'This email is for admin access only.' }, 400)

      const isRescuer = await ctx.runQuery(api.rescuers.isRescuer, { email })
      if (isRescuer) return jsonResponse({ error: 'This email is for rescuer access only.' }, 400)
    }

    const profile = await ctx.runMutation(api.otp.validateVerificationCode, {
      secret, email, scope: 'user', code, mode,
    })

    let user
    let isSignup = false
    if (mode === 'sign-up') {
      user = await ctx.runMutation(api.users.createUser, {
        email, firstName: profile.firstName, lastName: profile.lastName, password,
        phone: profile.phone,
      })
      isSignup = true
    } else {
      const existing = await ctx.runQuery(api.users.getByEmail, { email })
      if (!existing) return jsonResponse({ error: 'No account found. Please sign up first.' }, 400)
      user = existing
    }

    await ctx.runMutation(api.otp.consumeVerificationCode, { secret, email, scope: 'user' })

    await ctx.runMutation(api.auditLogs.fromAction, {
      action: isSignup ? 'user.signup' : 'user.login',
      actorEmail: email,
      actorName: `${profile.firstName} ${profile.lastName}`.trim(),
      actorRole: 'user',
      details: isSignup
        ? JSON.stringify({ mode: 'sign-up', phone: profile.phone ?? '' })
        : JSON.stringify({ mode: 'sign-in' }),
      ipAddress: getClientIp(request),
    })

    return jsonResponse({ success: true, user }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

// --- ADMINS ---
const adminSendOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const password = String(body.password ?? '')

    if (!email.includes('@')) return jsonResponse({ error: 'Please enter a valid email address.' }, 400)

    const otpEnabled = await ctx.runQuery(api.config.get, { key: 'otpEnabled' })

    const secret = getOtpSecret()
    await ctx.runMutation(api.admin.bootstrapAdmins, {})

    const allowed = await ctx.runQuery(api.admin.isAdmin, { email })
    if (!allowed) return jsonResponse({ error: 'This email is not authorized for admin access.' }, 400)

    const profile = await ctx.runQuery(api.admin.getAdminForLogin, { email })
    if (!profile) return jsonResponse({ error: 'Admin account not found.' }, 400)

    // ✅ Reset flow bypass added here
    if (password !== 'reset-temp' && profile.password !== password) {
      return jsonResponse({ error: 'Incorrect password.' }, 400)
    }

    const code = otpEnabled === false ? '000000' : generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret, email, scope: 'admin', code,
      firstName: profile.firstName, lastName: profile.lastName,
      mode: 'sign-in', expiresAt: Date.now() + OTP_TTL_MS,
    })

    if (otpEnabled !== false) {
      try {
        await sendOtpEmail(ctx, { email, firstName: profile.firstName, lastName: profile.lastName, subject: 'Your PWRRC Admin verification code', code })
      } catch (error) {
        await ctx.runMutation(api.otp.deleteVerificationCode, { secret, email, scope: 'admin' })
        return jsonResponse({ error: formatHandlerError(error) }, 500)
      }
    }

    return jsonResponse({ success: true, ...(otpEnabled === false ? { otpDisabled: true } : {}) }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
}

const adminVerifyOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))

    if (!email.includes('@')) return jsonResponse({ error: 'Please enter a valid email address.' }, 400)

    const secret = getOtpSecret()
    await ctx.runMutation(api.otp.verifyVerificationCode, { secret, email, scope: 'admin', code })
    const admin = await ctx.runMutation(api.admin.ensureAdminAccount, { adminEmail: email })

    await ctx.runMutation(api.auditLogs.fromAction, {
      action: 'admin.login',
      actorEmail: email,
      actorName: `${admin.firstName} ${admin.lastName}`.trim(),
      actorRole: 'admin',
      ipAddress: getClientIp(request),
    })

    return jsonResponse({
      success: true,
      user: { email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: 'admin' as const },
    }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

// --- RESCUERS ---
const rescuerSendOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const password = String(body.password ?? '')

    if (!email.includes('@')) return jsonResponse({ error: 'Please enter a valid email address.' }, 400)

    const otpEnabled = await ctx.runQuery(api.config.get, { key: 'otpEnabled' })

    const secret = getOtpSecret()
    const allowed = await ctx.runQuery(api.rescuers.isRescuer, { email })
    if (!allowed) return jsonResponse({ error: 'This email is not authorized for rescuer access.' }, 400)

    const profile = await ctx.runQuery(api.rescuers.getRescuerForLogin, { email })
    if (!profile) return jsonResponse({ error: 'Rescuer account not found.' }, 400)

    // ✅ Reset flow bypass added here
    if (password !== 'reset-temp' && profile.password !== password) {
      return jsonResponse({ error: 'Incorrect password.' }, 400)
    }

    const code = otpEnabled === false ? '000000' : generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret, email, scope: 'rescuer', code,
      firstName: profile.firstName, lastName: profile.lastName,
      mode: 'sign-in', expiresAt: Date.now() + OTP_TTL_MS,
    })

    if (otpEnabled !== false) {
      try {
        await sendOtpEmail(ctx, { email, firstName: profile.firstName, lastName: profile.lastName, subject: 'Your PWRCC Rescuer verification code', code })
      } catch (error) {
        await ctx.runMutation(api.otp.deleteVerificationCode, { secret, email, scope: 'rescuer' })
        return jsonResponse({ error: formatHandlerError(error) }, 500)
      }
    }

    return jsonResponse({ success: true, ...(otpEnabled === false ? { otpDisabled: true } : {}) }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
}

const rescuerVerifyOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))

    if (!email.includes('@')) return jsonResponse({ error: 'Please enter a valid email address.' }, 400)

    const secret = getOtpSecret()
    await ctx.runMutation(api.otp.verifyVerificationCode, { secret, email, scope: 'rescuer', code })

    const rescuer = await ctx.runQuery(api.rescuers.getRescuerForLogin, { email })
    if (!rescuer) return jsonResponse({ error: 'Rescuer account not found.' }, 400)

    await ctx.runMutation(api.auditLogs.fromAction, {
      action: 'rescuer.login',
      actorEmail: email,
      actorName: `${rescuer.firstName} ${rescuer.lastName}`.trim(),
      actorRole: 'rescuer',
      ipAddress: getClientIp(request),
    })

    return jsonResponse({
      success: true,
      user: {
        email: rescuer.email,
        firstName: rescuer.firstName,
        lastName: rescuer.lastName,
        role: 'rescuer' as const,
      },
    }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

// --- DOMESTIC APPROVERS ---
const domesticSendOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const password = String(body.password ?? '')

    if (!email.includes('@')) return jsonResponse({ error: 'Please enter a valid email address.' }, 400)

    const otpEnabled = await ctx.runQuery(api.config.get, { key: 'otpEnabled' })

    const secret = getOtpSecret()
    const allowed = await ctx.runQuery(api.domestic.isDomesticApprover, { email })
    if (!allowed) return jsonResponse({ error: 'This email is not authorized for domestic approver access.' }, 400)

    const profile = await ctx.runQuery(api.domestic.getDomesticApproverForLogin, { email })
    if (!profile) return jsonResponse({ error: 'Domestic approver account not found.' }, 400)

    // ✅ Reset flow bypass added here
    if (password !== 'reset-temp' && profile.password !== password) {
      return jsonResponse({ error: 'Incorrect password.' }, 400)
    }

    const code = otpEnabled === false ? '000000' : generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret, email, scope: 'admin', code,
      firstName: profile.firstName, lastName: profile.lastName,
      mode: 'sign-in', expiresAt: Date.now() + OTP_TTL_MS,
    })

    if (otpEnabled !== false) {
      try {
        await sendOtpEmail(ctx, {
          email, firstName: profile.firstName, lastName: profile.lastName,
          subject: 'Your Domestic Portal verification code', code,
        })
      } catch (error) {
        await ctx.runMutation(api.otp.deleteVerificationCode, { secret, email, scope: 'admin' })
        return jsonResponse({ error: formatHandlerError(error) }, 500)
      }
    }

    return jsonResponse({ success: true, ...(otpEnabled === false ? { otpDisabled: true } : {}) }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
}

const domesticVerifyOtp = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))

    const secret = getOtpSecret()
    await ctx.runMutation(api.otp.verifyVerificationCode, { secret, email, scope: 'admin', code })
    
    const profile = await ctx.runQuery(api.domestic.getDomesticApproverForLogin, { email })
    if (!profile) return jsonResponse({ error: 'Domestic approver account not found.' }, 400)

    await ctx.runMutation(api.auditLogs.fromAction, {
      action: 'domestic_approver.login',
      actorEmail: email,
      actorName: `${profile.firstName} ${profile.lastName}`.trim(),
      actorRole: 'domestic_approver',
      ipAddress: getClientIp(request),
    })

    return jsonResponse({
      success: true,
      user: { email: profile.email, firstName: profile.firstName, lastName: profile.lastName, role: 'domestic_approver' },
    }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

const userResetPassword = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const newPassword = String(body.newPassword ?? '')

    if (!email) return jsonResponse({ error: 'Email is required.' }, 400)
    if (newPassword.length < 8) return jsonResponse({ error: 'Password must be at least 8 characters.' }, 400)

    await ctx.runMutation(api.users.resetUserPassword, { email, newPassword })

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

const logGuest = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const sessionId = String(body.sessionId ?? '').trim()
    const page = String(body.page ?? '').trim()
    const guestAction = String(body.action ?? 'guest.page_view').trim()
    const referrer = String(body.referrer ?? '').trim()

    if (!sessionId || !page) return jsonResponse({ error: 'sessionId and page are required.' }, 400)

    await ctx.runMutation(api.auditLogs.fromAction, {
      action: guestAction,
      actorEmail: sessionId,
      actorName: `Guest (${page})`,
      actorRole: 'guest',
      targetType: 'page',
      targetId: page,
      details: JSON.stringify({ referrer, userAgent: request.headers.get('user-agent') ?? '' }),
      ipAddress: getClientIp(request),
    })

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

const logEvent = async (ctx: ActionCtx, request: Request) => {
  try {
    const body = await readJsonBody(request)
    const action = String(body.action ?? '').trim()
    const actorEmail = String(body.actorEmail ?? '').trim()
    const actorName = String(body.actorName ?? '').trim()
    const actorRole = String(body.actorRole ?? '').trim() as 'user' | 'admin' | 'rescuer' | 'domestic_approver' | 'guest'
    const targetType = String(body.targetType ?? '').trim()
    const targetId = String(body.targetId ?? '').trim()
    const details = body.details ? JSON.stringify(body.details) : undefined

    if (!action || !actorEmail) return jsonResponse({ error: 'action and actorEmail are required.' }, 400)

    await ctx.runMutation(api.auditLogs.fromAction, {
      action,
      actorEmail,
      actorName: actorName || undefined,
      actorRole,
      targetType: targetType || undefined,
      targetId: targetId || undefined,
      details,
      ipAddress: getClientIp(request),
    })

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
}

const routes = [
  { path: '/api/auth/send-otp', handler: withRateLimit(userSendOtp, 'user-send-otp') },
  { path: '/api/auth/verify-otp', handler: withRateLimit(userVerifyOtp, 'user-verify-otp') },
  { path: '/api/admin/auth/send-otp', handler: withRateLimit(adminSendOtp, 'admin-send-otp') },
  { path: '/api/admin/auth/verify-otp', handler: withRateLimit(adminVerifyOtp, 'admin-verify-otp') },
  { path: '/api/rescuer/auth/send-otp', handler: withRateLimit(rescuerSendOtp, 'rescuer-send-otp') },
  { path: '/api/rescuer/auth/verify-otp', handler: withRateLimit(rescuerVerifyOtp, 'rescuer-verify-otp') },
  { path: '/api/domestic/auth/send-otp', handler: withRateLimit(domesticSendOtp, 'domestic-send-otp') },
  { path: '/api/domestic/auth/verify-otp', handler: withRateLimit(domesticVerifyOtp, 'domestic-verify-otp') },
  { path: '/api/auth/reset-password', handler: httpAction(userResetPassword) },
  { path: '/api/log-guest', handler: httpAction(logGuest) },
  { path: '/api/log-event', handler: httpAction(logEvent) },
] as const

for (const route of routes) {
  http.route({ path: route.path, method: 'OPTIONS', handler: httpAction(async () => optionsResponse()) })
  http.route({ path: route.path, method: 'POST', handler: route.handler })
}

export default http
