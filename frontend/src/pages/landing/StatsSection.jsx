import AnimateIn from '../../components/ui/AnimateIn'

const features = [
  {
    title: 'Report in Seconds',
    desc: 'Submit lost or found animal reports with photos, location, and details in under a minute.',
    svg: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    bg: 'from-emerald-500 to-green-600',
  },
  {
    title: 'Community Alerts',
    desc: 'Get notified when a lost or injured wildlife is spotted nearby or a found animal matches your report.',
    svg: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
    bg: 'from-amber-400 to-orange-500',
  },
  {
    title: 'Smart Matching',
    desc: 'Our system automatically connects lost reports with found animals in the same area.',
    svg: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
    bg: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Rescue Tools',
    desc: 'For responders: mapping, team coordination, and case management all in one place.',
    svg: 'M11.42 15.17l-5.645 3.254a1.5 1.5 0 01-2.275-1.28v-7.29a1.5 1.5 0 012.275-1.28l5.645 3.254m5.645-3.254l5.645-3.255a1.5 1.5 0 012.275 1.28v7.29a1.5 1.5 0 01-2.275 1.28l-5.645-3.254m0 0l-5.645 3.254',
    bg: 'from-teal-500 to-cyan-600',
  },
]

export default function StatsSection({ stats }) {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="bg-gradient-to-br from-emerald-600 to-green-700 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        <AnimateIn delay={200}>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Community-Powered Rescue
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-500">
            From the moment an animal goes missing to the joy of a safe return, ResQBridge connects every piece of the rescue puzzle.
          </p>
        </AnimateIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <AnimateIn key={feature.title} delay={300 + i * 100}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.bg} shadow-sm transition-transform group-hover:scale-110`}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.svg} />
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
