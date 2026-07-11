import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'
import { DoubleConfirmation } from '../../components/ui'

const STATUS_CLASSES = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  reimbursed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([])
  const [userMap, setUserMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [expData, usersData] = await Promise.all([
        adminApi.getExpenses(),
        adminApi.getUsers(),
      ])
      setExpenses(expData.expenses || [])
      const map = {}
      ;(usersData.users || []).forEach((u) => {
        map[u.uuid] = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
      })
      setUserMap(map)
    } catch {} finally { setLoading(false) }
  }

  async function handleStatus(id, status) {
    setUpdating(id)
    try {
      await adminApi.updateExpenseStatus(id, status)
      await fetchAll()
    } catch {} finally { setUpdating(null) }
  }

  const filtered = filterStatus === 'all'
    ? expenses
    : expenses.filter((e) => e.status === filterStatus)

  const grouped = {}
  filtered.forEach((e) => {
    const key = e.userId || 'unknown'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Expense Approvals</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'reimbursed', 'rejected'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                filterStatus === s
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-400'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse border-2 border-gray-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
          <p className="text-lg font-semibold text-gray-500">No expenses found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([userId, items]) => {
            const name = userMap[userId] || userId.slice(0, 8) + '...'
            const total = items.reduce((s, e) => s + e.amount, 0)
            return (
              <div key={userId}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                  <span className="text-sm font-semibold text-gray-500">₱{total.toLocaleString()} total</span>
                </div>
                <div className="space-y-3">
                  {items.map((e) => (
                    <div key={e._id} className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-gray-900">{e.category}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CLASSES[e.status] || 'bg-gray-100 text-gray-800'}`}>
                              {e.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{e.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Report: {e.reportId} &middot; {new Date(e.createdAt).toLocaleDateString()}
                          </p>
                          {e.receiptImages?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {e.receiptImages.map((url, i) => (
                                <button key={i} onClick={() => setPreviewUrl(url)}>
                                  <img src={url} alt={`Receipt ${i + 1}`} className="h-14 w-14 rounded-lg object-cover border-2 border-gray-200 hover:border-amber-400 transition-colors" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-extrabold text-gray-900">₱{e.amount?.toLocaleString()}</p>
                          {e.status === 'pending' && (
                            <div className="mt-2 flex gap-2">
                              <DoubleConfirmation
                                onConfirm={() => handleStatus(e._id, 'approved')}
                                title="Approve Expense"
                                message={`Approve ₱${e.amount?.toLocaleString()} for this expense?`}
                                confirmText="Approve"
                              >
                                <button disabled={updating === e._id}
                                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {updating === e._id ? '...' : 'Approve'}
                                </button>
                              </DoubleConfirmation>
                              <DoubleConfirmation
                                onConfirm={() => handleStatus(e._id, 'rejected')}
                                title="Reject Expense"
                                message={`Reject ₱${e.amount?.toLocaleString()} for this expense?`}
                                confirmText="Reject"
                              >
                                <button disabled={updating === e._id}
                                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 border-2 border-red-200 disabled:opacity-50"
                                >
                                  {updating === e._id ? '...' : 'Reject'}
                                </button>
                              </DoubleConfirmation>
                            </div>
                          )}
                          {e.status === 'approved' && (
                            <div className="mt-2">
                              <DoubleConfirmation
                                onConfirm={() => handleStatus(e._id, 'reimbursed')}
                                title="Mark as Reimbursed"
                                message={`Mark ₱${e.amount?.toLocaleString()} as reimbursed?`}
                                confirmText="Reimburse"
                              >
                                <button disabled={updating === e._id}
                                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                  {updating === e._id ? '...' : 'Reimburse'}
                                </button>
                              </DoubleConfirmation>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white text-gray-900 text-lg font-bold flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              ×
            </button>
            <img src={previewUrl} alt="Receipt" className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  )
}