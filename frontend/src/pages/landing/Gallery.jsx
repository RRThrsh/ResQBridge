import { useState } from 'react'
import { Modal } from '../../components/ui'
import AnimateIn from '../../components/ui/AnimateIn'

const GALLERY_COLORS = [
  { from: 'from-emerald-500', to: 'to-green-700' },
  { from: 'from-amber-400', to: 'to-orange-600' },
  { from: 'from-teal-500', to: 'to-cyan-700' },
  { from: 'from-blue-500', to: 'to-indigo-700' },
  { from: 'from-rose-400', to: 'to-pink-600' },
  { from: 'from-violet-500', to: 'to-purple-700' },
]

export default function Gallery({ title, subtitle, images }) {
  const [selected, setSelected] = useState(null)

  if (!images.length) return null

  return (
    <section className="border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {images.map((img, i) => (
            <AnimateIn key={i} delay={i * 80}>
              <button
                onClick={() => setSelected(img)}
                className="group relative mb-5 block w-full overflow-hidden rounded-2xl text-left"
              >
                {img.image ? (
                  <img
                    src={img.image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`aspect-[4/3] bg-gradient-to-br ${GALLERY_COLORS[i % GALLERY_COLORS.length].from} ${GALLERY_COLORS[i % GALLERY_COLORS.length].to}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                  <p className="text-sm font-semibold text-white">{img.title}</p>
                  <p className="mt-0.5 text-xs text-white/70">{img.label}</p>
                </div>
              </button>
            </AnimateIn>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Photo'} size="4xl">
        {selected && (
          <div className="space-y-5">
            {selected.image ? (
              <img src={selected.image} alt="" className="aspect-video w-full rounded-xl object-cover" />
            ) : (
              <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${GALLERY_COLORS[0].from} ${GALLERY_COLORS[0].to}`}>
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
