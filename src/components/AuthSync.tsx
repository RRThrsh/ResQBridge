import { useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUserAuth } from '@/context/UserAuthContext'
import { normalizeEmail } from '@/lib/admin' // Adjust import path if needed
import { toast } from 'sonner'

export function AuthSync() {
  const { user, isLoggedIn, logout } = useUserAuth()
  
  // Real-time subscription to the user's database record
  const profile = useQuery(
    api.users.getProfile,
    user?.email ? { email: normalizeEmail(user.email) } : 'skip'
  )

  useEffect(() => {
    // If the app thinks they are logged in, but the database says 'null' (deleted)
    if (isLoggedIn && profile === null) {
      toast.error('Your account has been deactivated or deleted.')
      logout() // Instantly clear their local session
    }
  }, [isLoggedIn, profile, logout])

  return null // This component is invisible!
}
