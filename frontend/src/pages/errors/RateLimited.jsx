import { Link } from 'react-router-dom'

export default function RateLimited() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-yellow-200">429</p>
        <h1 className="mt-4 text-2xl font-light text-gray-900">Too many requests</h1>
        <p className="mt-2 text-sm text-gray-400">You've made too many requests. Please wait a moment and try again.</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-green-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
