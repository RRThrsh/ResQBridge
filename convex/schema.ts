import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { reportStatusSchemaValidator } from './lib/reportStatus'

export default defineSchema({
  admins: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    createdAt: v.number(),
    // Added password field for admin login
    password: v.optional(v.string()), 
  }).index('by_email', ['email']),

  rescuers: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.optional(v.string()),
    createdAt: v.number(),
    // Added password field for rescuer login
    password: v.optional(v.string()), 
  }).index('by_email', ['email']),

  users: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.optional(
      v.union(
        v.literal('admin'),
        v.literal('user'),
        v.literal('rescuer'),
        v.literal('domestic_approver'),
      ),
    ),
    contactPhone: v.optional(v.string()),
    createdAt: v.number(),
    // Added password field for user and domestic_approver login
    password: v.optional(v.string()), 
  }).index('by_email', ['email']),

  siteContent: defineTable({
    key: v.union(v.literal('wildlife'), v.literal('news')),
    itemsJson: v.string(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  verificationCodes: defineTable({
    email: v.string(),
    scope: v.union(v.literal('admin'), v.literal('user'), v.literal('rescuer')),
    code: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    mode: v.union(v.literal('sign-in'), v.literal('sign-up')),
    expiresAt: v.number(),
  }).index('by_email_scope', ['email', 'scope']),

  reports: defineTable({
    userEmail: v.string(),
    category: v.union(v.literal('wildlife'), v.literal('domestic')),
    type: v.string(),
    animalName: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    speciesId: v.optional(v.string()),
    condition: v.optional(v.string()),
    behavior: v.optional(v.string()),
    photoDataUrl: v.optional(v.string()),
    photoDataUrls: v.optional(v.array(v.string())),
    photoStorageIds: v.optional(v.array(v.id('_storage'))),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: reportStatusSchemaValidator,
    reportNumber: v.optional(v.string()),
    assignedRescuerEmail: v.optional(v.string()),
    seenAt: v.optional(v.number()),
    quantity: v.optional(v.number()),
    reportedSize: v.optional(v.string()),
    reporterFirstName: v.optional(v.string()),
    reporterLastName: v.optional(v.string()),
    reporterPhone: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user_email', ['userEmail'])
    .index('by_assigned_rescuer', ['assignedRescuerEmail']),
})
