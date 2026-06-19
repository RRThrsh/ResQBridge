import { useAuth } from '../../context/AuthContext'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export default function RescuerDashboard() {
  const { user: ctxUser } = useAuth()
  const user = ctxUser || getUser()

  if (!user) return null

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.firstName}</h1>
          <p className="mt-1 text-sm text-gray-500">Your rescuer dashboard</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Requests</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">0</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">On Duty</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">--</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-400">Name</p>
              <p className="mt-0.5 text-sm text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Email</p>
              <p className="mt-0.5 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Role</p>
              <p className="mt-0.5 text-sm text-gray-900">{user.role}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Member Since</p>
              <p className="mt-0.5 text-sm text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-400">No pending requests</p>
          <p className="mt-1 text-xs text-gray-400">New rescue requests will appear here.</p>
        </div>
      </div>
    </main>
  )
}
