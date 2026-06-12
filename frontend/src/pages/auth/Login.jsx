import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light text-gray-900 sm:text-3xl">Login</h1>
        <p className="mt-2 text-sm text-gray-400">Welcome back to ResQBridge.</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-green-700 underline underline-offset-2 hover:text-green-800">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-green-700 underline underline-offset-2 hover:text-green-800">
            Register
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}
