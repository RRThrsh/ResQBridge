import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { Loader2, KeyRound, User, ArrowLeft } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeEmail } from '@/lib/admin'
import { formatDateTime } from '@/lib/dates'
import { toast } from 'sonner'
// Note: Make sure to import your existing OTP function if you want to reuse it, 
// or define a new one specifically for password resets.
import { sendAdminOtp } from '@/lib/admin-auth-api'

export type AdminTableRow = {
  email: string
  firstName: string
  lastName: string
  createdAt: number
}

type DialogMode = 'view' | 'edit'
type EditTab = 'details' | 'password' | 'forgot_otp'

type Props = {
  adminRow: AdminTableRow | null
  actorEmail: string
  mode: DialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdatedSelf?: (patch: Pick<AdminTableRow, 'firstName' | 'lastName'>) => void
}

export function AdminAdminDialog({
  adminRow,
  actorEmail,
  mode,
  open,
  onOpenChange,
  onUpdatedSelf,
}: Props) {
  const updateAdmin = useMutation(api.admin.updateAdmin)
  
  // NOTE: You will need to create these two new mutations in your convex/admin.ts file!
  const changePassword = useMutation(api.admin.changeAdminPassword)
  const resetPassword = useMutation(api.admin.resetAdminPasswordWithOtp)

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<EditTab>('details')

  // Details State
  const [draft, setDraft] = useState({ firstName: '', lastName: '' })

  // Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const isView = mode === 'view'
  const draftSyncKey = open && !isView && adminRow ? adminRow.email : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)

  useEffect(() => {
    if (draftSyncKey !== prevDraftSyncKey && adminRow) {
      setPrevDraftSyncKey(draftSyncKey)
      if (draftSyncKey) {
        setDraft({
          firstName: adminRow.firstName,
          lastName: adminRow.lastName,
        })
      }
    }
    // Reset tabs and password states when dialog closes/opens
    if (!open) {
      setActiveTab('details')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setOtpCode('')
    }
  }, [draftSyncKey, prevDraftSyncKey, adminRow, open])

  if (!adminRow) return null

  // 1. Handle Details Update
  async function handleSaveDetails() {
    setSaving(true)
    try {
      const updated = await updateAdmin({
        adminEmail: normalizeEmail(actorEmail),
        targetEmail: adminRow!.email,
        firstName: draft.firstName,
        lastName: draft.lastName,
      })

      if (normalizeEmail(adminRow!.email) === normalizeEmail(actorEmail)) {
        onUpdatedSelf?.({
          firstName: updated.firstName,
          lastName: updated.lastName,
        })
      }

      toast.success('Admin updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update admin')
    } finally {
      setSaving(false)
    }
  }

  // 2. Handle Standard Password Change
  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      await changePassword({
        adminEmail: normalizeEmail(actorEmail),
        targetEmail: adminRow!.email,
        currentPassword,
        newPassword,
      })
      toast.success('Password changed successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not change password')
    } finally {
      setSaving(false)
    }
  }

  // 3. Handle Request OTP for Forgot Password
  async function handleRequestOtp() {
    setSaving(true)
    try {
      // Reusing your existing OTP function to send the code to this admin's email
      await sendAdminOtp(adminRow!.email)
      setActiveTab('forgot_otp')
      toast.success(`Reset code sent to ${adminRow!.email}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send reset code')
    } finally {
      setSaving(false)
    }
  }

  // 4. Handle Password Reset with OTP
  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setSaving(true)
    try {
      await resetPassword({
        adminEmail: normalizeEmail(actorEmail),
        targetEmail: adminRow!.email,
        otpCode,
        newPassword,
      })
      toast.success('Password has been reset successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid code or could not reset password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isView ? 'View admin' : 'Edit admin'}</DialogTitle>
          <DialogDescription>{adminRow.email}</DialogDescription>
        </DialogHeader>

        {isView ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="font-medium">
                {adminRow.firstName} {adminRow.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>{adminRow.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Admin since</dt>
              <dd>{formatDateTime(adminRow.createdAt)}</dd>
            </div>
          </dl>
        ) : (
          <>
            {/* View Selection Tabs */}
            {activeTab !== 'forgot_otp' && (
              <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={activeTab === 'details' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab('details')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Details
                </Button>
                <Button
                  type="button"
                  variant={activeTab === 'password' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab('password')}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Password
                </Button>
              </div>
            )}

            {/* TAB: Edit Details */}
            {activeTab === 'details' && (
              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">First name</label>
                  <Input
                    value={draft.firstName}
                    onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Last name</label>
                  <Input
                    value={draft.lastName}
                    onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Email cannot be changed. Remove and re-add the admin to use a different email.
                </p>
              </div>
            )}

            {/* TAB: Change Password */}
            {activeTab === 'password' && (
              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-xs text-primary h-auto"
                    onClick={handleRequestOtp}
                    disabled={saving}
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>
            )}

            {/* TAB: Forgot Password (OTP Entry) */}
            {activeTab === 'forgot_otp' && (
              <div className="grid gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveTab('password')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">Reset Password</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{adminRow.email}</span>.
                </p>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Verification Code</label>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center tracking-widest"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {isView ? 'Close' : 'Cancel'}
          </Button>
          {!isView && activeTab === 'details' && (
            <Button type="button" onClick={handleSaveDetails} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save details'}
            </Button>
          )}
          {!isView && activeTab === 'password' && (
            <Button type="button" onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change password'}
            </Button>
          )}
          {!isView && activeTab === 'forgot_otp' && (
            <Button type="button" onClick={handleResetPassword} disabled={saving || otpCode.length !== 6 || !newPassword}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Reset'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
