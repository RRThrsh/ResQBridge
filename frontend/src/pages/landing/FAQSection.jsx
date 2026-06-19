export default function FAQSection({ faq }) {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">FAQ</h2>
        <p className="mt-2 text-sm text-gray-400">
          Common questions about wildlife rescue and our platform.
        </p>

        <div className="mt-10 space-y-4">
          {faq.map((item) => (
            <details key={item.q} className="group rounded-xl border border-gray-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-gray-900 transition hover:text-green-700">
                {item.q}
                <svg className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-gray-500">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
