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
      v.literal("user"),
    ),
  })
    .index("by_email", ["email"])
    .index("by_uuid", ["uuid"]),
});
