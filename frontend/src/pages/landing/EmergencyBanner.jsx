import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ALERT_TYPES = {
  info: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { bg: 'bg-amber-600', hover: 'hover:bg-amber-700', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  danger: { bg: 'bg-red-600', hover: 'hover:bg-red-700', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
}

export default function EmergencyBanner({ message, type = 'info', active = false, linkText, ctaText }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('emergencyBannerDismissed') === 'true' } catch { return false }
  })

  useEffect(() => {
    if (!dismissed) {
      try { sessionStorage.setItem('emergencyBannerDismissed', 'false') } catch {}
    }
  }, [dismissed])

  if (!active || dismissed) return null

  const alert = ALERT_TYPES[type] || ALERT_TYPES.info

  return (
    <div className={`${alert.bg} relative isolate overflow-hidden`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-3 text-sm text-white">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={alert.icon} />
          </svg>
          <span className="font-medium">{message}</span>
          {(linkText && ctaText) && (
            <Link to={linkText} className={`ml-2 shrink-0 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${alert.hover} bg-white/15 transition-colors`}>
              {ctaText}
            </Link>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 shrink-0 rounded-lg p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
