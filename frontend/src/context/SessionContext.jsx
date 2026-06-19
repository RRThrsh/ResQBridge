import { createContext, useContext, useRef, useCallback, useEffect } from 'react'
import { logs } from '../services/api'
import { useAuth } from './AuthContext'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const { user } = useAuth()
  const timers = useRef({})
  const pendingFlush = useRef(null)
  const queue = useRef([])

  const flush = useCallback(() => {
    if (queue.current.length === 0) return
    const batch = queue.current.splice(0)
    pendingFlush.current = null
    batch.forEach(({ section, duration, eventType }) => {
      logs.trackGuest(section, duration, eventType).catch(() => {})
    })
  }, [])

  const reportSection = useCallback((section, eventType = 'guest') => {
    return (isVisible) => {
      if (isVisible) {
        timers.current[section] = Date.now()
      } else {
        const start = timers.current[section]
        if (start) {
          const duration = Math.round((Date.now() - start) / 1000)
          delete timers.current[section]
          queue.current.push({ section, duration, eventType })
          if (!pendingFlush.current) {
            pendingFlush.current = setTimeout(flush, 2000)
          }
        }
      }
    }
  }, [flush])

  useEffect(() => {
    return () => {
      if (pendingFlush.current) clearTimeout(pendingFlush.current)
      flush()
    }
  }, [flush])

  return (
    <SessionContext.Provider value={{ reportSection }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  return useContext(SessionContext)
}

export function useSectionTracking(sectionName) {
  const { reportSection } = useSessionContext() || {}
  const ref = useRef(null)

  useEffect(() => {
    if (!reportSection) return
    const el = ref.current
    if (!el) return

    const handler = reportSection(sectionName)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => handler(entry.isIntersecting))
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      handler(false)
    }
  }, [sectionName, reportSection])

  return ref
}
