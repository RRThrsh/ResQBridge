
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
} from 'lucide-react'

import { api } from '../../../convex/_generated/api'

import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'

import { useAdminAuth } from '@/context/AdminAuthContext'

import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'

import { toast } from 'sonner'

export function AdminProfilePage() {
  const { admin, updateAdmin } =
    useAdminAuth()

  const updateProfile =
    useMutation(
      api.admin.updateProfile,
    )

const changePassword = useMutation(
  api.admin.changeAdminPassword,
)

  const profile = useQuery(
    api.admin.getProfile,
    admin
      ? {
          adminEmail:
            normalizeEmail(
              admin.email,
            ),
        }
      : 'skip',
  )

  const [isEditing, setIsEditing] =
    useState(false)

  const [firstName, setFirstName] =
    useState('')

  const [lastName, setLastName] =
    useState('')

  const [saving, setSaving] =
    useState(false)

    const [
      currentPassword,
      setCurrentPassword,
    ] = useState('')

    const [
      newPassword,
      setNewPassword,
    ] = useState('')

    const [
      confirmPassword,
      setConfirmPassword,
    ] = useState('')

    const [
      showCurrentPassword,
      setShowCurrentPassword,
    ] = useState(false)

    const [
      showNewPassword,
      setShowNewPassword,
    ] = useState(false)

    const [
      showConfirmPassword,
      setShowConfirmPassword,
    ] = useState(false)

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

  async function handleSave(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (!admin) return

    setSaving(true)

    try {
      const updated =
        await updateProfile({
          adminEmail:
            normalizeEmail(
              admin.email,
            ),
          firstName,
          lastName,
        })

      updateAdmin({
        firstName:
          updated.firstName,
        lastName:
          updated.lastName,
      })

      toast.success(
        'Profile updated',
      )

      setIsEditing(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update profile',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (!admin) return

if (
  newPassword.length < 8 ||
  newPassword.length > 16
) {
  toast.error(
    'Password must be 8 to 16 characters long',
  )

  return
}

if (
  newPassword !==
  confirmPassword
) {
  toast.error(
    'Passwords do not match',
  )

  return
}


    setSaving(true)

    try {
await changePassword({
  adminEmail: normalizeEmail(
    admin.email,
  ),

  targetEmail: normalizeEmail(
    admin.email,
  ),

  currentPassword,
  newPassword,
})



      toast.success(
        'Password changed successfully',
      )

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not change password',
      )
    } finally {
      setSaving(false)
    }
  }

  if (
    !admin ||
    profile === undefined
  ) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Your admin profile
        could not be loaded.
        Try signing out and
        back in.
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
            <CardTitle
              style={{
                fontFamily:
                  'var(--font-heading)',
              }}
            >
              Account
            </CardTitle>

            <CardDescription>
              Profile information
              for the PWRCC admin
              panel
            </CardDescription>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={
                startEditing
              }
              aria-label="Edit profile"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <form
              onSubmit={
                handleSave
              }
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Email
                </label>

                <Input
                  value={
                    profile.email
                  }
                  disabled
                  className="bg-muted/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  First name
                </label>

                <Input
                  value={
                    firstName
                  }
                  onChange={(e) =>
                    setFirstName(
                      e.target
                        .value,
                    )
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Last name
                </label>

                <Input
                  value={
                    lastName
                  }
                  onChange={(e) =>
                    setLastName(
                      e.target
                        .value,
                    )
                  }
                  required
                />
              </div>

<div className="pt-2">
  <Button
    type="submit"
    disabled={saving}
  >
    {saving ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      'Save changes'
    )}
  </Button>
</div>
            </form>
          ) : (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">
                  Name
                </dt>

                <dd className="font-medium">
                  {
                    profile.firstName
                  }{' '}
                  {
                    profile.lastName
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  Email
                </dt>

                <dd>
                  {
                    profile.email
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  Admin since
                </dt>

                <dd>
                  {formatDate(
                    profile.createdAt,
                  )}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {isEditing ? (
        <Card className="border-border">
          <CardHeader>
            <CardTitle
              style={{
                fontFamily:
                  'var(--font-heading)',
              }}
            >
              Change Password
            </CardTitle>

            <CardDescription>
              Update your admin password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={
                handlePasswordChange
              }
              className="space-y-4"
            >
<div>
  <label className="mb-1 block text-xs text-muted-foreground">
    Current Password
  </label>

  <div className="relative">
    <Input
      type={
        showCurrentPassword
          ? 'text'
          : 'password'
      }
      value={currentPassword}
      onChange={(e) =>
        setCurrentPassword(
          e.target.value,
        )
      }
      required
    />

    <button
      type="button"
      onClick={() =>
        setShowCurrentPassword(
          !showCurrentPassword,
        )
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      {showCurrentPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  </div>
</div>

<div>
  <label className="mb-1 block text-xs text-muted-foreground">
    New Password
  </label>

  <div className="relative">
    <Input
      type={
        showNewPassword
          ? 'text'
          : 'password'
      }
      value={newPassword}
      onChange={(e) =>
        setNewPassword(
          e.target.value,
        )
      }
      required
    />

    <button
      type="button"
      onClick={() =>
        setShowNewPassword(
          !showNewPassword,
        )
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      {showNewPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  </div>
</div>

<div>
  <label className="mb-1 block text-xs text-muted-foreground">
    Confirm Password
  </label>

  <div className="relative">
    <Input
      type={
        showConfirmPassword
          ? 'text'
          : 'password'
      }
      value={confirmPassword}
      onChange={(e) =>
        setConfirmPassword(
          e.target.value,
        )
      }
      required
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword(
          !showConfirmPassword,
        )
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      {showConfirmPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  </div>
</div>

<div className="flex gap-2 pt-2">
  <Button
    type="button"
    variant="outline"
    onClick={cancelEditing}
    disabled={saving}
  >
    Cancel
  </Button>

  <Button
    type="submit"
    disabled={saving}
  >
    {saving ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      'Change Password'
    )}
  </Button>
</div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
