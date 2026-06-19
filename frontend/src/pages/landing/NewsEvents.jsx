export default function NewsEvents({ title, subtitle, news, events }) {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Latest News</h3>
            <div className="mt-4 space-y-4">
              {news.map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 uppercase tracking-wide">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-gray-900">{item.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Upcoming Events</h3>
            <div className="mt-4 space-y-4">
              {events.map((ev) => (
                <div key={ev.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5">
                      <span className="text-xs font-bold text-green-700 uppercase">{ev.date.split(' ')[0]}</span>
                      <span className="text-[10px] text-gray-500">{ev.date.split(',')[0].replace(ev.date.split(' ')[0], '').trim()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{ev.title}</h4>
                      <p className="text-xs text-gray-400">{ev.location}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{ev.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
