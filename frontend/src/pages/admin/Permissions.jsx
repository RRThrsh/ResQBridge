import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const FEATURES = [
  { key: 'dashboard', label: 'Dashboard', desc: 'View analytics overview' },
  { key: 'users', label: 'Users', desc: 'Manage user accounts and roles' },
  { key: 'reports', label: 'Reports', desc: 'View and assign rescue reports' },
  { key: 'rescuerMap', label: 'Rescuer Map', desc: 'View rescuer live locations' },
  { key: 'monitoring', label: 'Monitoring', desc: 'Access system monitoring' },
  { key: 'audit', label: 'Audit Logs', desc: 'View system activity logs' },
  { key: 'landingPage', label: 'Landing Page', desc: 'Edit landing page content' },
  { key: 'systemConfig', label: 'System Config', desc: 'Modify system configuration' },
]

const ACTIONS = [
  { key: 'read', label: 'Read', desc: 'View data' },
  { key: 'write', label: 'Write', desc: 'Edit or modify data' },
  { key: 'execute', label: 'Execute', desc: 'Perform actions like assigning' },
]

export default function Permissions() {
  const [permissions, setPermissions] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    adminApi.getAdminPermissions()
      .then((res) => setPermissions(res.permissions || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(feature, action) {
    const current = permissions[feature] || {}
    const next = {
      ...permissions,
      [feature]: { ...current, [action]: !(current[action] || false) },
    }
    setPermissions(next)
    setSaving(true)
    setMessage(null)
    try {
      const res = await adminApi.updateAdminPermissions(next)
      setPermissions(res.permissions || next)
      setMessage({ type: 'success', text: 'Permissions saved.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set Read / Write / Execute permissions for each feature. These apply
          to all users with the <strong>admin</strong> role. Superadmin always
          has full access to everything.
        </p>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-56">
                Feature
              </th>
              {ACTIONS.map((action) => (
                <th key={action.key} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <div>{action.label}</div>
                  <div className="text-[10px] font-normal text-gray-400">{action.desc}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {FEATURES.map((feature) => {
              const featurePerms = permissions[feature.key] || {}
              return (
                <tr key={feature.key} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900">{feature.label}</p>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </td>
                  {ACTIONS.map((action) => {
                    const enabled = featurePerms[action.key] === true
                    return (
                      <td key={action.key} className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleToggle(feature.key, action.key)}
                          disabled={saving}
                          className={`mx-auto flex h-7 w-12 items-center rounded-full transition-colors ${
                            enabled ? 'bg-green-500' : 'bg-gray-300'
                          } disabled:opacity-60`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {saving && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving...
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Dashboard is always readable for admin users. Changes take effect
        immediately.
      </p>
    </div>
  )
}
