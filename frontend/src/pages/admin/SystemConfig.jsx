import { useState, useEffect } from 'react'
import { DoubleConfirmation, SkeletonConfigCard } from '../../components/ui'
import { admin as adminApi } from '../../services/api'

export default function SystemConfig() {
  const [config, setConfig] = useState({})
  const [logRetention, setLogRetention] = useState('30')
  const [saving, setSaving] = useState(false)
  const [shutdownMode, setShutdownMode] = useState(false)
  const [endTime, setEndTime] = useState('')
  const [otpEnabled, setOtpEnabled] = useState(true)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getConfig()
        setConfig(res.config || {})
        setLogRetention(res.config?.logRetentionDays || '30')
        setShutdownMode(res.config?.maintenanceMode === 'true')
        setOtpEnabled(res.config?.otpEnabled !== 'false')
        const saved = res.config?.maintenanceEndTime
        if (saved) {
          const d = new Date(saved)
          const pad = (n) => String(n).padStart(2, '0')
          setEndTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`)
        }
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
      <div>
        <div className="mb-6">
          <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonConfigCard key={i} />)}
        </div>
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
            <DoubleConfirmation
              onConfirm={handleCleanupNow}
              title="Delete Old Logs"
              message="Are you sure you want to permanently delete all log entries older than the specified retention period? This action cannot be undone."
              confirmText="Yes, Delete Logs"
            >
              <button
                disabled={saving}
                className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Delete Old Logs Now
              </button>
            </DoubleConfirmation>
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
            <DoubleConfirmation
              onConfirm={handleToggleMaintenance}
              title={shutdownMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              message={shutdownMode
                ? 'Are you sure you want to disable maintenance mode? The landing page will become publicly accessible again.'
                : 'Are you sure you want to enable maintenance mode? The landing page will show a maintenance notice to all visitors.'
              }
              confirmText={shutdownMode ? 'Yes, Disable' : 'Yes, Shutdown'}
            >
              <button
                disabled={saving}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  shutdownMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {shutdownMode ? 'Disable' : 'Shutdown'}
              </button>
            </DoubleConfirmation>
          </div>

          {shutdownMode && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Back by
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button
                onClick={async () => {
                  try {
                    setSaving(true)
                    setMessage(null)
                    const iso = new Date(endTime).toISOString()
                    await adminApi.updateConfig('maintenanceEndTime', iso)
                    setMessage({ type: 'success', text: 'Maintenance end time saved.' })
                  } catch (err) {
                    setMessage({ type: 'error', text: err.message || 'Failed to save.' })
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving || !endTime}
                className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                Save Time
              </button>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-800">Shutdown Button</p>
            <p className="mt-1 text-xs text-amber-700">
              Toggling this will put the site into maintenance mode. All visitors will see a maintenance notice instead of the landing page.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">Registration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Control whether OTP verification is required during registration.
          </p>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">OTP Verification</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {otpEnabled
                  ? 'Users must verify their email via OTP to register.'
                  : 'Users can register without email verification.'}
              </p>
            </div>
            <DoubleConfirmation
              onConfirm={async () => {
                try {
                  setSaving(true)
                  setMessage(null)
                  const newVal = (!otpEnabled).toString()
                  await adminApi.updateConfig('otpEnabled', newVal)
                  setOtpEnabled(!otpEnabled)
                  setMessage({ type: 'success', text: `OTP verification ${!otpEnabled ? 'disabled' : 'enabled'}.` })
                } catch (err) {
                  setMessage({ type: 'error', text: err.message || 'Failed to update.' })
                } finally {
                  setSaving(false)
                }
              }}
              title={otpEnabled ? 'Disable OTP' : 'Enable OTP'}
              message={otpEnabled
                ? 'Are you sure you want to disable OTP verification? Users will be able to register without email verification.'
                : 'Are you sure you want to enable OTP verification? Users will need to verify their email via OTP to register.'
              }
              confirmText={otpEnabled ? 'Yes, Disable OTP' : 'Yes, Enable OTP'}
            >
              <button
                disabled={saving}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  otpEnabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {otpEnabled ? 'Disable OTP' : 'Enable OTP'}
              </button>
            </DoubleConfirmation>
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
