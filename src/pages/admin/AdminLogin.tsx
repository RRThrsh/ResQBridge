import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminAuth } from '@/context/AdminAuthContext'
import {
  sendAdminOtp,
  verifyAdminOtp,
} from '@/lib/admin-auth-api'

import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Helmet } from 'react-helmet-async'
import ReCAPTCHA from 'react-google-recaptcha'
const ADMIN_OTP_EMAIL_KEY = 'pwrrc_admin_otp_email'

export function AdminLogin() {
  const { login, isLoggedIn } = useAdminAuth()
  const wasLoggedIn = useRef(isLoggedIn)
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [password, setPassword] = useState('') // Added password state
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const resetPassword = useMutation(api.admin.resetAdminPasswordWithOtp)

  const [forgotStep, setForgotStep] = useState<
    'email' | 'otp' | 'password' | null
  >(null)
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const verifyingRef = useRef(false)

  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      setEmail('')
      setPassword('')
      setCode('')
      setStep('credentials')
      sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY)
    }
    wasLoggedIn.current = isLoggedIn
  }, [isLoggedIn])

  if (isLoggedIn) {
    return <Navigate to="/pwrcc/admin" replace />
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!captchaToken) {
      toast.error('Please complete the reCAPTCHA.')
      return
    }
    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      // Pass the password to your API function
      await sendAdminOtp(normalizedEmail, password)
      setEmail(normalizedEmail)
      sessionStorage.setItem(ADMIN_OTP_EMAIL_KEY, normalizedEmail)
      setStep('otp')
      toast.success(`Code sent to ${normalizedEmail}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleForgotPassword() {
  if (!forgotEmail.trim()) {
    toast.error('Enter your admin email.')
    return
  }

  setLoading(true)

  try {
    await sendAdminOtp(forgotEmail.trim().toLowerCase())

    setForgotStep('otp')

    toast.success('OTP sent successfully')
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : 'Could not send OTP',
    )
  } finally {
    setLoading(false)
  }
}
  
async function handleVerifyResetOtp() {
  if (forgotOtp.length !== 6) {
    toast.error('Enter valid OTP code')
    return
  }

  setLoading(true)

  try {
    await verifyAdminOtp(
      forgotEmail.trim().toLowerCase(),
      forgotOtp,
    )

    setOtpVerified(true)

    toast.success('OTP verified successfully')
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : 'Invalid OTP code',
    )
  } finally {
    setLoading(false)
  }
}
  
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6 || verifyingRef.current) return

    const otpEmail =
      email.trim().toLowerCase() ||
      sessionStorage.getItem(ADMIN_OTP_EMAIL_KEY)?.trim().toLowerCase() ||
      ''

    if (!otpEmail) {
      toast.error('Email session expired. Request a new code.')
      setStep('credentials')
      return
    }

    verifyingRef.current = true
    setLoading(true)
    try {
      login(await verifyAdminOtp(otpEmail, code))
      sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY)
      toast.success('Welcome back, admin.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid code')
    } finally {
      verifyingRef.current = false
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
  e.preventDefault()

  if (newPassword !== confirmPassword) {
    toast.error('Passwords do not match')
    return
  }

  if (newPassword.length < 8) {
    toast.error('Password must be at least 8 characters')
    return
  }

  setLoading(true)

  try {
    await resetPassword({
      adminEmail: forgotEmail.trim().toLowerCase(),
      targetEmail: forgotEmail.trim().toLowerCase(),
      otpCode: forgotOtp,
      newPassword,
    })

    toast.success('Password reset successful')

    setForgotOtp('')
    setNewPassword('')
    setConfirmPassword('')
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : 'Could not reset password',
    )
  } finally {
    setLoading(false)
  }
}
  
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>PWRRC Admin</CardTitle>
            <CardDescription>
              Admin sign-in only. Enter your credentials to receive a verification code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'credentials' && !forgotStep ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Admin email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="bg-card text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
                
                {/* New Password Field */}
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="bg-card text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="text-xs text-primary hover:underline"
                    disabled={loading}
                >
                    Forgot Password?
                </button>
                </div>
                
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token: string | null) => setCaptchaToken(token)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In & Send Code'}
                </Button>
              </form>
            ) : forgotStep ? (

<form
  onSubmit={(e) => {
    e.preventDefault()

    if (forgotStep === 'email') {
      handleForgotPassword()
      return
    }

    if (forgotStep === 'password') {
      handleResetPassword(e)
    }
  }}
  className="space-y-4"
>
  {forgotStep === 'email' && (
    <>
      <p className="text-sm text-muted-foreground">
        Enter your admin email
      </p>

      <Input
        type="email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        placeholder="admin@email.com"
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Send OTP'
        )}
      </Button>
    </>
  )}

  {forgotStep === 'otp' && (
    <>
      <p className="text-sm text-muted-foreground">
        Enter the OTP sent to {forgotEmail}
      </p>

      <Input
        inputMode="numeric"
        maxLength={6}
        value={forgotOtp}
        onChange={(e) =>
          setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
        }
        placeholder="000000"
        required
        className="text-center text-lg tracking-[0.3em]"
      />

      <Button
        type="button"
        className="w-full"
        disabled={loading || forgotOtp.length !== 6}
        onClick={async () => {
          await handleVerifyResetOtp()
          setForgotStep('password')
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Verify OTP'
        )}
      </Button>
    </>
  )}

  {forgotStep === 'password' && (
    <>
      <Input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Reset Password'
        )}
      </Button>
    </>
  )}

  <Button
    type="button"
    variant="ghost"
    className="w-full"
    onClick={() => {
      setForgotStep(null)
      setForgotEmail('')
      setForgotOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setOtpVerified(false)
    }}
  >
    Back to Login
  </Button>
</form>
) : (

              <form onSubmit={verifyCode} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to <span className="text-foreground">{email}</span>
                </p>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  className="bg-card text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary text-center text-lg tracking-[0.3em]"
                />

                <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('credentials')
                    setCode('')
                    setPassword('') // Clear password on go back
                    sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY)
                  }}
                >
                  Go back
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="text-primary hover:opacity-80">
                Back to public site
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
