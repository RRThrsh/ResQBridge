import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { RescuerUser } from '@/types/auth'
import { normalizeEmail } from '@/lib/admin'
import { logLogout } from '@/lib/logAudit'

interface RescuerAuthContextType {
  isLoggedIn: boolean
  rescuer: RescuerUser | null
  login: (rescuer: RescuerUser) => void
  updateRescuer: (patch: Pick<RescuerUser, 'firstName' | 'lastName'>) => void
  logout: () => void
}

const STORAGE_KEY = 'pwrrc_rescuer'

const RescuerAuthContext = createContext<RescuerAuthContextType | undefined>(undefined)

function loadStoredRescuer(): RescuerUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RescuerUser
    if (parsed.email && parsed.firstName && parsed.lastName && parsed.role === 'rescuer') {
      return { ...parsed, email: normalizeEmail(parsed.email) }
    }
    return null
  } catch {
    return null
  }
}

export function RescuerAuthProvider({ children }: { children: ReactNode }) {
  const [rescuer, setRescuer] = useState<RescuerUser | null>(() => loadStoredRescuer())

  const login = (nextRescuer: RescuerUser) => {
    const rescuerUser = { ...nextRescuer, email: normalizeEmail(nextRescuer.email) }
    setRescuer(rescuerUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rescuerUser))
  }

  const updateRescuer = (patch: Pick<RescuerUser, 'firstName' | 'lastName'>) => {
    setRescuer((current) => {
      if (!current) return current
      const next = { ...current, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    const current = rescuer
    setRescuer(null)
    localStorage.removeItem(STORAGE_KEY)
    if (current) logLogout(current.email, `${current.firstName} ${current.lastName}`.trim(), 'rescuer')
  }

  return (
    <RescuerAuthContext.Provider
      value={{ isLoggedIn: rescuer !== null, rescuer, login, updateRescuer, logout }}
    >
      {children}
    </RescuerAuthContext.Provider>
  )
}

export function useRescuerAuth() {
  const context = useContext(RescuerAuthContext)
  if (context === undefined) {
    throw new Error('useRescuerAuth must be used within a RescuerAuthProvider')
  }
  return context
}
