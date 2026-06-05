import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import type { AdminUser } from '@/types/auth'

import { normalizeEmail } from '@/lib/admin'

interface AdminAuthContextType {
  isLoggedIn: boolean
  admin: AdminUser | null
  login: (admin: AdminUser) => void
  updateAdmin: (
    patch: Pick<AdminUser, 'firstName' | 'lastName'>,
  ) => void
  logout: () => void
}

const STORAGE_KEY = 'pwrrc_admin'

const SESSION_KEY = 'pwrrc_admin_session'

const AdminAuthContext =
  createContext<AdminAuthContextType | undefined>(
    undefined,
  )

function loadStoredAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return null

    const parsed = JSON.parse(raw) as AdminUser

    if (
      parsed.email &&
      parsed.firstName &&
      parsed.lastName &&
      parsed.role === 'admin'
    ) {
      return {
        ...parsed,
        email: normalizeEmail(parsed.email),
      }
    }

    return null
  } catch {
    return null
  }
}

export function AdminAuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [admin, setAdmin] =
    useState<AdminUser | null>(() =>
      loadStoredAdmin(),
    )

  useEffect(() => {
    function checkSession() {
      const storedAdmin =
        localStorage.getItem(STORAGE_KEY)

      const storedSession =
        localStorage.getItem(SESSION_KEY)

      if (!storedAdmin || !storedSession) {
        setAdmin(null)
        return
      }

      try {
        const parsed = JSON.parse(storedAdmin)

        if (
          parsed.activeSessionId &&
          parsed.activeSessionId !== storedSession
        ) {
          logout()
        }
      } catch {
        logout()
      }
    }

    window.addEventListener(
      'storage',
      checkSession,
    )

    checkSession()

    return () => {
      window.removeEventListener(
        'storage',
        checkSession,
      )
    }
  }, [])

  const login = (nextAdmin: AdminUser) => {
    const activeSessionId =
      crypto.randomUUID()

    const adminUser = {
      ...nextAdmin,
      email: normalizeEmail(nextAdmin.email),
      activeSessionId,
    }

    setAdmin(adminUser)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(adminUser),
    )

    localStorage.setItem(
      SESSION_KEY,
      activeSessionId,
    )
  }

  const updateAdmin = (
    patch: Pick<
      AdminUser,
      'firstName' | 'lastName'
    >,
  ) => {
    setAdmin((current) => {
      if (!current) return current

      const next = {
        ...current,
        ...patch,
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next),
      )

      return next
    })
  }

  const logout = () => {
    setAdmin(null)

    localStorage.removeItem(STORAGE_KEY)

    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isLoggedIn: admin !== null,
        admin,
        login,
        updateAdmin,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(
    AdminAuthContext,
  )

  if (context === undefined) {
    throw new Error(
      'useAdminAuth must be used within an AdminAuthProvider',
    )
  }

  return context
}

