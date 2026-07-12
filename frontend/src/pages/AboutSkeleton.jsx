import { Skeleton } from '../components/ui'

export default function AboutSkeleton() {
  return (
    <div className="px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-9 w-64 sm:h-10" />
        <Skeleton className="mt-3 h-4 w-80" />
        <div className="mt-10 space-y-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="my-10 h-px w-full" />
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
            <Skeleton className="mt-1 h-4 w-4/5" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
            <Skeleton className="mt-1 h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}
