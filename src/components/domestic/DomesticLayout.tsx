import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Home, LogOut, UserCircle } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

import { useDomesticAuth } from '@/context/DomesticAuthContext'
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

export function DomesticLayout({
  children,
  footer,
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  className,
}: Props) {
  const { domesticApprover, logout } = useDomesticAuth()

  const { pathname } = useLocation()

  const [signOutOpen, setSignOutOpen] = useState(false)

  const onProfilePage = pathname.startsWith('/pwrcc/domestic/profile')

  function confirmSignOut() {
    logout()
    setSignOutOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/0.12,transparent)]" />

      <header className="z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Home className="h-4 w-4 text-primary" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Domestic Approvals
              </p>

              {title ? (
                <h1
                  className="truncate text-base font-bold text-foreground sm:text-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {title}
                </h1>
              ) : domesticApprover ? (
                <p className="truncate text-sm text-muted-foreground">
                  {domesticApprover.firstName} {domesticApprover.lastName}
                </p>
              ) : null}
            </div>
          </div>

            <div className="flex shrink-0 items-center gap-1">
              {!backTo && !onProfilePage ? (
                <Link
                  to="/pwrcc/domestic/profile"
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
          <p className="mx-auto max-w-2xl px-4 pb-3 text-xs text-muted-foreground sm:px-6">
            {subtitle}
          </p>
        ) : null}
      </header>

      <main
        className={cn(
          'mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8',
          className,
        )}
      >
        {children}
      </main>

      {footer ? (
        <footer className="z-30 border-t border-border/80 bg-background/90 backdrop-blur-md">
          {footer}
        </footer>
      ) : null}

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You will leave the domestic approver dashboard and need to sign in again to review reports."
        confirmLabel="Sign out"
        confirmVariant="default"
        onConfirm={confirmSignOut}
      />
    </div>
  )
}