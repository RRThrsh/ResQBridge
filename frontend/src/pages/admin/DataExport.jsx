import { useState } from 'react'
import { admin as adminApi } from '../../services/api'

const EXPORTS = [
  {
    key: 'reports',
    label: 'Reports',
    desc: 'All active rescue reports with status, assignment, and timestamps',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    color: 'blue',
    endpoint: '/admin/export/reports',
  },
  {
    key: 'users',
    label: 'Users',
    desc: 'All registered users with roles, emails, and contact info',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    color: 'green',
    endpoint: '/admin/export/users',
  },
  {
    key: 'logs',
    label: 'Audit Logs',
    desc: 'System audit trail including logins, report actions, and config changes',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'amber',
    endpoint: '/admin/export/logs',
  },
]

export default function DataExport() {
  const [loading, setLoading] = useState(null)
  const [message, setMessage] = useState(null)

  async function handleExport(key) {
    setLoading(key)
    setMessage(null)
    try {
      const API_BASE = '/api/v1'
      const res = await fetch(`${API_BASE}${EXPORTS.find((e) => e.key === key).endpoint}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${key}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: `${key} exported successfully.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Export failed.' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Data Export</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download your data as CSV files for external analysis or backup.
        </p>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map((exp) => {
          const isBusy = loading === exp.key
          return (
            <div key={exp.key} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                exp.color === 'blue' ? 'bg-blue-50' :
                exp.color === 'green' ? 'bg-green-50' :
                'bg-amber-50'
              }`}>
                <svg className={`h-5 w-5 ${
                  exp.color === 'blue' ? 'text-blue-600' :
                  exp.color === 'green' ? 'text-green-600' :
                  'text-amber-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={exp.icon} />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{exp.label}</h3>
              <p className="mt-1 text-xs text-gray-500">{exp.desc}</p>
              <button
                onClick={() => handleExport(exp.key)}
                disabled={isBusy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {isBusy ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
                {isBusy ? 'Downloading...' : 'Download CSV'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
