import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import { assertAdmin } from './lib/adminAccess'
import { defaultNews, defaultWildlife } from './lib/defaultContent'

const wildlifeItemValidator = v.object({
  id: v.string(),
  commonName: v.string(),
  localName: v.string(),
  scientificName: v.string(),
  category: v.union(
    v.literal('mammal'),
    v.literal('bird'),
    v.literal('reptile'),
    v.literal('amphibian'),
    v.literal('marine'),
  ),
  status: v.union(
    v.literal('critically-endangered'),
    v.literal('endangered'),
    v.literal('vulnerable'),
    v.literal('protected'),
  ),
  habitat: v.string(),
  diet: v.string(),
  activeTime: v.union(
    v.literal('diurnal'),
    v.literal('nocturnal'),
    v.literal('crepuscular'),
  ),
  description: v.string(),
  safetyTips: v.array(v.string()),
  ecologicalImportance: v.string(),
  images: v.optional(v.array(v.string())),
  tags: v.array(v.string()),
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

// --- VERCEL FIX: Helper to safely bridge default data to the new schema ---
function getMappedDefaultWildlife(): WildlifeItem[] {
  return defaultWildlife.map((item: any) => {
    const { image, ...rest } = item; // Pull out the old image property if it exists
    return {
      ...rest,
      safetyTips: Array.isArray(item.safetyTips) ? [...item.safetyTips] : [],
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      // Convert old 'image' string into the new 'images' array
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
  returns: v.array(wildlifeItemValidator),
  handler: async (ctx) => {
    return await getItems<WildlifeItem>(
      ctx,
      'wildlife',
      getMappedDefaultWildlife() // Use the helper
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
        itemsJson: JSON.stringify(getMappedDefaultWildlife()), // Use the helper
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
      localName: v.string(),
      scientificName: v.string(),
      category: wildlifeItemValidator.fields.category,
      status: wildlifeItemValidator.fields.status,
      habitat: v.string(),
      diet: v.string(),
      activeTime: wildlifeItemValidator.fields.activeTime,
      description: v.string(),
      safetyTips: v.array(v.string()),
      ecologicalImportance: v.string(),
      images: v.array(v.string()),
      tags: v.array(v.string()),
    }),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.adminEmail)
    const fallback = getMappedDefaultWildlife() // Use the helper
    const items = await getItems<WildlifeItem>(ctx, 'wildlife', fallback)
    const baseId = slugId(args.item.commonName, `species-${Date.now()}`)
    let id = baseId
    let suffix = 1
    while (items.some((item) => item.id === id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    const nextItem: WildlifeItem = { ...args.item, id }
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
    const items = await getItems<NewsItem>(
      ctx,
      'news',
      defaultNews.map((item) => ({ ...item })),
    )
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
    const fallback = getMappedDefaultWildlife() // Use the helper
    const items = await getItems<WildlifeItem>(ctx, 'wildlife', fallback)
    const next = items.map((item) => (item.id === args.item.id ? args.item : item))
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
    const fallback = getMappedDefaultWildlife() // Use the helper
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
    const items = await getItems<NewsItem>(
      ctx,
      'news',
      defaultNews.map((item) => ({ ...item })),
    )
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
    const items = await getItems<NewsItem>(
      ctx,
      'news',
      defaultNews.map((item) => ({ ...item })),
    )
    const next = items.filter((item) => item.id !== args.itemId)
    if (next.length === items.length) {
      throw new Error('Item not found.')
    }
    await saveItems(ctx, 'news', next)
    return null
  },
})
