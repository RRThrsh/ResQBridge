import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

// Add the missing getImageUrl mutation
export const getImageUrl = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId)

    if (!url) {
      throw new Error('Image not found')
    }

    return url
  },
})
