import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { DoubleConfirmation, SkeletonCard } from '../../components/ui'
import { rescuer as rescuerApi } from '../../services/api'
import ReportMap from './ReportMap'
import { MedicalIcon, StrandedIcon, SearchIcon, PawIcon, HouseIcon, ClipboardIcon, RefreshIcon, CheckCircleIcon } from '../../components/SvgIcons'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'urgency', label: 'Urgency' },
]

const URGENCY_LABEL = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', class: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', class: 'bg-orange-100 text-orange-800' },
  emergency: { label: 'Emergency', class: 'bg-red-100 text-red-800 font-bold' },
}

const STATUS_LABEL = {
  pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Resolved', class: 'bg-green-100 text-green-800' },
}

const CATEGORY_ICONS = {
  injury: MedicalIcon,
  stranded: StrandedIcon,
  missing: SearchIcon,
  found: PawIcon,
  abandoned: HouseIcon,
  other: ClipboardIcon,
}

const CATEGORY_LABELS = {
  injury: 'Injured / In Distress',
  stranded: 'Stranded',
  missing: 'Missing Pet / Animal',
  found: 'Found Animal',
  abandoned: 'Abandoned',
  other: 'Other',
}

function TimeAgo({ date }) {
  const now = Date.now()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RescuerReports() {
  const { user, loading: authLoading } = useAuth()
  const { userPos, requestLocation } = useLocationContext()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [noteInputs, setNoteInputs] = useState({})
  const [notesMap, setNotesMap] = useState({})
  const eventSourceRef = useRef(null)

  useEffect(() => { requestLocation() }, [requestLocation])

  const fetchReports = useCallback(async (status, searchVal, sortVal) => {
    setLoading(true)
    try {
      const params = {}
      if (status) params.status = status
      if (searchVal) params.search = searchVal
      if (sortVal && sortVal !== 'newest') params.sortBy = sortVal
      const data = await rescuerApi.getReports(params)
      setReports(data.reports || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user || (user.role !== 'rescuer' && user.role !== 'admin' && user.role !== 'superadmin')) {
      navigate(user ? '/' : '/v1/login', { replace: true })
      return
    }
    fetchReports(filter, search, sortBy)
  }, [user, authLoading, navigate, fetchReports, filter, search, sortBy])

  useEffect(() => {
    const es = new EventSource('/api/v1/report/updates', { withCredentials: true })
    eventSourceRef.current = es
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'report:claimed' || event.type === 'report:status') {
          fetchReports(filter, search, sortBy)
        }
      } catch {}
    }
    es.onerror = () => {}
    return () => es.close()
  }, [fetchReports, filter, search, sortBy])

  function handleFilterChange(status) {
    setFilter(status)
    setExpanded(null)
  }

  function handleSearch(val) {
    setSearch(val)
    setExpanded(null)
  }

  function handleSortChange(val) {
    setSortBy(val)
    setExpanded(null)
  }

  async function loadNotes(reportId) {
    if (notesMap[reportId]) return
    try {
      const data = await rescuerApi.getNotes(reportId)
      setNotesMap((prev) => ({ ...prev, [reportId]: data.notes || [] }))
    } catch {}
  }

  async function handleAddNote(reportId) {
    const content = noteInputs[reportId]?.trim()
    if (!content) return
    try {
      await rescuerApi.addNote(reportId, content)
      setNoteInputs((prev) => ({ ...prev, [reportId]: '' }))
      const data = await rescuerApi.getNotes(reportId)
      setNotesMap((prev) => ({ ...prev, [reportId]: data.notes || [] }))
    } catch { alert('Failed to add note.') }
  }

  async function handleStatusChange(reportId, newStatus) {
    setActionLoading(reportId)
    try {
      await rescuerApi.updateReportStatus(reportId, newStatus)
      fetchReports(filter || undefined)
    } catch { alert('Failed to update status.') }
    finally { setActionLoading(null) }
  }

  if (!user) return null

  const activeCount = reports.filter((r) => r.status === 'pending' || r.status === 'in_progress').length

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Animal Reports</h1>
            <p className="mt-1 text-lg text-gray-500">
              {loading ? 'Loading...' : `${reports.length} total${activeCount ? ` - ${activeCount} active` : ''}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: '', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => handleFilterChange(s.key)}
                className={`rounded-xl px-5 py-3 text-base font-bold transition-all ${
                  filter === s.key
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-amber-500 hover:text-amber-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, location, animal..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 px-5 py-3.5 text-base font-medium focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-xl border-2 border-gray-300 px-5 py-3.5 text-base font-bold bg-white text-gray-700 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">No reports found</h3>
            <p className="mt-2 text-base text-gray-500">
              {filter ? `No reports with status "${filter.replace('_', ' ')}"` : 'No reports have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => {
              const urgency = URGENCY_LABEL[r.urgency] || URGENCY_LABEL.low
              const status = STATUS_LABEL[r.status] || STATUS_LABEL.pending
              const isExpanded = expanded === r._id
              return (
                <div
                  key={r._id}
                  className={`rounded-2xl border-2 transition-all ${
                    isExpanded
                      ? 'border-amber-500 shadow-lg bg-white'
                      : 'border-gray-200 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => {
                      const next = isExpanded ? null : r._id
                      setExpanded(next)
                      if (next) loadNotes(next)
                    }}
                    className="flex w-full items-start gap-4 px-6 py-5 text-left"
                  >
                    <span className="mt-0.5">{(() => { const Icon = CATEGORY_ICONS[r.category] || ClipboardIcon; return <Icon className="w-7 h-7 text-gray-600" />; })()}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">{r.name}</span>
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${status.class}`}>
                          {STATUS_LABEL[r.status]?.label || r.status.replace('_', ' ')}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${urgency.class}`}>
                          {urgency.label}
                        </span>
                        {r.assignedTo && (
                          <span className="rounded-full bg-indigo-100 text-indigo-800 px-3 py-1 text-sm font-bold border border-indigo-300">
                            Claimed
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-base text-gray-600">
                        {CATEGORY_LABELS[r.category] || r.category} &middot; {r.animalType} &middot; {r.location}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 font-medium">
                        <TimeAgo date={r.createdAt} />
                      </p>
                    </div>
                    <div className={`mt-1 flex items-center gap-2 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t-2 border-gray-100 px-6 pb-6">
                      <div className="grid gap-5 sm:grid-cols-2 pt-5">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Contact</p>
                          <p className="text-lg font-semibold text-gray-900 mt-0.5">{r.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Category</p>
                          <p className="text-lg text-gray-900 mt-0.5">{CATEGORY_LABELS[r.category] || r.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Animal</p>
                          <p className="text-lg text-gray-900 mt-0.5">{r.animalType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Location</p>
                          <p className="text-lg text-gray-900 mt-0.5">{r.location}</p>
                        </div>
                      </div>

                      {r.description && (
                        <div className="mt-5">
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-1.5">Description</p>
                          <p className="text-base text-gray-800 bg-gray-50 rounded-xl px-5 py-4 border-2 border-gray-200 leading-relaxed">
                            {r.description}
                          </p>
                        </div>
                      )}

                      {r.images && r.images.length > 0 && (
                        <div className="mt-5">
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Photos</p>
                          <div className="flex flex-wrap gap-3">
                            {r.images.map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-xl border-2 border-gray-200">
                                <img src={img} alt="" className="h-24 w-36 object-cover transition group-hover:scale-105" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {r.latitude && r.longitude && (
                        <div className="mt-5">
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Location Map</p>
                          <ReportMap
                            latitude={r.latitude}
                            longitude={r.longitude}
                            label={`${r.animalType} - ${r.location}`}
                            userPos={userPos}
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t-2 border-gray-100">
                        {r.assignedTo && r.status !== 'resolved' && (
                          <>
                            {r.status === 'pending' && (
                              <DoubleConfirmation
                                onConfirm={() => handleStatusChange(r._id, 'in_progress')}
                                title="Start Working"
                                message="Are you sure you want to start working on this report? This will update the status to 'In Progress'."
                                confirmText="Yes, Start Working"
                              >
                                <button
                                  disabled={actionLoading === r._id}
                                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-lg font-bold text-white shadow transition-all hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {actionLoading === r._id ? 'Updating...' : <><RefreshIcon className="w-5 h-5" /> Start Working</>}
                                </button>
                              </DoubleConfirmation>
                            )}
                            {r.status === 'in_progress' && (
                              <DoubleConfirmation
                                onConfirm={() => handleStatusChange(r._id, 'resolved')}
                                title="Mark as Resolved"
                                message="Are you sure you want to mark this report as resolved?"
                                confirmText="Yes, Resolve"
                              >
                                <button
                                  disabled={actionLoading === r._id}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-base font-bold text-white hover:bg-green-700 transition-colors shadow disabled:opacity-50"
                                >
                                  {actionLoading === r._id ? 'Updating...' : <><CheckCircleIcon className="w-5 h-5" /> Mark as Resolved</>}
                                </button>
                              </DoubleConfirmation>
                            )}
                          </>
                        )}
                      </div>

                      {r.assignedTo && (
                        <div className="mt-5 pt-5 border-t-2 border-gray-100">
                          <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Private Notes</p>
                          <div className="space-y-3 mb-3">
                            {notesMap[r._id]?.length > 0 ? (
                              notesMap[r._id].map((n) => (
                                <div key={n._id} className="rounded-xl bg-gray-50 border-2 border-gray-200 px-4 py-3">
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm font-bold text-gray-700">{n.userName}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-base text-gray-800">{n.content}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">No notes yet</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a note..."
                              value={noteInputs[r._id] || ''}
                              onChange={(e) => setNoteInputs((prev) => ({ ...prev, [r._id]: e.target.value }))}
                              className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-2.5 text-base focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                            />
                            <button
                              onClick={() => handleAddNote(r._id)}
                              className="rounded-xl bg-amber-600 px-5 py-2.5 text-base font-bold text-white hover:bg-amber-700 transition-colors shadow"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
