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
      v.literal("domestic"),
      v.literal("rescuer"),
      v.literal("user"),
    ),
  })
    .index("by_email", ["email"])
    .index("by_uuid", ["uuid"]),

  admins: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  })
    .index("by_email", ["email"]),

  rescuers: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
  })
    .index("by_email", ["email"]),

  reports: defineTable({
    name: v.string(),
    phone: v.string(),
    category: v.string(),
    animalType: v.string(),
    urgency: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    images: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("en_route"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("failed"),
    ),
    assignedTo: v.optional(v.string()),
    assignedUser: v.optional(v.object({ firstName: v.string(), lastName: v.string() })),
    reporterEmail: v.optional(v.string()),
    reporterIp: v.optional(v.string()),
    createdAt: v.number(),
    archivedAt: v.optional(v.number()),
    archivedByName: v.optional(v.string()),
  })
    .index("by_assigned_to", ["assignedTo"])
    .index("by_reporter_email", ["reporterEmail"])
    .index("by_status", ["status"]),

  activityLogs: defineTable({
    userId: v.string(),
    action: v.string(),
    reportId: v.optional(v.string()),
    details: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  rescuerLocations: defineTable({
    rescuerEmail: v.string(),
    rescuerName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    heading: v.optional(v.number()),
    speed: v.optional(v.number()),
    updatedAt: v.number(),
    reportId: v.id("reports"),
    animalName: v.optional(v.string()),
    isTracking: v.boolean(),
  })
    .index("by_rescuer_email", ["rescuerEmail"])
    .index("by_tracking", ["isTracking"]),
});
