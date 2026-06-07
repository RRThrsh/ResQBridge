import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { Menu } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

const titles: Record<string, string> = {
  '/pwrcc/admin': 'Dashboard',
  '/pwrcc/admin/reports': 'Reports',
  '/pwrcc/admin/reports/wildlife': 'Wildlife reports',
  '/pwrcc/admin/reports/domestic': 'Domestic reports',
  '/pwrcc/admin/users': 'Users',
  '/pwrcc/admin/rescuers': 'Rescuers',
  '/pwrcc/admin/domestic-approvers': 'Domestic Approvers',
  '/pwrcc/admin/audit-logs': 'Audit Logs',
  '/pwrcc/admin/wildlife': 'Wildlife Guide',
  '/pwrcc/admin/news': 'News & Events',
  '/pwrcc/admin/admins': 'Admins',
  '/pwrcc/admin/profile': 'My profile',
}

export function AdminLayout() {
  const { admin } = useAdminAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const seedContent = useMutation(api.content.seedContent)

  useEffect(() => {
    if (!admin) return
    void seedContent({ adminEmail: normalizeEmail(admin.email) }).catch(() => {
      /* content seed is best-effort */
    })
  }, [admin, seedContent])

  const pageTitle = titles[location.pathname] ?? 'Admin'

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden h-screen shrink-0 overflow-hidden lg:block">
        <AdminSidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Administration
            </p>
            <h2
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {pageTitle}
            </h2>
          </div>
          <ThemeToggle className="ml-auto" />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
