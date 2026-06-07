import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import {
  Loader2,
  Mail,
  Pencil,
  Phone,
  Shield,
  User,
  
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { ThemeSetting } from '@/components/theme/ThemeSetting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'

export function RescuerProfilePage() {
  const { rescuer, updateRescuer } = useRescuerAuth()
  const updateProfile = useMutation(api.rescuers.updateProfile)
const changePassword = useMutation(
  api.rescuers.resetRescuerPassword,
)
  const profile = useQuery(
    api.rescuers.getProfile,
    rescuer ? { rescuerEmail: normalizeEmail(rescuer.email) } : 'skip',
  )
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const [newPassword, setNewPassword] =
  useState('')

const [confirmPassword, setConfirmPassword] =
  useState('')
  function startEditing() {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setContactPhone(profile.contactPhone)
    setIsEditing(true)
  }

  function cancelEditing() {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setContactPhone(profile.contactPhone)
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!rescuer) return
if (
  newPassword &&
  newPassword !== confirmPassword
) {
  toast.error('Passwords do not match')
  return
}

if (
  newPassword &&
  newPassword.length < 8
) {
  toast.error(
    'Password must be at least 8 characters',
  )
  return
}
    setSaving(true)
    try {
      const updated = await updateProfile({
        rescuerEmail: normalizeEmail(rescuer.email),
        firstName,
        lastName,
        contactPhone,
      })
      updateRescuer({
        firstName: updated.firstName,
        lastName: updated.lastName,
      })
      if (newPassword) {
  await changePassword({
    email: normalizeEmail(
      rescuer.email,
    ),
    newPassword,
  })
}
      toast.success('Profile updated')
      setNewPassword('')
setConfirmPassword('')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!rescuer || profile === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Your rescuer profile could not be loaded. Try signing out and back in.
      </p>
    )
  }

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()

  return (
    <div className="space-y-6">
      <section>
        <h2
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          My account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile and preferences for your rescuer access.
        </p>
      </section>

      <Card className="border-border overflow-hidden">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-lg font-bold text-primary">
            {initials || <User className="h-7 w-7" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {profile.firstName} {profile.lastName}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{profile.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Rescuer since {formatDate(profile.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base" style={{ fontFamily: 'var(--font-heading)' }}>
            Appearance
          </CardTitle>
          <CardDescription>How the rescuer app looks on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSetting />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-base" style={{ fontFamily: 'var(--font-heading)' }}>
              Profile details
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your profile. Email is tied to OTP sign-in and cannot be changed.'
                : 'Your details appear on dispatch records.'}
            </CardDescription>
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
  <div>
  <label className="mb-1 block text-xs text-muted-foreground">
    Contact number
  </label>

  <Input
    type="tel"
    value={contactPhone}
    onChange={(e) => {
      const value =
        e.target.value.replace(/\D/g, '')

      if (value.length <= 11) {
        setContactPhone(value)
      }
    }}
    placeholder="09XXXXXXXXX"
    required
  />

  {contactPhone.length > 0 &&
  !/^09\d{9}$/.test(contactPhone) ? (
    <p className="mt-1 text-xs text-red-500">
      Enter a valid 11-digit PH number.
    </p>
  ) : null}
</div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            New password
          </label>

          <Input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="Leave blank to keep current password"
          />

          {newPassword &&
          newPassword.length < 8 ? (
            <p className="mt-1 text-xs text-red-500">
              Password must be at least 8 characters.
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Confirm password
          </label>

          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value,
              )
            }
            placeholder="Confirm new password"
          />

          {newPassword &&
          confirmPassword &&
          newPassword !== confirmPassword ? (
            <p className="mt-1 text-xs text-red-500">
              Passwords do not match.
            </p>
          ) : null}
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
            <dl className="grid gap-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Full name</dt>
                  <dd className="font-medium">
                    {profile.firstName} {profile.lastName}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>{profile.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Contact number</dt>
                  <dd className="font-medium">{profile.contactPhone || 'Not set'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Role</dt>
                  <dd className="font-medium">Field rescuer</dd>
                </div>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
