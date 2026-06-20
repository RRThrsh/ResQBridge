export default function PartnerLogos({ title, subtitle, partners }) {
  if (!partners.length) return null

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {partners.map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-50">
                <span className="text-lg font-bold text-green-700">
                  {p.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                </span>
              </div>
              <p className="mt-3 text-center text-xs font-medium text-gray-700">{p.name}</p>
              <p className="mt-0.5 text-center text-[10px] text-gray-400">{p.type}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
