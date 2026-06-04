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
import { type AuthMode } from './lib/authParse'
import { normalizeOtpCode } from './lib/otpCode'

const http = httpRouter()

const OTP_TTL_MS = 5 * 60 * 1000

// --- EMAIL SENDER ---
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

// --- NEW: SMS SENDER VIA PHILSMS ---
async function sendOtpSms(phone: string, code: string) {
  // 1. HARDCODED NOTIFICATION NUMBER
  // We are ignoring the 'phone' argument so all texts go to this exact number
  let cleanNumber = '09539814023'.replace(/\D/g, '')
  let formattedPhone = ''
  
  // 2. FORMATTING FIX: Strictly using '63' (NO PLUS SIGN)
  if (cleanNumber.length === 11 && cleanNumber.startsWith('09')) {
    formattedPhone = '63' + cleanNumber.substring(1)
  } else if (cleanNumber.length === 10 && cleanNumber.startsWith('9')) {
    formattedPhone = '63' + cleanNumber
  } else if (cleanNumber.length === 12 && cleanNumber.startsWith('63')) {
    formattedPhone = cleanNumber
  } else {
    formattedPhone = cleanNumber
  }

  // 3. Grab your token directly from the environment variables!
  const philsmsToken = process.env.PHILSMS_API_TOKEN
  
  if (!philsmsToken) {
    throw new Error('PhilSMS API token is missing in Convex environment variables.')
  }

  // 4. Send the request
  const response = await fetch('https://dashboard.philsms.com/api/v3/sms/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${philsmsToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      recipient: formattedPhone, // Now sending the perfect 63 format
      sender_id: 'PhilSMS', 
      type: 'plain',
      message: `Your verification code is: ${code}. Please do not share this with anyone.`,
    }),
  })

  // Capture the actual error from PhilSMS
  if (!response.ok) {
    const errorText = await response.text()
    console.error('PhilSMS API Error:', errorText)
    throw new Error(`PhilSMS rejected the request: ${errorText}`)
  }
}

// --- UPDATED: USER SEND OTP ---
const userSendOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    
    // Extract the new payload variables coming from our React frontend
    const identifier = String(body.identifier ?? '').trim()
    const type = body.type === 'phone' ? 'phone' : 'email'
    const mode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'
    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()

    if (!identifier) {
      return jsonResponse({ error: 'An email or phone number is required.' }, 400)
    }

    const secret = getOtpSecret()

    // We use the identifier as the "email" in the DB to avoid breaking your schema
    const isAdmin = await ctx.runQuery(api.admin.isAdmin, { email: identifier })
    if (isAdmin) {
      return jsonResponse({ error: 'This contact is for admin access only.' }, 400)
    }

    const isRescuer = await ctx.runQuery(api.rescuers.isRescuer, { email: identifier })
    if (isRescuer) {
      return jsonResponse({ error: 'This contact is for rescuer access only.' }, 400)
    }

    const existing = await ctx.runQuery(api.users.getByEmail, { email: identifier })
    let finalFirstName = firstName
    let finalLastName = lastName

    if (mode === 'sign-in') {
      if (!existing) {
        return jsonResponse({ error: 'No account found. Please sign up first.' }, 400)
      }
      finalFirstName = existing.firstName
      finalLastName = existing.lastName
    } else if (existing) {
      return jsonResponse({ error: 'An account already exists. Please sign in.' }, 400)
    }

    const code = generateOtp()
    await ctx.runMutation(api.otp.saveVerificationCode, {
      secret,
      email: identifier, // Save the phone/email to the DB
      scope: 'user',
      code,
      firstName: finalFirstName,
      lastName: finalLastName,
      mode,
      expiresAt: Date.now() + OTP_TTL_MS,
    })

    try {
      // THE MAGIC SWITCH
      if (type === 'phone') {
        // No ctx needed here since we are using process.env!
        await sendOtpSms(identifier, code)
      } else {
        await sendOtpEmail(ctx, {
          email: identifier,
          firstName: finalFirstName,
          lastName: finalLastName,
          subject: 'Your verification code',
          code,
        })
      }
    } catch (error) {
      await ctx.runMutation(api.otp.deleteVerificationCode, {
        secret,
        email: identifier,
        scope: 'user',
      })
      return jsonResponse({ error: formatHandlerError(error) }, 500)
    }

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 500)
  }
})

// --- UPDATED: USER VERIFY OTP ---
const userVerifyOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const identifier = String(body.identifier ?? '').trim()
    const code = normalizeOtpCode(String(body.code ?? ''))
    const mode: AuthMode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'

    if (!identifier) {
      return jsonResponse({ error: 'Please enter a valid email or phone number.' }, 400)
    }

    const secret = getOtpSecret()

    const isAdmin = await ctx.runQuery(api.admin.isAdmin, { email: identifier })
    if (isAdmin) {
      return jsonResponse({ error: 'This contact is for admin access only.' }, 400)
    }

    const isRescuer = await ctx.runQuery(api.rescuers.isRescuer, { email: identifier })
    if (isRescuer) {
      return jsonResponse({ error: 'This contact is for rescuer access only.' }, 400)
    }

    const profile = await ctx.runMutation(api.otp.validateVerificationCode, {
      secret,
      email: identifier,
      scope: 'user',
      code,
      mode,
    })

    let user: { email: string; firstName: string; lastName: string; role: 'user' }
    if (mode === 'sign-up') {
      user = await ctx.runMutation(api.users.createUser, {
        email: identifier,
        firstName: profile.firstName,
        lastName: profile.lastName,
      })
    } else {
      const existing = await ctx.runQuery(api.users.getByEmail, { email: identifier })
      if (!existing) {
        return jsonResponse({ error: 'No account found. Please sign up first.' }, 400)
      }
      user = existing
    }

    await ctx.runMutation(api.otp.consumeVerificationCode, {
      secret,
      email: identifier,
      scope: 'user',
    })

    return jsonResponse({ success: true, user }, 200)
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
  }
})

// Admins and Rescuers code remains exactly the same below
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

const domesticSendOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)
    const email = normalizeEmail(String(body.email ?? ''))

    if (!email.includes('@')) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
    }

    const secret = getOtpSecret()

    const allowed = await ctx.runQuery(api.domestic.isDomesticApprover, { email })

    if (!allowed) {
      return jsonResponse(
        { error: 'This email is not authorized for domestic approver access.' },
        400,
      )
    }

    const profile = await ctx.runQuery(api.domestic.getDomesticApproverForLogin, {
      email,
    })

    if (!profile) {
      return jsonResponse({ error: 'Domestic approver account not found.' }, 400)
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
        subject: 'Your Domestic Portal verification code',
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

const domesticVerifyOtp = httpAction(async (ctx, request) => {
  try {
    const body = await readJsonBody(request)

    const email = normalizeEmail(String(body.email ?? ''))
    const code = normalizeOtpCode(String(body.code ?? ''))

    const secret = getOtpSecret()

    await ctx.runMutation(api.otp.verifyVerificationCode, {
      secret,
      email,
      scope: 'admin',
      code,
    })

    const profile = await ctx.runQuery(api.domestic.getDomesticApproverForLogin, {
      email,
    })

    if (!profile) {
      return jsonResponse({ error: 'Domestic approver account not found.' }, 400)
    }

    return jsonResponse(
      {
        success: true,
        user: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: 'domestic_approver',
        },
      },
      200,
    )
  } catch (error) {
    return jsonResponse({ error: formatHandlerError(error) }, 400)
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
  { path: '/api/domestic/auth/send-otp', handler: domesticSendOtp },
  { path: '/api/domestic/auth/verify-otp', handler: domesticVerifyOtp },
] as const

for (const route of routes) {
  http.route({ path: route.path, method: 'OPTIONS', handler: httpAction(async () => optionsResponse()) })
  http.route({ path: route.path, method: 'POST', handler: route.handler })
}

export default http
