import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const API_BASE = '/api/v1'

export default function EditConfig() {
  const [config, setConfig] = useState(null)
  const [defaults, setDefaults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [dirty, setDirty] = useState(false)

  async function fetchConfig() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/admin/landing-config`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      setConfig(data.config)
      setDefaults(data.defaults)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchConfig() }, [])

  function update(path, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      const keys = path.split('.')
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return copy
    })
    setDirty(true)
  }

  function updateStat(index, field, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.stats[index][field] = value
      return copy
    })
    setDirty(true)
  }

  function updateFAQ(index, field, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.faq[index][field] = value
      return copy
    })
    setDirty(true)
  }

  function addFAQ() {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.faq.push({ q: '', a: '' })
      return copy
    })
    setDirty(true)
  }

  function removeFAQ(index) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.faq.splice(index, 1)
      return copy
    })
    setDirty(true)
  }

  async function handleSave() {
    try {
      setSaving(true)
      setMessage(null)
      const res = await fetch(`${API_BASE}/admin/landing-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage({ type: 'success', text: 'Landing page content saved.' })
      setDirty(false)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setConfig(structuredClone(defaults))
    setDirty(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (!config) {
    return <p className="py-10 text-center text-sm text-gray-400">Failed to load config.</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Config</h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit the content displayed on the landing page sections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>{message.text}</div>
      )}

      <div className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Badge</label>
              <input
                value={config.hero.badge}
                onChange={(e) => update('hero.badge', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.hero.title}
                onChange={(e) => update('hero.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={config.hero.description}
                onChange={(e) => update('hero.description', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Stats</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {config.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                <span className="text-sm font-medium text-gray-500 w-6">{i + 1}.</span>
                <div className="flex-1 space-y-2">
                  <input
                    value={stat.label}
                    onChange={(e) => updateStat(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  <input
                    value={stat.value}
                    onChange={(e) => updateStat(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Hotline</label>
              <input
                value={config.contact.emergencyHotline}
                onChange={(e) => update('contact.emergencyHotline', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                value={config.contact.phone}
                onChange={(e) => update('contact.phone', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={config.contact.email}
                onChange={(e) => update('contact.email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                value={config.contact.address}
                onChange={(e) => update('contact.address', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
              <input
                value={config.contact.hours}
                onChange={(e) => update('contact.hours', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
            <button onClick={addFAQ} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              + Add FAQ
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      value={item.q}
                      onChange={(e) => updateFAQ(i, 'q', e.target.value)}
                      placeholder="Question"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => updateFAQ(i, 'a', e.target.value)}
                      placeholder="Answer"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <button
                    onClick={() => removeFAQ(i)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
