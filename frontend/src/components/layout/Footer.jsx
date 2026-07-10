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
                  { label: 'Report', to: '/report' },
                  { label: 'Wildlife Guide', to: '/wildlife-guide' },
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
              <div className="flex items-center gap-3">
                <a href="#" aria-label="Facebook" className="text-gray-400 transition-colors hover:text-green-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 transition-colors hover:text-green-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-400 transition-colors hover:text-green-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.27 2.525c.636-.247 1.363-.416 2.427-.465C8.877 2.013 9.232 2 11.67 2h.645zm-.22 1.803h-.345c-2.401 0-2.686.01-3.729.047-1.09.05-1.694.229-2.088.378a3.034 3.034 0 00-1.14.724 3.034 3.034 0 00-.724 1.14c-.149.394-.328.998-.378 2.088-.036 1.008-.047 1.284-.047 3.709v.638c0 2.426.01 2.702.047 3.71.05 1.09.229 1.694.378 2.088.18.48.36.822.724 1.14.378.378.72.56 1.14.724.394.149.998.328 2.088.378 1.008.036 1.284.047 3.71.047h.637c2.426 0 2.702-.01 3.71-.047 1.09-.05 1.694-.229 2.088-.378.48-.18.822-.36 1.14-.724.378-.378.56-.72.724-1.14.149-.394.328-.998.378-2.088.036-1.008.047-1.284.047-3.71v-.637c0-2.426-.01-2.702-.047-3.71-.05-1.09-.229-1.694-.378-2.088-.18-.48-.36-.822-.724-1.14-.378-.378-.72-.56-1.14-.724-.394-.149-.998-.328-2.088-.378-1.008-.036-1.284-.047-3.71-.047zm0 1.65c2.648 0 2.963.01 4.013.048 1.017.04 1.592.216 1.966.36.5.19.852.42 1.226.795a2.42 2.42 0 01.794 1.226c.144.374.32.95.36 1.966.038 1.05.048 1.365.048 4.013s-.01 2.963-.048 4.013c-.04 1.016-.216 1.592-.36 1.966a2.42 2.42 0 01-.794 1.226 2.42 2.42 0 01-1.226.794c-.374.144-.95.32-1.966.36-1.05.038-1.365.048-4.013.048s-2.963-.01-4.013-.048c-1.016-.04-1.592-.216-1.966-.36a2.42 2.42 0 01-1.226-.794 2.42 2.42 0 01-.794-1.226c-.144-.374-.32-.95-.36-1.966-.038-1.05-.048-1.365-.048-4.013s.01-2.963.048-4.013c.04-1.016.216-1.592.36-1.966.19-.5.42-.852.795-1.226a2.42 2.42 0 011.226-.794c.374-.144.95-.32 1.966-.36 1.05-.038 1.365-.048 4.013-.048zm0 3.013a4.14 4.14 0 00-4.131 4.131 4.14 4.14 0 004.131 4.132 4.14 4.14 0 004.132-4.132 4.14 4.14 0 00-4.132-4.131zm0 6.836a2.708 2.708 0 01-2.705-2.705 2.708 2.708 0 012.705-2.704 2.708 2.708 0 012.705 2.704 2.708 2.708 0 01-2.705 2.705zm4.827-7.002a.909.909 0 100-1.818.909.909 0 000 1.818z"/></svg>
                </a>
              </div>
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
