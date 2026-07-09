import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { rescuer as rescuerApi } from '../../services/api'
import { MedicalIcon, StrandedIcon, SearchIcon, PawIcon, HouseIcon, ClipboardIcon } from '../../components/SvgIcons'

const URGENCY_LABEL = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-700' },
  high: { label: 'High', class: 'bg-red-100 text-red-800 font-bold' },
}

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
}

const CATEGORY_ICONS = {
  injury: MedicalIcon,
  stranded: StrandedIcon,
  missing: SearchIcon,
  found: PawIcon,
  abandoned: HouseIcon,
  other: ClipboardIcon,
}

export default function RescuerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    rescuerApi.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const statCards = [
    {
      label: 'Active Requests',
      value: stats?.activeRequests ?? 0,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      valueColor: 'text-green-700',
    },
    {
      label: 'Resolution Rate',
      value: stats?.resolutionRate != null ? `${stats.resolutionRate}%` : '—',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Avg Response',
      value: stats?.avgResponseTime != null ? `${stats.avgResponseTime} min` : '—',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      valueColor: 'text-purple-700',
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.firstName}
          </h1>
          <p className="mt-1 text-lg text-gray-500">Here is your rescue summary</p>
        </div>

        <div className="grid gap-5 grid-cols-2 sm:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border-2 ${card.border} ${card.bg} p-6 shadow-sm`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.text}`}>
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-gray-700">{card.label}</p>
                  <p className={`mt-1 text-4xl font-extrabold leading-none ${card.valueColor}`}>
                    {loading ? (
                      <span className="inline-block h-9 w-16 animate-pulse rounded bg-gray-300" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && stats?.monthlyTrends?.length > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trends</h2>
            <div className="flex flex-wrap gap-6">
              {stats.monthlyTrends.map((m) => {
                const total = m.assigned || 1
                const rate = m.resolved > 0 ? Math.round((m.resolved / total) * 100) : 0
                return (
                  <div key={m.month} className="flex-1 min-w-[120px]">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 text-center">{m.month}</p>
                    <div className="mt-2 flex justify-center gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-gray-900">{m.assigned}</p>
                        <p className="text-xs text-gray-500">Assigned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-green-600">{m.resolved}</p>
                        <p className="text-xs text-gray-500">Done</p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${rate}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-center text-gray-500">{rate}% resolved</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && stats?.categoryBreakdown?.length > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Animal Breakdown</h2>
            <div className="space-y-3">
              {stats.categoryBreakdown.map((c) => {
                const maxCount = stats.categoryBreakdown[0]?.count || 1
                const pct = Math.round((c.count / maxCount) * 100)
                return (
                  <div key={c.animal}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700">{c.animal}</span>
                      <span className="font-bold text-gray-900">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Assignments</h2>
            <button
              onClick={() => navigate('/rescuer/assignments')}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-base font-bold text-white hover:bg-amber-700 transition-colors shadow"
            >
              View All Reports
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          ) : stats?.recentReports?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentReports.slice(0, 5).map((r) => (
                <div
                  key={r._id}
                  className="rounded-2xl border-2 border-gray-200 bg-white p-5 transition-all hover:border-amber-400 hover:shadow-md cursor-pointer"
                  onClick={() => navigate('/rescuer/assignments')}
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5">{(() => { const Icon = CATEGORY_ICONS[r.category] || ClipboardIcon; return <Icon className="w-7 h-7 text-gray-600" />; })()}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{r.name}</span>
                        <span className={`rounded-full border-2 px-3 py-0.5 text-sm font-semibold ${STATUS_BADGE[r.status] || ''}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                        <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${URGENCY_LABEL[r.urgency]?.class || 'bg-gray-100 text-gray-700'}`}>
                          {URGENCY_LABEL[r.urgency]?.label || r.urgency}
                        </span>
                      </div>
                      <p className="mt-1 text-base text-gray-600">
                        {r.animalType} &middot; {r.location}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
                <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">No assignments yet</h3>
              <p className="mt-2 text-base text-gray-500">Reports assigned to you will show up here</p>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/rescuer/assignments')}
                className="flex w-full items-center gap-3 rounded-xl bg-amber-600 px-5 py-4 text-lg font-bold text-white hover:bg-amber-700 transition-colors shadow"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View My Assignments
              </button>
              <button
                onClick={() => navigate('/rescuer/profile')}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-gray-300 bg-gray-50 px-5 py-4 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Update My Profile
              </button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Account</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-base font-semibold text-gray-600">Role</span>
                <span className="rounded-lg bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 capitalize">{user.role}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-base font-semibold text-gray-600">Email</span>
                <span className="text-base text-gray-900 font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-600">Phone</span>
                <span className="text-base text-gray-900 font-medium">{user.phoneNumber || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
