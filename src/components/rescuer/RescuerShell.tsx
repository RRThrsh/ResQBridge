import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ClipboardList, UserCircle } from 'lucide-react'
import { RescuerLayout } from '@/components/rescuer/RescuerLayout'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/pwrcc/rescuer', label: 'Assignments', icon: ClipboardList, end: true },
  { to: '/pwrcc/rescuer/profile', label: 'Account', icon: UserCircle, end: false },
] as const

export function RescuerShell() {
  const { pathname } = useLocation()

  return (
    <RescuerLayout
      footer={
        <nav aria-label="Rescuer navigation">
          <div className="mx-auto max-w-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
            <div className="flex w-full gap-1 rounded-2xl border border-border bg-muted/40 p-1">
              {navItems.map(({ to, label, icon: Icon, end }) => {
                const active = end
                  ? pathname === '/pwrcc/rescuer' || pathname === '/pwrcc/rescuer/'
                  : pathname.startsWith(to)

                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium transition-colors',
                      active
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                    {label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        </nav>
      }
    >
      <Outlet />
    </RescuerLayout>
  )
}
