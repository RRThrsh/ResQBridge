import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '@/types/auth'
import { normalizeEmail } from '@/lib/admin'

interface UserAuthContextType {
  isLoggedIn: boolean
  user: AuthUser | null
  login: (user: AuthUser) => void
  updateUser: (patch: Pick<AuthUser, 'firstName' | 'lastName'>) => void
  logout: () => void
}

const STORAGE_KEY = 'pwrrc_user'

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

function toPublicUser(data: {
  email: string
  firstName: string
  lastName: string
  role?: string
}): AuthUser {
  return {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'user',
  }
}

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (parsed.email && parsed.firstName && parsed.lastName) {
      return toPublicUser({ ...parsed, email: normalizeEmail(parsed.email) })
    }
    return null
  } catch {
    return null
  }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())

  const login = (nextUser: Omit<AuthUser, 'role'> & { role?: string }) => {
    const user = toPublicUser({ ...nextUser, email: normalizeEmail(nextUser.email) })
    setUser(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }

  const updateUser = (patch: Pick<AuthUser, 'firstName' | 'lastName'>) => {
    setUser((current) => {
      if (!current) return current
      const next = { ...current, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <UserAuthContext.Provider
      value={{ isLoggedIn: user !== null, user, login, updateUser, logout }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}

/** Public-site auth (users only). */
export function useAuth() {
  return useUserAuth()
}
