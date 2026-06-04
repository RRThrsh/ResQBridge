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
    try {
      await resend.emails.send({
        from: 'ResQBridge <onboarding@resend.dev>',
        to: 'ralphbandahala05@gmail.com',
        subject: 'New Domestic Report Submitted',
        html: `
          <h2>New Report Submitted</h2>

          <p><strong>Animal:</strong> ${args.species}</p>

          <p><strong>Location:</strong> ${args.location}</p>

          <p><strong>Report ID:</strong> ${args.reportId}</p>
        `,
      })

      console.log('Admin email sent successfully.')
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  },
})