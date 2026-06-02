import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import type { ActionCtx } from './_generated/server'
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
import { parseSendOtpParams, type AuthMode } from './lib/authParse'
import { normalizeOtpCode } from './lib/otpCode'

const http = httpRouter()

const OTP_TTL_MS = 5 * 60 * 1000

async function sendOtpEmail(
  ctx: ActionCtx,
  args: {
    email: string
    firstName: string
    lastName: string
    subject: string
    code: string
  },
) {
  await ctx.runAction(internal.email.sendVerificationEmail, {
    to: args.email,
    displayName: `${args.firstName} ${args.lastName}`.trim() || args.email,
    code: args.code,
    subject: args.subject,
  })
}

const userSendOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const parsed = parseSendOtpParams(body, true)
    if ('error' in parsed) {
      return jsonResponse({ error: parsed.error }, 400)
    }

    const secret = getOtpSecret()
    const { email, mode } = parsed

    const isAdmin = await ctx.runQuery(api.admin.isAdmin, { email })
    if (isAdmin) {
      return jsonResponse({
        error: 'This email is for admin access only. Please use the admin sign-in page.',
      }, 400)
    }

    const isRescuer = await ctx.runQuery(api.rescuers.isRescuer, { email })
    if (isRescuer) {
      return jsonResponse({
        error: 'This email is for rescuer access only. Please use the rescuer sign-in page.',
      }, 400)
    }

    const existing = await ctx.runQuery(api.users.getByEmail, { email })
    let params = parsed

    if (mode === 'sign-in') {
      if (!existing) {
        return jsonResponse({
          error: 'No account found for this email. Please sign up first.',
        }, 400)
      }
      params = {
        email,
        firstName: existing.firstName,
        lastName: existing.lastName,
        mode,
      }
    } else if (existing) {
      return jsonResponse({
        error: 'An account with this email already exists. Please sign in.',
      }, 400)
    }

    const code = generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret,
      email: params.email,
      scope: 'user',
      code,
      firstName: params.firstName,
      lastName: params.lastName,
      mode: params.mode,
      expiresAt: Date.now() + OTP_TTL_MS,
    })

    try {
      await sendOtpEmail(ctx, {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        subject: 'Your PWRRC verification code',
        code,
      })
    } catch (error) {
      await ctx.runMutation(api.otp.deleteVerificationCode, {
        secret,
        email: params.email,
        scope: 'user',
      })
      return jsonResponse({ error: formatHandlerError(error) }, 500)
    }

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
})

const userVerifyOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))
    const mode: AuthMode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'

    if (!email.includes('@')) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
    }

    const secret = getOtpSecret()

    const isAdmin = await ctx.runQuery(api.admin.isAdmin, { email })
    if (isAdmin) {
      return jsonResponse({
        error: 'This email is for admin access only. Please use the admin sign-in page.',
      }, 400)
    }

    const isRescuer = await ctx.runQuery(api.rescuers.isRescuer, { email })
    if (isRescuer) {
      return jsonResponse({
        error: 'This email is for rescuer access only. Please use the rescuer sign-in page.',
      }, 400)
    }

    const profile = await ctx.runMutation(api.otp.validateVerificationCode, {
      secret,
      email,
      scope: 'user',
      code,
      mode,
    })

    let user: { email: string; firstName: string; lastName: string; role: 'user' }
    if (mode === 'sign-up') {
      user = await ctx.runMutation(api.users.createUser, {
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      })
    } else {
      const existing = await ctx.runQuery(api.users.getByEmail, { email })
      if (!existing) {
        return jsonResponse({
          error: 'No account found for this email. Please sign up first.',
        }, 400)
      }
      user = existing
    }

    await ctx.runMutation(api.otp.consumeVerificationCode, {
      secret,
      email,
      scope: 'user',
    })

    return jsonResponse({ success: true, user }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
})

const adminSendOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))

    if (!email.includes('@')) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
    }

    const secret = getOtpSecret()

    await ctx.runMutation(api.admin.bootstrapAdmins, {})

    const allowed = await ctx.runQuery(api.admin.isAdmin, { email })
    if (!allowed) {
      return jsonResponse({ error: 'This email is not authorized for admin access.' }, 400)
    }

    const profile = await ctx.runQuery(api.admin.getAdminForLogin, { email })
    if (!profile) {
      return jsonResponse({ error: 'Admin account not found.' }, 400)
    }

    const code = generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret,
      email,
      scope: 'admin',
      code,
      firstName: profile.firstName,
      lastName: profile.lastName,
      mode: 'sign-in',
      expiresAt: Date.now() + OTP_TTL_MS,
    })

    try {
      await sendOtpEmail(ctx, {
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        subject: 'Your PWRRC Admin verification code',
        code,
      })
    } catch (error) {
      await ctx.runMutation(api.otp.deleteVerificationCode, {
        secret,
        email,
        scope: 'admin',
      })
      return jsonResponse({ error: formatHandlerError(error) }, 500)
    }

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
})

const adminVerifyOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))

    if (!email.includes('@')) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
    }

    const secret = getOtpSecret()

    await ctx.runMutation(api.otp.verifyVerificationCode, {
      secret,
      email,
      scope: 'admin',
      code,
    })

    const admin = await ctx.runMutation(api.admin.ensureAdminAccount, {
      adminEmail: email,
    })

    return jsonResponse(
      {
        success: true,
        user: {
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: 'admin' as const,
        },
      },
      200,
    )
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
})

const rescuerSendOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))

    if (!email.includes('@')) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
    }

    const secret = getOtpSecret()

    const allowed = await ctx.runQuery(api.rescuers.isRescuer, { email })
    if (!allowed) {
      return jsonResponse({ error: 'This email is not authorized for rescuer access.' }, 400)
    }

    const profile = await ctx.runQuery(api.rescuers.getRescuerForLogin, { email })
    if (!profile) {
      return jsonResponse({ error: 'Rescuer account not found.' }, 400)
    }

    const code = generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret,
      email,
      scope: 'rescuer',
      code,
      firstName: profile.firstName,
      lastName: profile.lastName,
      mode: 'sign-in',
      expiresAt: Date.now() + OTP_TTL_MS,
    })

    try {
      await sendOtpEmail(ctx, {
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        subject: 'Your PWRCC Rescuer verification code',
        code,
      })
    } catch (error) {
      await ctx.runMutation(api.otp.deleteVerificationCode, {
        secret,
        email,
        scope: 'rescuer',
      })
      return jsonResponse({ error: formatHandlerError(error) }, 500)
    }

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
})

const rescuerVerifyOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))

    if (!email.includes('@')) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
    }

    const secret = getOtpSecret()

    await ctx.runMutation(api.otp.verifyVerificationCode, {
      secret,
      email,
      scope: 'rescuer',
      code,
    })

    const rescuer = await ctx.runMutation(api.rescuers.ensureRescuerAccount, {
      rescuerEmail: email,
    })

    return jsonResponse(
      {
        success: true,
        user: {
          email: rescuer.email,
          firstName: rescuer.firstName,
          lastName: rescuer.lastName,
          role: 'rescuer' as const,
        },
      },
      200,
    )
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
})

const routes = [
  { path: '/api/auth/send-otp', handler: userSendOtp },
  { path: '/api/auth/verify-otp', handler: userVerifyOtp },
  { path: '/api/admin/auth/send-otp', handler: adminSendOtp },
  { path: '/api/admin/auth/verify-otp', handler: adminVerifyOtp },
  { path: '/api/rescuer/auth/send-otp', handler: rescuerSendOtp },
  { path: '/api/rescuer/auth/verify-otp', handler: rescuerVerifyOtp },
] as const

for (const route of routes) {
  http.route({ path: route.path, method: 'OPTIONS', handler: httpAction(async () => optionsResponse()) })
  http.route({ path: route.path, method: 'POST', handler: route.handler })
}

export default http
