import { useState, useEffect, useCallback } from 'react'
import { admin as adminApi } from '../../services/api'

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '―'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export default function Monitoring() {
  const [stats, setStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [logStats, userRes] = await Promise.all([
        adminApi.getLogStats(),
        adminApi.getStats(),
      ])
      setStats(logStats.stats)
      setUserStats(userRes.stats)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  const eventBreakdown = stats?.eventBreakdown || {}
  const ipBreakdown = stats?.ipBreakdown || []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            System-wide activity and usage metrics.
          </p>
        </div>
        <button onClick={fetchAll} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Event Distribution</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(eventBreakdown).map(([event, count]) => (
              <div key={event}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{event.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-gray-900">{count}</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${(count / stats.totalLogs) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Top IP Addresses</h3>
          <div className="mt-4 space-y-2">
            {ipBreakdown.slice(0, 10).map(({ ip, count }, i) => (
              <div key={ip} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs text-gray-400">{i + 1}</span>
                  <span className="font-mono text-gray-700">{ip.replace(/^::ffff:/, '')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-500">{count}x</span>
                  <div className="h-2 w-16 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${Math.min((count / ipBreakdown[0]?.count || 1) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {ipBreakdown.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No IP data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Session Analytics</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Total Log Events</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.totalLogs || 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Unique Visitors (All-time)</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.uniqueIPs || 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Avg Session Duration</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatDuration(stats?.avgDuration)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Registered Users</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{userStats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Section Engagement</h3>
          <div className="mt-4 space-y-2">
            {stats?.sectionBreakdown?.length ? (
              stats.sectionBreakdown.map(({ section, totalDuration, avgDuration, visits }, i) => (
                <div key={section} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs text-gray-400">{i + 1}</span>
                    <span className="capitalize text-gray-700">{section.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{visits}x</span>
                    <span className="w-16 text-right font-mono text-xs text-gray-600">{formatDuration(totalDuration)}</span>
                    <span className="w-16 text-right font-mono text-xs text-gray-400">avg {formatDuration(avgDuration)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">No section engagement data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">IP Deduplication</p>
              <p className="mt-1">{stats?.uniqueIPs || 0} unique IPs out of {stats?.totalLogs || 0} total requests. Same IPs are counted once in unique visitors.</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">Section Engagement</p>
              <p className="mt-1">Average session duration of {formatDuration(stats?.avgDuration)} across all tracked sections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
