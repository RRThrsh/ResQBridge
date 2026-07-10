import { useState, useEffect } from 'react'
import WildlifeGuideSkeleton from './WildlifeGuideSkeleton'

const API_BASE = '/api/v1'

export default function WildlifeGuide() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [mainIdx, setMainIdx] = useState(0)
  const [lightbox, setLightbox] = useState(null) // image index or null

  useEffect(() => {
    fetch(`${API_BASE}/landing-config`)
      .then((r) => r.json())
      .then((d) => {
        setAnimals(d.config?.wildlifeGuide || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <WildlifeGuideSkeleton />

  return (
    <div className="px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">Wildlife Guide</h1>
        <p className="mt-3 text-sm text-gray-400">
          A quick reference for common Palawan wildlife you may encounter.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <button
              key={a.name}
              onClick={() => { setSelected(a); setMainIdx(0) }}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left transition-shadow hover:shadow-md"
            >
              {a.images?.[0] ? (
                <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg">
                  <img src={a.images[0]} alt={a.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="mb-3 aspect-square w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50" />
              )}
              <h3 className="text-base font-semibold text-gray-900">{a.name}</h3>
              {a.scientificName && <p className="text-xs italic text-gray-400">{a.scientificName}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">{a.status}</span>
                {a.activeStatus && (
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{a.activeStatus}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">{a.habitat}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{a.note}</p>
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && selected?.images?.[lightbox] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-[61] flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
            {selected.images.length > 1 && lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}
                className="absolute -left-14 z-[61] hidden h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 lg:flex"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <img
              src={selected.images[lightbox]}
              alt={selected.name}
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
            {selected.images.length > 1 && lightbox < selected.images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}
                className="absolute -right-14 z-[61] hidden h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 lg:flex"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => { setSelected(null); setLightbox(null) }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {selected.images?.length > 0 ? (
              <div>
                <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl">
                  <button onClick={() => setLightbox(mainIdx)} className="h-full w-full">
                    <img src={selected.images[mainIdx]} alt={selected.name} className="h-full w-full cursor-zoom-in object-cover transition-transform hover:scale-105" />
                  </button>
                </div>
                {selected.images.length > 1 && (
                  <div className="mb-6 flex gap-2">
                    {selected.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainIdx(idx)}
                        className={`h-14 w-20 overflow-hidden rounded-lg border transition-opacity hover:opacity-80 ${
                          idx === mainIdx ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6 aspect-square w-full rounded-xl bg-gradient-to-br from-green-100 to-emerald-50" />
            )}

            <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
            {selected.scientificName && (
              <p className="mt-1 text-sm italic text-gray-500">{selected.scientificName}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {selected.status && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">{selected.status}</span>
              )}
              {selected.activeStatus && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">{selected.activeStatus}</span>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Habitat</p>
                <p className="mt-0.5 text-sm text-gray-700">{selected.habitat}</p>
              </div>
              {selected.note && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Safety Note</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-700">{selected.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
