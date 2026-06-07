import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, Truck, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import {
  sendRescuerOtp,
  verifyRescuerOtp,
} from '@/lib/rescuer-auth-api'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Helmet } from 'react-helmet-async'

const convex = new ConvexHttpClient(
  import.meta.env.VITE_CONVEX_URL,
)

const RESCUER_OTP_EMAIL_KEY =
  'pwrrc_rescuer_otp_email'

const errMsg = (
  err: unknown,
  fallback: string,
) => (err instanceof Error ? err.message : fallback)

export function RescuerLogin() {
  const { login, isLoggedIn } = useRescuerAuth()

  const wasLoggedIn = useRef(isLoggedIn)
  const verifyingRef = useRef(false)

  // Login State
  const [step, setStep] = useState<'login' | 'otp'>(
    'login',
  )

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Forgot Password State
  const [forgotMode, setForgotMode] = useState(false)

  const [forgotStep, setForgotStep] = useState<
    'identifier' | 'otp' | 'password'
  >('identifier')

  const [forgotIdentifier, setForgotIdentifier] =
    useState('')

  const [forgotOtp, setForgotOtp] = useState('')

  const [newPassword, setNewPassword] = useState('')
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

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      setIdentifier('')
      setPassword('')
      setCode('')
      setStep('login')

      sessionStorage.removeItem(
        RESCUER_OTP_EMAIL_KEY,
      )
    }

    wasLoggedIn.current = isLoggedIn
  }, [isLoggedIn])

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) =>
        Math.max(prev - 1, 0),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  if (isLoggedIn) {
    return <Navigate to="/pwrcc/rescuer" replace />
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (loading) return

    setLoading(true)

    try {
      const normalized = identifier
        .trim()
        .toLowerCase()

      await sendRescuerOtp(normalized, password)

      setIdentifier(normalized)

      sessionStorage.setItem(
        RESCUER_OTP_EMAIL_KEY,
        normalized,
      )

      setStep('otp')
      setCountdown(60)

      toast.success(`Code sent to ${normalized}`)
    } catch (error) {
      setError(
        errMsg(error, 'Could not send code'),
      )
    } finally {
      setLoading(false)
    }
  }

  async function resendLoginOtp() {
    if (countdown > 0) return

    try {
      setLoading(true)
      setError(null)

      await sendRescuerOtp(
        identifier.trim().toLowerCase(),
        password,
      )

      setCountdown(60)

      toast.success('OTP resent')
    } catch (error) {
      setError(
        errMsg(error, 'Could not resend OTP'),
      )
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (
      code.length !== 6 ||
      verifyingRef.current
    ) {
      return
    }

    const otpEmail =
      identifier.trim().toLowerCase() ||
      sessionStorage
        .getItem(RESCUER_OTP_EMAIL_KEY)
        ?.trim()
        .toLowerCase() ||
      ''

    if (!otpEmail) {
      setError(
        'Session expired. Request a new code.',
      )

      setStep('login')

      return
    }

    verifyingRef.current = true
    setLoading(true)

    try {
      login(await verifyRescuerOtp(otpEmail, code))

      sessionStorage.removeItem(
        RESCUER_OTP_EMAIL_KEY,
      )

      toast.success('Welcome back.')
    } catch (error) {
      setError(errMsg(error, 'Invalid code'))
    } finally {
      verifyingRef.current = false
      setLoading(false)
    }
  }

  async function resendForgotOtp() {
    if (countdown > 0) return

    try {
      setLoading(true)
      setError(null)

      await sendRescuerOtp(
        forgotIdentifier.trim().toLowerCase(),
        'reset-temp',
      )

      setCountdown(60)

      toast.success('OTP resent')
    } catch (error) {
      setError(
        errMsg(error, 'Could not resend OTP'),
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotFlow(
    action: 'send' | 'verify' | 'reset',
    e: React.FormEvent,
  ) {
    e.preventDefault()
    setError(null)

    try {
      if (action === 'send') {
        if (!forgotIdentifier.trim()) {
          return setError(
            'Enter your email',
          )
        }

        await sendRescuerOtp(
          forgotIdentifier.trim().toLowerCase(),
          'reset-temp',
        )

        setForgotStep('otp')
        setCountdown(60)
        setError(null)

        toast.success('OTP sent')
      } else if (action === 'verify') {
        await verifyRescuerOtp(
          forgotIdentifier.trim().toLowerCase(),
          forgotOtp,
        )

        setForgotStep('password')
        setError(null)

        toast.success('OTP verified')
      } else if (action === 'reset') {
        if (newPassword.length < 8) {
          return setError(
            'Password must be at least 8 characters',
          )
        }

        if (newPassword !== confirmPassword) {
          return setError(
            'Passwords do not match',
          )
        }

        await convex.mutation(
          api.rescuers.resetRescuerPassword,
          {
            email: forgotIdentifier
              .trim()
              .toLowerCase(),
            newPassword,
          },
        )

        toast.success(
          'Password reset successful',
        )

        setForgotMode(false)
        setForgotIdentifier('')
        setForgotOtp('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      setError(errMsg(error, 'Action failed'))
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
              <Truck className="h-6 w-6 text-primary" />
            </div>

            <CardTitle
              style={{
                fontFamily: 'var(--font-heading)',
              }}
            >
              PWRCC Rescuer
            </CardTitle>

            <CardDescription>
              Authorized rescuers only.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {forgotMode ? (
              <form
                onSubmit={(e) =>
                  handleForgotFlow(
                    forgotStep === 'identifier'
                      ? 'send'
                      : forgotStep === 'otp'
                        ? 'verify'
                        : 'reset',
                    e,
                  )
                }
                className="space-y-4"
              >
                {forgotStep === 'identifier' && (
                  <>
                    <Input
                      placeholder="Email"
                      value={forgotIdentifier}
                      onChange={(e) =>
                        setForgotIdentifier(
                          e.target.value,
                        )
                      }
                      required
                    />

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Send OTP
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setForgotMode(false)
                        setError(null)
                      }}
                    >
                      Back to login
                    </Button>
                  </>
                )}

                {forgotStep === 'otp' && (
                  <>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) =>
                        setForgotOtp(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      className="text-center text-lg tracking-[0.3em]"
                      required
                    />

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Verify OTP
                    </Button>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={resendForgotOtp}
                        disabled={
                          loading || countdown > 0
                        }
                        className="text-sm font-medium text-primary hover:underline disabled:no-underline disabled:opacity-50"
                      >
                        {countdown > 0
                          ? `Resend OTP in ${countdown}s`
                          : 'Resend OTP'}
                      </button>
                    </div>
                  </>
                )}

                {forgotStep === 'password' && (
                  <>
                    <div className="relative">
                      <Input
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="New password"
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
                            (prev) => !prev,
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
                        placeholder="Confirm password"
                        value={confirmPassword}
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
                            (prev) => !prev,
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
                    >
                      Reset Password
                    </Button>
                  </>
                )}
              </form>
            ) : step === 'login' ? (
              <form
                onSubmit={sendCode}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Email
                  </label>

                  <Input
                    type="email"
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(e.target.value)
                    }
                    required
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
                        setPassword(e.target.value)
                      }
                      className="pr-10"
                      required
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
                      setForgotMode(true)
                      setForgotStep('identifier')
                      setError(null)
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
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
                    'Log In'
                  )}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={verifyCode}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-foreground">
                    {identifier}
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
                  className="text-center text-lg tracking-[0.3em]"
                  required
                />

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading || code.length !== 6
                  }
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={resendLoginOtp}
                    disabled={
                      loading || countdown > 0
                    }
                    className="text-sm font-medium text-primary hover:underline disabled:no-underline disabled:opacity-50"
                  >
                    {countdown > 0
                      ? `Resend OTP in ${countdown}s`
                      : 'Resend OTP'}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('login')
                    setCode('')
                    setError(null)

                    sessionStorage.removeItem(
                      RESCUER_OTP_EMAIL_KEY,
                    )
                  }}
                >
                  Use different account
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link
                to="/"
                className="text-primary hover:opacity-80"
              >
                Go to public site
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
