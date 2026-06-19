export default function Maintenance({ endTime }) {
  const formatted = endTime
    ? new Date(endTime).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-sm px-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.645 3.254a1.5 1.5 0 01-2.275-1.28v-7.29a1.5 1.5 0 012.275-1.28l5.645 3.254m5.645-3.254l5.645-3.255a1.5 1.5 0 012.275 1.28v7.29a1.5 1.5 0 01-2.275 1.28l-5.645-3.254m0 0l-5.645 3.254" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Under Maintenance
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {formatted ? `Back ${formatted}` : 'We\'ll be back shortly.'}
        </p>
        <div className="mx-auto mt-8 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
