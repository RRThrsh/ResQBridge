import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const roleBadge = {
  superadmin: 'bg-red-100 text-red-800',
  admin: 'bg-blue-100 text-blue-800',
  rescuer: 'bg-amber-100 text-amber-800',
}

const roleLabels = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  rescuer: 'Rescuer',
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export default function RescuerDashboard() {
  const { user: ctxUser, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = ctxUser || getUser()

  useEffect(() => {
    if (!user || user.role !== 'rescuer') {
      navigate(user ? '/' : '/v1/login', { replace: true })
    }
  }, [user, navigate])

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!user || user.role !== 'rescuer') return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-sm font-bold text-white">
            R
          </div>
          <span className="text-lg font-semibold text-gray-900">ResQBridge</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </div>
          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </button>

          </nav>
        </div>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[user.role] || ''}`}>
              {roleLabels[user.role] || user.role}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.firstName}</h1>
              <p className="mt-1 text-sm text-gray-500">Your rescuer dashboard</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Requests</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">0</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</p>
                <p className="mt-2 text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">On Duty</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">--</p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900">Profile</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-400">Name</p>
                  <p className="mt-0.5 text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Email</p>
                  <p className="mt-0.5 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Role</p>
                  <p className="mt-0.5 text-sm text-gray-900">{roleLabels[user.role] || user.role}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Member Since</p>
                  <p className="mt-0.5 text-sm text-gray-900">--</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-400">No pending requests</p>
              <p className="mt-1 text-xs text-gray-400">New rescue requests will appear here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
