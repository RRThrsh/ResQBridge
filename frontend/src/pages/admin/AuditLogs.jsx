import { useState, useEffect, useCallback, useRef } from 'react'
import { admin as adminApi } from '../../services/api'

const EVENT_CONFIG = {
  login:          { color: 'text-green-400', bg: 'bg-green-500/10', label: 'LOGIN', icon: '→' },
  login_attempt:  { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'ATTEMPT', icon: '?' },
  logout:         { color: 'text-red-400', bg: 'bg-red-500/10', label: 'LOGOUT', icon: '←' },
  register:       { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'REGISTER', icon: '+' },
  guest:          { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'GUEST', icon: '●' },
  password_reset: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'RESET', icon: '🔑' },
  role_change:    { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'ROLE', icon: '⚡' },
  config_update:  { color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'CONFIG', icon: '⚙' },
  landing_update: { color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'LANDING', icon: '✎' },
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  return d.toLocaleString('en-PH', {
    month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' })
}

function parseMeta(log) {
  if (!log.metadata) return null
  try {
    return typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata
  } catch {
    return { raw: log.metadata }
  }
}

function UserCell({ log, meta }) {
  if (log.userId) {
    return (
      <span className="truncate font-medium text-gray-200" title={`UUID: ${log.userId}`}>
        {meta?.email || log.userId.slice(0, 12)}
      </span>
    )
  }
  return <span className="text-gray-500">guest</span>
}

function MetaPreview({ meta }) {
  if (!meta) return <span className="text-gray-600">—</span>
  const text = meta.email || meta.reason || meta.action || meta.newRole || meta.key || Object.values(meta).filter(v => typeof v === 'string').join(', ') || JSON.stringify(meta)
  return <span className="truncate text-gray-400">{String(text).slice(0, 80)}</span>
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  const ip = (log.ipAddress || '').replace(/^::ffff:/, '')
  const cfg = EVENT_CONFIG[log.eventType] || { color: 'text-gray-400', bg: 'bg-gray-500/10', label: log.eventType?.toUpperCase() || '---', icon: '?' }
  const meta = parseMeta(log)
  const time = formatTimestamp(log.createdAt || log._creationTime)

  return (
    <>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-2 font-mono text-xs leading-5 transition-colors hover:bg-white/[0.03]"
      >
        <span className="w-20 shrink-0 text-gray-600">{time}</span>
        <span className={`inline-flex w-16 shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-semibold ${cfg.color} ${cfg.bg}`}>
          <span>{cfg.icon}</span>
          <span>{cfg.label}</span>
        </span>
        <span className="w-[4.5rem] shrink-0 text-gray-400">{ip || '0.0.0.0'}</span>
        <span className="w-28 shrink-0"><UserCell log={log} meta={meta} /></span>
        <span className="w-28 shrink-0 truncate text-gray-500">{log.section || '—'}</span>
        <span className="w-12 shrink-0 text-right text-gray-500 tabular-nums">{formatDuration(log.sessionDuration)}</span>
        <span className="min-w-0 flex-1"><MetaPreview meta={meta} /></span>
        <svg className={`h-3 w-3 shrink-0 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {expanded && (
        <div className="border-b border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-[11px] leading-relaxed text-gray-400">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            <div><span className="text-gray-600">Event Type:</span> {log.eventType}</div>
            <div><span className="text-gray-600">IP Address:</span> {ip}</div>
            <div><span className="text-gray-600">User ID:</span> {log.userId || 'N/A'}</div>
            <div><span className="text-gray-600">User Agent:</span> {(log.userAgent || 'N/A').slice(0, 80)}</div>
            <div><span className="text-gray-600">Section:</span> {log.section || 'N/A'}</div>
            <div><span className="text-gray-600">Duration:</span> {formatDuration(log.sessionDuration)}</div>
            <div><span className="text-gray-600">Created:</span> {formatDate(log.createdAt || log._creationTime)}</div>
            <div><span className="text-gray-600">Log ID:</span> {log._id}</div>
          </div>
          {meta && (
            <div className="mt-2">
              <div className="text-gray-600 mb-1">Metadata:</div>
              <pre className="overflow-x-auto rounded bg-black/30 p-2 text-[11px] text-gray-300">{JSON.stringify(meta, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const scrollBottomRef = useRef(null)

  const displayedLogs = [...logs].reverse()

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const [logRes, statRes] = await Promise.all([
        adminApi.getLogs({ limit: 500 }),
        adminApi.getLogStats(),
      ])
      setLogs(logRes.items || [])
      setStats(statRes.stats)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  useEffect(() => {
    if (logs.length) scrollToBottom()
  }, [logs, scrollToBottom])

  const eventBreakdown = stats?.eventBreakdown || {}
  const totalLogs = stats?.totalLogs || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete transaction trail — every action logged with IP, user, and metadata.
        </p>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-5 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Total Logs</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{totalLogs.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Unique IPs</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{stats.uniqueIPs}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Avg Session</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{stats.avgDuration ? formatDuration(stats.avgDuration) : '—'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Top IP</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900 font-mono text-sm">
              {stats.ipBreakdown?.[0]?.ip?.replace(/^::ffff:/, '') || '—'}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Event Types</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{Object.keys(eventBreakdown).length}</p>
          </div>
        </div>
      )}

      {stats && Object.keys(eventBreakdown).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(eventBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const cfg = EVENT_CONFIG[type] || { color: 'text-gray-500', bg: 'bg-gray-100' }
            return (
              <div
                key={type}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
              >
                <span>{cfg.icon || '?'}</span>
                <span>{type.replace(/_/g, ' ')}</span>
                <span className="ml-0.5 opacity-60">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950 shadow-inner">
        <div className="flex items-center gap-3 border-b border-white/10 bg-gray-900/50 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span className="w-20 shrink-0">Time</span>
          <span className="w-16 shrink-0">Event</span>
          <span className="w-[4.5rem] shrink-0">IP</span>
          <span className="w-28 shrink-0">User</span>
          <span className="w-28 shrink-0">Section</span>
          <span className="w-12 shrink-0 text-right">Dur</span>
          <span className="min-w-0 flex-1">Details</span>
          <span className="w-4" />
        </div>

        <div className="max-h-[65dvh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-600 font-mono">
              Loading transaction log...
            </div>
          ) : displayedLogs.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-600 font-mono">
              No entries found.
            </div>
          ) : (
            displayedLogs.map((log) => <LogRow key={log._id} log={log} />)
          )}
          <div ref={scrollBottomRef} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 font-mono">
        <span>{logs.length} entries displayed · {totalLogs.toLocaleString()} total</span>
        <span>auto-refresh · 5s</span>
      </div>
    </div>
  )
}