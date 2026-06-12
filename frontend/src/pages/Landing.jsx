import { Button } from '../components/ui'

const features = [
  {
    title: 'Real-time Alerts',
    desc: 'Instant notifications when disasters strike, so rescue teams can mobilize without delay.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Team Coordination',
    desc: 'Centralized command hub for assigning roles, tracking progress, and sharing intel.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Resource Mapping',
    desc: 'Live map of available shelters, hospitals, supplies, and transportation routes.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'Victim Tracking',
    desc: 'End-to-end visibility from rescue to recovery, ensuring no one is left behind.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export default function Landing() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Connect. Coordinate. Rescue.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-green-100 sm:text-xl">
            The platform that bridges rescue teams, resources, and survivors during critical moments.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-12 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-[50%] bg-white" />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 grid max-w-4xl grid-cols-2 gap-8 divide-x divide-gray-200 rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm md:grid-cols-4">
          {[
            { label: 'Rescues', value: '12K+' },
            { label: 'Teams', value: '500+' },
            { label: 'Countries', value: '30+' },
            { label: 'Response Time', value: '<5m' },
          ].map((stat) => (
            <div key={stat.label} className="text-center first:pl-0 last:pr-0">
              <p className="text-2xl font-bold text-green-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything you need to respond faster
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
            From first alert to final recovery, ResQBridge gives your team the tools to act decisively.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-green-50 p-3 text-green-600">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-green-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to bridge the gap?
          </h2>
          <p className="mt-4 text-lg text-green-100">
            Join hundreds of rescue organizations already using ResQBridge.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
