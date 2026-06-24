import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { rescuer as rescuerApi } from '../../services/api'
import { CheckIcon, XIcon, CarIcon, CameraIcon, ClipboardIcon, MedicalIcon, StrandedIcon, SearchIcon, PawIcon, HouseIcon, CheckCircleIcon, XCircleIcon } from '../../components/SvgIcons'
import ReportMap from './ReportMap'

const BADGES = {
  new: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  en_route: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
}

const BADGE_LABELS = {
  new: 'New',
  en_route: 'En Route',
  in_progress: 'Working',
  resolved: 'Done',
  failed: 'Failed',
}

const URGENCY_LABEL = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', class: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', class: 'bg-orange-100 text-orange-800' },
  emergency: { label: 'Emergency', class: 'bg-red-100 text-red-800 font-bold' },
}

const CATEGORY_ICONS = {
  injury: MedicalIcon, stranded: StrandedIcon, missing: SearchIcon,
  found: PawIcon, abandoned: HouseIcon, other: ClipboardIcon,
}

export default function RescuerAssignments() {
  const { user } = useAuth()
  const { userPos } = useLocationContext()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [acceptedIds, setAcceptedIds] = useState(new Set())

  const [diaryText, setDiaryText] = useState({})
  const [failReason, setFailReason] = useState({})
  const [showFailInput, setShowFailInput] = useState(new Set())
  const [uploadingId, setUploadingId] = useState(null)
  const [uploadedImages, setUploadedImages] = useState({})
  const [showDirections, setShowDirections] = useState(new Set())
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [page, setPage] = useState(1)
  const pageSize = 10

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

  useEffect(() => { setPage(1); fetchReports() }, [user, filter])

  useEffect(() => {
    const es = new EventSource('/api/v1/report/updates', { withCredentials: true })
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'report:claimed' || event.type === 'report:status') {
          fetchReports()
        }
      } catch {}
    }
    es.onerror = () => {}
    return () => es.close()
  }, [fetchReports])

  async function handleAccept(reportId) {
    setActionLoading(reportId)
    try {
      await rescuerApi.updateReportStatus(reportId, 'en_route')
      const next = new Set(acceptedIds)
      next.add(reportId)
      setAcceptedIds(next)
      fetchReports()
    } catch { alert('Failed to accept.') }
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

  async function handleResolve(reportId) {
    const diary = diaryText[reportId] || ''
    if (!diary.trim()) {
      alert('Please write a diary entry about how you executed the rescue.')
      return
    }
    setActionLoading(reportId)
    try {
      await rescuerApi.addNote(reportId, `Rescue Diary: ${diary}`)
      await rescuerApi.updateReportStatus(reportId, 'resolved')
      fetchReports()
    } catch { alert('Failed to resolve.') }
    finally { setActionLoading(null) }
  }

  async function handleFail(reportId) {
    const diary = diaryText[reportId] || ''
    const reason = failReason[reportId] || ''
    if (!diary.trim()) {
      alert('Please write a diary entry about what happened.')
      return
    }
    if (!reason.trim()) {
      alert('Please provide the reason why the rescue failed.')
      return
    }
    setActionLoading(reportId)
    try {
      await rescuerApi.addNote(reportId, `Rescue Diary: ${diary}`)
      await rescuerApi.addNote(reportId, `Failure Reason: ${reason}`)
      await rescuerApi.updateReportStatus(reportId, 'failed')
      fetchReports()
    } catch { alert('Failed to mark as failed.') }
    finally { setActionLoading(null) }
  }

  async function handleImageUpload(reportId, file) {
    setUploadingId(reportId)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/v1/rescuer/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json()
      if (data.url) {
        setUploadedImages((prev) => ({
          ...prev,
          [reportId]: [...(prev[reportId] || []), data.url],
        }))
      }
    } catch { alert('Failed to upload image.') }
    finally { setUploadingId(null) }
  }

  function statusBadgeKey(status) {
    if (status === 'resolved') return 'resolved'
    if (status === 'failed') return 'failed'
    if (status === 'in_progress') return 'in_progress'
    if (status === 'en_route') return 'en_route'
    return 'new'
  }

  if (!user) return null

  const activeCount = reports.filter((r) => r.status !== 'resolved' && r.status !== 'failed').length
  const totalPages = Math.max(1, Math.ceil(reports.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedReports = reports.slice((safePage - 1) * pageSize, safePage * pageSize)

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
              { key: 'failed', label: 'Failed' },
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
            {paginatedReports.map((r) => {
              const urgency = URGENCY_LABEL[r.urgency] || URGENCY_LABEL.low
              const isAccepted = acceptedIds.has(r._id)
              const badgeKey = statusBadgeKey(r.status)
              const badgeClass = BADGES[badgeKey] || BADGES.new
              const badgeLabel = BADGE_LABELS[badgeKey]

              const showDiary = isAccepted || r.status === 'en_route' || r.status === 'in_progress'
              const showInitial = !isAccepted && r.status !== 'en_route' && r.status !== 'in_progress' && r.status !== 'resolved' && r.status !== 'failed'
              const reportImages = uploadedImages[r._id] || []

              const isCollapsed = collapsedIds.has(r._id)

              return (
                <div key={r._id} className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm hover:border-amber-400 transition-all">
                  <div className="flex items-start gap-4 p-5">
                    <span className="mt-0.5">{(() => { const Icon = CATEGORY_ICONS[r.category] || ClipboardIcon; return <Icon className="w-7 h-7 text-gray-600" />; })()}</span>
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
                      {!isCollapsed && (
                        <>
                          <p className="mt-1.5 text-base text-gray-600">
                            {r.animalType} &middot; {r.location}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </>
                      )}
                    </div>
                    {r.latitude && r.longitude && !isCollapsed && (
                      <button
                        onClick={() => {
                          const next = new Set(showDirections)
                          if (next.has(r._id)) next.delete(r._id)
                          else next.add(r._id)
                          setShowDirections(next)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2.5 text-base font-bold text-blue-700 hover:bg-blue-100 border-2 border-blue-200 transition-colors shrink-0"
                      >
                        <CarIcon className="w-5 h-5" /> Directions
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const next = new Set(collapsedIds)
                        if (next.has(r._id)) next.delete(r._id)
                        else next.add(r._id)
                        setCollapsedIds(next)
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-100 w-10 h-10 text-gray-600 hover:bg-gray-200 border-2 border-gray-200 transition-colors shrink-0"
                    >
                      <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </div>

                  {!isCollapsed && (
                    <>
                      {showDirections.has(r._id) && (
                        <div className="px-5 pb-4">
                          <ReportMap
                            latitude={r.latitude}
                            longitude={r.longitude}
                            label={r.name}
                            userPos={userPos}
                          />
                        </div>
                      )}

                      <div className="px-5 pb-4 pt-4 border-t-2 border-gray-100 flex flex-wrap gap-2">
                        {showInitial && (
                          <>
                            <button
                              onClick={() => handleAccept(r._id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-base font-bold text-white hover:bg-green-700 transition-colors shadow"
                            >
                              <CheckIcon className="w-5 h-5" /> Accept
                            </button>
                            <button
                              onClick={() => handleReject(r._id)}
                              disabled={actionLoading === r._id}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 px-5 py-2.5 text-base font-bold text-red-700 hover:bg-red-200 transition-colors border-2 border-red-200 disabled:opacity-50"
                            >
                              <XIcon className="w-5 h-5" /> Reject
                            </button>
                          </>
                        )}
                      </div>

                      {showDiary && (
                        <div className="px-5 pb-5 pt-4 border-t-2 border-gray-100 space-y-3">
                          <textarea
                            placeholder="Write your rescue diary here..."
                            value={diaryText[r._id] || ''}
                            onChange={(e) => setDiaryText({ ...diaryText, [r._id]: e.target.value })}
                            className="w-full rounded-xl border-2 border-gray-300 p-3 text-base focus:border-amber-500 focus:outline-none"
                            rows={3}
                          />

                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl bg-gray-100 px-4 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-200 border-2 border-gray-300 transition-colors">
                              {uploadingId === r._id ? 'Uploading...' : <><CameraIcon className="w-5 h-5" /> Add Photo</>}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                disabled={uploadingId === r._id}
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) handleImageUpload(r._id, file)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>

                          {reportImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {reportImages.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`Rescue photo ${i + 1}`}
                                  className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleResolve(r._id)}
                              disabled={actionLoading === r._id}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-base font-bold text-white hover:bg-green-700 transition-colors shadow disabled:opacity-50"
                            >
                              {actionLoading === r._id ? '...' : <><CheckCircleIcon className="w-5 h-5" /> Resolve</>}
                            </button>
                            <button
                              onClick={() => {
                                const next = new Set(showFailInput)
                                if (next.has(r._id)) next.delete(r._id)
                                else next.add(r._id)
                                setShowFailInput(next)
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 px-5 py-2.5 text-base font-bold text-red-700 hover:bg-red-200 transition-colors border-2 border-red-200"
                            >
                              <XCircleIcon className="w-5 h-5" /> Failed
                            </button>
                          </div>

                          {showFailInput.has(r._id) && (
                            <div className="space-y-2">
                              <textarea
                                placeholder="Why did the rescue fail?"
                                value={failReason[r._id] || ''}
                                onChange={(e) => setFailReason({ ...failReason, [r._id]: e.target.value })}
                                className="w-full rounded-xl border-2 border-red-300 p-3 text-base focus:border-red-500 focus:outline-none"
                                rows={2}
                              />
                              <button
                                onClick={() => handleFail(r._id)}
                                disabled={actionLoading === r._id}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-base font-bold text-white hover:bg-red-700 transition-colors shadow disabled:opacity-50"
                              >
                                {actionLoading === r._id ? '...' : 'Confirm Failed'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
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
              className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-base font-bold text-gray-700 hover:border-amber-500 hover:text-amber-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-xl border-2 px-4 py-2 text-base font-bold transition-colors ${
                  p === safePage
                    ? 'bg-amber-600 text-white shadow border-amber-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:text-amber-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-base font-bold text-gray-700 hover:border-amber-500 hover:text-amber-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
