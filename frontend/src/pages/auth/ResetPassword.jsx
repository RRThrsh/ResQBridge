import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/v1/login'), 3000)
      } else {
        setError(data.message || 'Failed to reset password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Invalid Link</h1>
          <p className="mt-2 text-sm text-gray-500">This password reset link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-lg font-bold text-white">
            R
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your new password</p>
        </div>

        {success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-medium text-green-800">Password reset successful!</p>
            <p className="mt-1 text-xs text-green-600">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Repeat your password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
