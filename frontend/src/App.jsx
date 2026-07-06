import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Landing from './pages/landing'
import About from './pages/About.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import NotFound from './pages/errors/NotFound.jsx'
import ServerError from './pages/errors/ServerError.jsx'
import RateLimited from './pages/errors/RateLimited.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import RescuerLayout from './pages/rescuer/Layout.jsx'
import RescuerDashboard from './pages/rescuer/Dashboard.jsx'
import RescuerProfile from './pages/rescuer/Profile.jsx'
import RescuerAssignments from './pages/rescuer/Assignments.jsx'
import RescuerActivity from './pages/rescuer/Activity.jsx'
import RescuerReports from './pages/rescuer/Reports.jsx'
import RescuerNotifications from './pages/rescuer/Notifications.jsx'
import RescuerShifts from './pages/rescuer/Shifts.jsx'
import RescuerTeamMap from './pages/rescuer/TeamMap.jsx'
import WildlifeGuide from './pages/WildlifeGuide.jsx'
import Report from './pages/landing/Report.jsx'

function PublicShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<PublicShell><About /></PublicShell>} />
            <Route path="/wildlife-guide" element={<PublicShell><WildlifeGuide /></PublicShell>} />
            <Route path="/report" element={<PublicShell><Report /></PublicShell>} />
            <Route path="/v1/login" element={<Login />} />
            <Route path="/v1/register" element={<Register />} />
            <Route path="/v1/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/error" element={<ServerError />} />
            <Route path="/rate-limited" element={<RateLimited />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard/:tab" element={<AdminDashboard />} />
            <Route path="/rescuer" element={<RescuerLayout />}>
              <Route index element={<RescuerDashboard />} />
              <Route path="dashboard" element={<RescuerDashboard />} />
              <Route path="assignments" element={<RescuerAssignments />} />
              <Route path="reports" element={<RescuerReports />} />
              <Route path="notifications" element={<RescuerNotifications />} />
              <Route path="activity" element={<RescuerActivity />} />
              <Route path="profile" element={<RescuerProfile />} />
              <Route path="shifts" element={<RescuerShifts />} />
              <Route path="team-map" element={<RescuerTeamMap />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
