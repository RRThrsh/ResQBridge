import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Pencil, ShieldCheck } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUserAuth } from '@/context/UserAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'
import { ThemeSetting } from '@/components/theme/ThemeSetting'
// import { sendOtp } from '@/lib/auth-api' // Keep this handy for when you wire up the backend

export function AccountPage() {
  const { isLoggedIn, user, updateUser } = useUserAuth()
  const updateProfile = useMutation(api.users.updateProfile)
  const profile = useQuery(
    api.users.getProfile,
    user ? { email: normalizeEmail(user.email) } : 'skip',
  )
  
  // UI State Machine: 'view' -> 'edit' -> 'otp'
  const [step, setStep] = useState<'view' | 'edit' | 'otp'>('view')
  const [saving, setSaving] = useState(false)

  // Form Data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  
  // OTP Verification State
  const [otpCode, setOtpCode] = useState('')
  const [originalEmail, setOriginalEmail] = useState('')
  const [originalPhone, setOriginalPhone] = useState('')
  const [targetOtpIdentifier, setTargetOtpIdentifier] = useState('')

  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />
  }

  const accountUser = user

  // Automatically detect if the stored "email" is actually a phone number
  function isPhoneNumber(identifier: string) {
    if (!identifier) return false
    return /^\+?\d+$/.test(identifier.replace(/\D/g, ''))
  }

  function startEditing() {
    if (!profile) return
    
    // Smart Mapping: Route the database 'email' to the correct visual input
    const isStoredPhone = isPhoneNumber(profile.email)
    const currentEmail = isStoredPhone ? '' : profile.email
    const currentPhone = isStoredPhone ? profile.email : (profile.contactPhone ?? '')

    setOriginalEmail(currentEmail)
    setOriginalPhone(currentPhone)
    
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setEmailInput(currentEmail)
    setPhoneInput(currentPhone)
    
    setStep('edit')
  }

  function cancelEditing() {
    setStep('view')
    setOtpCode('')
  }

  // Intercept the save to check if contact info was changed
  async function handleSaveRequest(e: React.FormEvent) {
    e.preventDefault()

    const emailChanged = emailInput !== originalEmail
    const phoneChanged = phoneInput !== originalPhone

    if (emailChanged || phoneChanged) {
      // Determine which one needs verification (prioritizing the phone if both changed)
      const targetIdentifier = phoneChanged ? phoneInput : emailInput
      
      if (!targetIdentifier.trim()) {
        toast.error('Contact information cannot be empty.')
        return
      }

      setSaving(true)
      try {
        // NOTE: You will need to create a dedicated profile-update OTP backend route.
        // For now, this triggers the UI flow so you can see it working.
        
        // Example: await sendOtp({ identifier: targetIdentifier, mode: 'profile-update' })
        
        setTargetOtpIdentifier(targetIdentifier)
        setStep('otp') // Move to OTP verification view
        toast.success(`Verification code sent to ${targetIdentifier}`)
      } catch (error) {
        toast.error('Failed to send verification code.')
      } finally {
        setSaving(false)
      }
    } else {
      // If only name changed, save immediately without OTP
      saveProfileFinal()
    }
  }

  // The final save that runs AFTER the OTP is successfully verified
  async function saveProfileFinal(e?: React.FormEvent) {
    if (e) e.preventDefault()
    
    // Quick validation for OTP step
    if (step === 'otp' && otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code.')
      return
    }

    setSaving(true)
    try {
      // NOTE: Here you would ideally call a 'verifyUpdateOtp' backend function first.
      
      // Determine what to save to the database's primary 'email' field
      // If they provided a phone number, we use that as the primary DB identifier
      const finalPrimaryIdentifier = phoneInput.trim() ? phoneInput.trim() : emailInput.trim()
      const finalContactPhone = emailInput.trim() ? phoneInput.trim() : ''

      const updated = await updateProfile({
        email: normalizeEmail(accountUser.email), // Target the current user
        newEmail: normalizeEmail(finalPrimaryIdentifier), // Assuming your backend supports changing this
        firstName,
        lastName,
        contactPhone: finalContactPhone,
      })
      
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
      })
      
      toast.success('Profile updated successfully')
      setStep('view')
      setOtpCode('')
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
            {step === 'edit'
              ? 'Update your profile below. Changes to your contact info require verification.'
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
              <CardDescription>Choose how DWARRMS looks on this device</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSetting />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1.5">
                <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Profile</CardTitle>
                <CardDescription>Personal details for your DWARRMS account</CardDescription>
              </div>
              {step === 'view' ? (
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
              {step === 'view' && (
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="font-medium">
                      {profile.firstName} {profile.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Contact Number</dt>
                    <dd>{isPhoneNumber(profile.email) ? profile.email : (profile.contactPhone || 'Not set')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd>{!isPhoneNumber(profile.email) ? profile.email : 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Member since</dt>
                    <dd>{formatDate(profile.createdAt)}</dd>
                  </div>
                </dl>
              )}

              {/* --- EDIT MODE --- */}
              {step === 'edit' && (
                <form onSubmit={handleSaveRequest} className="space-y-4">
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
                    <label className="mb-1 block text-xs text-muted-foreground">Primary Email</label>
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Mobile Number</label>
                    <Input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="09123456789"
                      maxLength={11}
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

              {/* --- OTP VERIFICATION MODE --- */}
              {step === 'otp' && (
                <form onSubmit={saveProfileFinal} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col items-center justify-center space-y-3 pb-2 pt-4">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                    <div className="text-center">
                      <h3 className="font-semibold text-foreground">Verify your new contact info</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        We sent a 6-digit code to <span className="font-medium text-foreground">{targetOtpIdentifier}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-12 text-center text-xl font-mono tracking-[0.35em]"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('edit')}
                      disabled={saving}
                      className="rounded-xl"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={saving || otpCode.length !== 6} className="rounded-xl flex-1">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Save'}
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
