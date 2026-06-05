```tsx
import { useRef, useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useUserAuth } from '@/context/UserAuthContext'
import { toast } from 'sonner'

import {
  sendOtp,
  verifyOtp,
  resetUserPassword,
  type AuthMode,
} from '@/lib/auth-api'

type Props = {
  open: boolean
  onClose: () => void
}

function errorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback
}

export function AuthModal({
  open,
  onClose,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) =>
        !isOpen && onClose()
      }
    >
      <DialogContent className="sm:max-w-md gap-6 p-6">
        {open ? (
          <AuthForm onClose={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

const emptyAuthForm = {
  mode: 'sign-in' as AuthMode,
  step: 'details' as const,
  loginMethod: 'email' as 'email' | 'phone',
  firstName: '',
  lastName: '',
  identifier: '',
  code: '',
}

function AuthForm({
  onClose,
}: {
  onClose: () => void
}) {
  const { login } = useUserAuth()

  const [mode, setMode] = useState<AuthMode>(
    emptyAuthForm.mode,
  )

  const [step, setStep] = useState<
    'details' | 'otp'
  >(emptyAuthForm.step)

  const [loginMethod, setLoginMethod] =
    useState<'email' | 'phone'>(
      emptyAuthForm.loginMethod,
    )

  const [firstName, setFirstName] =
    useState(emptyAuthForm.firstName)

  const [lastName, setLastName] =
    useState(emptyAuthForm.lastName)

  const [identifier, setIdentifier] =
    useState(emptyAuthForm.identifier)

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [code, setCode] = useState(
    emptyAuthForm.code,
  )

  const [loading, setLoading] =
    useState(false)

  const [countdown, setCountdown] =
    useState(0)

  const submittingRef = useRef(false)

  // forgot password
  const [forgotMode, setForgotMode] =
    useState(false)

  const [forgotStep, setForgotStep] =
    useState<
      'identifier' | 'otp' | 'password'
    >('identifier')

  const [forgotOtp, setForgotOtp] =
    useState('')

  const [
    forgotIdentifier,
    setForgotIdentifier,
  ] = useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const normalizedId = identifier
    .trim()
    .toLowerCase()

  const identifierValid =
    loginMethod === 'email'
      ? normalizedId.includes('@')
      : normalizedId.replace(/\D/g, '')
          .length >= 10

  const passwordValid =
    password.length >= 8

  const signUpReady =
    firstName.trim() &&
    lastName.trim() &&
    identifierValid &&
    passwordValid &&
    password === confirmPassword

  const signInReady =
    identifierValid && passwordValid

  const detailsReady =
    mode === 'sign-up'
      ? signUpReady
      : signInReady

  const otpReady = code.length === 6

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((c) => c - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  function switchMode(next: AuthMode) {
    setMode(next)
    setStep('details')
    setCode('')
    setCountdown(0)
    setPassword('')
    setConfirmPassword('')
  }

  function switchLoginMethod(
    method: 'email' | 'phone',
  ) {
    setLoginMethod(method)
    setIdentifier('')
  }

  function backToDetails() {
    setStep('details')
    setCode('')
    setCountdown(0)
  }

  async function sendCode(
    e?: React.FormEvent,
  ) {
    if (e) e.preventDefault()

    if (mode === 'sign-up') {
      if (
        !firstName.trim() ||
        !lastName.trim()
      ) {
        toast.error(
          'Enter your first and last name',
        )
        return
      }
    }

    if (!identifierValid) {
      toast.error(
        `Enter a valid ${
          loginMethod === 'email'
            ? 'email'
            : 'phone number'
        }`,
      )
      return
    }

    if (password.length < 8) {
      toast.error(
        'Password must be at least 8 characters',
      )
      return
    }

    if (
      mode === 'sign-up' &&
      password !== confirmPassword
    ) {
      toast.error(
        'Passwords do not match',
      )
      return
    }

    if (submittingRef.current) return

    submittingRef.current = true
    setLoading(true)

    try {
      await sendOtp({
        mode,
        identifier: normalizedId,
        type: loginMethod,
        password,

        ...(mode === 'sign-up'
          ? {
              firstName:
                firstName.trim(),
              lastName:
                lastName.trim(),
            }
          : {}),
      })

      setIdentifier(normalizedId)

      if (mode === 'sign-up') {
        setFirstName(
          firstName.trim(),
        )

        setLastName(
          lastName.trim(),
        )
      }

      setCode('')
      setStep('otp')
      setCountdown(60)

      toast.success(
        `Code sent to ${normalizedId}`,
      )
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Could not send code',
        ),
      )
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  async function verifyCode(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (
      !otpReady ||
      submittingRef.current
    )
      return

    submittingRef.current = true
    setLoading(true)

    try {
      login(
        await verifyOtp(
          identifier,
          code,
          mode,
          password,
        ),
      )

      onClose()

      toast.success(
        mode === 'sign-up'
          ? 'Account created'
          : 'Signed in',
      )
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Invalid code',
        ),
      )
    } finally {
      submittingRef.current = false
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
      await sendOtp({
        mode: 'sign-in',
        identifier: forgotIdentifier,

        type:
          forgotIdentifier.includes(
            '@',
          )
            ? 'email'
            : 'phone',

        password: 'reset-temp',
      })

      setForgotStep('otp')

      toast.success('OTP sent')
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Failed to send OTP',
        ),
      )
    }
  }

  async function handleForgotVerifyOtp() {
    try {
      await verifyOtp(
        forgotIdentifier,
        forgotOtp,
        'sign-in',
        'reset-temp',
      )

      setForgotStep('password')

      toast.success(
        'OTP verified',
      )
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Invalid OTP',
        ),
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
      newPassword !== confirmPassword
    ) {
      toast.error(
        'Passwords do not match',
      )
      return
    }

    try {
      await resetUserPassword(
        forgotIdentifier,
        newPassword,
      )

      toast.success(
        'Password reset successful',
      )

      setForgotMode(false)

      setForgotIdentifier('')
      setForgotOtp('')
      setNewPassword('')
      setConfirmPassword('')

      setStep('details')
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Reset failed',
        ),
      )
    }
  }

  return (
    <>
      <div className="space-y-1 text-center">
        <DialogTitle
          className="text-xl font-bold"
          style={{
            fontFamily:
              'var(--font-heading)',
          }}
        >
          {forgotMode
            ? 'Reset Password'
            : step === 'details'
            ? mode === 'sign-up'
              ? 'Create account'
              : 'Welcome back'
            : 'Enter verification code'}
        </DialogTitle>

        <DialogDescription>
          {forgotMode
            ? 'Reset your password using OTP verification.'
            : step === 'details'
            ? mode === 'sign-up'
              ? 'Sign up with your contact information.'
              : 'Sign in to your account.'
            : `6-digit code sent to ${identifier}`}
        </DialogDescription>
      </div>

      {!forgotMode &&
        step === 'details' && (
          <Tabs
            value={mode}
            onValueChange={(value) =>
              switchMode(
                value as AuthMode,
              )
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-background border border-border h-10 p-1">
              <TabsTrigger
                value="sign-in"
                className="h-full rounded-md text-xs"
              >
                Sign In
              </TabsTrigger>

              <TabsTrigger
                value="sign-up"
                className="h-full rounded-md text-xs"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

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
              placeholder="Email or phone number"
              value={forgotIdentifier}
              onChange={(e) =>
                setForgotIdentifier(
                  e.target.value,
                )
              }
              required
            />

            <SubmitButton
              loading={loading}
              disabled={
                !forgotIdentifier
              }
            >
              Send OTP
            </SubmitButton>

            <button
              type="button"
              onClick={() =>
                setForgotMode(false)
              }
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Back to login
            </button>
          </form>
        ) : forgotStep === 'otp' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleForgotVerifyOtp()
            }}
            className="space-y-4"
          >
            <Input
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={forgotOtp}
              onChange={(e) =>
                setForgotOtp(
                  e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6),
                )
              }
              className="h-12 text-center text-xl font-mono tracking-[0.35em]"
            />

            <SubmitButton
              loading={loading}
              disabled={
                forgotOtp.length !==
                6
              }
            >
              Verify OTP
            </SubmitButton>
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
              value={newPassword}
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
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value,
                )
              }
              required
            />

            <SubmitButton
              loading={loading}
              disabled={!newPassword}
            >
              Reset Password
            </SubmitButton>
          </form>
        )
      ) : step === 'details' ? (
        <form
          onSubmit={sendCode}
          className="space-y-4"
        >
          {mode === 'sign-up' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(
                    e.target.value,
                  )
                }
                required
              />

              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) =>
                  setLastName(
                    e.target.value,
                  )
                }
                required
              />
            </div>
          )}

          <Tabs
            value={loginMethod}
            onValueChange={(value) =>
              switchLoginMethod(
                value as
                  | 'email'
                  | 'phone',
              )
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted h-9 p-1">
              <TabsTrigger
                value="email"
                className="text-xs"
              >
                Email
              </TabsTrigger>

              <TabsTrigger
                value="phone"
                className="text-xs"
              >
                Phone Number
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Input
            type={
              loginMethod === 'email'
                ? 'email'
                : 'tel'
            }
            placeholder={
              loginMethod === 'email'
                ? 'Email address'
                : 'Phone number'
            }
            value={identifier}
            onChange={(e) => {
              const val =
                loginMethod ===
                'phone'
                  ? e.target.value.replace(
                      /\D/g,
                      '',
                    )
                  : e.target.value

              setIdentifier(val)
            }}
            autoComplete="username"
            maxLength={
              loginMethod === 'phone'
                ? 11
                : undefined
            }
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
            autoComplete={
              mode === 'sign-up'
                ? 'new-password'
                : 'current-password'
            }
            required
          />

          {mode === 'sign-up' && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value,
                )
              }
              autoComplete="new-password"
              required
            />
          )}

          {mode === 'sign-in' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true)
                  setForgotStep(
                    'identifier',
                  )
                }}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <SubmitButton
            loading={loading}
            disabled={!detailsReady}
          >
            Send code
          </SubmitButton>
        </form>
      ) : (
        <form
          onSubmit={verifyCode}
          className="space-y-4"
        >
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 6),
              )
            }
            className="h-12 text-center text-xl font-mono tracking-[0.35em]"
            autoFocus
          />

          <SubmitButton
            loading={loading}
            disabled={!otpReady}
          >
            {mode === 'sign-up'
              ? 'Create account'
              : 'Sign in'}
          </SubmitButton>

          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              onClick={() =>
                sendCode()
              }
              disabled={
                loading ||
                countdown > 0
              }
            >
              {countdown > 0
                ? `Resend code in ${countdown}s`
                : 'Resend code'}
            </button>

            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={
                backToDetails
              }
            >
              Use a different email or phone
            </button>
          </div>
        </form>
      )}
    </>
  )
}

function SubmitButton({
  loading,
  disabled,
  children,
}: {
  loading: boolean
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      type="submit"
      disabled={
        disabled || loading
      }
      className="w-full"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        children
      )}
    </Button>
  )
}
```
