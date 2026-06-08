import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getAuthApiUrl } from '@/lib/auth-api-base'

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
    const path = location.pathname + location.search
    if (path === lastPath.current) return
    lastPath.current = path

    const sessionId = getSessionId()
    let url: string
    try {
      url = getAuthApiUrl('/api/log-guest')
    } catch {
      return
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        page: path,
        action: 'guest.page_view',
        referrer: document.referrer,
      }),
    }).catch(() => {})
  }, [location.pathname, location.search])
}
