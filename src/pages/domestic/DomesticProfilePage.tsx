import { useState } from 'react'
import { useMutation } from 'convex/react'
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
import { ThemeSetting } from '@/components/theme/ThemeSetting'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { toast } from 'sonner' // Added to match admin error handling

export function DomesticProfilePage() {
  const { domesticApprover, updateApprover } = useDomesticAuth()

  const updateApproverMutation = useMutation(api.domestic.updateApprover)
  const changeDomesticPassword = useMutation(api.domestic.changeDomesticPassword)

  const [isEditing, setIsEditing] = useState(false)

  // Profile States
  const [firstName, setFirstName] = useState(domesticApprover?.firstName ?? '')
  const [lastName, setLastName] = useState(domesticApprover?.lastName ?? '')
  const [contactPhone, setContactPhone] = useState(domesticApprover?.contactPhone ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!domesticApprover) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  function startEditing() {
    if (!domesticApprover) return

    setFirstName(domesticApprover.firstName)
    setLastName(domesticApprover.lastName)
    setContactPhone(domesticApprover.contactPhone ?? '')
    
    // Reset password fields
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    
    setIsEditing(true)
  }

  function cancelEditing() {
    if (!domesticApprover) return

    setFirstName(domesticApprover.firstName)
    setLastName(domesticApprover.lastName)
    setContactPhone(domesticApprover.contactPhone ?? '')
    
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    
    setIsEditing(false)
  }

  // --- FORM 1: Handle Profile Save ---
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()

    if (!domesticApprover) return

    const isValidPhone = /^09\d{9}$/.test(contactPhone)
    if (!isValidPhone) {
      toast.error('Contact number must be exactly 11 digits starting with 09.')
      return
    }

    setSavingProfile(true)

    try {
      await updateApproverMutation({
        adminEmail: domesticApprover.email,
        targetEmail: domesticApprover.email,
        firstName,
        lastName,
        contactPhone,
      })

      updateApprover({
        firstName,
        lastName,
        contactPhone,
      })

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update profile'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  // --- FORM 2: Handle Password Save ---
  // --- FORM 2: Handle Password Save ---
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()

    if (!domesticApprover) return

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSavingPassword(true)

    try {
      await changeDomesticPassword({
        email: domesticApprover.email,
        currentPassword,
        newPassword,
      })

      toast.success('Password changed successfully')

      // Clear the form after success
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsEditing(false)
      
    } catch (error: any) {
      console.error("Mutation failed:", error)
      const errorMessage = error?.data || error?.message || ''

      if (typeof errorMessage === 'string' && errorMessage.includes('Incorrect current password')) {
        toast.error('Incorrect current password. Please try again.')
      } else {
        // Just show the raw error so we don't accidentally mask a real crash!
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Could not change password.')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = `${domesticApprover.firstName?.[0] ?? ''}${
    domesticApprover.lastName?.[0] ?? ''
  }`.toUpperCase()

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border">
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
            // Form 1: Profile Details
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                <Input value={domesticApprover.email} disabled className="bg-muted/40" />
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
                <label className="mb-1 block text-xs text-muted-foreground">Contact number</label>
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
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={cancelEditing} disabled={savingProfile}>
                  Cancel
                </Button>

                <Button type="submit" disabled={savingProfile || contactPhone.length !== 11}>
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Profile'}
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
                  <dt className="text-xs text-muted-foreground">Contact number</dt>
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

      {/* Render Password Card ONLY when editing, matching the Admin page pattern */}
      {isEditing && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Change Password
            </CardTitle>
            <CardDescription>
              Update your domestic admin password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Form 2: Password Change */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
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
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
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
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
