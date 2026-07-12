import AnimateIn from '../../components/ui/AnimateIn'

export default function FAQSection({ faq }) {
  return (
    <section className="border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">FAQ</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">
            Common questions about wildlife rescue and our platform.
          </p>
        </AnimateIn>

        <div className="mt-10 space-y-3">
          {faq.map((item, i) => (
            <AnimateIn key={item.q} delay={i * 80}>
              <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 open:border-emerald-200 open:shadow-md">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-sm font-semibold text-gray-900 transition-colors hover:text-emerald-700">
                  {item.q}
                  <svg
                    className="h-4 w-4 shrink-0 text-gray-400 transition-all duration-300 group-open:rotate-180 group-open:text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="overflow-hidden transition-all duration-300">
                  <p className="border-t border-gray-100 px-6 pb-5 pt-4 text-sm leading-relaxed text-gray-500">
                    {item.a}
                  </p>
                </div>
              </details>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
