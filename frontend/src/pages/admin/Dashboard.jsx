import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { admin as adminApi } from '../../services/api'
import AuditLogs from './AuditLogs'
import Permissions from './Permissions'
import Monitoring from './Monitoring'
import EditConfig from './EditConfig'
import SystemConfig from './SystemConfig'

const roleBadge = {
  superadmin: 'bg-red-100 text-red-800',
  admin: 'bg-blue-100 text-blue-800',
  rescuer: 'bg-amber-100 text-amber-800',
  user: 'bg-gray-100 text-gray-800',
}

const roleLabels = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  rescuer: 'Rescuer',
  user: 'User',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null)

  const sidebarLinks = [
    { key: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { key: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { key: 'audit', label: 'Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { key: 'permissions', label: 'Permissions', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { key: 'monitoring', label: 'Monitoring', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { key: 'editConfig', label: 'Edit Config', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { key: 'config', label: 'Config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ]

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [usersRes, statsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getStats(),
      ])
      setUsers(usersRes.users)
      setStats(statsRes.stats)
    } catch (err) {
      setError(err.message || 'Failed to load admin data')
      if (err.status === 401 || err.status === 403) {
        navigate('/v1/login')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (!user) {
      navigate('/v1/login')
      return
    }
    fetchData()
  }, [user, navigate, fetchData])

  async function handleRoleChange(uuid, newRole) {
    try {
      setUpdating(uuid)
      await adminApi.updateUserRole(uuid, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.uuid === uuid ? { ...u, role: newRole } : u))
      )
      setStats(null)
      const statsRes = await adminApi.getStats()
      setStats(statsRes.stats)
    } catch (err) {
      setError(err.message || 'Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  if (loading && !users.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <Link to="/" className="text-xl font-bold text-green-600">
            ResQBridge
          </Link>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => setActiveTab(link.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === link.key
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
              </svg>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-3 py-4">
          <div className="mb-3 px-3 text-sm text-gray-500">
            {user?.firstName} {user?.lastName}
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.firstName}. Here is your overview.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Users" value={stats?.totalUsers ?? '-'} color="green" />
                <StatCard label="Superadmins" value={stats?.roleCounts?.superadmin ?? '-'} color="red" />
                <StatCard label="Admins" value={stats?.roleCounts?.admin ?? '-'} color="blue" />
                <StatCard label="Rescuers" value={stats?.roleCounts?.rescuer ?? '-'} color="amber" />
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage all registered users and their roles.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.uuid} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.phoneNumber}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[u.role] || 'bg-gray-100 text-gray-800'}`}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <select
                            value={u.role}
                            disabled={updating === u.uuid || user?.uuid === u.uuid}
                            onChange={(e) => handleRoleChange(u.uuid, e.target.value)}
                            className={`rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none ${
                              updating === u.uuid ? 'opacity-50' : ''
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="rescuer">Rescuer</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'audit' && <AuditLogs />}
          {activeTab === 'permissions' && <Permissions />}
          {activeTab === 'monitoring' && <Monitoring />}
          {activeTab === 'editConfig' && <EditConfig />}
          {activeTab === 'config' && <SystemConfig />}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colorMap = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.green}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}
