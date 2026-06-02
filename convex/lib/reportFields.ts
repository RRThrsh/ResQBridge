import { v } from 'convex/values'
import { reportStatusSchemaValidator } from './reportStatus'

export const reportFieldsValidator = {
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
  reporterPhone: v.optional(v.string()),
  createdAt: v.number(),
}

export const reportDocValidator = v.object({
  _id: v.id('reports'),
  _creationTime: v.number(),
  ...reportFieldsValidator,
})

export const reportCreateOptionalFields = {
  behavior: v.optional(v.string()),
  seenAt: v.optional(v.number()),
  quantity: v.optional(v.number()),
  reportedSize: v.optional(v.string()),
  reporterPhone: v.optional(v.string()),
}
