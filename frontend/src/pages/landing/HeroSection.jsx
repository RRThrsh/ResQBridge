import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'

export default function HeroSection({
  badge = 'Community Powered',
  title = 'Helping Lost Pets Find Their Way Home',
  description = 'Report lost or found animals, connect with your community, and help reunite pets with their families.',
}) {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  const words = title.split(' ')
  const normalTitle = words.length > 2 ? words.slice(0, -2).join(' ') : ''
  const gradientTitle = words.length > 2 ? words.slice(-2).join(' ') : title

  const dots = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      left: `${(i * 23 + 7) % 100}%`,
      top: `${(i * 17 + 11) % 100}%`,
      delay: `${(i * 0.4) % 3}s`,
      size: (i % 3) + 1,
    })), [])

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-white px-6 py-20">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse-soft rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-float rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-72 w-72 animate-float-slow rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb20_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb20_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Floating decorative dots */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {dots.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-400/30"
            style={{
              left: d.left,
              top: d.top,
              width: `${d.size * 4}px`,
              height: `${d.size * 4}px`,
              animation: `float ${3 + (i % 4)}s ease-in-out ${d.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Badge */}
        <div className="animate-fadeIn">
          <span className="inline-block rounded-full border border-emerald-200/60 bg-white/70 px-5 py-2 text-sm font-semibold tracking-wide text-emerald-700 shadow-sm backdrop-blur-md">
            {badge}
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
          {normalTitle && <>{normalTitle} </>}
          <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
            {gradientTitle}
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600">
          {description}
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link to="/report">
            <Button
              size="lg"
              className="w-full rounded-xl px-8 py-6 text-base shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-300/40 sm:w-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Report an Animal
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={scrollToHowItWorks}
            className="w-full rounded-xl px-8 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50 sm:w-auto"
          >
            Learn More
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <FeaturePill icon="🐶" label="Lost & Found Animals" />
          <div className="hidden h-5 w-px bg-gray-300 sm:block" />
          <FeaturePill icon="⚡" label="Fast Community Reporting" />
          <div className="hidden h-5 w-px bg-gray-300 sm:block" />
          <FeaturePill icon="💚" label="Helping Pets Reunite" />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 flex flex-col items-center text-gray-400">
          <span className="mb-2 text-xs uppercase tracking-[0.3em]">Scroll</span>
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-300">
            <div className="mt-2 h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturePill({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs shadow-sm">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  )
}
