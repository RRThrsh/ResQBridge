import AnimateIn from '../../components/ui/AnimateIn'

const featureIcons = [
  {
    svg: 'M13 10V3L4 14h7v7l9-11h-7z',
    bg: 'from-amber-400 to-orange-500',
  },
  {
    svg: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    bg: 'from-blue-400 to-indigo-500',
  },
  {
    svg: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    bg: 'from-teal-400 to-cyan-500',
  },
  {
    svg: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    bg: 'from-rose-400 to-pink-500',
  },
]

export default function StatsSection({ stats }) {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        {/* Stats grid */}
        <AnimateIn>
          <div className="mb-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <p className="bg-gradient-to-br from-emerald-600 to-green-700 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Feature cards */}
        <AnimateIn delay={200}>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to respond faster
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-500">
            From first alert to final recovery, ResQBridge gives your team the tools to act decisively.
          </p>
        </AnimateIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Real-time Alerts', desc: 'Instant notifications when disasters strike, so rescue teams can mobilize without delay.' },
            { title: 'Team Coordination', desc: 'Centralized command hub for assigning roles, tracking progress, and sharing intel.' },
            { title: 'Resource Mapping', desc: 'Live map of available shelters, hospitals, supplies, and transportation routes.' },
            { title: 'Victim Tracking', desc: 'End-to-end visibility from rescue to recovery, ensuring no one is left behind.' },
          ].map((feature, i) => (
            <AnimateIn key={feature.title} delay={300 + i * 100}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${featureIcons[i].bg} shadow-sm transition-transform group-hover:scale-110`}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={featureIcons[i].svg} />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
