import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  LayoutDashboard,
  Leaf,
  PawPrint,
  LogOut,
  Newspaper,
  Settings,
  Shield,
  Truck,
  UserCircle,
  Users,
  Home,
  ScrollText,
} from 'lucide-react'
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog'
import { cn } from '@/lib/utils'
import { useAdminAuth } from '@/context/AdminAuthContext'

const navItems = [
  { to: '/pwrcc/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pwrcc/admin/reports/wildlife', label: 'Wildlife reports', icon: Leaf },
  { to: '/pwrcc/admin/reports/domestic', label: 'Domestic reports', icon: PawPrint },
  { to: '/pwrcc/admin/users', label: 'Users', icon: Users },
  { to: '/pwrcc/admin/wildlife', label: 'Wildlife Guide', icon: Leaf },
  { to: '/pwrcc/admin/news', label: 'News & Events', icon: Newspaper },
  { to: '/pwrcc/admin/rescuers', label: 'Rescuers', icon: Truck },
  { to: '/pwrcc/admin/domestic-approvers', label: 'Domestic Approvers', icon: Home },
  { to: '/pwrcc/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/pwrcc/admin/config', label: 'App Config', icon: Settings },
  { to: '/pwrcc/admin/admins', label: 'Admins', icon: Shield },
  { to: '/pwrcc/admin/profile', label: 'My profile', icon: UserCircle },
] as const

type Props = {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: Props) {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()
  const [signOutOpen, setSignOutOpen] = useState(false)

  const counts = useQuery(
    api.admin.getNavCounts,
    admin ? { adminEmail: admin.email } : 'skip',
  )

  function confirmSignOut() {
    logout()
    onNavigate?.()
    setSignOutOpen(false)
    navigate('/')
  }

  return (
    <>
      <aside className="flex h-[100dvh] w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground overflow-y-auto">
        <div className="border-b border-sidebar-border px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            ResQBridge
          </p>
          <h1
            className="mt-1 text-lg font-bold text-sidebar-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Admin Panel
          </h1>
        {admin ? (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {admin.firstName} {admin.lastName}
          </p>
        ) : null}
        </div>

        <nav className="flex-1 space-y-1 p-3 pb-24">
          {navItems.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest ? rest.end : false}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {(to === '/pwrcc/admin/reports/wildlife' && counts?.wildlifePending) ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {counts.wildlifePending > 99 ? '99+' : counts.wildlifePending}
                </span>
              ) : null}
              {(to === '/pwrcc/admin/reports/domestic' && counts?.domesticPending) ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {counts.domesticPending > 99 ? '99+' : counts.domesticPending}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          View public site
        </a>
          <button
            type="button"
            onClick={() => setSignOutOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <AdminConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You will leave the admin panel and return to the public ResQBridge website. You can sign in again anytime."
        onConfirm={confirmSignOut}
      />
    </>
  )
}
