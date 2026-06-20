export default function HowItWorks({ title, subtitle, steps }) {
  if (!steps.length) return null

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

        <div className="relative mt-10">
          <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-green-200 sm:block" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white shadow-md">
                  {i + 1}
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
