import { useState } from 'react'
import { Button, HoneypotField } from '../../components/ui'
import AnimateIn from '../../components/ui/AnimateIn'

const API_BASE = '/api/v1'

export default function ContactSection({ contact }) {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Report an Animal', message: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSending(true)
      setStatus(null)
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send message')
      setStatus({ type: 'success', text: 'Message sent successfully. We will get back to you within 24 hours.' })
      setForm({ name: '', email: '', subject: 'Report an Animal', message: '' })
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setSending(false)
    }
  }

  const socialLinks = [
    { name: 'Facebook', url: contact?.social?.facebook || '#' },
    { name: 'Instagram', url: contact?.social?.instagram || '#' },
    { name: 'Twitter', url: contact?.social?.twitter || '#' },
  ]

  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_right,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact Us</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">
            Reach out for rescues, inquiries, or to lend a hand.
          </p>
        </AnimateIn>

        <div className="mt-10 grid gap-10 lg:grid-cols-5">
          {/* Info sidebar */}
          <AnimateIn animation="fade-left" delay={100} className="lg:col-span-2">
            <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">Emergency Hotline</p>
              <p className="mt-2 text-2xl font-bold text-red-700">{contact.emergencyHotline}</p>
              <p className="mt-1 text-sm text-red-500">Available 24/7 for wildlife emergencies</p>
            </div>

            <div className="mt-6 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <InfoRow label="Non-Emergency" value={contact.phone} />
              <InfoRow label="Email" value={contact.email} />
              <div>
                <p className="text-sm font-semibold text-gray-700">Follow Us</p>
                <div className="mt-2 flex gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-500 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    >
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
              <p className="text-xs italic leading-relaxed text-gray-400">
                We respond to non-emergency messages within 24 hours.
              </p>
            </div>
          </AnimateIn>

          {/* Form */}
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
                  <label className="block text-sm font-semibold text-gray-700">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    pattern="[a-z0-9._%+\-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com|aol\.com|mail\.com|ymail\.com|live\.com)"
                    title="Please enter a valid email address (e.g., user@gmail.com)"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>Report an Animal</option>
                  <option>Volunteer</option>
                  <option>Donation</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  required
                  className="mt-1.5 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <Button type="submit" isLoading={sending} className="w-full sm:w-auto">
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="mt-0.5 text-sm text-gray-500">{value}</p>
    </div>
  )
}
