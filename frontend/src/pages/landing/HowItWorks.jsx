import AnimateIn from '../../components/ui/AnimateIn'

const stepIcons = [
  'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
]

export default function HowItWorks({ title, subtitle, steps }) {
  if (!steps.length) return null

  return (
    <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-8">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="relative mt-14">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400 sm:block" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <AnimateIn key={i} delay={i * 120}>
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-lg font-bold text-white shadow-lg shadow-emerald-200/50">
                    {i + 1}
                  </div>

                  <div className="group flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-7">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-emerald-200">
                        <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={stepIcon(step.icon, i)} />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{step.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function stepIcon(icon, index) {
  if (icon) return icon
  return stepIcons[index % stepIcons.length]
}
