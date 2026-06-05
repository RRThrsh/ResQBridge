import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Pencil } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUserAuth } from '@/context/UserAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'
import { ThemeSetting } from '@/components/theme/ThemeSetting'

export function AccountPage() {
  const { isLoggedIn, user, updateUser } = useUserAuth()
  const updateProfile = useMutation(api.users.updateProfile)
  
  // Safely pass the email only if the user object exists
  const profile = useQuery(
    api.users.getProfile,
    user?.email ? { email: normalizeEmail(user.email) } : 'skip',
  )

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />
  }

  function startEditing() {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user?.email) {
      toast.error('Could not verify your account details.')
      return
    }

    setSaving(true)
    
    try {
      const updated = await updateProfile({
        email: normalizeEmail(user.email),
        firstName,
        lastName,
        contactPhone: profile?.contactPhone ?? '', 
      })

      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
      })

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="mb-10">
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Account</span>
          </div>
          <h1
            className="mb-2 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            My Account
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update your name below. Your contact info is used for sign-in and cannot be changed here.'
              : 'Your profile details. Your contact info is used for sign-in.'}
          </p>
        </div>

        {profile === undefined ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !profile ? (
          <p className="text-sm text-muted-foreground">
            Your account could not be loaded. Try signing out and back in.
          </p>
        ) : (
          <>
          <Card className="mb-6 border-border">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Appearance</CardTitle>
              <CardDescription>Choose how ResQBridge looks on this device</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSetting />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1.5">
                <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Profile</CardTitle>
                <CardDescription>Personal details for your ResQBridge account</CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={startEditing}
                  aria-label="Edit profile"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              
              {/* --- VIEW MODE --- */}
              {!isEditing ? (
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="font-medium">
                      {profile.firstName} {profile.lastName}
                    </dd>
                  </div>

                  {/* Unified Contact Label */}
                  <div>
                    <dt className="text-xs text-muted-foreground">Email / Phone Number</dt>
                    <dd className="font-medium">{profile.email}</dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">Member since</dt>
                    <dd>{formatDate(profile.createdAt)}</dd>
                  </div>
                </dl>
              ) : (
                /* --- EDIT MODE --- */
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">First name</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Last name</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Unified Read-Only Contact Field */}
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Email / Phone Number</label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-muted/40 cursor-not-allowed text-muted-foreground font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="rounded-xl">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
  )
}
