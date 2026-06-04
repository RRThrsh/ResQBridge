// convex/notifications.ts
import { internalAction } from './_generated/server'
import { v } from 'convex/values'

export const alertAdmin = internalAction({
  args: { 
    reportId: v.id('reports'),
    species: v.string(),
    location: v.string()
  },
  handler: async (ctx, args) => {
    // 1. EMAIL LOGIC
    // e.g., await fetch('https://api.resend.com/emails', { ... })
    console.log(`Sending Email: New wildlife report for ${args.species} at ${args.location}`)

    // 2. SMS LOGIC
    // e.g., await fetch('https://api.twilio.com/...', { ... })
    console.log(`Sending SMS: Admin alert for report ${args.reportId}`)
  },
})
