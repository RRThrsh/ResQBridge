import type { ReactNode } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { RescuerAuthProvider } from '@/context/RescuerAuthContext'
import { UserAuthProvider } from '@/context/UserAuthContext'

export function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <RescuerAuthProvider>{children}</RescuerAuthProvider>
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
