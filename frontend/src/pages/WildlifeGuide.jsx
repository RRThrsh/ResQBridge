import species from '../data/wildlifeSpecies'

export default function WildlifeGuide() {
  const animals = species

  return (
    <div className="px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">Wildlife Guide</h1>
        <p className="mt-3 text-sm text-gray-400">
          A quick reference for common Palawan wildlife you may encounter.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <div key={a.name} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 h-28 w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50" />
              <h3 className="text-base font-semibold text-gray-900">{a.name}</h3>
              <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">{a.status}</span>
              <p className="mt-2 text-xs text-gray-400">{a.habitat}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{a.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
