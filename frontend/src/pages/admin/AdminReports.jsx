import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'
import { MedicalIcon, StrandedIcon, SearchIcon, PawIcon, HouseIcon, ClipboardIcon } from '../../components/SvgIcons'

const URGENCY_LABEL = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', class: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', class: 'bg-orange-100 text-orange-800' },
  emergency: { label: 'Emergency', class: 'bg-red-100 text-red-800 font-bold' },
}

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  assigned: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  en_route: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
}

const STATUS_LABELS = {
  pending: 'Pending', assigned: 'Assigned', en_route: 'En Route',
  in_progress: 'Working', resolved: 'Done', failed: 'Failed',
}

const CATEGORY_ICONS = {
  injury: MedicalIcon, stranded: StrandedIcon, missing: SearchIcon,
  found: PawIcon, abandoned: HouseIcon, other: ClipboardIcon,
}

const CATEGORY_LABELS = {
  injury: 'Injured / In Distress', stranded: 'Stranded', missing: 'Missing Pet / Animal',
  found: 'Found Animal', abandoned: 'Abandoned', other: 'Other',
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [expanded, setExpanded] = useState(null)
  const [assigningId, setAssigningId] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    Promise.allSettled([
      adminApi.getReports(),
      adminApi.getUsers(),
      adminApi.getRescuerLocations(),
    ]).then(([reportRes, userRes, locRes]) => {
      if (reportRes.status === 'fulfilled') setReports(reportRes.value.reports || [])
      if (userRes.status === 'fulfilled') setUsers((userRes.value.users || []).filter((u) => u.role === 'rescuer'))
      if (locRes.status === 'fulfilled') setLocations(locRes.value.locations || [])
    }).finally(() => setLoading(false))
  }, [])

  function getRescuerStatus(uuid) {
    const activeReport = reports.find(
      (r) => r.assignedTo === uuid && r.status !== 'resolved' && r.status !== 'failed'
    )
    if (activeReport) {
      if (activeReport.status === 'en_route') return { label: 'En Route', color: 'text-blue-700' }
      if (activeReport.status === 'in_progress') return { label: 'Busy', color: 'text-red-700' }
      return { label: 'Busy', color: 'text-red-700' }
    }
    const loc = locations.find((l) => l.userId === uuid)
    const isActive = loc && Date.now() - new Date(loc.updatedAt).getTime() < 120000
    if (isActive) return { label: 'Active', color: 'text-green-700' }
    return { label: 'Offline', color: 'text-gray-400' }
  }

  async function handleAssign(reportId, userId) {
    if (!userId) return
    setAssigningId(reportId)
    try {
      await adminApi.assignReport(reportId, userId)
      const reportData = await adminApi.getReports()
      setReports(reportData.reports || [])
    } catch (err) {
      alert(err.message || 'Failed to assign report.')
    } finally {
      setAssigningId(null)
    }
  }

  const filtered = reports
    .filter((r) => !filter || r.status === filter)
    .filter((r) => {
      if (!search) return true
      const q = search.toLowerCase()
      return r.name?.toLowerCase().includes(q)
        || r.location?.toLowerCase().includes(q)
        || r.animalType?.toLowerCase().includes(q)
        || r.phone?.includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'urgency') {
        const order = { emergency: 0, high: 1, medium: 2, low: 3 }
        return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3)
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h2>
          <p className="mt-1 text-lg text-gray-500">
            {loading ? 'Loading...' : `${filtered.length} total`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: '', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'assigned', label: 'Assigned' },
            { key: 'en_route', label: 'En Route' },
            { key: 'in_progress', label: 'Working' },
            { key: 'resolved', label: 'Done' },
            { key: 'failed', label: 'Failed' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => { setFilter(s.key); setPage(1); setExpanded(null) }}
              className={`rounded-xl px-5 py-3 text-base font-bold transition-all border-2 ${
                filter === s.key
                  ? 'bg-green-600 text-white shadow border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
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
            onChange={(e) => { setSearch(e.target.value); setPage(1); setExpanded(null) }}
            className="w-full rounded-xl border-2 border-gray-300 px-5 py-3.5 text-base font-medium focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
          className="rounded-xl border-2 border-gray-300 px-5 py-3.5 text-base font-bold bg-white text-gray-700 focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="urgency">Urgency</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
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
          {paginated.map((r) => {
            const urgency = URGENCY_LABEL[r.urgency] || URGENCY_LABEL.low
            const statusClass = STATUS_BADGE[r.status] || STATUS_BADGE.pending
            const statusLabel = STATUS_LABELS[r.status] || r.status.replace('_', ' ')
            const isExpanded = expanded === r._id

            return (
              <div
                key={r._id}
                className={`rounded-2xl border-2 transition-all ${
                  isExpanded
                    ? 'border-green-500 shadow-lg bg-white'
                    : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => {
                    const next = isExpanded ? null : r._id
                    setExpanded(next)
                  }}
                  className="flex w-full items-start gap-4 px-6 py-5 text-left"
                >
                  <span className="mt-0.5">{(() => { const Icon = CATEGORY_ICONS[r.category] || ClipboardIcon; return <Icon className="w-7 h-7 text-gray-600" />; })()}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">{r.name}</span>
                      <span className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${statusClass}`}>
                        {statusLabel}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${urgency.class}`}>
                        {urgency.label}
                      </span>
                      {r.assignedUser && (
                        <span className="rounded-full bg-indigo-100 text-indigo-800 px-3 py-1 text-sm font-bold border border-indigo-300 inline-flex items-center gap-1.5">
                          {r.assignedUser.firstName} {r.assignedUser.lastName}
                          <span className={`text-[10px] ${getRescuerStatus(r.assignedTo).color}`}>
                            · {getRescuerStatus(r.assignedTo).label}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-base text-gray-600">
                      {CATEGORY_LABELS[r.category] || r.category} &middot; {r.animalType} &middot; {r.location}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

                    <div className="mt-5 pt-5 border-t-2 border-gray-100 flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-1.5">Assigned Rescuer</p>
                        {r.assignedTo ? (
                          <span className="text-base font-semibold text-gray-900">
                            {r.assignedUser?.firstName} {r.assignedUser?.lastName}
                          </span>
                        ) : (
                          <span className="text-base text-gray-400">Unassigned</span>
                        )}
                      </div>
                      {r.status !== 'resolved' && r.status !== 'failed' && !r.assignedTo && (
                        <select
                          disabled={assigningId === r._id}
                          defaultValue=""
                          onChange={(e) => handleAssign(r._id, e.target.value)}
                          className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-base font-bold text-gray-700 focus:border-green-600 focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Assign rescuer...</option>
                          {users.map((u) => {
                            const s = getRescuerStatus(u.uuid)
                            return (
                              <option key={u.uuid} value={u.uuid}>
                                {u.firstName} {u.lastName} — {s.label}
                              </option>
                            )
                          })}
                        </select>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-base font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-xl border-2 px-4 py-2 text-base font-bold transition-colors ${
                p === safePage
                  ? 'bg-green-600 text-white shadow border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-base font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
