import { useState, useEffect, useCallback } from 'react'
import AnimateIn from '../../components/ui/AnimateIn'

const CAROUSEL_COLORS = [
  'from-emerald-700 via-green-600 to-teal-700',
  'from-amber-600 via-orange-500 to-red-600',
  'from-teal-700 via-cyan-600 to-blue-700',
  'from-indigo-700 via-violet-600 to-purple-700',
]

export default function Carousel({ slides }) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1)), [slides.length])
  const next = useCallback(() => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1)), [slides.length])

  useEffect(() => {
    if (!slides.length) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  if (!slides.length) return null

  const slide = slides[current]
  const bg = CAROUSEL_COLORS[current % CAROUSEL_COLORS.length]

  return (
    <section className="relative overflow-hidden px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-full">
        <div className="relative isolate overflow-hidden rounded-xl">
          {slide.image ? (
            <div className="absolute inset-0 transition-all duration-700">
              <img src={slide.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            </div>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} transition-all duration-700`} />
          )}
          <div className="relative z-10 flex flex-col items-center px-6 py-44 text-center text-white sm:px-12 lg:px-20">
            <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
              Featured
            </span>
            <h3 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{slide.title}</h3>
            <p className="mt-2 max-w-xl text-md leading-relaxed text-white/90 sm:text-base lg:text-xl">
              {slide.desc}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current ? 'w-8 bg-green-700' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                style={{ height: '8px' }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
