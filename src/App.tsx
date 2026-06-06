import { useCallback, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/report/AuthModal'
import { AuthProviders } from '@/context/AuthProviders'
import { AuthSync } from '@/components/AuthSync'
import { Dashboard } from '@/pages/Dashboard'
import { WildlifeGuide } from '@/pages/WildlifeGuide'
import { ReportPage } from '@/pages/ReportPage'
import { MyReports } from '@/pages/MyReports'
import { AccountPage } from '@/pages/AccountPage'
import { ReportSuccess } from '@/pages/ReportSuccess'
import { NotFound } from '@/pages/NotFound'
import { ErrorPage } from '@/pages/ErrorPage'
import { TooManyRequest } from '@/pages/TooManyRequest'
import { AdminApp } from '@/pages/admin/AdminApp'
import { RescuerApp } from '@/pages/rescuer/RescuerApp'
import { DomesticApp } from '@/pages/domestic/DomesticApp'
import { Toaster } from '@/components/ui/sonner'
import { useScrollToHash } from '@/hooks/useScrollToHash'

function RefreshRateLimit({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/too-many-request') return

    const key = 'pwrrc_refresh_log'
    const maxRefreshes = 10
    const windowMs = 60_000
    const now = Date.now()

    let timestamps: number[] = []
    try {
      const raw = sessionStorage.getItem(key)
      if (raw) timestamps = JSON.parse(raw) as number[]
    } catch { /* ignore */ }

    timestamps = timestamps.filter((t) => now - t < windowMs)
    timestamps.push(now)

    if (timestamps.length > maxRefreshes) {
      sessionStorage.setItem(key, JSON.stringify(timestamps))
      navigate('/too-many-request', { replace: true })
      return
    }

    sessionStorage.setItem(key, JSON.stringify(timestamps))
  }, [navigate, location.pathname])

  return <>{children}</>
}

function RouteWrapper({ children }: { children: React.ReactNode }) {
  useScrollToHash()
  return <>{children}</>
}

function PublicApp() {
  const [authOpen, setAuthOpen] = useState(false)
  const openAuth = useCallback(() => setAuthOpen(true), [])
  const closeAuth = useCallback(() => setAuthOpen(false), [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onLoginClick={openAuth} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard onLoginRequest={openAuth} />
            }
          />
          <Route path="/wildlife" element={<WildlifeGuide />} />
          <Route
            path="/report"
            element={
              <ReportPage onLoginRequest={openAuth} />
            }
          />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/report/success" element={<ReportSuccess />} />
          <Route path="/error/:code" element={<ErrorPage />} />
          <Route path="/too-many-request" element={<TooManyRequest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <AuthModal open={authOpen} onClose={closeAuth} />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProviders>
      <AuthSync /> {/* <--- THE INVISIBLE GUARD SITS RIGHT HERE! */}
      <BrowserRouter>
        <RefreshRateLimit>
          <RouteWrapper>
            <Routes>
              <Route path="/pwrcc/admin/*" element={<AdminApp />} />
              <Route path="/pwrcc/rescuer/*" element={<RescuerApp />} />
              <Route path="/pwrcc/domestic/*" element={<DomesticApp />} />
              <Route path="/*" element={<PublicApp />} />
            </Routes>
          </RouteWrapper>
        </RefreshRateLimit>
      </BrowserRouter>
    </AuthProviders>
  )
}
