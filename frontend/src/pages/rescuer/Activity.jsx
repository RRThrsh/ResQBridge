import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { rescuer as rescuerApi } from '../../services/api'

const ACTION_ICONS = {
  claimed: '📋',
  'status:in_progress': '🔄',
  'status:resolved': '✅',
  availability: '🔵',
}

export default function RescuerActivity() {
  const { user } = useAuth()
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    rescuerApi.getActivity()
      .then((data) => setActivity(data.activity || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
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
          <div className="space-y-3">
            {activity.map((a) => (
              <div key={a._id} className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{ACTION_ICONS[a.action] || '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {a.action === 'claimed' && 'Claimed a report'}
                      {a.action === 'status:in_progress' && 'Started working on a report'}
                      {a.action === 'status:resolved' && 'Resolved a report'}
                      {a.action === 'availability' && 'Changed availability status'}
                      {!['claimed', 'status:in_progress', 'status:resolved', 'availability'].includes(a.action) && a.action.replace('_', ' ')}
                    </p>
                    {a.details && <p className="mt-0.5 text-base text-gray-600">{a.details}</p>}
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
