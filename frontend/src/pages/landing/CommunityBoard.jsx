import { useState } from 'react'
import { Badge, Modal } from '../../components/ui'

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
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">
            {subtitle}
          </p>
        </div>

        {categories.map((cat) => {
          const reports = mockReports[cat.id]
          const visible = reports.slice(0, 5)

          return (
            <div key={cat.id} className="mt-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{cat.title} Reports</h3>
                {reports.length > 5 && (
                  <button
                    onClick={() => setModalTab(cat.id)}
                    className="text-sm font-medium text-green-700 underline underline-offset-2 transition-colors hover:text-green-800"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {visible.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 h-36 w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50" />
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-semibold text-gray-900">{r.species}</h4>
                      <Badge variant={r.status === 'Active' || r.status === 'In Care' ? 'warning' : 'success'} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{r.location} &middot; {r.date}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={!!modalTab} onClose={() => setModalTab(null)} title={`All ${modalTab === 'missing' ? 'Missing' : 'Found'} Animal Reports`} size="7xl">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modalTab && mockReports[modalTab]?.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 p-5">
              <div className="mb-3 h-40 w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50" />
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base font-semibold text-gray-900">{r.species}</h4>
                <Badge variant={r.status === 'Active' || r.status === 'In Care' ? 'warning' : 'success'} size="sm">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-400">{r.location} &middot; {r.date}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  )
}
