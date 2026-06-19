import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Landing from './pages/Landing.jsx'
import About from './pages/About.jsx'
import WildlifeGuide from './pages/WildlifeGuide.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import NotFound from './pages/errors/NotFound.jsx'
import ServerError from './pages/errors/ServerError.jsx'
import RateLimited from './pages/errors/RateLimited.jsx'

const layoutPaths = ['/', '/about', '/wildlife-guide']

function AppLayout() {
  const { pathname } = useLocation()
  const showLayout = layoutPaths.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      {showLayout && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/wildlife-guide" element={<WildlifeGuide />} />
          <Route path="/v1/login" element={<Login />} />
          <Route path="/v1/register" element={<Register />} />
          <Route path="/v1/forgot-password" element={<ForgotPassword />} />
          <Route path="/error" element={<ServerError />} />
          <Route path="/rate-limited" element={<RateLimited />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showLayout && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <AppLayout />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
