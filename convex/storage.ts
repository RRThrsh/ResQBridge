import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})

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

export const deleteImage = mutation({
  args: {
    storageId: v.id('_storage'),
  },

  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId)
    return true
  },
})
