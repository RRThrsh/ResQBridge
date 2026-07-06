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
    animalName: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("en_route"),
      v.literal("rescue_success"),
      v.literal("rescue_failed"),
    ),
    assignedRescuerEmail: v.optional(v.string()),
    reporterEmail: v.string(),
    createdAt: v.number(),
  })
    .index("by_assigned_rescuer", ["assignedRescuerEmail"])
    .index("by_reporter", ["reporterEmail"]),

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
