import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Modal } from '../../components/ui'
import AnimateIn from '../../components/ui/AnimateIn'

const recentIncidents = [
  { id: 1, species: 'Philippine Eagle', location: 'Mount Mantalingajan', date: '2026-07-09', status: 'Active', priority: 'Critical', desc: 'Injured eagle spotted near the eastern ridge. Rescue team dispatched.' },
  { id: 2, species: 'Hawksbill Turtle', location: 'Tubbataha Reef', date: '2026-07-08', status: 'In Progress', priority: 'High', desc: 'Entangled in fishing net, rescue boat en route.' },
  { id: 3, species: 'Palawan Bearcat', location: 'Cleopatra Needle', date: '2026-07-07', status: 'Resolved', priority: 'Medium', desc: 'Successfully relocated to protected area.' },
  { id: 4, species: 'Green Sea Turtle', location: 'El Nido', date: '2026-07-07', status: 'In Progress', priority: 'High', desc: 'Stranded on beach, receiving medical attention.' },
  { id: 5, species: 'Dugong', location: 'Port Barton', date: '2026-07-06', status: 'Monitoring', priority: 'Low', desc: 'Regular sighting in seagrass beds, under observation.' },
]

const statusColors = {
  'Active': { badge: 'danger', dot: 'bg-red-500' },
  'In Progress': { badge: 'warning', dot: 'bg-amber-500' },
  'Resolved': { badge: 'success', dot: 'bg-emerald-500' },
  'Monitoring': { badge: 'info', dot: 'bg-blue-500' },
}

const priorityColors = {
  Critical: 'text-red-600 bg-red-50 border-red-200',
  High: 'text-amber-600 bg-amber-50 border-amber-200',
  Medium: 'text-blue-600 bg-blue-50 border-blue-200',
  Low: 'text-gray-600 bg-gray-50 border-gray-200',
}

export default function ActiveIncidents({ title, subtitle }) {
  const [selected, setSelected] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const display = showAll ? recentIncidents : recentIncidents.filter((r) => r.status !== 'Resolved' && r.status !== 'Monitoring')

  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_right,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <AnimateIn>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
          </AnimateIn>
        </div>

        <div className="mt-10 space-y-4">
          {display.map((incident, i) => {
            const sc = statusColors[incident.status] || statusColors['Active']

            return (
              <AnimateIn key={incident.id} delay={i * 80}>
                <button
                  onClick={() => setSelected(incident)}
                  className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${sc.dot} ${incident.status === 'Active' ? 'animate-pulse' : ''}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{incident.species}</h3>
                          <Badge variant={sc.badge} size="sm">{incident.status}</Badge>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityColors[incident.priority]}`}>
                            {incident.priority}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {incident.location}
                          <span className="text-gray-300">&middot;</span>
                          {incident.date}
                        </p>
                      </div>
                    </div>
                    <svg className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              </AnimateIn>
            )
          })}
        </div>

        <AnimateIn delay={200}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="text-sm font-semibold text-emerald-600 underline-offset-2 transition-all hover:text-emerald-700 hover:underline"
            >
              {showAll ? 'Show Active Only' : `View All (${recentIncidents.length} total)`}
            </button>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
            >
              Report New Incident
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          </div>
        </AnimateIn>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Incident Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900">{selected.species}</h3>
              <Badge variant={statusColors[selected.status]?.badge || 'default'}>{selected.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Location</p>
                <p className="text-gray-500">{selected.location}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Date Reported</p>
                <p className="text-gray-500">{selected.date}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Priority</p>
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityColors[selected.priority]}`}>
                  {selected.priority}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">{selected.desc}</p>
          </div>
        )}
      </Modal>
    </section>
  )
}
