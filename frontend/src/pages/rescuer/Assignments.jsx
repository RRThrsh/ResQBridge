import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { rescuer as rescuerApi } from '../../services/api'

const LOCAL_BADGES = {
  new: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  accepted: 'bg-blue-100 text-blue-800 border-blue-300',
  en_route: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
}

const URGENCY_LABEL = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', class: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', class: 'bg-orange-100 text-orange-800' },
  emergency: { label: 'Emergency', class: 'bg-red-100 text-red-800 font-bold' },
}

const CATEGORY_ICONS = {
  injury: '🩺', stranded: '🏝️', missing: '🔍',
  found: '🐾', abandoned: '🏚️', other: '📋',
}

export default function RescuerAssignments() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [acceptedIds, setAcceptedIds] = useState(new Set())
  const [enRouteIds, setEnRouteIds] = useState(new Set())

  function fetchReports() {
    if (!user) return
    setLoading(true)
    const statusParam = filter === 'unaccepted' ? undefined : (filter || undefined)
    rescuerApi.getReports({ assignedTo: user.uuid, status: statusParam })
      .then((data) => {
        let list = data.reports || []
        if (filter === 'unaccepted') {
          list = list.filter((r) => r.status === 'assigned' || r.status === 'pending')
        }
        setReports(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReports() }, [user, filter])

  function handleAccept(reportId) {
    const next = new Set(acceptedIds)
    next.add(reportId)
    setAcceptedIds(next)
  }

  async function handleEnRoute(reportId) {
    setActionLoading(reportId)
    try {
      await rescuerApi.updateReportStatus(reportId, 'en_route')
      const next = new Set(enRouteIds)
      next.add(reportId)
      setEnRouteIds(next)
      fetchReports()
    } catch { alert('Failed to set en route.') }
    finally { setActionLoading(null) }
  }

  async function handleReject(reportId) {
    if (!confirm('Reject this assignment? It will go back to the admin.')) return
    setActionLoading(reportId)
    try {
      await rescuerApi.rejectAssignment(reportId)
      fetchReports()
    } catch { alert('Failed to reject.') }
    finally { setActionLoading(null) }
  }

  if (!user) return null

  const activeCount = reports.filter((r) => r.status !== 'resolved').length

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Assignments</h1>
            <p className="mt-1 text-lg text-gray-500">
              {loading ? 'Loading...' : `${reports.length} total - ${activeCount} active`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: '', label: 'All' },
              { key: 'unaccepted', label: 'New' },
              { key: 'en_route', label: 'En Route' },
              { key: 'in_progress', label: 'Working' },
              { key: 'resolved', label: 'Done' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className={`rounded-xl px-5 py-3 text-base font-bold transition-all border-2 ${
                  filter === s.key
                    ? 'bg-amber-600 text-white shadow border-amber-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:text-amber-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">No assignments</h3>
            <p className="mt-2 text-base text-gray-500">
              {filter === 'unaccepted' ? 'No new assignments' : filter ? `No ${filter.replace('_', ' ')} assignments` : 'No reports have been assigned to you yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => {
              const urgency = URGENCY_LABEL[r.urgency] || URGENCY_LABEL.low
              const isAccepted = acceptedIds.has(r._id)
              const isEnRouted = enRouteIds.has(r._id)
              const badgeKey = r.status === 'resolved' ? 'resolved'
                : r.status === 'in_progress' ? 'in_progress'
                : isEnRouted ? 'en_route'
                : isAccepted ? 'accepted'
                : 'new'
              const badgeClass = LOCAL_BADGES[badgeKey] || LOCAL_BADGES.new
              const badgeLabel = badgeKey === 'new' ? 'New'
                : badgeKey === 'accepted' ? 'Accepted'
                : badgeKey === 'en_route' ? 'En Route'
                : badgeKey === 'in_progress' ? 'Working'
                : 'Done'
              return (
                <div key={r._id} className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm hover:border-amber-400 transition-all">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{CATEGORY_ICONS[r.category] || '📋'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">{r.name}</span>
                        <span className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${urgency.class}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-base text-gray-600">
                        {r.animalType} &middot; {r.location}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-gray-100 flex flex-wrap gap-2">
                    {!isAccepted && !isEnRouted && (
                      <>
                        <button
                          onClick={() => handleAccept(r._id)}
                          className="rounded-xl bg-green-600 px-5 py-2.5 text-base font-bold text-white hover:bg-green-700 transition-colors shadow"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(r._id)}
                          disabled={actionLoading === r._id}
                          className="rounded-xl bg-red-100 px-5 py-2.5 text-base font-bold text-red-700 hover:bg-red-200 transition-colors border-2 border-red-200 disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {isAccepted && !isEnRouted && (
                      <button
                        onClick={() => handleEnRoute(r._id)}
                        disabled={actionLoading === r._id}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-base font-bold text-white hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
                      >
                        {actionLoading === r._id ? '...' : '🚗 En Route'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
