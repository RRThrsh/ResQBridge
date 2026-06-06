/// <reference types="node" />

import { mutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import { assertOtpInternalSecret } from './lib/otpInternal'
import { isValidOtpCode, normalizeOtpCode, otpCodesMatch } from './lib/otpCode'

const scopeValidator = v.union(
  v.literal('admin'),
  v.literal('user'),
  v.literal('rescuer'),
)
const modeValidator = v.union(v.literal('sign-in'), v.literal('sign-up'))

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const saveVerificationCode = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    scope: scopeValidator,
    code: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    mode: modeValidator,
    expiresAt: v.number(),
    phone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertOtpInternalSecret(args.secret)
    const email = normalizeEmail(args.email)

    const existing = await ctx.db
      .query('verificationCodes')
      .withIndex('by_email_scope', (q) => q.eq('email', email).eq('scope', args.scope))
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    const code = normalizeOtpCode(args.code)
    if (!isValidOtpCode(code)) {
      throw new Error('Invalid verification code format.')
    }

    await ctx.db.insert('verificationCodes', {
      email,
      scope: args.scope,
      code,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      mode: args.mode,
      expiresAt: args.expiresAt,
      phone: args.phone?.trim() || undefined,
    })

    return null
  },
})

export const deleteVerificationCode = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    scope: scopeValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertOtpInternalSecret(args.secret)
    const email = normalizeEmail(args.email)
    const existing = await ctx.db
      .query('verificationCodes')
      .withIndex('by_email_scope', (q) => q.eq('email', email).eq('scope', args.scope))
      .first()
    if (existing) {
      await ctx.db.delete(existing._id)
    }
    return null
  },
})

async function getVerificationRecord(
  ctx: MutationCtx,
  email: string,
  scope: 'admin' | 'user' | 'rescuer',
) {
  return await ctx.db
    .query('verificationCodes')
    .withIndex('by_email_scope', (q) => q.eq('email', email).eq('scope', scope))
    .first()
}

export const validateVerificationCode = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    scope: scopeValidator,
    code: v.string(),
    mode: v.optional(modeValidator),
  },
  returns: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    assertOtpInternalSecret(args.secret)
    const email = normalizeEmail(args.email)
    const code = normalizeOtpCode(args.code)

    if (!isValidOtpCode(code)) {
      throw new Error('Invalid verification code.')
    }

    const record = await getVerificationRecord(ctx, email, args.scope)

    if (!record) {
      throw new Error('No verification code found. Please request a new one.')
    }
    if (args.mode && record.mode !== args.mode) {
      throw new Error(
        'This code was issued for a different sign-in step. Request a new code and try again.',
      )
    }
    if (!otpCodesMatch(record.code, code)) {
      throw new Error('Invalid verification code.')
    }
    if (Date.now() > record.expiresAt) {
      await ctx.db.delete(record._id)
      throw new Error('Verification code has expired. Please request a new one.')
    }

    return {
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
    }
  },
})

export const consumeVerificationCode = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    scope: scopeValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertOtpInternalSecret(args.secret)
    const email = normalizeEmail(args.email)
    const record = await getVerificationRecord(ctx, email, args.scope)
    if (record) {
      await ctx.db.delete(record._id)
    }
    return null
  },
})

export const verifyVerificationCode = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    scope: scopeValidator,
    code: v.string(),
    mode: v.optional(modeValidator),
  },
  returns: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    assertOtpInternalSecret(args.secret)
    const email = normalizeEmail(args.email)
    const code = normalizeOtpCode(args.code)

    if (!isValidOtpCode(code)) {
      throw new Error('Invalid verification code.')
    }

    const record = await getVerificationRecord(ctx, email, args.scope)

    if (!record) {
      throw new Error('No verification code found. Please request a new one.')
    }
    if (args.mode && record.mode !== args.mode) {
      throw new Error(
        'This code was issued for a different sign-in step. Request a new code and try again.',
      )
    }
    if (!otpCodesMatch(record.code, code)) {
      throw new Error('Invalid verification code.')
    }
    if (Date.now() > record.expiresAt) {
      await ctx.db.delete(record._id)
      throw new Error('Verification code has expired. Please request a new one.')
    }

    await ctx.db.delete(record._id)

    return {
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
    }
  },
})
