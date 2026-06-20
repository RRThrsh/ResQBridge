import { useState } from 'react'
import { Modal } from '../../components/ui'

const STORY_COLORS = [
  'from-emerald-600 to-green-800',
  'from-blue-600 to-indigo-800',
  'from-amber-500 to-orange-700',
  'from-teal-600 to-cyan-800',
]

export default function SuccessStories({ title, subtitle, stories }) {
  const [selected, setSelected] = useState(null)

  if (!stories.length) return null

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelected(s)}
              className="group relative flex flex-col overflow-hidden rounded-xl text-left shadow-sm transition hover:shadow-md"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${STORY_COLORS[i % STORY_COLORS.length]} flex items-end p-5`}>
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">{s.species}</p>
              </div>
              <div className="flex flex-1 flex-col justify-between border border-t-0 border-gray-200 bg-white p-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">&ldquo;{s.quote}&rdquo;</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{s.result}</p>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.role}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Success Story" size="3xl">
        {selected && (
          <div className="space-y-4">
            <div className={`aspect-[2/1] rounded-xl bg-gradient-to-br ${STORY_COLORS[0]} flex items-end p-6`}>
              <p className="text-sm font-medium uppercase tracking-wider text-white/70">{selected.species}</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">&ldquo;{selected.quote}&rdquo;</p>
            <p className="text-sm leading-relaxed text-gray-500">{selected.result}</p>
            <p className="text-sm leading-relaxed text-gray-500">{selected.fullStory}</p>
            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                {selected.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.role}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
