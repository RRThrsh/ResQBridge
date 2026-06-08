import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'

const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL ?? '')

let guestSessionId: string | null = null

function getSessionId(): string {
  if (guestSessionId) return guestSessionId
  let id = localStorage.getItem('guest_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('guest_session_id', id)
  }
  guestSessionId = id
  return id
}

export function useGuestLogger(skip?: boolean) {
  const location = useLocation()
  const lastPath = useRef('')

  useEffect(() => {
    if (skip) return
    if (!import.meta.env.VITE_CONVEX_URL) return
    const path = location.pathname + location.search
    if (path === lastPath.current) return
    lastPath.current = path

    const sessionId = getSessionId()

    client.mutation(api.auditLogs.fromAction, {
      action: 'guest.page_view',
      actorEmail: sessionId,
      actorName: `Guest (${path})`,
      actorRole: 'guest',
      targetType: 'page',
      targetId: path,
    }).catch((e) => console.warn('[guest-logger]', e))
  }, [location.pathname, location.search])
}
