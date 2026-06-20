import { useState } from 'react'
import { Modal } from '../../components/ui'

const GALLERY_COLORS = [
  'from-emerald-600 to-green-800',
  'from-amber-500 to-orange-700',
  'from-teal-600 to-cyan-800',
  'from-blue-600 to-indigo-800',
  'from-rose-500 to-pink-800',
  'from-violet-500 to-purple-800',
]

export default function Gallery({ title, subtitle, images }) {
  const [selected, setSelected] = useState(null)

  if (!images.length) return null

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(img)}
              className={`group relative mb-4 block w-full overflow-hidden rounded-xl text-left ${
                img.span ? 'aspect-square sm:aspect-auto sm:row-span-2' : 'aspect-[4/3]'
              }`}
            >
              {img.image ? (
                <img src={img.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${GALLERY_COLORS[i % GALLERY_COLORS.length]}`} />
              )}
              <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />
              <div className="relative flex h-full flex-col justify-end p-5">
                <p className="text-sm font-semibold text-white">{img.title}</p>
                <p className="mt-1 text-xs text-white/70">{img.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Photo'} size="4xl">
        {selected && (
          <div className="space-y-4">
            {selected.image ? (
              <img src={selected.image} alt="" className="aspect-video w-full rounded-xl object-cover" />
            ) : (
              <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${GALLERY_COLORS[0]}`}>
                <div className="flex h-full items-end rounded-xl bg-black/20 p-6">
                  <p className="text-lg font-semibold text-white">{selected.title}</p>
                </div>
              </div>
            )}
            <p className="text-sm leading-relaxed text-gray-500">{selected.desc}</p>
            <p className="text-xs text-gray-400">{selected.label} &middot; {selected.date}</p>
          </div>
        )}
      </Modal>
    </section>
  )
}
