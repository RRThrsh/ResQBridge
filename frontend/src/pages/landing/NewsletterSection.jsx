import { useState } from 'react'
import AnimateIn from '../../components/ui/AnimateIn'
import { HoneypotField } from '../../components/ui'

const API_BASE = '/api/v1'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSending(true)
      setStatus(null)
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to subscribe')
      setStatus({ type: 'success', text: 'Thanks for subscribing! Check your inbox for a confirmation.' })
      setEmail('')
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-6 py-20 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <AnimateIn>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-200/50">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Stay Updated
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-500">
            Get rescue alerts, success stories, and conservation tips delivered to your inbox.
          </p>
        </AnimateIn>

        {status && (
          <div className={`mt-6 rounded-xl border px-5 py-4 text-sm ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <svg className={`h-5 w-5 shrink-0 ${status.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {status.type === 'success'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              </svg>
              {status.text}
            </div>
          </div>
        )}

        <AnimateIn delay={150}>
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
            <HoneypotField />
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern="[a-z0-9._%+\-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com|aol\.com|mail\.com|ymail\.com|live\.com)"
                title="Please enter a valid email address (e.g., user@gmail.com)"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </AnimateIn>

        <p className="mt-4 text-xs text-gray-400">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  )
}
