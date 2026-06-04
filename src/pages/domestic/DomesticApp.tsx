import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { normalizeEmail } from '@/lib/admin'
// We will create these components next!
import { DomesticShell } from '@/components/domestic/DomesticShell' 
import { DomesticLogin } from '@/pages/domestic/DomesticLogin'
import { DomesticReportsPage } from '@/pages/domestic/DomesticReportsPage'
import { Toaster } from '@/components/ui/sonner'

function DomesticGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, domesticApprover, logout } = useDomesticAuth()
  
  // Checks if the logged-in email is officially an authorized Domestic Approver
  // @ts-ignore
  const allowed = useQuery(
    api.domestic.isDomesticApprover,
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
          {/* Default dashboard route */}
          <Route index element={<DomesticReportsPage />} />
          {/* We can add a DomesticProfilePage later if you want them to edit their info! */}
        </Route>
        
        {/* We will build the Approval Detail Page next */}
        {/* <Route
          path="reports/:reportId"
          element={
            <DomesticGuard>
              <DomesticReportDetailPage />
            </DomesticGuard>
          }
        /> */}
        
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
