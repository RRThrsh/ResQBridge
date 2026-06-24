import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const NotificationContext = createContext(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef(null)

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...toast, id }])
    setUnreadCount((prev) => prev + 1)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    const es = new EventSource('/api/v1/report/updates', { withCredentials: true })
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'report:claimed') {
          addToast({ type: 'info', title: 'Report Claimed', message: `Report assigned to ${event.assignedByName || 'a rescuer'}` })
        } else if (event.type === 'report:status') {
          addToast({ type: 'success', title: 'Status Update', message: `Report updated to ${event.status?.replace('_', ' ')}` })
        }
      } catch {}
    }

    es.onerror = () => {}

    return () => es.close()
  }, [addToast])

  return (
    <NotificationContext.Provider value={{ toasts, unreadCount, clearToasts, markAllRead }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-2xl border-2 px-5 py-4 shadow-lg bg-white text-gray-900 animate-slide-up ${
              t.type === 'success' ? 'border-green-400' : 'border-amber-400'
            }`}
          >
            <p className="text-base font-bold">{t.title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{t.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
