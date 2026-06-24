import { useState, useEffect } from 'react'
import { useNotifications } from '../../context/NotificationContext'

export default function RescuerNotifications() {
  const { toasts, unreadCount, markAllRead, clearToasts } = useNotifications()
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (toasts.length > 0) {
      setHistory((prev) => {
        const existing = new Set(prev.map((t) => t.id))
        const newOnes = toasts.filter((t) => !existing.has(t.id))
        return [...newOnes, ...prev]
      })
    }
  }, [toasts])

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-lg text-gray-500">
              {history.length} total{unreadCount > 0 ? ` - ${unreadCount} unread` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="rounded-xl bg-amber-600 px-5 py-3 text-base font-bold text-white hover:bg-amber-700 transition-colors shadow"
              >
                Mark All Read
              </button>
            )}
            {history.length > 0 && (
              <button
                onClick={() => { clearToasts(); setHistory([]) }}
                className="rounded-xl bg-gray-100 px-5 py-3 text-base font-bold text-gray-700 hover:bg-gray-200 border-2 border-gray-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">No notifications</h3>
            <p className="mt-2 text-base text-gray-500">You will see updates here when reports are claimed or statuses change.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((t) => (
              <div
                key={t.id}
                className={`rounded-2xl border-2 bg-white px-6 py-5 transition-all ${
                  t.type === 'success' ? 'border-green-300' : 'border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    t.type === 'success' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <svg className={`h-4 w-4 ${t.type === 'success' ? 'text-green-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {t.type === 'success'
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      }
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-gray-900">{t.title}</p>
                    <p className="mt-0.5 text-sm text-gray-600">{t.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
