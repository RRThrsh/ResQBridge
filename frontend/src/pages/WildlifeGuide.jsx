import { useState, useEffect, useRef } from 'react'
import { InfoPopover } from '../components/ui'
import WildlifeGuideSkeleton from './WildlifeGuideSkeleton'

const API_BASE = '/api/v1'

const STATUS_ORDER = {
  'Critically Endangered': 1,
  'Endangered': 2,
  'Vulnerable': 3,
}

export default function WildlifeGuide() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [mainIdx, setMainIdx] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const [sortBy, setSortBy] = useState('name-asc')
  const [sortOpen, setSortOpen] = useState(false)
  const [sortMenu, setSortMenu] = useState(null) // 'name' | 'status'
  const sortRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) { setSortOpen(false); setSortMenu(null) }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const sortedAnimals = [...animals].sort((a, b) => {
    if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '')
    if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '')
    if (sortBy === 'status-asc') return (STATUS_ORDER[a.status] || 99) - (STATUS_ORDER[b.status] || 99)
    if (sortBy === 'status-desc') return (STATUS_ORDER[b.status] || 99) - (STATUS_ORDER[a.status] || 99)
    return (a.name || '').localeCompare(b.name || '')
  })

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

        <div className="relative mt-6" ref={sortRef}>
          <button
            onClick={() => { setSortOpen(!sortOpen); setSortMenu(null) }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6M3 12h10M3 17h14" />
            </svg>
            {{
              'name-asc': 'Name A-Z',
              'name-desc': 'Name Z-A',
              'status-asc': 'Status: Critical → Vulnerable',
              'status-desc': 'Status: Vulnerable → Critical',
            }[sortBy]}
            <svg className={`h-3 w-3 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {sortOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
              {!sortMenu && (
                <div>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'status', label: 'Conservation Status' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSortMenu(item.key)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      {item.label}
                      <svg className="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {sortMenu === 'name' && (
                <div>
                  <button onClick={() => setSortMenu(null)} className="flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div className="mt-0.5 border-t border-gray-100" />
                  {[
                    { value: 'name-asc', label: 'A-Z' },
                    { value: 'name-desc', label: 'Z-A' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); setSortMenu(null) }}
                      className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                        sortBy === opt.value
                          ? 'bg-green-100 font-medium text-green-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {sortMenu === 'status' && (
                <div>
                  <button onClick={() => setSortMenu(null)} className="flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div className="mt-0.5 border-t border-gray-100" />
                  {[
                    { value: 'status-asc', label: 'Critical → Vulnerable' },
                    { value: 'status-desc', label: 'Vulnerable → Critical' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); setSortMenu(null) }}
                      className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                        sortBy === opt.value
                          ? 'bg-green-100 font-medium text-green-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAnimals.map((a) => (
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
                {a.hazard && a.hazard !== 'None' && (
                  <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">{a.hazard}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">{a.habitat}</p>
              <div className="relative mt-1">
                <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">{a.note}</p>
                {a.note && a.note.length > 80 && (
                  <span className="absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-6 text-[10px] font-medium text-green-600">See more</span>
                )}
              </div>
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

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500">Conservation Status <InfoPopover><p className="font-semibold">Conservation Status</p><p className="mt-1 text-gray-300">PCSD classification indicating how threatened the species is in Palawan.</p></InfoPopover></p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selected.status && (
                    <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700">{selected.status}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500">Active Period <InfoPopover><p className="font-semibold">Active Period</p><p className="mt-1 text-gray-300">When this animal is most active throughout the day.</p></InfoPopover></p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selected.activeStatus && (
                    <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">{selected.activeStatus}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500">Habitat</p>
                <p className="mt-0.5 text-sm text-gray-700">{selected.habitat}</p>
              </div>
              {selected.hazard && selected.hazard !== 'None' && (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500">Hazard <InfoPopover><p className="font-semibold">Hazard</p><p className="mt-1 text-gray-300">Know what risks this animal may pose for your safety. Venomous animals can inject venom, poisonous animals are harmful if touched or eaten, and aggressive or defensive animals may attack if provoked.</p></InfoPopover></p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">{selected.hazard}</span>
                  </div>
                </div>
              )}
              {selected.note && (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500">Safety Note</p>
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
