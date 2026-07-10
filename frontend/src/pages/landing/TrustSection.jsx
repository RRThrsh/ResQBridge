import AnimateIn from '../../components/ui/AnimateIn'

const mediaMentions = [
  { name: 'Wildlife Daily', logo: 'WD', desc: 'Community-Powered Rescue Platform of the Year' },
  { name: 'Eco Times', logo: 'ET', desc: 'Featured as top innovator in wildlife conservation' },
  { name: 'Palawan News', logo: 'PN', desc: 'ResQBridge connects over 500 volunteers island-wide' },
]

const awards = [
  { title: 'Best Conservation Tech', year: '2025', org: 'ASEAN Biodiversity' },
  { title: 'Community Impact Award', year: '2025', org: 'Wildlife Rescue Alliance' },
  { title: 'Innovation in Rescue', year: '2024', org: 'Palawan Council' },
]

export default function TrustSection({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <AnimateIn delay={100}>
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Media Mentions</h3>
              </div>
              <div className="space-y-4">
                {mediaMentions.map((m, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-bold text-white shadow-sm">
                      {m.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>

          <AnimateIn delay={200}>
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Awards & Recognition</h3>
              </div>
              <div className="space-y-4">
                {awards.map((a, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{a.year} &middot; {a.org}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>

        <AnimateIn delay={300}>
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50/50 p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">
              Trusted by <span className="text-emerald-700">500+</span> wildlife professionals and{' '}
              <span className="text-emerald-700">15+</span> conservation organizations across Palawan
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Organization
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Data Protected
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                24/7 Support
              </span>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
