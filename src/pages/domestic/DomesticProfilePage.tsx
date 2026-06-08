import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import React, { useState } from 'react'

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Pencil,
  Shield,
  User,
  UserCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'

import { ThemeSetting } from '@/components/theme/ThemeSetting'

import { useDomesticAuth } from '@/context/DomesticAuthContext'

export function DomesticProfilePage() {
  const { domesticApprover, updateApprover } = useDomesticAuth()

  const [isEditing, setIsEditing] = useState(false)

  const [firstName, setFirstName] = useState(
    domesticApprover?.firstName ?? '',
  )
  const [lastName, setLastName] = useState(
    domesticApprover?.lastName ?? '',
  )
  const [contactPhone, setContactPhone] = useState(
    domesticApprover?.contactPhone ?? '',
  )

  // Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [saving, setSaving] = useState(false)

  const updateApproverMutation = useMutation(api.domestic.updateApprover)
  const changeDomesticPassword = useMutation(api.domestic.changeDomesticPassword)

  if (!domesticApprover) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check if the user has actually changed anything
  const hasChanges =
    firstName !== (domesticApprover.firstName ?? '') ||
    lastName !== (domesticApprover.lastName ?? '') ||
    contactPhone !== (domesticApprover.contactPhone ?? '') ||
    password !== ''

  function startEditing() {
    if (!domesticApprover) return

    setFirstName(domesticApprover.firstName)
    setLastName(domesticApprover.lastName)
    setContactPhone(domesticApprover.contactPhone ?? '')
    setCurrentPassword('')
    setPassword('')
    setConfirmPassword('')
    setAuthError('')
    setIsEditing(true)
  }

  function cancelEditing() {
    if (!domesticApprover) return

    setFirstName(domesticApprover.firstName)
    setLastName(domesticApprover.lastName)
    setContactPhone(domesticApprover.contactPhone ?? '')
    setCurrentPassword('')
    setPassword('')
    setConfirmPassword('')
    setAuthError('')
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')

    const isValidPhone = /^09\d{9}$/.test(contactPhone)
    if (!isValidPhone) return

    // Only validate passwords if the user is trying to change them
    if (password) {
      if (!currentPassword) {
        setAuthError('Current password is required to set a new password.')
        return
      }
      if (password !== confirmPassword) {
        setAuthError('New passwords do not match.')
        return
      }
      if (password.length < 8) {
        setAuthError('New password must be at least 8 characters.')
        return
      }
    }

    setSaving(true)

    try {
      if (password) {
        await changeDomesticPassword({
          email: domesticApprover!.email,
          currentPassword, 
          newPassword: password,
        })
      }

      await updateApproverMutation({
        adminEmail: domesticApprover!.email,
        targetEmail: domesticApprover!.email,
        firstName,
        lastName,
        contactPhone,
      })

      updateApprover({
        firstName,
        lastName,
        contactPhone,
      })

      setCurrentPassword('')
      setPassword('')
      setConfirmPassword('')
      setIsEditing(false)
    } catch (error: any) {
      const errorMessage = error?.message || ''
      if (errorMessage.includes('Incorrect current password')) {
        setAuthError('Incorrect current password. Please try again.')
      } else {
        setAuthError('Failed to update. Please ensure your current password is correct.')
      }
    } finally {
      setSaving(false)
    }
  }

  const initials = `${domesticApprover.firstName?.[0] ?? ''}${
    domesticApprover.lastName?.[0] ?? ''
  }`.toUpperCase()

  return (
    <div className="space-y-6">
      <Card className="border-border overflow-hidden">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-bold text-primary">
            {initials || <UserCircle className="h-7 w-7" />}
          </div>

          <div className="min-w-0">
            <p
              className="font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {domesticApprover.firstName} {domesticApprover.lastName}
            </p>

            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {domesticApprover.email}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Domestic report approver
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle
            className="text-base"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Appearance
          </CardTitle>

          <CardDescription>
            How the domestic dashboard looks on this device
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ThemeSetting />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle
              className="text-base"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Profile Details
            </CardTitle>

            <CardDescription>
              {isEditing
                ? 'Update your domestic approver information.'
                : 'Your domestic approver account information'}
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
                <label className="mb-1 block text-xs text-muted-foreground">
                  Email
                </label>

                <Input
                  value={domesticApprover.email}
                  disabled
                  className="bg-muted/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  First name
                </label>

                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Last name
                </label>

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
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 11) {
                      setContactPhone(value)
                    }
                  }}
                  placeholder="09XXXXXXXXX"
                  required
                  minLength={11}
                  maxLength={11}
                />

                {contactPhone.length > 0 &&
                !/^09\d{9}$/.test(contactPhone) ? (
                  <p className="mt-1 text-xs text-red-500">
                    Contact number must be exactly 11 digits.
                  </p>
                ) : null}
              </div>

              {/* Password Section */}
              <div className="mt-6 border-t border-border pt-4">
                <h4 className="mb-4 text-sm font-medium">Change Password (Optional)</h4>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Current password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Required if setting a new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      New password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword ? (
                      <p className="mt-1 text-xs text-red-500">
                        Passwords do not match.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
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
                  disabled={
                    !hasChanges || 
                    saving ||
                    contactPhone.length !== 11 ||
                    (password !== '' && password !== confirmPassword) ||
                    (password !== '' && currentPassword === '')
                  }
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>

              {/* Error message moved to the very bottom with dark mode styling */}
              {authError && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                  {authError}
                </div>
              )}
            </form>
          ) : (
            <dl className="grid gap-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">Full name</dt>

                  <dd className="font-medium">
                    {domesticApprover.firstName} {domesticApprover.lastName}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>

                  <dd>{domesticApprover.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Contact number
                  </dt>

                  <dd>{domesticApprover.contactPhone || 'Not set'}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">Role</dt>

                  <dd className="font-medium">Domestic Report Approver</dd>
                </div>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
