export default function StatsSection() {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {[
            { label: 'Rescues', value: '12K+' },
            { label: 'Teams', value: '500+' },
            { label: 'Countries', value: '30+' },
            { label: 'Response Time', value: '<5m' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-light text-gray-900">{stat.value}</p>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">
          Everything you need to respond faster
        </h2>
        <p className="mt-2 max-w-xl text-sm text-gray-400">
          From first alert to final recovery, ResQBridge gives your team the tools to act decisively.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h3 className="text-base font-medium text-gray-900">Real-time Alerts</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">Instant notifications when disasters strike, so rescue teams can mobilize without delay.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h3 className="text-base font-medium text-gray-900">Team Coordination</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">Centralized command hub for assigning roles, tracking progress, and sharing intel.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h3 className="text-base font-medium text-gray-900">Resource Mapping</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">Live map of available shelters, hospitals, supplies, and transportation routes.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h3 className="text-base font-medium text-gray-900">Victim Tracking</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">End-to-end visibility from rescue to recovery, ensuring no one is left behind.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
