import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const alertAdmin = internalAction({
  args: {
    reportId: v.id('reports'),
    species: v.string(),
    location: v.string(),
  },

  handler: async (_ctx, args) => {
    console.log('ALERT ADMIN TRIGGERED')

    try {
      // =========================
      // EMAIL NOTIFICATION
      // =========================
// =========================
// GET ALL ADMINS
// =========================
const admins = await _ctx.runQuery(
  'admin:getAdminsForNotifications' as any
)

const adminEmails = admins
  .map((admin: {
    email: string
    firstName: string
    lastName: string
  }) => admin.email)
  .filter(Boolean)

if (adminEmails.length === 0) {
  throw new Error('No admin emails found.')
}

// =========================
// EMAIL NOTIFICATION
// =========================

console.log('ADMIN EMAILS:', adminEmails)

const emailResult = await resend.emails.send({
  from: 'ResQBridge <onboarding@resend.dev>',
  to: ['vinsainttt99@gmail.com'],
  subject: 'New Wildlife Report Submitted',
  html: `
    <h2>New Report Submitted</h2>
    <p><strong>Animal:</strong> ${args.species}</p>
    <p><strong>Location:</strong> ${args.location}</p>
    <p><strong>Report ID:</strong> ${args.reportId}</p>
  `,
})

console.log('EMAIL RESULT:', emailResult)

      // =========================
      // SMS NOTIFICATION
      // =========================
      let cleanNumber = '09539814023'.replace(/\D/g, '')
      let formattedPhone = ''

      if (cleanNumber.length === 11 && cleanNumber.startsWith('09')) {
        formattedPhone = '+63' + cleanNumber.substring(1)
      } else if (cleanNumber.length === 10 && cleanNumber.startsWith('9')) {
        formattedPhone = '+63' + cleanNumber
      } else if (cleanNumber.length === 12 && cleanNumber.startsWith('63')) {
        formattedPhone = '+' + cleanNumber
      } else {
        formattedPhone = '+' + cleanNumber
      }
      console.log('PHILSMS TOKEN EXISTS:', !!process.env.PHILSMS_API_TOKEN)
console.log('FORMATTED PHONE:', formattedPhone)
      const response = await fetch(
        'https://dashboard.philsms.com/api/v3/sms/send',
        {
          method: 'POST',
          headers: {
            // FIX: Restored backticks here
            Authorization: `Bearer ${process.env.PHILSMS_API_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            recipient: formattedPhone.replace('+', ''),
            sender_id: 'PhilSMS',
            type: 'plain',
            message: 'New Report Submitted. Please check now.',
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        // FIX: Restored backticks here
        throw new Error(`PhilSMS API Error: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('SMS RESPONSE:', result)
      
    } catch (error: any) {
      console.error('NOTIFICATION ERROR:', error.message || error)
    }
  },
})
export const notifyRescuer = internalAction({
  args: {
    rescuerEmail: v.string(),
    rescuerPhone: v.optional(v.string()),
    animalName: v.string(),
    location: v.string(),
    reportNumber: v.string(),
  },

  handler: async (_ctx, args) => {
    try {
      console.log('NOTIFY RESCUER TRIGGERED')

      // =========================
      // EMAIL
      // =========================
      const emailResult = await resend.emails.send({
        from: 'ResQBridge <onboarding@resend.dev>',
        to: [args.rescuerEmail],
        subject: 'New Rescue Assignment',
        html: `
          <h2>New Rescue Assignment</h2>

          <p><strong>Report Number:</strong> ${args.reportNumber}</p>

          <p><strong>Animal:</strong> ${args.animalName}</p>

          <p><strong>Location:</strong> ${args.location}</p>

          <p>Please check now.</p>
        `,
      })

      console.log('RESCUER EMAIL RESULT:', emailResult)

      // =========================
      // SMS
      // =========================
      if (args.rescuerPhone) {
        const cleanPhone = args.rescuerPhone.replace(/\D/g, '')

        const response = await fetch(
          'https://dashboard.philsms.com/api/v3/sms/send',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.PHILSMS_API_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },

            body: JSON.stringify({
              recipient: cleanPhone,
              sender_id: 'PhilSMS',
              type: 'plain',
              message: 'New Rescue Assignment. Please check now.',
            }),
          }
        )

        const result = await response.json()

        console.log('RESCUER SMS RESULT:', result)
      }
    } catch (error: any) {
      console.error(
        'RESCUER NOTIFICATION ERROR:',
        error.message || error
      )
    }
  },
})