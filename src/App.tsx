import { useCallback, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/report/AuthModal'
import { AuthProviders } from '@/context/AuthProviders'
import { Dashboard } from '@/pages/Dashboard'
import { WildlifeGuide } from '@/pages/WildlifeGuide'
import { ReportPage } from '@/pages/ReportPage'
import { MyReports } from '@/pages/MyReports'
import { AccountPage } from '@/pages/AccountPage'
import { ReportSuccess } from '@/pages/ReportSuccess'
import { NotFound } from '@/pages/NotFound'
import { AdminApp } from '@/pages/admin/AdminApp'
import { RescuerApp } from '@/pages/rescuer/RescuerApp'
import { Toaster } from '@/components/ui/sonner'
import { useScrollToHash } from '@/hooks/useScrollToHash'

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
      <BrowserRouter>
        <RouteWrapper>
          <Routes>
            <Route path="/pwrcc/admin/*" element={<AdminApp />} />
            <Route path="/pwrcc/rescuer/*" element={<RescuerApp />} />
            <Route path="/*" element={<PublicApp />} />
          </Routes>
        </RouteWrapper>
      </BrowserRouter>
    </AuthProviders>
  )
}
