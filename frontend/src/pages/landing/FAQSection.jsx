export default function FAQSection() {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">FAQ</h2>
        <p className="mt-2 text-sm text-gray-400">
          Common questions about wildlife rescue and our platform.
        </p>

        <div className="mt-10 space-y-4">
          {[
            { q: 'How do I report a wildlife emergency?', a: 'Call our 24/7 hotline at +63 (48) 123-4567 or use the Report an Animal button on our homepage. Provide the location, species if known, and a description of the animal\'s condition.' },
            { q: 'What should I do if I find an injured animal?', a: 'Keep your distance, observe from a safe spot, and call our rescue hotline immediately. Do not attempt to feed, touch, or move the animal unless instructed by our team.' },
            { q: 'Can I volunteer at the rescue center?', a: 'Yes. We welcome volunteers for animal care, clean-up drives, and community education programs. Fill out the Contact form and select Volunteer as the subject.' },
            { q: 'How are donated funds used?', a: 'Donations go directly toward veterinary supplies, animal feed, facility maintenance, and community conservation programs. We publish annual transparency reports.' },
            { q: 'Do you accept drop-off donations?', a: 'Yes. In-kind donations like animal feed, cleaning materials, and office supplies can be dropped off during operating hours (Mon–Sun, 8 AM – 5 PM) at our Irawan center.' },
          ].map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-gray-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-gray-900 transition hover:text-green-700">
                {faq.q}
                <svg className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-gray-500">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
