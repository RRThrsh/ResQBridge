import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  otps: defineTable({
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_email", ["email"]),

  users: defineTable({
    uuid: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("rescuer"),
    ),
    availability: v.optional(v.union(
      v.literal("available"),
      v.literal("busy"),
    )),
  })
    .index("by_email", ["email"])
    .index("by_uuid", ["uuid"]),

  logs: defineTable({
    userId: v.optional(v.string()),
    eventType: v.string(),
    section: v.optional(v.string()),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.string()),
    sessionDuration: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_eventType", ["eventType"])
    .index("by_ipAddress", ["ipAddress"])
    .index("by_createdAt", ["createdAt"]),

  config: defineTable({
    key: v.string(),
    value: v.string(),
  })
    .index("by_key", ["key"]),

  activityLogs: defineTable({
    userId: v.string(),
    action: v.string(),
    reportId: v.optional(v.string()),
    details: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  rescuerLocations: defineTable({
    userId: v.string(),
    userName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  reportNotes: defineTable({
    reportId: v.string(),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_reportId", ["reportId"]),

  reports: defineTable({
    name: v.string(),
    phone: v.string(),
    category: v.string(),
    animalType: v.string(),
    urgency: v.string(),
    location: v.string(),
    description: v.string(),
    images: v.string(),
    status: v.string(),
    assignedTo: v.optional(v.string()),
    reporterIp: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"]),
});
