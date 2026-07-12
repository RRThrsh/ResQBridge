import { Button } from '../../components/ui'
import AnimateIn from '../../components/ui/AnimateIn'

export default function DonateSection({ title, subtitle, reasons, donateLinks }) {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-green-700 to-teal-800 px-6 py-16 text-center shadow-2xl sm:px-12 lg:px-20">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />

            <h2 className="relative text-3xl font-bold text-white sm:text-4xl">{title}</h2>
            <p className="relative mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">
              {subtitle}
            </p>

            <div className="relative mt-10 grid gap-5 sm:grid-cols-3">
              {reasons.map((r, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/10 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
                  <p className="text-4xl font-bold text-emerald-200">{r.stat}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{r.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={donateLinks?.donateUrl || '#'} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-yellow-400 px-10 py-6 text-base font-bold text-emerald-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-yellow-400/30 sm:w-auto"
                >
                  Donate Now
                </Button>
              </a>
              <a href={donateLinks?.monthlyUrl || '#'} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-xl border-white/30 bg-white/10 px-10 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:bg-white/20 sm:w-auto"
                >
                  Monthly Giving
                </Button>
              </a>
            </div>

            <p className="relative mt-5 text-xs text-emerald-200/80">
              {donateLinks?.note || '100% of donations go directly to wildlife care and conservation programs.'}
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
