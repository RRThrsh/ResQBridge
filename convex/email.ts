'use node'

import { v } from 'convex/values'
import { internalAction } from './_generated/server'
import nodemailer from 'nodemailer'

function stripQuotes(value: string) {
  return value.replace(/^["']|["']$/g, '').trim()
}

function resolveSmtpConfig() {
  const user = stripQuotes(process.env.EMAIL_USER ?? '')
  const pass = stripQuotes(process.env.EMAIL_PASS ?? '').replace(/\s+/g, '')

  if (!user || !pass) {
    throw new Error(
      'Email is not configured. Set EMAIL_USER and EMAIL_PASS in Convex environment variables.',
    )
  }

  const isGmail = user.toLowerCase().endsWith('@gmail.com')
  let host = stripQuotes(process.env.EMAIL_HOST ?? '')
  if (!host && isGmail) {
    host = 'smtp.gmail.com'
  }
  if (!host) {
    throw new Error('EMAIL_HOST is required when not using Gmail.')
  }

  const port = parseInt(process.env.EMAIL_PORT ?? (isGmail ? '465' : '587'), 10)
  let secure = process.env.EMAIL_SECURE === 'true'
  if (port === 465) secure = true
  if (port === 587 || port === 25 || port === 2525) secure = false

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    fromName: stripQuotes(process.env.EMAIL_FROM_NAME ?? 'Palawan Wildlife Rescue'),
    fromAddress: stripQuotes(process.env.EMAIL_FROM ?? user),
  }
}

export const sendVerificationEmail = internalAction({
  args: {
    to: v.string(),
    displayName: v.string(),
    code: v.string(),
    subject: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const config = resolveSmtpConfig()
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    })

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: args.to,
      subject: args.subject,
      text: `Hello ${args.displayName},\n\nYour verification code is: ${args.code}\n\nThis code expires in 5 minutes.`,
      html: `<p>Hello <strong>${args.displayName}</strong>,</p><p>Your verification code is: <strong>${args.code}</strong></p><p>This code expires in 5 minutes.</p>`,
    })

    return null
  },
})
