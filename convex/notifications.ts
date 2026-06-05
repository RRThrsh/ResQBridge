import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import { Resend } from 'resend'
import { internal } from './_generated/api'
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
const admins = await _ctx.runQuery(internal.users.getAdmins)

const adminEmails = admins
  .map((admin) => admin.email)
  .filter(Boolean)

if (adminEmails.length === 0) {
  throw new Error('No admin emails found.')
}

// =========================
// EMAIL NOTIFICATION
// =========================
await resend.emails.send({
  from: 'ResQBridge <onboarding@resend.dev>',
  to: adminEmails,
  subject: 'New Domestic Report Submitted',
  html: `
    <h2>New Report Submitted</h2>
    <p><strong>Animal:</strong> ${args.species}</p>
    <p><strong>Location:</strong> ${args.location}</p>
    <p><strong>Report ID:</strong> ${args.reportId}</p>
  `,
})

      console.log('Admin email sent successfully.')

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
            recipient: formattedPhone,
            sender_id: 'PhilSMS', // <-- CHANGED from 'sender' to 'sender_id'
            type: 'plain',
            // FIX: Restored backticks here
            message: `New Wildlife Report Submitted\n\nAnimal: ${args.species}\nLocation: ${args.location}`,
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