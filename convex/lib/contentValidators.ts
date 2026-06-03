import { v } from 'convex/values'

export const wildlifeItemValidator = v.object({
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
  image: v.string(),
  tags: v.array(v.string()),
})

export const newsItemValidator = v.object({
  id: v.string(),
  type: v.union(v.literal('event'), v.literal('news')),
  title: v.string(),
  excerpt: v.string(),
  body: v.string(),
  date: v.string(),
images: v.optional(v.array(v.string())),
  category: v.string(),
})

export const wildlifeListValidator = v.array(wildlifeItemValidator)
export const newsListValidator = v.array(newsItemValidator)
