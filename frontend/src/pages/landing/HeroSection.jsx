import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'

export default function HeroSection({
  badge = 'Community Powered',
  title = 'Helping Lost Pets Find Their Way Home',
  description = 'Report lost or found animals, connect with your community, and help reunite pets with their families.',
}) {
  const scrollToHowItWorks = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const words = title.split(' ')
  const normalTitle =
    words.length > 2 ? words.slice(0, -2).join(' ') : ''
  const gradientTitle =
    words.length > 2 ? words.slice(-2).join(' ') : title

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-white px-6 py-20">
      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_60%)]" />

      {/* Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb25_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb25_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Glow Effects */}
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl animate-pulse" />
      <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-green-200/20 blur-3xl animate-pulse" />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-100/40 blur-3xl" />

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Badge */}
        <span className="rounded-full border border-emerald-200 bg-white/80 px-5 py-2 text-sm font-semibold tracking-wide text-emerald-700 shadow-sm backdrop-blur">
          {badge}
        </span>

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
              className="w-full rounded-xl px-8 py-6 text-base shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-300/30 sm:w-auto"
            >
              🐾 Report an Animal
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={scrollToHowItWorks}
            className="w-full rounded-xl px-8 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50 sm:w-auto"
          >
            Learn More →
          </Button>
        </div>

        {/* Features */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>🐶</span>
            <span>Lost & Found Animals</span>
          </div>

          <div className="hidden h-5 w-px bg-gray-300 sm:block" />

          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>Fast Community Reporting</span>
          </div>

          <div className="hidden h-5 w-px bg-gray-300 sm:block" />

          <div className="flex items-center gap-2">
            <span>💚</span>
            <span>Helping Pets Reunite</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 flex flex-col items-center text-gray-400">
          <span className="mb-2 text-xs uppercase tracking-[0.3em]">
            Scroll
          </span>

          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-300">
            <div className="mt-2 h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}