import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, LogOut, Truck, UserCircle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  footer?: ReactNode
  title?: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  className?: string
}

export function RescuerLayout({
  children,
  footer,
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  className,
}: Props) {
  const { rescuer, logout } = useRescuerAuth()
  const { pathname } = useLocation()
  const [signOutOpen, setSignOutOpen] = useState(false)
  const onProfilePage = pathname.startsWith('/pwrcc/rescuer/profile')

  function confirmSignOut() {
    logout()
    setSignOutOpen(false)
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/0.12,transparent)]" />

      <header className="z-20 shrink-0 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-none items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {backTo ? (
              <Link
                to={backTo}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={backLabel}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Truck className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                PWRCC Rescuer
              </p>
              {title ? (
                <h1
                  className="truncate text-base font-bold text-foreground sm:text-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {title}
                </h1>
              ) : rescuer ? (
                <p className="truncate text-sm text-muted-foreground">
                  {rescuer.firstName} {rescuer.lastName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!backTo && !onProfilePage ? (
              <Link
                to="/pwrcc/rescuer/profile"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="My account"
              >
                <UserCircle className="h-4 w-4" />
              </Link>
            ) : null}
            <ThemeToggle size="sm" />
            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {subtitle ? (
          <p className="mx-auto max-w-none px-4 pb-3 text-xs text-muted-foreground sm:px-6">
            {subtitle}
          </p>
        ) : null}
      </header>

      <main
        className={cn(
          'mx-auto min-h-0 w-full flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 sm:px-6 sm:py-8',
          className,
        )}
      >
        {children}
      </main>

      {footer ? (
        <footer className="z-30 shrink-0 border-t border-border/80 bg-background/90 backdrop-blur-md">
          {footer}
        </footer>
      ) : null}

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You will leave the rescuer dashboard and need to sign in again to view assignments."
        confirmLabel="Sign out"
        confirmVariant="default"
        onConfirm={confirmSignOut}
      />
    </div>
  )
}
