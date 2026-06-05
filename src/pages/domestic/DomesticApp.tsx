import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { DomesticShell } from '@/components/domestic/DomesticShell' 
import { DomesticLogin } from '@/pages/domestic/DomesticLogin'
import { DomesticReportsPage } from '@/pages/domestic/DomesticReportsPage'
// ADDED THIS IMPORT:
import { DomesticReportDetailPage } from '@/pages/domestic/DomesticReportDetailPage'
import { Toaster } from '@/components/ui/sonner'
import { DomesticProfilePage } from '@/pages/domestic/DomesticProfilePage'
function DomesticGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, domesticApprover, logout } = useDomesticAuth()
  
  // @ts-ignore
  const allowed = useQuery(
    (api as any).domestic.isDomesticApprover,
    domesticApprover ? { email: normalizeEmail(domesticApprover.email) } : 'skip',
  )

  useEffect(() => {
    if (allowed === false) {
      logout()
    }
  }, [allowed, logout])

  if (!isLoggedIn) {
    return <Navigate to="/pwrcc/domestic/login" replace />
  }

  if (allowed === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/pwrcc/domestic/login" replace />
  }

  return <>{children}</>
}

export function DomesticApp() {
  return (
    <>
      <Routes>
        <Route path="login" element={<DomesticLogin />} />
<Route
  element={
    <DomesticGuard>
      <DomesticShell />
    </DomesticGuard>
  }
>
  <Route index element={<DomesticReportsPage />} />

  <Route
    path="profile"
    element={<DomesticProfilePage />}
  />
</Route>
        
        {/* THIS IS NOW UNCOMMENTED AND ACTIVE! */}
        <Route
          path="reports/:reportId"
          element={
            <DomesticGuard>
              <DomesticReportDetailPage />
            </DomesticGuard>
          }
        />
        
        <Route path="*" element={<Navigate to="/pwrcc/domestic" replace />} />
      </Routes>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
          },
        }}
      />
    </>
  )
}
