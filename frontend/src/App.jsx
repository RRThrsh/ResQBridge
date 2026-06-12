import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { LocationProvider } from './context/LocationContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Landing from './pages/Landing.jsx'
import About from './pages/About.jsx'
import WildlifeGuide from './pages/WildlifeGuide.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'

const authPaths = ['/login', '/register', '/forgot-password']

function AppLayout() {
  const { pathname } = useLocation()
  const isAuth = authPaths.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuth && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/wildlife-guide" element={<WildlifeGuide />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
      {!isAuth && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AppLayout />
      </LocationProvider>
    </BrowserRouter>
  )
}

export default App
