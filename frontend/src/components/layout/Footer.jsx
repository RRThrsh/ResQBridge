import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Button } from '../ui'

const API_BASE = '/api/v1'

export default function Footer() {
  const [modalType, setModalType] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  const isBug = modalType === 'bug'

  function open(type) {
    setModalType(type)
    setForm({ name: '', email: '', message: '' })
    setStatus(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSending(true)
      setStatus(null)
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: isBug ? 'Report a Bug' : 'Feedback',
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send')
      setStatus({ type: 'success', text: isBug ? 'Bug report sent. We\'ll look into it.' : 'Thanks for your feedback!' })
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link to="/" className="text-xl font-bold text-green-600">
                ResQBridge
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
                A community-driven platform connecting wildlife rescue teams, volunteers, and concerned citizens across Palawan.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'About', to: '/about' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 transition-colors hover:text-green-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-500">
                <li>+63 (48) 123-4567</li>
                <li>rescue@palawanwildlife.org</li>
                <li>Puerto Princesa City, Palawan</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} ResQBridge. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => open('bug')}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Report a Bug
                </button>
                <button
                  onClick={() => open('feedback')}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-green-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={isBug ? 'Report a Bug' : 'Send Feedback'} size="md">
        {status?.type === 'success' ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">{status.text}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status?.type === 'error' && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {status.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="mt-1 w-full resize-y rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder={isBug ? 'Describe the bug you encountered...' : 'Share your thoughts or suggestions...'}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalType(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={sending}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
