import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'

export default function HeroSection({ badge, title, description }) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-12 sm:px-8 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-50/50 blur-2xl" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="text-center lg:text-left">
          <span className="inline-block max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-medium tracking-wide text-emerald-700 uppercase sm:px-4 sm:py-1.5 sm:text-xs">
            {badge}
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:mt-6 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:mt-6 sm:text-base sm:leading-relaxed lg:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/report"><Button size="lg" className="w-full sm:w-auto">Report an Animal</Button></Link>
            <Link to="/wildlife-guide"><Button variant="outline" size="lg" className="w-full sm:w-auto">Wildlife Guide</Button></Link>
          </div>
        </div>
        <div className="relative hidden h-72 lg:block lg:h-[28rem]">
          <div className="absolute right-0 h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 rounded-t-[100%] bg-gradient-to-t from-green-700/20 to-transparent" />
            <div className="absolute bottom-12 left-0 right-0 mx-auto h-8 w-3/4 rounded-t-full bg-gradient-to-t from-green-800/30 to-transparent" />
            <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full bg-yellow-200/60 blur-sm" />
            <div className="absolute bottom-4 left-1/3 h-6 w-6 rounded-full bg-green-600/20" />
            <div className="absolute bottom-6 right-1/4 h-4 w-4 rounded-full bg-green-600/20" />
            <div className="absolute bottom-8 left-1/2 h-3 w-3 rounded-full bg-green-600/15" />
            <div className="absolute right-12 top-12 h-24 w-24 rounded-full bg-white/60 shadow-lg" />
            <div className="absolute right-16 top-16 h-8 w-8 rounded-full bg-yellow-100" />
            <svg className="absolute left-8 top-8 h-12 w-12 text-green-600/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
