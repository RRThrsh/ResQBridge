import { useState, useEffect, useCallback } from 'react'
import { admin as adminApi } from '../../services/api'

const EVENT_COLORS = {
  login: 'text-green-400',
  login_attempt: 'text-yellow-400',
  logout: 'text-red-400',
  changes: 'text-blue-400',
  updates: 'text-cyan-400',
  guest: 'text-purple-400',
  register: 'text-emerald-400',
}

const EVENT_LABELS = {
  login: 'LOGIN',
  login_attempt: 'ATTEMPT',
  logout: 'LOGOUT',
  changes: 'CHANGE',
  updates: 'UPDATE',
  guest: 'GUEST',
  register: 'REGISTER',
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--'
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

function LogRow({ log }) {
  const ip = log.ipAddress?.replace(/^::ffff:/, '') || '0.0.0.0'
  const color = EVENT_COLORS[log.eventType] || 'text-gray-400'
  const label = EVENT_LABELS[log.eventType] || log.eventType?.toUpperCase() || '---'
  const section = (log.section || '―').padEnd(16)
  const duration = formatDuration(log.sessionDuration).padStart(8)
  const time = formatTimestamp(log.createdAt || log._creationTime)
  const user = (log.userId || 'guest').slice(0, 8).padEnd(8)

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-white/5 px-4 py-1.5 font-mono text-xs leading-5 hover:bg-white/[0.02]">
      <span className="w-20 shrink-0 text-gray-600">{time}</span>
      <span className={`w-18 shrink-0 font-semibold ${color}`}>{label}</span>
      <span className="w-20 shrink-0 text-gray-400">{ip}</span>
      <span className="w-9 shrink-0 text-gray-500">{user}</span>
      <span className="w-32 shrink-0 truncate text-gray-500">{section}</span>
      <span className="w-10 shrink-0 text-right text-gray-500 tabular-nums">{duration}</span>
      <span className="min-w-0 flex-1 truncate text-gray-600">
        {log.metadata ? (() => {
          try {
            const m = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata
            return m.email || m.reason || m.action || JSON.stringify(m).slice(0, 60)
          } catch { return log.metadata.slice(0, 60) }
        })() : '―'}
      </span>
    </div>
  )
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const opts = { limit: 500 }
      if (filterEvent) opts.eventType = filterEvent
      const [logRes, statRes] = await Promise.all([
        adminApi.getLogs(opts),
        adminApi.getLogStats(),
      ])
      setLogs(logRes.items || [])
      setStats(statRes.stats)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [filterEvent])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time audit trail with IP tracking and session duration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
            <option value="">All Events</option>
            <option value="login">Login</option>
            <option value="login_attempt">Login Attempt</option>
            <option value="logout">Logout</option>
            <option value="guest">Guest Visit</option>
            <option value="register">Register</option>
            <option value="changes">Changes</option>
            <option value="updates">Updates</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
            Auto-refresh
          </label>
          <button onClick={fetchLogs} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Total Logs</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{stats.totalLogs}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Unique IPs</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{stats.uniqueIPs}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Avg Session</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">{stats.avgDuration ? formatDuration(stats.avgDuration) : '―'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Top IP</p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900 font-mono text-sm">
              {stats.ipBreakdown?.[0]?.ip?.replace(/^::ffff:/, '') || '―'}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950 shadow-inner">
        <div className="flex items-center gap-3 border-b border-white/10 bg-gray-900/50 px-4 py-2 font-mono text-xs text-gray-500">
          <span className="w-20 shrink-0">TIME</span>
          <span className="w-18 shrink-0">EVENT</span>
          <span className="w-20 shrink-0">IP</span>
          <span className="w-9 shrink-0">USER</span>
          <span className="w-32 shrink-0">SECTION</span>
          <span className="w-10 shrink-0 text-right">DUR</span>
          <span className="min-w-0 flex-1">META</span>
        </div>

        <div className="h-[520px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-600 font-mono">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-600 font-mono">
              No log entries found.
            </div>
          ) : (
            logs.map((log) => <LogRow key={log._id} log={log} />)
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 font-mono">
        {logs.length} entries &middot; tailing {autoRefresh ? 'active' : 'paused'}
      </div>
    </div>
  )
}
