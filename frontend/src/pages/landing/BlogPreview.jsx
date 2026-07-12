import { Link } from 'react-router-dom'
import AnimateIn from '../../components/ui/AnimateIn'

const blogPosts = [
  {
    category: 'Wildlife Care',
    title: 'First Aid Tips for Injured Wildlife',
    excerpt: 'Learn the essential steps to take when you encounter an injured animal in the wild.',
    date: 'Jul 5, 2026',
    readTime: '5 min read',
    color: 'from-emerald-500 to-green-600',
  },
  {
    category: 'Community',
    title: 'How to Build a Wildlife-Friendly Backyard',
    excerpt: 'Simple changes you can make to turn your outdoor space into a haven for local wildlife.',
    date: 'Jun 28, 2026',
    readTime: '4 min read',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    category: 'Conservation',
    title: 'The State of Palawan Wildlife in 2026',
    excerpt: 'An in-depth look at the challenges and successes in wildlife conservation across Palawan.',
    date: 'Jun 20, 2026',
    readTime: '8 min read',
    color: 'from-amber-400 to-orange-600',
  },
  {
    category: 'Success Story',
    title: 'From Rescue to Release: A Philippine Eagle Journey',
    excerpt: 'Follow the remarkable rehabilitation of a magnificent Philippine Eagle rescued in Palawan.',
    date: 'Jun 15, 2026',
    readTime: '6 min read',
    color: 'from-teal-500 to-cyan-600',
  },
]

export default function BlogPreview({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post, i) => (
            <AnimateIn key={i} delay={i * 100}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <div className={`aspect-[16/9] bg-gradient-to-br ${post.color} flex items-end p-4`}>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-gray-500 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn delay={300}>
          <div className="mt-8 text-center">
            <Link
              to="/wildlife-guide"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              View Wildlife Guide
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
