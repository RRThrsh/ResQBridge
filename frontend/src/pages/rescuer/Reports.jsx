import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const API_BASE = '/api/v1'

const URGENCY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700',
  emergency: 'bg-red-50 text-red-700',
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const CATEGORY_LABELS = {
  injury: 'Injured / In Distress',
  stranded: 'Stranded',
  missing: 'Missing Pet / Animal',
  found: 'Found Animal',
  abandoned: 'Abandoned',
  other: 'Other',
}

export default function RescuerReports() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user || (user.role !== 'rescuer' && user.role !== 'admin' && user.role !== 'superadmin')) {
      navigate(user ? '/' : '/v1/login', { replace: true })
      return
    }
    fetchReports()
  }, [user, navigate])

  async function fetchReports(status) {
    setLoading(true)
    try {
      const params = status ? `?status=${status}` : ''
      const res = await fetch(`${API_BASE}/rescuer/reports${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok) setReports(data.reports || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  function handleFilterChange(status) {
    setFilter(status)
    fetchReports(status)
  }

  if (!user) return null

  const filtered = filter ? reports : reports

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Animal Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Incoming rescue requests from the public</p>
          </div>
          <div className="flex gap-2">
            {['', 'pending', 'in_progress', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s ? s.replace('_', ' ') : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-400">No reports yet</p>
            <p className="mt-1 text-xs text-gray-400">Submitted reports will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r._id} className="rounded-xl border border-gray-200 bg-white transition hover:shadow-sm">
                <button
                  onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left"
                >
                  <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    r.urgency === 'emergency' ? 'bg-red-500 animate-pulse' :
                    r.urgency === 'high' ? 'bg-orange-500' :
                    r.urgency === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_COLORS[r.urgency] || ''}`}>
                        {r.urgency}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                      {CATEGORY_LABELS[r.category] || r.category} &middot; {r.animalType} &middot; {r.location}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <svg className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition ${expanded === r._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {expanded === r._id && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Contact</p>
                        <p className="mt-0.5 text-sm text-gray-900">{r.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Category</p>
                        <p className="mt-0.5 text-sm text-gray-900">{CATEGORY_LABELS[r.category] || r.category}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Animal Type</p>
                        <p className="mt-0.5 text-sm text-gray-900">{r.animalType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Location</p>
                        <p className="mt-0.5 text-sm text-gray-900">{r.location}</p>
                      </div>
                    </div>
                    {r.latitude && r.longitude && (
                      <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium text-gray-400">Coordinates</p>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}&zoom=16`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 underline-offset-2 hover:underline"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {r.latitude}, {r.longitude}
                        </a>
                      </div>
                    )}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-400">Description</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-900">{r.description}</p>
                    </div>
                    {r.images && r.images.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium text-gray-400">Photos</p>
                        <div className="flex flex-wrap gap-2">
                          {r.images.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              <img src={img} alt="" className="h-24 w-36 rounded-lg object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
