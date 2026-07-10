import { Skeleton } from '../components/ui'

export default function WildlifeGuideSkeleton() {
  return (
    <div className="px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-9 w-72 sm:h-10" />
        <Skeleton className="mt-3 h-4 w-96" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Skeleton className="mb-3 h-28 w-full rounded-lg" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-20 rounded-full" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
