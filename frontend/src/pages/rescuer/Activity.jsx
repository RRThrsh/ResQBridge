import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { rescuer as rescuerApi } from '../../services/api'
import { ClipboardIcon, RefreshIcon, CheckCircleIcon, DotIcon, PinIcon } from '../../components/SvgIcons'

const ACTION_ICONS = {
  claimed: ClipboardIcon,
  'status:in_progress': RefreshIcon,
  'status:resolved': CheckCircleIcon,
  availability: DotIcon,
}

const ACTION_LABELS = {
  claimed: 'Claimed a report',
  'status:in_progress': 'Started working',
  'status:resolved': 'Resolved a report',
  availability: 'Changed availability',
}

export default function RescuerActivity() {
  const { user } = useAuth()
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [continueCursor, setContinueCursor] = useState(null)
  const [prevCursors, setPrevCursors] = useState([])
  const [isDone, setIsDone] = useState(false)

  function fetchPage(cursor) {
    if (!user) return
    setLoading(true)
    rescuerApi.getActivity(cursor)
      .then((data) => {
        setActivity(data.activity || [])
        setContinueCursor(data.continueCursor)
        setIsDone(data.isDone)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    setPrevCursors([])
    fetchPage(null)
  }, [user])

  function handleNext() {
    setPrevCursors((p) => [...p, continueCursor])
    fetchPage(continueCursor)
  }

  function handlePrev() {
    const prev = [...prevCursors]
    const cursor = prev.pop()
    setPrevCursors(prev)
    fetchPage(cursor || null)
  }

  if (!user) return null

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="mt-1 text-lg text-gray-500">Your recent actions and updates</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          </div>
        ) : activity.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">No activity yet</h3>
            <p className="mt-2 text-base text-gray-500">Your actions will be recorded here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-base font-bold text-gray-700">
                    <th className="px-5 py-4 w-12" />
                    <th className="px-5 py-4">Action</th>
                    <th className="px-5 py-4 hidden sm:table-cell">Details</th>
                    <th className="px-5 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activity.map((a) => {
                    const Icon = ACTION_ICONS[a.action] || PinIcon
                    return (
                      <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <Icon className="w-6 h-6 text-gray-500" />
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {ACTION_LABELS[a.action] || a.action.replace('_', ' ')}
                        </td>
                        <td className="px-5 py-4 text-gray-600 hidden sm:table-cell max-w-xs truncate">
                          {a.details || '—'}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500 whitespace-nowrap">
                          {new Date(a.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-base text-gray-500">
                Page {prevCursors.length + 1}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  disabled={prevCursors.length === 0}
                  className="rounded-xl border-2 border-gray-300 bg-white px-5 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={isDone}
                  className="rounded-xl border-2 border-gray-300 bg-white px-5 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
