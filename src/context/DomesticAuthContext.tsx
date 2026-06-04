import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { normalizeEmail } from '@/lib/admin'
import type { DomesticUser } from '@/lib/domestic-auth-api'

interface DomesticAuthContextType {
  isLoggedIn: boolean
  domesticApprover: DomesticUser | null
  login: (approver: DomesticUser) => void
  updateApprover: (patch: Pick<DomesticUser, 'firstName' | 'lastName'>) => void
  logout: () => void
}

const STORAGE_KEY = 'pwrrc_domestic'

const DomesticAuthContext = createContext<DomesticAuthContextType | undefined>(undefined)

function loadStoredApprover(): DomesticUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DomesticUser
    if (parsed.email && parsed.firstName && parsed.lastName) {
      return { ...parsed, email: normalizeEmail(parsed.email) }
    }
    return null
  } catch {
    return null
  }
}

export function DomesticAuthProvider({ children }: { children: ReactNode }) {
  const [approver, setApprover] = useState<DomesticUser | null>(() => loadStoredApprover())

  const login = (nextApprover: DomesticUser) => {
    const user = { ...nextApprover, email: normalizeEmail(nextApprover.email) }
    setApprover(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }

  const updateApprover = (patch: Pick<DomesticUser, 'firstName' | 'lastName'>) => {
    setApprover((current) => {
      if (!current) return current
      const next = { ...current, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    setApprover(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <DomesticAuthContext.Provider
      value={{ 
        isLoggedIn: approver !== null, 
        domesticApprover: approver, 
        login, 
        updateApprover, 
        logout 
      }}
    >
      {children}
    </DomesticAuthContext.Provider>
  )
}

export function useDomesticAuth() {
  const context = useContext(DomesticAuthContext)
  if (context === undefined) {
    throw new Error('useDomesticAuth must be used within a DomesticAuthProvider')
  }
  return context
}
