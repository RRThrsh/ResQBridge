import { Button } from '../../components/ui'

export default function DonateSection({ title, subtitle, reasons, donateLinks }) {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 px-6 py-14 text-center sm:px-12 lg:px-20">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-green-100">
            {subtitle}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {reasons.map((r, i) => (
              <div key={i} className="rounded-xl bg-white/10 p-6 text-left backdrop-blur-sm">
                <p className="text-3xl font-bold text-green-200">{r.stat}</p>
                <p className="mt-2 text-sm font-medium text-white">{r.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-green-100/80">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={donateLinks?.donateUrl || '#'} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 sm:px-10">
                Donate Now
              </Button>
            </a>
            <a href={donateLinks?.monthlyUrl || '#'} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white/60 bg-white/90 text-green-900 hover:bg-white sm:px-10">
                Monthly Giving
              </Button>
            </a>
          </div>

          <p className="mt-4 text-xs text-green-200">
            {donateLinks?.note || '100% of donations go directly to animal care and conservation programs.'}
          </p>
        </div>
      </div>
    </section>
  )
}
