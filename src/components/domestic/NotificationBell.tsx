import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { Bell, Clock, MapPin, X } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useLanguage } from '@/context/LanguageContext'
import { formatDateTime } from '@/lib/dates'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const pending = useQuery(api.domestic.listPendingReports)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const count = pending?.length ?? 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              {t('notifications.title') || 'Notifications'}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {pending === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : count === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              pending.map((report) => (
                <Link
                  key={report._id}
                  to={`/pwrcc/domestic/report/${report._id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex gap-3 px-4 py-3 border-b border-border/50 last:border-0',
                    'hover:bg-muted/50 transition-colors',
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {report.animalName || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {report.type} · {report.speciesId || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <span className="text-[11px] text-muted-foreground/80 truncate">
                        {report.location?.split(',')[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDateTime(report._creationTime)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {count > 0 && (
            <Link
              to="/pwrcc/domestic"
              onClick={() => setOpen(false)}
              className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-muted/50 transition-colors"
            >
              View all pending reports
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
