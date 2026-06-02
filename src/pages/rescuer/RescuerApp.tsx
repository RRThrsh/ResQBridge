import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { RescuerShell } from '@/components/rescuer/RescuerShell'
import { RescuerLogin } from '@/pages/rescuer/RescuerLogin'
import { RescuerProfilePage } from '@/pages/rescuer/RescuerProfilePage'
import { RescuerReportDetailPage } from '@/pages/rescuer/RescuerReportDetailPage'
import { RescuerReportsPage } from '@/pages/rescuer/RescuerReportsPage'
import { Toaster } from '@/components/ui/sonner'

function RescuerGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, rescuer, logout } = useRescuerAuth()
  const allowed = useQuery(
    api.rescuers.isRescuer,
    rescuer ? { email: normalizeEmail(rescuer.email) } : 'skip',
  )

  useEffect(() => {
    if (allowed === false) {
      logout()
    }
  }, [allowed, logout])

  if (!isLoggedIn) {
    return <Navigate to="/pwrcc/rescuer/login" replace />
  }

  if (allowed === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/pwrcc/rescuer/login" replace />
  }

  return <>{children}</>
}

export function RescuerApp() {
  return (
    <>
      <Routes>
        <Route path="login" element={<RescuerLogin />} />
        <Route
          element={
            <RescuerGuard>
              <RescuerShell />
            </RescuerGuard>
          }
        >
          <Route index element={<RescuerReportsPage />} />
          <Route path="profile" element={<RescuerProfilePage />} />
        </Route>
        <Route
          path="reports/:reportId"
          element={
            <RescuerGuard>
              <RescuerReportDetailPage />
            </RescuerGuard>
          }
        />
        <Route path="*" element={<Navigate to="/pwrcc/rescuer" replace />} />
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
