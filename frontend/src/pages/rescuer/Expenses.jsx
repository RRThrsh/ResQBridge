import { useState, useEffect } from 'react'
import { rescuer as rescuerApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const MAX_RECEIPT_IMAGES = 3
const STATUS_FILTERS = ['all', 'pending', 'approved', 'reimbursed', 'rejected']

export default function RescuerExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reportId: '', amount: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [receiptImages, setReceiptImages] = useState([])
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [reports, setReports] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => {
    Promise.all([
      rescuerApi.getExpenses(),
      rescuerApi.getExpenseStats(),
      user?.uuid ? rescuerApi.getReports({ assignedTo: user.uuid }) : Promise.resolve({ reports: [] }),
    ]).then(([expData, statData, repData]) => {
      setExpenses(expData.expenses || [])
      setStats(statData)
      const all = repData.reports || []
      setReports(all.filter((r) => r.status === 'resolved' || r.status === 'failed'))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  async function fetchAll() {
    const [expData, statData] = await Promise.all([
      rescuerApi.getExpenses(),
      rescuerApi.getExpenseStats(),
    ])
    setExpenses(expData.expenses || [])
    setStats(statData)
  }

  async function handleUploadReceipt(file) {
    setUploadingReceipt(true)
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
        setReceiptImages((prev) => [...prev, data.url])
      }
    } catch {} finally { setUploadingReceipt(false) }
  }

  function removeReceiptImage(url) {
    setReceiptImages((prev) => prev.filter((u) => u !== url))
  }

  function resetForm() {
    setForm({ reportId: '', amount: '', description: '' })
    setReceiptImages([])
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.reportId || !form.amount || !form.description.trim()) return
    setSubmitting(true)
    try {
      await rescuerApi.addExpense({
          reportId: form.reportId,
          category: 'Other',
          amount: parseFloat(form.amount),
          description: form.description.trim(),
          receiptImages: receiptImages.length ? receiptImages : undefined,
        })
      await fetchAll()
      resetForm()
    } catch {} finally { setSubmitting(false) }
  }

  const filtered = expenses
    .filter((e) => filterStatus === 'all' || e.status === filterStatus)
    .sort((a, b) => {
      const da = a.createdAt || 0
      const db = b.createdAt || 0
      return sortOrder === 'newest' ? db - da : da - db
    })

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-1 text-lg text-gray-500">Track your rescue-related expenses</p>
          </div>
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="rounded-xl bg-amber-600 px-5 py-3 text-base font-bold text-white hover:bg-amber-700 transition-colors shadow"
          >
            {showForm ? 'Cancel' : 'Log Expense'}
          </button>
        </div>

        {stats && !loading && (
          <div className="mb-6 grid gap-4 grid-cols-3">
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-800">Total</p>
              <p className="mt-1 text-3xl font-extrabold text-blue-700">₱{stats.total?.toLocaleString() || 0}</p>
            </div>
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-amber-800">Pending</p>
              <p className="mt-1 text-3xl font-extrabold text-amber-700">₱{stats.pending?.toLocaleString() || 0}</p>
            </div>
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-green-800">Approved</p>
              <p className="mt-1 text-3xl font-extrabold text-green-700">₱{stats.approved?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Linked Report *</label>
                <select required value={form.reportId}
                  onChange={(e) => setForm({ ...form, reportId: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none bg-white"
                >
                  <option value="">Select a report</option>
                  {reports.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.animalType || r.category} — {r.status === 'resolved' ? 'Successful' : 'Failed'} ({r.location || 'No location'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Amount (₱) *</label>
                <input type="number" step="0.01" min="0" required value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <input type="text" required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What was this expense for?"
                  className="mt-1 w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Receipt Images (up to 3, optional)</label>
                <div className="mt-1 space-y-2">
                  {receiptImages.length < MAX_RECEIPT_IMAGES && (
                    <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 border-2 border-gray-300">
                      {uploadingReceipt ? 'Uploading...' : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Add Receipt</>}
                      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                        disabled={uploadingReceipt}
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) handleUploadReceipt(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  )}
                  {receiptImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {receiptImages.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`Receipt ${i + 1}`} className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200" />
                          <button type="button" onClick={() => removeReceiptImage(url)}
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submitting}
                className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow"
              >
                {submitting ? 'Saving...' : 'Submit Expense'}
              </button>
            </div>
          </form>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {STATUS_FILTERS.map((s) => (
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
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">Sort:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-xl border-2 border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse border-2 border-gray-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">No expenses found</h3>
            <p className="mt-2 text-base text-gray-500">Track your rescue-related expenses for reimbursement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div key={e._id} className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">{e.category}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        e.status === 'approved' || e.status === 'reimbursed' ? 'bg-green-100 text-green-800' :
                        e.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>{e.status}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600">{e.description}</p>
                    {e.reportId && <p className="text-xs text-gray-400 mt-0.5">Report: {e.reportId}</p>}
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xl font-extrabold text-gray-900">₱{e.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {e.receiptImages?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-gray-100 pt-3">
                    {e.receiptImages.map((url, i) => (
                      <button key={i} onClick={() => setPreviewUrl(url)}>
                        <img src={url} alt={`Receipt ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200 hover:border-amber-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
    </main>
  )
}