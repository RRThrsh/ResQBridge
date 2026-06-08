
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import {
  useMutation,
  useQuery,
} from 'convex/react'

import { api } from '../../convex/_generated/api'

import type { AdminUser } from '@/types/auth'

import { normalizeEmail } from '@/lib/admin'
import { logLogout } from '@/lib/logAudit'

interface AdminAuthContextType {
  isLoggedIn: boolean
  admin: AdminUser | null
  login: (admin: AdminUser) => Promise<void>
  updateAdmin: (
    patch: Pick<
      AdminUser,
      'firstName' | 'lastName'
    >,
  ) => void
  logout: () => void
}

const STORAGE_KEY = 'pwrrc_admin'

const SESSION_KEY =
  'pwrrc_admin_session'

const AdminAuthContext =
  createContext<
    AdminAuthContextType | undefined
  >(undefined)

function loadStoredAdmin(): AdminUser | null {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (!raw) return null

    const parsed =
      JSON.parse(raw) as AdminUser

    if (
      parsed.email &&
      parsed.firstName &&
      parsed.lastName &&
      parsed.role === 'admin'
    ) {
      return {
        ...parsed,
        email: normalizeEmail(
          parsed.email,
        ),
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

  const dbAdmin = useQuery(
    api.admin.getAdminByEmailQuery,
    admin
      ? {
          email: normalizeEmail(
            admin.email,
          ),
        }
      : 'skip',
  )

  const updateSession =
    useMutation(
      api.admin.updateActiveSession,
    )

  useEffect(() => {
    if (!admin || !dbAdmin) return

    const localSession =
      localStorage.getItem(
        SESSION_KEY,
      )

    if (
      dbAdmin.activeSessionId &&
      dbAdmin.activeSessionId !==
        localSession
    ) {
      logout()

      alert(
        'Your account was logged in on another device.',
      )
    }
  }, [dbAdmin])

  const login = async (
    nextAdmin: AdminUser,
  ) => {
    const activeSessionId =
      crypto.randomUUID()

    const adminUser = {
      ...nextAdmin,
      email: normalizeEmail(
        nextAdmin.email,
      ),
      activeSessionId,
    }

    await updateSession({
      email: adminUser.email,
      sessionId: activeSessionId,
    })

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
    const current = admin
    setAdmin(null)

    localStorage.removeItem(
      STORAGE_KEY,
    )

    localStorage.removeItem(
      SESSION_KEY,
    )

    if (current) logLogout(current.email, `${current.firstName} ${current.lastName}`.trim(), 'admin')
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isLoggedIn:
          admin !== null,
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

