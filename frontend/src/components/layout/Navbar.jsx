import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Wildlife Guide', href: '/wildlife-guide' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  function isActive(href) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-green-600">
          ResQBridge
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-green-700 ${
                isActive(link.href)
                  ? 'rounded-lg bg-green-100 px-3 py-1.5 text-green-800 -mx-3'
                  : 'text-gray-600 px-3 py-1.5 -mx-3'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-green-600 ${
                isActive(link.href) ? 'bg-green-50 text-green-700' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={() => { handleLogout(); setOpen(false) }}
                className="block w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
