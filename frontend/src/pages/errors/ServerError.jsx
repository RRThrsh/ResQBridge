import { Link } from 'react-router-dom'

export default function ServerError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-red-200">500</p>
        <h1 className="mt-4 text-2xl font-light text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-400">An unexpected error occurred. Please try again later.</p>
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
