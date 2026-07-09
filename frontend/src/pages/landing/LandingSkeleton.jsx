function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
}

export default function LandingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar skeleton */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
        <SkeletonBlock className="h-6 w-28" />
        <div className="flex gap-4">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
      </div>

      <main className="flex-1">
        {/* Hero skeleton */}
        <section className="flex min-h-screen items-center justify-center px-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <SkeletonBlock className="mb-8 h-8 w-44 rounded-full" />
            <SkeletonBlock className="mb-4 h-16 w-3/4" />
            <SkeletonBlock className="mb-4 h-16 w-2/3" />
            <SkeletonBlock className="mb-8 h-6 w-1/2" />
            <div className="flex gap-4">
              <SkeletonBlock className="h-14 w-44 rounded-xl" />
              <SkeletonBlock className="h-14 w-36 rounded-xl" />
            </div>
            <div className="mt-14 flex gap-6">
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="h-5 w-36" />
            </div>
          </div>
        </section>

        {/* Carousel skeleton */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <SkeletonBlock className="h-80 w-full rounded-2xl" />
          </div>
        </section>

        {/* How It Works skeleton */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <SkeletonBlock className="mb-4 h-10 w-64" />
            <SkeletonBlock className="mb-10 h-5 w-96" />
            <div className="space-y-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <SkeletonBlock className="h-16 w-16 shrink-0 rounded-2xl" />
                  <SkeletonBlock className="h-24 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats skeleton */}
        <section className="border-t border-gray-100 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 grid grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <SkeletonBlock className="mx-auto mb-2 h-12 w-24" />
                  <SkeletonBlock className="mx-auto h-4 w-20" />
                </div>
              ))}
            </div>
            <SkeletonBlock className="mb-2 h-10 w-96" />
            <SkeletonBlock className="mb-10 h-5 w-64" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBlock key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>

        {/* Location skeleton */}
        <section className="border-t border-gray-100 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <SkeletonBlock className="mb-2 h-10 w-48" />
            <SkeletonBlock className="mb-10 h-5 w-72" />
            <div className="grid grid-cols-5 gap-8">
              <SkeletonBlock className="col-span-2 h-96 rounded-2xl" />
              <SkeletonBlock className="col-span-3 h-96 rounded-2xl" />
            </div>
          </div>
        </section>

        {/* FAQ skeleton */}
        <section className="border-t border-gray-100 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <SkeletonBlock className="mx-auto mb-2 h-10 w-24" />
            <SkeletonBlock className="mx-auto mb-10 h-5 w-72" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBlock key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </section>

        {/* Contact skeleton */}
        <section className="border-t border-gray-100 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <SkeletonBlock className="mb-2 h-10 w-48" />
            <SkeletonBlock className="mb-10 h-5 w-64" />
            <div className="grid grid-cols-5 gap-10">
              <SkeletonBlock className="col-span-2 h-80 rounded-2xl" />
              <SkeletonBlock className="col-span-3 h-80 rounded-2xl" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer skeleton */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-4 gap-10">
            <div className="col-span-2">
              <SkeletonBlock className="mb-3 h-6 w-28" />
              <SkeletonBlock className="h-12 w-72" />
            </div>
            <div>
              <SkeletonBlock className="mb-4 h-4 w-20" />
              <SkeletonBlock className="mb-2 h-3 w-16" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <div>
              <SkeletonBlock className="mb-4 h-4 w-16" />
              <SkeletonBlock className="mb-2 h-3 w-32" />
              <SkeletonBlock className="mb-2 h-3 w-28" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
