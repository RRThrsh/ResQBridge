import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { newsEvents } from '@/data/events'
import { wildlifeSpecies } from '@/data/wildlife'

export function useWildlifeContent() {
  const rows = useQuery(api.content.listWildlife)
  return rows ?? wildlifeSpecies
}

export function useNewsContent() {
  const rows = useQuery(api.content.listNews)
  return rows ?? newsEvents
}
