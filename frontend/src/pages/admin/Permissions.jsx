import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const ROLES = [
  { key: 'superadmin', label: 'Superadmin', color: 'text-red-700 bg-red-100' },
  { key: 'admin', label: 'Admin', color: 'text-blue-700 bg-blue-100' },
  { key: 'rescuer', label: 'Rescuer', color: 'text-amber-700 bg-amber-100' },
  { key: 'user', label: 'User', color: 'text-gray-700 bg-gray-100' },
]

const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', desc: 'View analytics and charts' },
  { key: 'users', label: 'User Management', desc: 'View, edit, and manage users' },
  { key: 'audit', label: 'Audit Logs', desc: 'View system activity logs' },
  { key: 'reports_view', label: 'View Reports', desc: 'Browse all submitted reports' },
  { key: 'reports_assign', label: 'Assign Reports', desc: 'Assign reports to rescuers' },
  { key: 'rescuer_map', label: 'Rescuer Map', desc: 'View rescuer live locations' },
  { key: 'config_view', label: 'View Config', desc: 'Read system configuration' },
  { key: 'config_edit', label: 'Edit Config', desc: 'Modify system configuration' },
  { key: 'landing_edit', label: 'Edit Landing Page', desc: 'Modify landing page content' },
  { key: 'permissions', label: 'Permissions', desc: 'View and manage role permissions' },
  { key: 'upload', label: 'Upload Media', desc: 'Upload images and files' },
]

const ROLE_PERMISSIONS = {
  superadmin: PERMISSIONS.map((p) => p.key),
  admin: ['dashboard', 'users', 'reports_view', 'reports_assign', 'rescuer_map', 'permissions'],
  rescuer: ['dashboard', 'reports_view'],
  user: [],
}

export default function Permissions() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getUsers()
      .then((res) => setUsers(res.users || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const roleCounts = {}
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Role-based access control matrix — {users.length} total users
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {ROLES.map((role) => (
          <div key={role.key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${role.color}`}>
              {role.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{roleCounts[role.key] || 0}</p>
            <p className="text-sm text-gray-500">users</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-64">
                Permission
              </th>
              {ROLES.map((role) => (
                <th key={role.key} className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${role.color}`}>
                    {role.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PERMISSIONS.map((perm) => (
              <tr key={perm.key} className="transition-colors hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{perm.label}</p>
                  <p className="text-xs text-gray-500">{perm.desc}</p>
                </td>
                {ROLES.map((role) => {
                  const hasPermission = ROLE_PERMISSIONS[role.key]?.includes(perm.key)
                  return (
                    <td key={role.key} className="px-4 py-4 text-center">
                      {hasPermission ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Manage Roles</p>
            <p className="mt-1 text-sm text-amber-700">
              To change a user&apos;s role, go to the{' '}
              <span className="font-semibold">Users</span> tab. Role changes are
              logged in Audit Logs. Only one superadmin is allowed at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
