import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useDomesticAuth } from '@/context/DomesticAuthContext'

import {
  sendDomesticOtp,
  verifyDomesticOtp,
} from '@/lib/domestic-auth-api'

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'

import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Helmet } from 'react-helmet-async'

const convex = new ConvexHttpClient(
  import.meta.env.VITE_CONVEX_URL,
)

const DOMESTIC_OTP_EMAIL_KEY =
  'pwrrc_domestic_otp_email'

export function DomesticLogin() {
  const { login, isLoggedIn } =
    useDomesticAuth()

  const wasLoggedIn =
    useRef(isLoggedIn)

  const [step, setStep] = useState<
    'login' | 'otp'
  >('login')

  const [identifier, setIdentifier] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [code, setCode] = useState('')

  const [loading, setLoading] =
    useState(false)

  const verifyingRef =
    useRef(false)

  // forgot password
  const [forgotMode, setForgotMode] =
    useState(false)

  const [forgotStep, setForgotStep] =
    useState<
      'identifier' | 'otp' | 'password'
    >('identifier')

  const [
    forgotIdentifier,
    setForgotIdentifier,
  ] = useState('')

  const [forgotOtp, setForgotOtp] =
    useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  useEffect(() => {
    if (
      wasLoggedIn.current &&
      !isLoggedIn
    ) {
      setIdentifier('')
      setPassword('')
      setCode('')
      setStep('login')

      sessionStorage.removeItem(
        DOMESTIC_OTP_EMAIL_KEY,
      )
    }

    wasLoggedIn.current =
      isLoggedIn
  }, [isLoggedIn])

  if (isLoggedIn) {
    return (
      <Navigate
        to="/pwrcc/domestic"
        replace
      />
    )
  }

  async function sendCode(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      const normalized =
        identifier
          .trim()
          .toLowerCase()

      await sendDomesticOtp(
        normalized,
        password,
      )

      setIdentifier(normalized)

      sessionStorage.setItem(
        DOMESTIC_OTP_EMAIL_KEY,
        normalized,
      )

      setStep('otp')

      toast.success(
        `Code sent to ${normalized}`,
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not send code',
      )
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (
      code.length !== 6 ||
      verifyingRef.current
    )
      return

    const otpEmail =
      identifier
        .trim()
        .toLowerCase() ||
      sessionStorage
        .getItem(
          DOMESTIC_OTP_EMAIL_KEY,
        )
        ?.trim()
        .toLowerCase() ||
      ''

    if (!otpEmail) {
      toast.error(
        'Session expired. Request a new code.',
      )

      setStep('login')

      return
    }

    verifyingRef.current = true

    setLoading(true)

    try {
      login(
        await verifyDomesticOtp(
          otpEmail,
          code,
        ),
      )

      sessionStorage.removeItem(
        DOMESTIC_OTP_EMAIL_KEY,
      )

      toast.success(
        'Welcome back.',
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Invalid code',
      )
    } finally {
      verifyingRef.current =
        false

      setLoading(false)
    }
  }

  async function handleForgotSendOtp() {
    if (!forgotIdentifier.trim()) {
      toast.error(
        'Enter your email or phone',
      )
      return
    }

    try {
      await sendDomesticOtp(
        forgotIdentifier,
        'reset-temp',
      )

      setForgotStep('otp')

      toast.success('OTP sent')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send OTP',
      )
    }
  }

  async function handleForgotVerifyOtp() {
    try {
      await verifyDomesticOtp(
        forgotIdentifier,
        forgotOtp,
      )

      setForgotStep('password')

      toast.success(
        'OTP verified',
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Invalid OTP',
      )
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 8) {
      toast.error(
        'Password must be at least 8 characters',
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

    try {
      await convex.mutation(
        api.domestic.resetDomesticPassword,
        {
          email: forgotIdentifier,
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Reset failed',
      )
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Home className="h-6 w-6 text-primary" />
            </div>

            <CardTitle
              style={{
                fontFamily:
                  'var(--font-heading)',
              }}
            >
              Domestic Portal
            </CardTitle>

            <CardDescription>
              Authorized approvers
              only.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {forgotMode ? (
              forgotStep ===
              'identifier' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()

                    handleForgotSendOtp()
                  }}
                  className="space-y-4"
                >
                  <Input
                    placeholder="Email or phone"
                    value={
                      forgotIdentifier
                    }
                    onChange={(e) =>
                      setForgotIdentifier(
                        e.target.value,
                      )
                    }
                    required
                  />

                  <Button className="w-full">
                    Send OTP
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() =>
                      setForgotMode(
                        false,
                      )
                    }
                  >
                    Back to login
                  </Button>
                </form>
              ) : forgotStep ===
                'otp' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()

                    handleForgotVerifyOtp()
                  }}
                  className="space-y-4"
                >
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
                          .slice(
                            0,
                            6,
                          ),
                      )
                    }
                    placeholder="000000"
                    className="text-center text-lg tracking-[0.3em]"
                    required
                  />

                  <Button className="w-full">
                    Verify OTP
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()

                    handleResetPassword()
                  }}
                  className="space-y-4"
                >
                  <Input
                    type="password"
                    placeholder="New password"
                    value={
                      newPassword
                    }
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value,
                      )
                    }
                    required
                  />

                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value,
                      )
                    }
                    required
                  />

                  <Button className="w-full">
                    Reset Password
                  </Button>
                </form>
              )
            ) : step === 'login' ? (
              <form
                onSubmit={sendCode}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Email or Phone
                  </label>

                  <Input
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Password
                  </label>

                  <Input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(
                        true,
                      )

                      setForgotStep(
                        'identifier',
                      )
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

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
                  Enter the 6-digit
                  code sent to{' '}
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
                        .replace(
                          /\D/g,
                          '',
                        )
                        .slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.3em]"
                  required
                />

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
                    'Sign in'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('login')

                    setCode('')

                    sessionStorage.removeItem(
                      DOMESTIC_OTP_EMAIL_KEY,
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
                Back to public site
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
