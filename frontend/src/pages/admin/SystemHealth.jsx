import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

export default function SystemHealth() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    adminApi.getHealth()
      .then(setHealth)
      .catch((err) => setError(err.message || 'Failed to fetch health'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  const statusColor = health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
  const statusText = health.status === 'healthy' ? 'All Systems Operational' : 'Degraded'

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System Health</h1>
          <p className="mt-1 text-sm text-gray-500">
            Server and service status overview.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
          <span className="text-xs font-semibold text-gray-700">{statusText}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Server Uptime</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">
            {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{health.uptime.toLocaleString()} seconds</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Node.js</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{health.nodeVersion}</p>
          <p className="mt-0.5 text-xs text-gray-400 capitalize">{health.platform}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Environment</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 capitalize">{health.env}</p>
          <p className="mt-0.5 text-xs text-gray-400">{new Date(health.timestamp).toLocaleString('en-PH')}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={`rounded-xl border p-5 shadow-sm ${
          health.services.convex === 'connected'
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Convex</p>
              <p className={`mt-1 text-lg font-bold ${
                health.services.convex === 'connected' ? 'text-green-700' : 'text-red-700'
              }`}>
                {health.services.convex === 'connected' ? 'Connected' : 'Error'}
              </p>
            </div>
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
              health.services.convex === 'connected' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`h-4 w-4 ${
                health.services.convex === 'connected' ? 'text-green-600' : 'text-red-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {health.services.convex === 'connected'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                }
              </svg>
            </span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 shadow-sm ${
          health.services.redis === 'connected'
            ? 'border-green-200 bg-green-50'
            : health.services.redis === 'disabled'
            ? 'border-gray-200 bg-gray-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Redis</p>
              <p className={`mt-1 text-lg font-bold ${
                health.services.redis === 'connected' ? 'text-green-700' :
                health.services.redis === 'disabled' ? 'text-gray-500' : 'text-red-700'
              }`}>
                {health.services.redis === 'connected' ? 'Connected' :
                 health.services.redis === 'disabled' ? 'Disabled' : 'Error'}
              </p>
            </div>
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
              health.services.redis === 'connected' ? 'bg-green-100' :
              health.services.redis === 'disabled' ? 'bg-gray-100' : 'bg-red-100'
            }`}>
              <svg className={`h-4 w-4 ${
                health.services.redis === 'connected' ? 'text-green-600' :
                health.services.redis === 'disabled' ? 'text-gray-400' : 'text-red-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {health.services.redis === 'connected'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : health.services.redis === 'disabled'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                }
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Memory Usage</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Heap Used</p>
            <p className="text-xl font-bold text-gray-900">{health.memory.heapUsed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Heap Total</p>
            <p className="text-xl font-bold text-gray-900">{health.memory.heapTotal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">RSS</p>
            <p className="text-xl font-bold text-gray-900">{health.memory.rss}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
