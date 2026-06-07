import { useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUserAuth } from '@/context/UserAuthContext'
import { normalizeEmail } from '@/lib/admin' // Adjust import path if needed
import { toast } from 'sonner'
import { useLanguage } from '@/context/LanguageContext'

export function AuthSync() {
  const { t } = useLanguage()
  const { user, isLoggedIn, logout } = useUserAuth()
  
  // Real-time subscription to the user's database record
  const profile = useQuery(
    api.users.getProfile,
    user?.email ? { email: normalizeEmail(user.email) } : 'skip'
  )

  useEffect(() => {
    // If the app thinks they are logged in, but the database says 'null' (deleted)
    if (isLoggedIn && profile === null) {
      toast.error(t('authSync.deactivated'))
      logout() // Instantly clear their local session
    }
  }, [t, isLoggedIn, profile, logout])

  return null // This component is invisible!
}
