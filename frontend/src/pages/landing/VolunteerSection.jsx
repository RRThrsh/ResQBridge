import { useState, useCallback } from 'react'
import { Button, HoneypotField } from '../../components/ui'
import AnimateIn from '../../components/ui/AnimateIn'

const API_BASE = '/api/v1'

const VALID_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'aol.com', 'mail.com', 'ymail.com', 'live.com']

const reasons = [
  { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', label: 'Make a Difference', desc: 'Directly contribute to wildlife rescue and conservation efforts in Palawan.' },
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Get Trained', desc: 'Receive expert training in wildlife handling, first aid, and rescue operations.' },
  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Join a Community', desc: 'Connect with like-minded individuals passionate about animal welfare.' },
]

export default function VolunteerSection({ title, subtitle }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', interest: 'Field Rescue', message: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  const formatPhone = useCallback((val) => {
    const digits = val.replace(/\D/g, '')
    const local = digits === '6' ? '' : digits.replace(/^63/, '')
    return `+63${local.slice(0, 10)}`
  }, [])

  const handlePhoneChange = useCallback((e) => {
    setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))
  }, [formatPhone])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSending(true)
      setStatus(null)
      const res = await fetch(`${API_BASE}/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit application')
      setStatus({ type: 'success', text: 'Application submitted! We will be in touch within 48 hours.' })
      setForm({ name: '', email: '', phone: '', interest: 'Field Rescue', message: '' })
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <AnimateIn animation="fade-left" delay={100} className="lg:col-span-2">
            <div className="space-y-5">
              {reasons.map((r, i) => (
                <div key={i} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-emerald-200">
                      <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{r.label}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{r.desc}</p>
                    </div>
                  </div>
                </div>
              ))}


            </div>
          </AnimateIn>

          <AnimateIn animation="fade-right" delay={200} className="lg:col-span-3">
            {status && (
              <div className={`mb-6 rounded-xl border px-5 py-4 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className={`h-5 w-5 shrink-0 ${status.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {status.type === 'success'
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  </svg>
                  {status.text}
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <HoneypotField />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    pattern={`[a-z0-9._%+\\-]+@(${VALID_EMAIL_DOMAINS.join('|')})`}
                    title="Please enter a valid email address (e.g., user@gmail.com)"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="+63 xxx xxx xxxx"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Area of Interest</label>
                  <select
                    value={form.interest}
                    onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>Field Rescue</option>
                    <option>Wildlife Transport</option>
                    <option>Administrative Support</option>
                    <option>Fundraising & Events</option>
                    <option>Public Education</option>
                    <option>Veterinary Assistance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Why do you want to volunteer?</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-1.5 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Tell us about yourself and why you'd like to help..."
                />
              </div>

              <Button type="submit" isLoading={sending} className="w-full sm:w-auto">
                {sending ? 'Submitting...' : 'Apply to Volunteer'}
              </Button>
            </form>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
