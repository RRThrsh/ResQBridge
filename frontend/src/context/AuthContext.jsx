import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        return data.user
      } else {
        setUser(null)
        return null
      }
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  function handleLogin(_newToken, newUser) {
    setUser(newUser)
  }

  async function logout() {
    try { await fetch('/api/v1/log/logout', { method: 'POST', credentials: 'include' }) } catch {}
    setUser(null)
  }

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, logout, isAuthenticated: !!user, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
