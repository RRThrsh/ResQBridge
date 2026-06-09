import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, FileText, User, LogOut, UserCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserAuth } from '@/context/UserAuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'
import { NAV_LINKS, useNavbarActive } from '@/hooks/useNavbarActive'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useUserAuth()
  const { isNavLinkActive, isPathActive } = useNavbarActive()
  const { t, lang, setLang } = useLanguage()

  const userInitials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : ''

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const requestLogout = () => {
    setOpen(false)
    setLogoutOpen(true)
  }

  const confirmLogout = () => {
    logout()
    setLogoutOpen(false)
  }

  const toggleLang = () => {
    setLang(lang === 'en' ? 'fil' : 'en')
  }

  const navLabel = (l: typeof NAV_LINKS[number]) => {
    const key = 'nav.' + l.label.toLowerCase()
    return t(key, l.label)
  }

  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
        : 'bg-background/0'
    )}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-primary/10 transition-colors group-hover:bg-primary/20">
              <img
                src="/resq.png"
                alt="ResQBridge Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className="text-sm font-bold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              ResQBridge
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                aria-current={isNavLinkActive(l) ? 'page' : undefined}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isNavLinkActive(l)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {navLabel(l)}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Auth */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleLang}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              aria-label={lang === 'en' ? 'Switch to Filipino' : 'Lumipat sa English'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-[10px] font-semibold ml-0.5">{lang === 'en' ? 'EN' : 'FIL'}</span>
            </button>
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" onClick={onLoginClick}
                  className="text-xs text-muted-foreground h-8 px-3">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  {t('nav.login')}
                </Button>
                <Link to="/report">
                  <Button size="sm" className="h-8 px-4 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-semibold">
                    {t('nav.report')}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/report">
                  <Button size="sm" className="h-8 px-4 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-semibold">
                    {t('nav.newReport')}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-full ml-1 border border-border bg-card hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-transparent text-primary text-xs font-medium">
                        {userInitials || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {user ? `${user.firstName} ${user.lastName}` : 'Account'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-accent focus:text-foreground"
                      onClick={() => navigate('/account')}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>{t('nav.myAccount')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-accent focus:text-foreground"
                      onClick={() => navigate('/my-reports')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('nav.myReports')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={requestLogout} className="cursor-pointer focus:bg-destructive/10 text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              onClick={toggleLang}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              aria-label={lang === 'en' ? 'Switch to Filipino' : 'Lumipat sa English'}
            >
              <Globe className="h-4 w-4" />
            </button>
            <button onClick={() => setOpen(!open)}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            aria-label="Toggle menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md pb-4">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                aria-current={isNavLinkActive(l) ? 'page' : undefined}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isNavLinkActive(l)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {navLabel(l)}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isPathActive('/account')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  {t('nav.myAccount')}
                </Link>
                <Link
                  to="/my-reports"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isPathActive('/my-reports')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t('nav.myReports')}
                </Link>
              </>
            )}

            <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2">
              {!isLoggedIn ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setOpen(false); onLoginClick() }}
                    className="w-full text-xs h-9 justify-center">{t('nav.login')}</Button>
                  <Link to="/report" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full text-xs h-9 bg-primary text-primary-foreground justify-center">
                      {t('nav.report')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/report" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full text-xs h-9 bg-primary text-primary-foreground justify-center">
                      {t('nav.newReport')}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={requestLogout}
                    className="w-full text-xs h-9 justify-center text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={t('logout.title')}
        description={t('logout.description')}
        confirmLabel={t('nav.logout')}
        onConfirm={confirmLogout}
      />
    </header>
  )
}
