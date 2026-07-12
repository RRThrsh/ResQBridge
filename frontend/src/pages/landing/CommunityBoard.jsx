import { useState } from 'react'
import { Badge, Modal } from '../../components/ui'
import AnimateIn from '../../components/ui/AnimateIn'

const categories = [
  { id: 'missing', title: 'Missing', color: 'bg-red-50 border-red-200 text-red-700', icon: 'M16 3h5m0 0v5m0-5l-6 6M4 14l-2 2m0 0l-2 2m2-2l2 2m-2-2l-2 2' },
  { id: 'found', title: 'Found', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: 'M5 13l4 4L19 7' },
]

const mockReports = {
  missing: [
    { id: 1, species: 'Philippine Eagle', location: 'Mount Mantalingajan', date: '2026-06-10', status: 'Active', desc: 'Last seen near the eastern ridge. Brown and white plumage, distinct crest.' },
    { id: 2, species: 'Palawan Bearcat', location: 'Cleopatra Needle', date: '2026-06-08', status: 'Active', desc: 'Young adult, spotted near forest edge. Distinctive long tail and dark coat.' },
    { id: 3, species: 'Sea Turtle (Hawksbill)', location: 'Tubbataha Reef', date: '2026-06-05', status: 'Resolved', desc: 'Found entangled in fishing net, rehabilitated and released.' },
    { id: 4, species: 'Palawan Peacock-Pheasant', location: 'Irawan Forest', date: '2026-06-03', status: 'Active', desc: 'Male with iridescent blue-black plumage, last seen near the trail head.' },
    { id: 5, species: 'Dugong', location: 'Port Barton', date: '2026-05-28', status: 'Active', desc: 'Regularly sighted in seagrass beds near the marine sanctuary.' },
    { id: 6, species: 'Monitor Lizard', location: 'Sabang', date: '2026-05-25', status: 'Resolved', desc: 'Relocated from residential area to the mangrove reserve.' },
  ],
  found: [
    { id: 7, species: 'Philippine Cockatoo', location: 'Narra', date: '2026-06-12', status: 'In Care', desc: 'Injured wing, brought in by local resident. Currently under treatment.' },
    { id: 8, species: 'Palm Civet', location: 'Puerto Princesa', date: '2026-06-09', status: 'Released', desc: 'Dehydrated but healthy, released after 48 hours of observation.' },
    { id: 9, species: 'Green Sea Turtle', location: 'El Nido', date: '2026-06-07', status: 'In Care', desc: 'Found stranded on beach, minor injuries to front flipper.' },
    { id: 10, species: 'Tabon Scrubfowl', location: 'Roxas', date: '2026-06-04', status: 'Released', desc: 'Disoriented juvenile, released after successful feeding.' },
    { id: 11, species: 'Fishing Cat', location: 'Aborlan', date: '2026-06-01', status: 'In Care', desc: 'Caught in snare, undergoing treatment for leg wound.' },
    { id: 12, species: 'Reticulated Python', location: "Brooke's Point", date: '2026-05-30', status: 'Released', desc: 'Removed from poultry farm, released into protected forest.' },
    { id: 13, species: 'Wild Boar Piglet', location: 'Quezon', date: '2026-05-27', status: 'In Care', desc: 'Orphaned piglet, being bottle-fed at the center.' },
    { id: 14, species: 'Hornbill', location: 'San Vicente', date: '2026-05-24', status: 'Released', desc: 'Flew into window, stunned but unharmed. Released after recovery.' },
  ],
}

export default function CommunityBoard({ title, subtitle }) {
  const [modalTab, setModalTab] = useState(null)

  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="mx-auto max-w-7xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        {categories.map((cat) => {
          const reports = mockReports[cat.id]
          const visible = reports.slice(0, 5)

          return (
            <div key={cat.id} className="mt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${cat.id === 'missing' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <h3 className="text-lg font-bold text-gray-900">{cat.title} Reports</h3>
                </div>
                {reports.length > 5 && (
                  <button
                    onClick={() => setModalTab(cat.id)}
                    className="text-sm font-semibold text-emerald-600 underline-offset-2 transition-all hover:text-emerald-700 hover:underline"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {visible.map((r) => (
                  <AnimateIn key={r.id}>
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                      <div className="mb-4 h-32 w-full rounded-xl bg-gradient-to-br from-emerald-100 to-green-50" />
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{r.species}</h4>
                        <Badge variant={r.status === 'Active' || r.status === 'In Care' ? 'warning' : 'success'} size="sm">
                          {r.status}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400">{r.location} &middot; {r.date}</p>
                      <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{r.desc}</p>
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={!!modalTab} onClose={() => setModalTab(null)} title={`All ${modalTab === 'missing' ? 'Missing' : 'Found'} Animal Reports`} size="7xl">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modalTab && mockReports[modalTab]?.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 p-5 transition-all hover:border-emerald-200 hover:shadow-sm">
              <div className="mb-3 h-36 w-full rounded-xl bg-gradient-to-br from-emerald-100 to-green-50" />
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-gray-900">{r.species}</h4>
                <Badge variant={r.status === 'Active' || r.status === 'In Care' ? 'warning' : 'success'} size="sm">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-gray-400">{r.location} &middot; {r.date}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  )
}
