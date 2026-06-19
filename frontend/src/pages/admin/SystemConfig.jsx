import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

export default function SystemConfig() {
  const [config, setConfig] = useState({})
  const [logRetention, setLogRetention] = useState('30')
  const [saving, setSaving] = useState(false)
  const [shutdownMode, setShutdownMode] = useState(false)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getConfig()
        setConfig(res.config || {})
        setLogRetention(res.config?.logRetentionDays || '30')
        setShutdownMode(res.config?.maintenanceMode === 'true')
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  async function handleSaveRetention() {
    try {
      setSaving(true)
      setMessage(null)
      await adminApi.updateConfig('logRetentionDays', logRetention)
      setMessage({ type: 'success', text: `Log retention set to ${logRetention} days.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleCleanupNow() {
    try {
      setSaving(true)
      setMessage(null)
      const res = await adminApi.cleanupLogs(parseInt(logRetention, 10))
      setMessage({ type: 'success', text: res.message })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to cleanup.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleMaintenance() {
    try {
      setSaving(true)
      setMessage(null)
      const newVal = (!shutdownMode).toString()
      await adminApi.updateConfig('maintenanceMode', newVal)
      setShutdownMode(!shutdownMode)
      setMessage({
        type: 'success',
        text: !shutdownMode
          ? 'Maintenance mode enabled. The landing page will show a maintenance notice.'
          : 'Maintenance mode disabled.',
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to toggle.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Config</h1>
        <p className="mt-1 text-sm text-gray-500">
          System-wide configuration and maintenance controls.
        </p>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">Log Retention</h3>
          <p className="mt-1 text-sm text-gray-500">
            Auto-delete audit logs older than the specified number of days.
          </p>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Delete logs older than (days)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={365}
                value={logRetention}
                onChange={(e) => setLogRetention(e.target.value)}
                className="w-32 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <span className="text-sm text-gray-400">days</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSaveRetention}
              disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCleanupNow}
              disabled={saving}
              className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Delete Old Logs Now
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">Maintenance</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enable maintenance mode to show a shutdown notice on the landing page.
          </p>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {shutdownMode
                  ? 'The landing page is currently in maintenance mode.'
                  : 'The landing page is publicly accessible.'}
              </p>
            </div>
            <button
              onClick={handleToggleMaintenance}
              disabled={saving}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                shutdownMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {shutdownMode ? 'Disable' : 'Shutdown'}
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-800">Shutdown Button</p>
            <p className="mt-1 text-xs text-amber-700">
              Toggling this will put the site into maintenance mode. All visitors will see a maintenance notice instead of the landing page.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900">All Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Raw key-value pairs stored in the system.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(config).length === 0 ? (
              <p className="col-span-full text-sm text-gray-400">No configuration entries yet.</p>
            ) : (
              Object.entries(config).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs font-mono text-gray-700 break-all">{key}</p>
                  <p className="mt-0.5 text-sm text-gray-500 truncate">{typeof value === 'string' && value.length > 60 ? value.slice(0, 60) + '...' : value}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
