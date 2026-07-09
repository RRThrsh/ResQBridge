import { useState, useEffect } from 'react'
import { rescuer as rescuerApi } from '../../services/api'

const CATEGORIES = ['Fuel', 'Tolls', 'Meals', 'Supplies', 'Veterinary', 'Equipment', 'Vehicle maintenance', 'Other']

export default function RescuerExpenses() {
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reportId: '', category: '', amount: '', description: '', receiptUrl: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      rescuerApi.getExpenses(),
      rescuerApi.getExpenseStats(),
    ]).then(([expData, statData]) => {
      setExpenses(expData.expenses || [])
      setStats(statData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category || !form.amount || !form.description.trim()) return
    setSubmitting(true)
    try {
      await rescuerApi.addExpense({
        reportId: form.reportId || undefined,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        receiptUrl: form.receiptUrl || undefined,
      })
      const [expData, statData] = await Promise.all([
        rescuerApi.getExpenses(),
        rescuerApi.getExpenseStats(),
      ])
      setExpenses(expData.expenses || [])
      setStats(statData)
      setForm({ reportId: '', category: '', amount: '', description: '', receiptUrl: '' })
      setShowForm(false)
    } catch {} finally { setSubmitting(false) }
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-1 text-lg text-gray-500">Track your rescue-related expenses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
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
                <label className="text-sm font-semibold text-gray-700">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none bg-white"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                <label className="text-sm font-semibold text-gray-700">Report ID (optional)</label>
                <input type="text" value={form.reportId}
                  onChange={(e) => setForm({ ...form, reportId: e.target.value })}
                  placeholder="Link to a specific assignment"
                  className="mt-1 w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Receipt URL (optional)</label>
                <input type="url" value={form.receiptUrl}
                  onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                  placeholder="Link to receipt photo"
                  className="mt-1 w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                />
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

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse border-2 border-gray-200" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">No expenses logged</h3>
            <p className="mt-2 text-base text-gray-500">Track your rescue-related expenses for reimbursement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((e) => (
              <div key={e._id} className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
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
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
