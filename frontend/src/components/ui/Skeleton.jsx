export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  )
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`rounded-2xl border-2 border-gray-200 bg-white p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3.5">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-40 flex-1" />
            <Skeleton className="h-4 w-28 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonConfigCard({ className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 ${className}`}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
