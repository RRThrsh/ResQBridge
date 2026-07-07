import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { rescuer as rescuerApi } from '../../services/api'
import { CheckIcon, XIcon } from '../../components/SvgIcons'

export default function RescuerProfile() {
  const { user, updateUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const result = await rescuerApi.updateProfile({ firstName, lastName, phoneNumber })
      updateUser(result.user)
      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not save profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '')

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-lg text-gray-500">Update your personal information</p>
        </div>

        {message && (
          <div className={`mb-6 rounded-2xl px-6 py-4 text-lg font-bold flex items-center gap-3 border-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            <span>{message.type === 'success' ? <CheckIcon className="w-6 h-6" /> : <XIcon className="w-6 h-6" />}</span>
            {message.text}
          </div>
        )}

        <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow">
          <div className="bg-amber-600 px-6 py-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white shadow-lg ring-4 ring-white/50">
              {initials || 'R'}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
            <p className="text-lg text-white/90">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-5 py-3.5 text-lg focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-5 py-3.5 text-lg focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 px-5 py-3.5 text-lg focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-700 mb-1.5">Email</label>
              <div className="flex items-center gap-4 rounded-xl border-2 border-gray-200 bg-gray-50 px-5 py-3.5">
                <svg className="h-6 w-6 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-lg text-gray-700 font-medium">{user.email}</span>
                <span className="ml-auto rounded-lg bg-gray-200 px-3 py-1 text-sm font-bold text-gray-600">Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-100 pt-6">
              <p className="text-base text-gray-600 font-semibold">
                <span className="capitalize">{user.role}</span> account
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-3.5 text-lg font-bold text-white shadow transition-all hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
