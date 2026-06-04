import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import { assertAdmin } from './lib/adminAccess'
import { defaultNews, defaultWildlife } from './lib/defaultContent'

// Root validator that handles both singular and plural images
const wildlifeItemValidator = v.object({
  id: v.string(),
  commonName: v.string(),
  category: v.union(
    v.literal('mammal'),
    v.literal('bird'),
    v.literal('reptile'),
    v.literal('amphibian'),
    v.literal('marine'),
  ),
  habitat: v.string(),
  diet: v.string(),
  activeTime: v.union(
    v.literal('diurnal'),
    v.literal('nocturnal'),
    v.literal('crepuscular'),
  ),
  description: v.string(),
  ecologicalImportance: v.string(),

  // FIX: Mark BOTH formats as completely optional so old/new code never clashes
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  
  localName: v.optional(v.string()),
  scientificName: v.optional(v.string()),
  status: v.optional(
    v.union(
      v.literal('critically-endangered'),
      v.literal('endangered'),
      v.literal('vulnerable'),
      v.literal('protected'),
    )
  ),
  safetyTips: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
})

const newsItemValidator = v.object({
  id: v.string(),
  type: v.union(v.literal('event'), v.literal('news')),
  title: v.string(),
  excerpt: v.string(),
  body: v.string(),
  date: v.string(),
  image: v.string(),
  category: v.string(),
})

type WildlifeItem = {
  id: string
  commonName: string
  localName: string
  scientificName: string
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'marine'
  status: 'critically-endangered' | 'endangered' | 'vulnerable' | 'protected'
  habitat: string
  diet: string
  activeTime: 'diurnal' | 'nocturnal' | 'crepuscular'
  description: string
  safetyTips: string[]
  ecologicalImportance: string
  images: string[]
  tags: string[]
}

type NewsItem = {
  id: string
  type: 'event' | 'news'
  title: string
  excerpt: string
  body: string
  date: string
  image: string
  category: string
}

function getMappedDefaultWildlife(): WildlifeItem[] {
  return defaultWildlife.map((item: any) => {
    const { image, ...rest } = item;
    return {
      ...rest,
      safetyTips: Array.isArray(item.safetyTips) ? [...item.safetyTips] : [],
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      images: Array.isArray(item.images) ? [...item.images] : (image ? [image] : []),
    } as WildlifeItem;
  });
}

async function getItems<T>(
  ctx: QueryCtx | MutationCtx,
  key: 'wildlife' | 'news',
  fallback: T[],
): Promise<T[]> {
  const row = await ctx.db
    .query('siteContent')
    .withIndex('by_key', (q) => q.eq('key', key))
    .unique()

  if (!row) return fallback

  const parsed = JSON.parse(row.itemsJson)

  if (key === 'wildlife') {
    return parsed.map((item: any) => ({
      ...item,
      images: Array.isArray(item.images)
        ? item.images
        : item.image
          ? [item.image]
          : [],
    })) as T[]
  }

  return parsed as T[]
}

async function saveItems(
  ctx: MutationCtx,
  key: 'wildlife' | 'news',
  items: unknown[],
) {
  const json = JSON.stringify(items)
  const existing = await ctx.db
    .query('siteContent')
    .withIndex('by_key', (q) => q.eq('key', key))
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, { itemsJson: json, updatedAt: Date.now() })
    return
  }

  await ctx.db.insert('siteContent', {
    key,
    itemsJson: json,
    updatedAt: Date.now(),
  })
}

export const listWildlife = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await getItems<WildlifeItem>(
      ctx,
      'wildlife',
      getMappedDefaultWildlife()
    )
  },
})

export const listNews = query({
  args: {},
  returns: v.array(newsItemValidator),
  handler: async (ctx) => {
    return await getItems<NewsItem>(ctx, 'news', defaultNews.map((item) => ({ ...item })))
  },
})

export const seedContent = mutation({
  args: { adminEmail: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)

    const wildlifeRow = await ctx.db
      .query('siteContent')
      .withIndex('by_key', (q) => q.eq('key', 'wildlife'))
      .unique()

    if (!wildlifeRow) {
      await ctx.db.insert('siteContent', {
        key: 'wildlife',
        itemsJson: JSON.stringify(getMappedDefaultWildlife()),
        updatedAt: Date.now(),
      })
    }

    const newsRow = await ctx.db
      .query('siteContent')
      .withIndex('by_key', (q) => q.eq('key', 'news'))
      .unique()

    if (!newsRow) {
      await ctx.db.insert('siteContent', {
        key: 'news',
        itemsJson: JSON.stringify(defaultNews),
        updatedAt: Date.now(),
      })
    }

    return null
  },
})

function slugId(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || fallback
}

export const createWildlifeItem = mutation({
  args: {
    adminEmail: v.string(),
    item: v.object({
      commonName: v.string(),
      description: v.string(),
      category: wildlifeItemValidator.fields.category,
      habitat: v.string(),
      diet: v.string(),
      activeTime: wildlifeItemValidator.fields.activeTime,
      ecologicalImportance: v.string(),
      
      image: v.optional(v.string()),
      // Expect an array of image strings (e.g., base64 or URLs)
      images: v.optional(v.array(v.string())),

      localName: v.optional(v.string()),
      scientificName: v.optional(v.string()),
      status: v.optional(wildlifeItemValidator.fields.status),
      safetyTips: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    }),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const fallback = getMappedDefaultWildlife()
    const items = await getItems<WildlifeItem>(ctx, 'wildlife', fallback)

    const baseId = slugId(args.item.commonName, `species-${Date.now()}`)
    let id = baseId
    let suffix = 1
    while (items.some((item) => item.id === id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    // Process incoming image data
    let finalImages: string[] = []
    if (Array.isArray(args.item.images)) {
      finalImages = args.item.images.map((img) => {
  // Limit every image to ~200KB base64

  return img
})
    } else if (typeof args.item.image === 'string' && args.item.image) {


finalImages = [args.item.image]
    }

    // ENFORCE LIMIT: Keep only the first 3 pictures if more are sent
    if (finalImages.length > 3) {
      finalImages = finalImages.slice(0, 3)
    }
    const totalImageSize = finalImages.reduce(
      (acc, img) => acc + img.length,
      0
    )

    if (totalImageSize > 120000) {
      throw new Error(
        'Total image size is too large. Use smaller images.'
      )
    }
    const nextItem: WildlifeItem = {
      id,
      commonName: args.item.commonName,
      description: args.item.description,
      category: args.item.category as any,
      habitat: args.item.habitat,
      diet: args.item.diet,
      activeTime: args.item.activeTime as any,
      ecologicalImportance: args.item.ecologicalImportance,
      images: finalImages, // Stores up to 3 pictures
      localName: args.item.localName ?? "",
      scientificName: args.item.scientificName ?? "",
      status: (args.item.status ?? "protected") as any,
      safetyTips: args.item.safetyTips ?? [],
      tags: args.item.tags ?? [],
    }

    await saveItems(ctx, 'wildlife', [...items, nextItem])
    return id
  },
})

export const createNewsItem = mutation({
  args: {
    adminEmail: v.string(),
    item: v.object({
      type: newsItemValidator.fields.type,
      title: v.string(),
      excerpt: v.string(),
      body: v.string(),
      date: v.string(),
      image: v.string(),
      category: v.string(),
    }),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const items = await getItems<NewsItem>(ctx, 'news', defaultNews.map((item) => ({ ...item })))
    const prefix = args.item.type === 'event' ? 'ev' : 'nw'
    const id = `${prefix}-${Date.now()}`
    const nextItem: NewsItem = { ...args.item, id }
    await saveItems(ctx, 'news', [...items, nextItem])
    return id
  },
})

export const updateWildlifeItem = mutation({
  args: {
    adminEmail: v.string(),
    item: wildlifeItemValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const fallback = getMappedDefaultWildlife()
    const items = await getItems<WildlifeItem>(ctx, 'wildlife', fallback)
    
    let finalImages: string[] = []
    if (Array.isArray(args.item.images)) {
      finalImages = args.item.images.map((img) => {


  return img
})
    } else if (typeof (args.item as any).image === 'string' && (args.item as any).image) {


finalImages = [(args.item as any).image]
    }
    const normalizedItem: WildlifeItem = {
      id: args.item.id,
      commonName: args.item.commonName,
      description: args.item.description,
      category: args.item.category as any,
      habitat: args.item.habitat,
      diet: args.item.diet,
      activeTime: args.item.activeTime as any,
      ecologicalImportance: args.item.ecologicalImportance,
      images: finalImages,
      localName: args.item.localName ?? "",
      scientificName: args.item.scientificName ?? "",
      status: (args.item.status ?? "protected") as any,
      safetyTips: args.item.safetyTips ?? [],
      tags: args.item.tags ?? [],
    }

    const next = items.map((item) =>
      item.id === args.item.id
        ? normalizedItem
        : {
            ...item,
            images: Array.isArray(item.images) ? item.images : [],
          }
    )
    if (!next.some((item) => item.id === args.item.id)) {
      throw new Error('Species not found.')
    }
    await saveItems(ctx, 'wildlife', next)
    return null
  },
})

export const deleteWildlifeItem = mutation({
  args: { adminEmail: v.string(), itemId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const fallback = getMappedDefaultWildlife()
    const items = await getItems<WildlifeItem>(ctx, 'wildlife', fallback)
    const next = items.filter((item) => item.id !== args.itemId)
    if (next.length === items.length) {
      throw new Error('Species not found.')
    }
    await saveItems(ctx, 'wildlife', next)
    return null
  },
})

export const updateNewsItem = mutation({
  args: {
    adminEmail: v.string(),
    item: newsItemValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const items = await getItems<NewsItem>(ctx, 'news', defaultNews.map((item) => ({ ...item })))
    const next = items.map((item) => (item.id === args.item.id ? args.item : item))
    if (!next.some((item) => item.id === args.item.id)) {
      throw new Error('Item not found.')
    }
    await saveItems(ctx, 'news', next)
    return null
  },
})

export const deleteNewsItem = mutation({
  args: { adminEmail: v.string(), itemId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const items = await getItems<NewsItem>(ctx, 'news', defaultNews.map((item) => ({ ...item })))
    const next = items.filter((item) => item.id !== args.itemId)
    if (next.length === items.length) {
      throw new Error('Item not found.')
    }
    await saveItems(ctx, 'news', next)
    return null
  },
})
