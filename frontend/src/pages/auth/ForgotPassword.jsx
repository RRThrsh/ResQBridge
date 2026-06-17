import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light text-gray-900 sm:text-3xl">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-400">Enter your email and we'll send you a reset link.</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="you@example.com" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-800">
            Back to Login
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link to="/" className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}
