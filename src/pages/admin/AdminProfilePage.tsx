import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Pencil } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'

export function AdminProfilePage() {
  const { admin, updateAdmin } = useAdminAuth()
  const updateProfile = useMutation(api.admin.updateProfile)
  const profile = useQuery(
    api.admin.getProfile,
    admin ? { adminEmail: normalizeEmail(admin.email) } : 'skip',
  )
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)

  function startEditing() {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setIsEditing(true)
  }

  function cancelEditing() {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!admin) return

    setSaving(true)
    try {
      const updated = await updateProfile({
        adminEmail: normalizeEmail(admin.email),
        firstName,
        lastName,
      })
      updateAdmin({
        firstName: updated.firstName,
        lastName: updated.lastName,
      })
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!admin || profile === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Your admin profile could not be loaded. Try signing out and back in.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-sm text-muted-foreground">
        {isEditing
          ? 'Update your name below. Your email is used for OTP sign-in and cannot be changed here.'
          : 'Your admin account details. Your email is used for OTP sign-in and cannot be changed here.'}
      </p>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Account</CardTitle>
            <CardDescription>Profile information for the PWRRC admin panel</CardDescription>
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
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                <Input value={profile.email} disabled className="bg-muted/40" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">First name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
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
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="font-medium">
                  {profile.firstName} {profile.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Admin since</dt>
                <dd>{formatDate(profile.createdAt)}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
