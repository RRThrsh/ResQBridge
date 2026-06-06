import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import {
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

const ADMIN_OTP_EMAIL_KEY =
  'pwrrc_admin_otp_email'

export function AdminLogin() {
  const { login, isLoggedIn } = useAdminAuth()

  const wasLoggedIn = useRef(isLoggedIn)
  const verifyingRef = useRef(false)

  const [step, setStep] = useState<
    'credentials' | 'otp'
  >('credentials')

  const [email, setEmail] = useState('')
  const [forgotEmail, setForgotEmail] =
    useState('')

  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const [loading, setLoading] = useState(false)

  const [captchaToken, setCaptchaToken] =
    useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const resetPassword = useMutation(
    api.admin.resetAdminPasswordWithOtp,
  )

  const [forgotStep, setForgotStep] =
    useState<
      'email' | 'otp' | 'password' | null
    >(null)

  const [forgotOtp, setForgotOtp] =
    useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  // Password Visibility
  const [showPassword, setShowPassword] =
    useState(false)

  const [showNewPassword, setShowNewPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  // Cooldowns
  const [resendCooldown, setResendCooldown] =
    useState(0)

  const [
    forgotResendCooldown,
    setForgotResendCooldown,
  ] = useState(0)

  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      setEmail('')
      setPassword('')
      setCode('')
      setStep('credentials')

      sessionStorage.removeItem(
        ADMIN_OTP_EMAIL_KEY,
      )
    }

    wasLoggedIn.current = isLoggedIn
  }, [isLoggedIn])

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((prev) =>
        Math.max(prev - 1, 0),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (forgotResendCooldown <= 0) return

    const timer = setInterval(() => {
      setForgotResendCooldown((prev) =>
        Math.max(prev - 1, 0),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [forgotResendCooldown])

  if (isLoggedIn) {
    return <Navigate to="/pwrcc/admin" replace />
  }

  async function handleCredentialsSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault()
    setError(null)

    if (loading) return

    if (!captchaToken) {
      setError(
        'Please complete the reCAPTCHA.',
      )

      return
    }

    setLoading(true)

    try {
      const normalizedEmail = email
        .trim()
        .toLowerCase()

      await sendAdminOtp(
        normalizedEmail,
        password,
      )

      setEmail(normalizedEmail)

      sessionStorage.setItem(
        ADMIN_OTP_EMAIL_KEY,
        normalizedEmail,
      )

      setStep('otp')
      setResendCooldown(60)

      toast.success(
        `Code sent to ${normalizedEmail}`,
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Invalid credentials',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return

    try {
      setLoading(true)
      setError(null)

      await sendAdminOtp(email, password)

      toast.success(
        'OTP resent successfully',
      )

      setResendCooldown(60)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not resend OTP',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)

    if (!forgotEmail.trim()) {
      setError('Enter your admin email.')

      return
    }

    setLoading(true)

    try {
      await sendAdminOtp(
        forgotEmail.trim().toLowerCase(),
        'reset-temp',
      )

      setForgotStep('otp')
      setForgotResendCooldown(60)

      toast.success('OTP sent successfully')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not send OTP',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotResendOtp() {
    if (forgotResendCooldown > 0) return

    try {
      setLoading(true)
      setError(null)

      await sendAdminOtp(
        forgotEmail.trim().toLowerCase(),
        'reset-temp',
      )

      toast.success(
        'OTP resent successfully',
      )

      setForgotResendCooldown(60)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not resend OTP',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyResetOtp() {
    setError(null)

    if (forgotOtp.length !== 6) {
      setError('Enter valid OTP code')
      return
    }

    setLoading(true)

    try {
      await verifyAdminOtp(
        forgotEmail.trim().toLowerCase(),
        forgotOtp,
      )

      toast.success(
        'OTP verified successfully',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Invalid OTP code',
      )

      throw error
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(
    e: React.FormEvent,
  ) {
    e.preventDefault()
    setError(null)

    if (
      code.length !== 6 ||
      verifyingRef.current
    ) {
      return
    }

    const otpEmail =
      email.trim().toLowerCase() ||
      sessionStorage
        .getItem(ADMIN_OTP_EMAIL_KEY)
        ?.trim()
        .toLowerCase() ||
      ''

    if (!otpEmail) {
      setError(
        'Email session expired. Request a new code.',
      )

      setStep('credentials')

      return
    }

    verifyingRef.current = true
    setLoading(true)

    try {
      const adminData =
        await verifyAdminOtp(
          otpEmail,
          code,
        )

      const activeSessionId =
        crypto.randomUUID()

      localStorage.setItem(
        'adminActiveSessionId',
        activeSessionId,
      )

      login({
        ...adminData,
        activeSessionId,
      })

      sessionStorage.removeItem(
        ADMIN_OTP_EMAIL_KEY,
      )

      toast.success('Welcome back, admin.')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Invalid code',
      )
    } finally {
      verifyingRef.current = false
      setLoading(false)
    }
  }

  async function handleResetPassword(
    e: React.FormEvent,
  ) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError(
        'Password must be at least 8 characters',
      )

      return
    }

    setLoading(true)

    try {
      await resetPassword({
        adminEmail: forgotEmail
          .trim()
          .toLowerCase(),

        targetEmail: forgotEmail
          .trim()
          .toLowerCase(),

        otpCode: forgotOtp,
        newPassword,
      })

      toast.success(
        'Password reset successful',
      )

      setForgotStep(null)
      setForgotEmail('')
      setForgotOtp('')
      setNewPassword('')
      setConfirmPassword('')

      setStep('credentials')
    } catch (error) {
      setError(
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
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Helmet>

      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>

            <CardTitle
              style={{
                fontFamily: 'var(--font-heading)',
              }}
            >
              PWRRC Admin
            </CardTitle>

            <CardDescription>
              Admin sign-in only. Enter your
              credentials to receive a
              verification code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'credentials' &&
            !forgotStep ? (
              <form
                onSubmit={
                  handleCredentialsSubmit
                }
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Admin email
                  </label>

                  <Input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value,
                      )
                    }
                    autoComplete="email"
                    required
                    className="bg-card text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Password
                  </label>

                  <div className="relative">
                    <Input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value,
                        )
                      }
                      autoComplete="current-password"
                      required
                      className="bg-card pr-10 text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(
                        'email',
                      )
                      setError(null)
                    }}
                    className="text-xs text-primary hover:underline"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={
                      import.meta.env
                        .VITE_RECAPTCHA_SITE_KEY
                    }
                    onChange={(
                      token:
                        | string
                        | null,
                    ) =>
                      setCaptchaToken(
                        token,
                      )
                    }
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Sign In & Send Code'
                  )}
                </Button>
              </form>
            ) : forgotStep ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()

                  if (
                    forgotStep === 'email'
                  ) {
                    handleForgotPassword()

                    return
                  }

                  if (
                    forgotStep ===
                    'password'
                  ) {
                    handleResetPassword(
                      e,
                    )
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
                      onChange={(e) =>
                        setForgotEmail(
                          e.target.value,
                        )
                      }
                      placeholder="admin@email.com"
                      required
                    />

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
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
                      Enter the OTP sent to{' '}
                      {forgotEmail}
                    </p>

                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) =>
                        setForgotOtp(
                          e.target.value
                            .replace(
                              /\D/g,
                              '',
                            )
                            .slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      required
                      className="text-center text-lg tracking-[0.3em]"
                    />

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="button"
                      className="w-full"
                      disabled={
                        loading ||
                        forgotOtp.length !==
                          6
                      }
                      onClick={async () => {
                        try {
                          await handleVerifyResetOtp()

                          setForgotStep(
                            'password',
                          )
                        } catch {
                          return
                        }
                      }}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={
                        loading ||
                        forgotResendCooldown >
                          0
                      }
                      onClick={
                        handleForgotResendOtp
                      }
                    >
                      {forgotResendCooldown >
                      0
                        ? `Resend OTP in ${forgotResendCooldown}s`
                        : 'Resend OTP'}
                    </Button>
                  </>
                )}

                {forgotStep ===
                  'password' && (
                  <>
                    <div className="relative">
                      <Input
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(
                            e.target.value,
                          )
                        }
                        className="pr-10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            (
                              prev,
                            ) =>
                              !prev,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="Confirm New Password"
                        value={
                          confirmPassword
                        }
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value,
                          )
                        }
                        className="pr-10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (
                              prev,
                            ) =>
                              !prev,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
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
                    setError(null)
                  }}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <form
                onSubmit={verifyCode}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent
                  to{' '}
                  <span className="text-foreground">
                    {email}
                  </span>
                </p>

                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  required
                  className="bg-card text-center text-lg tracking-[0.3em] text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={
                    loading ||
                    verifyingRef.current ||
                    resendCooldown > 0
                  }
                  onClick={
                    handleResendOtp
                  }
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : 'Resend OTP'}
                </Button>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    code.length !== 6
                  }
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep(
                      'credentials',
                    )

                    setCode('')
                    setPassword('')
                    setError(null)

                    sessionStorage.removeItem(
                      ADMIN_OTP_EMAIL_KEY,
                    )
                  }}
                >
                  Go back
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link
                to="/"
                className="text-primary hover:opacity-80"
              >
                Back to public site
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
