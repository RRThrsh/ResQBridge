import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-2xl font-light text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
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
