import type { ReactNode } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { DomesticAuthProvider } from '@/context/DomesticAuthContext'
import { RescuerAuthProvider } from '@/context/RescuerAuthContext'
import { UserAuthProvider } from '@/context/UserAuthContext'

export function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <RescuerAuthProvider>
          <DomesticAuthProvider> {/* <--- Wraps the children right here! */}
            {children}
          </DomesticAuthProvider>
        </RescuerAuthProvider>
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
