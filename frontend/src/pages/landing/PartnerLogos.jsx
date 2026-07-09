import AnimateIn from '../../components/ui/AnimateIn'

export default function PartnerLogos({ title, subtitle, partners }) {
  if (!partners.length) return null

  return (
    <section className="border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {partners.map((p, i) => (
            <AnimateIn key={i} delay={i * 80}>
              <div className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 transition-transform duration-300 group-hover:scale-110 group-hover:from-emerald-100 group-hover:to-green-100">
                  <span className="text-lg font-bold text-emerald-600">
                    {p.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                  </span>
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-gray-700">{p.name}</p>
                <p className="mt-0.5 text-center text-xs text-gray-400">{p.type}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
