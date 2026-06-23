import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const URGENCY_LABEL = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-700 border-gray-300' },
  medium: { label: 'Medium', class: 'bg-amber-100 text-amber-800 border-amber-300' },
  high: { label: 'High', class: 'bg-orange-100 text-orange-800 border-orange-300' },
  emergency: { label: 'Emergency', class: 'bg-red-100 text-red-800 border-red-300 font-bold' },
}

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  assigned: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  en_route: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
}

const CATEGORY_ICONS = {
  injury: '🩺', stranded: '🏝️', missing: '🔍',
  found: '🐾', abandoned: '🏚️', other: '📋',
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [assigningId, setAssigningId] = useState(null)

  useEffect(() => {
    Promise.all([
      adminApi.getReports(),
      adminApi.getUsers(),
    ]).then(([reportData, userData]) => {
      setReports(reportData.reports || [])
      setUsers((userData.users || []).filter((u) => u.role === 'rescuer'))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

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

  const filtered = filter
    ? reports.filter((r) => r.status === filter)
    : reports

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Reports</h2>
          <p className="text-sm text-gray-500">{reports.length} total</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                filter === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-400'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-semibold">No reports found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Reporter</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Animal</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Urgency</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Assigned To</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Assign Rescuer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const urgency = URGENCY_LABEL[r.urgency] || URGENCY_LABEL.low
                const status = STATUS_BADGE[r.status] || STATUS_BADGE.pending
                return (
                  <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg mr-1">{CATEGORY_ICONS[r.category] || '📋'}</span>
                      <span className="text-gray-700">{r.animalType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${urgency.class}`}>
                        {urgency.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${status}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.assignedUser ? (
                        <span className="font-medium text-gray-800">
                          {r.assignedUser.firstName} {r.assignedUser.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={r.location}>
                      {r.location}
                    </td>
                    <td className="px-4 py-3">
                      {r.status !== 'resolved' && !r.assignedTo ? (
                        <select
                          disabled={assigningId === r._id}
                          defaultValue=""
                          onChange={(e) => handleAssign(r._id, e.target.value)}
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium focus:border-amber-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Assign...</option>
                          {users.map((u) => (
                            <option key={u.uuid} value={u.uuid}>
                              {u.firstName} {u.lastName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {r.assignedTo ? 'Assigned' : 'Resolved'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
