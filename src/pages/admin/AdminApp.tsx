import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminNewsPage } from '@/pages/admin/AdminNewsPage'
import { AdminDomesticReportsPage } from '@/pages/admin/AdminDomesticReportsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminWildlifeReportsPage } from '@/pages/admin/AdminWildlifeReportsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminWildlifePage } from '@/pages/admin/AdminWildlifePage'
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage'
import { AdminAdminsPage } from '@/pages/admin/AdminAdminsPage'
import { AdminRescuersPage } from '@/pages/admin/AdminRescuersPage'
import { AdminDomesticApproversPage } from '@/pages/admin/AdminDomesticApproversPage'
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage'
import { Toaster } from '@/components/ui/sonner'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, admin, logout } = useAdminAuth()
  const allowed = useQuery(
    api.admin.isAdmin,
    admin ? { email: normalizeEmail(admin.email) } : 'skip',
  )

  useEffect(() => {
    if (allowed === false) {
      logout()
    }
  }, [allowed, logout])

  if (!isLoggedIn) {
    return <Navigate to="/pwrcc/admin/login" replace />
  }

  if (allowed === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/pwrcc/admin/login" replace />
  }

  return <>{children}</>
}

export function AdminApp() {
  return (
    <>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="reports/wildlife" element={<AdminWildlifeReportsPage />} />
          <Route path="reports/domestic" element={<AdminDomesticReportsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="wildlife" element={<AdminWildlifePage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="rescuers" element={<AdminRescuersPage />} />
          <Route path="domestic-approvers" element={<AdminDomesticApproversPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="admins" element={<AdminAdminsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/pwrcc/admin" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  )
}
