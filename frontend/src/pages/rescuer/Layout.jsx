import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { useNotifications } from '../../context/NotificationContext'
import { rescuer as rescuerApi } from '../../services/api'

const navItems = [
  {
    label: 'Dashboard',
    path: '/rescuer/dashboard',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 15.75V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'My Assignments',
    path: '/rescuer/assignments',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Team Map',
    path: '/rescuer/team-map',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: 'My Shifts',
    path: '/rescuer/shifts',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Activity Log',
    path: '/rescuer/activity',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/rescuer/profile',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

export default function RescuerLayout() {
  const { user, loading: authLoading, logout } = useAuth()
  const { userPos, requestLocation } = useLocationContext()
  const { toasts, unreadCount, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [availability, setAvailability] = useState(user?.availability || 'available')
  const [togglingAvail, setTogglingAvail] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const locIntervalRef = useRef(null)
  const lastSentRef = useRef(null)
  const userPosRef = useRef(null)

  useEffect(() => {
    userPosRef.current = userPos
  }, [userPos])

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { requestLocation() }, [requestLocation])

  useEffect(() => {
    if (!user) return
    const send = () => {
      const pos = userPosRef.current
      if (!pos) return
      const key = `${pos.lat.toFixed(4)}_${pos.lng.toFixed(4)}`
      if (lastSentRef.current === key) return
      lastSentRef.current = key
      rescuerApi.updateLocation(pos.lat, pos.lng).catch(() => {})
    }
    send()
    locIntervalRef.current = setInterval(send, 30000)
    return () => { if (locIntervalRef.current) { clearInterval(locIntervalRef.current); locIntervalRef.current = null } }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!user || (user.role !== 'rescuer' && user.role !== 'admin' && user.role !== 'superadmin')) {
      navigate(user ? '/' : '/v1/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user?.availability) setAvailability(user.availability)
  }, [user?.availability])

  async function toggleAvailability() {
    setTogglingAvail(true)
    const next = availability === 'available' ? 'busy' : 'available'
    try {
      await rescuerApi.updateAvailability(next)
      setAvailability(next)
    } catch {} finally { setTogglingAvail(false) }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (authLoading) return null
  if (!user || (user.role !== 'rescuer' && user.role !== 'admin' && user.role !== 'superadmin')) return null

  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-300 bg-white shadow-lg transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-lg font-bold text-white shadow">
            R
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">ResQBridge</span>
            <p className="text-sm text-gray-500">Rescuer Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                    active
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-6 border-t border-gray-200 pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3 px-1">Your Status</p>
            <button
              onClick={toggleAvailability}
              disabled={togglingAvail}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-bold transition-all ${
                availability === 'available'
                  ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              <span className={`h-3 w-3 rounded-full ${availability === 'available' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {availability === 'available' ? 'Available' : 'Busy'}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 space-y-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700 transition-all hover:bg-red-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-h-screen md:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl p-3 text-gray-700 bg-gray-100 hover:bg-gray-200 md:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="hidden md:block text-lg font-semibold text-gray-800 capitalize">
              {location.pathname === '/rescuer/assignments' ? 'All Assignments' : location.pathname.split('/').pop().replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative"
              aria-label="Notifications"
            >
              <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-base font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => navigate('/rescuer/profile')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-lg font-bold text-white shadow hover:bg-amber-700 transition-colors"
              >
                {initials || 'R'}
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </div>

      {notifOpen && (
        <div
          ref={notifRef}
          className="fixed top-20 right-6 z-50 w-80 rounded-2xl border-2 border-gray-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-bold text-gray-900">Notifications</h3>
            {toasts.length > 0 && (
              <button
                onClick={() => { markAllRead(); setNotifOpen(false) }}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto px-5 py-3 space-y-2">
            {toasts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
            ) : (
              toasts.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl border-2 px-4 py-3 ${
                    t.type === 'success' ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{t.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
