import { useState, useRef, useCallback, useEffect } from 'react'
import { Loader2, Eye, EyeOff, Mail, Smartphone } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useUserAuth } from '@/context/UserAuthContext'
import type { AuthUser } from '@/types/auth'
import { useLanguage } from '@/context/LanguageContext'
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

export function AuthModal({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {open && <AuthForm onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

function AuthForm({ onClose }: { onClose: () => void }) {
  const { login } = useUserAuth()
  const { t } = useLanguage()

  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [step, setStep] = useState<'form' | 'otp' | 'forgot-password' | 'forgot-otp' | 'forgot-reset'>('form')
  const [identifier, setIdentifier] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotUser, setForgotUser] = useState<AuthUser | null>(null)

  const submittingRef = useRef(false)
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([])

  const isEmailIdent = identifier.includes('@')

  const identifierMasked = isEmailIdent
    ? identifier.replace(/(.{3}).+@/, '$1***@')
    : identifier.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')

  const resetForm = useCallback(() => {
    setStep('form')
    setIdentifier('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setConfirmPassword('')
    setCode(['', '', '', '', '', ''])
    setError(null)
    setCountdown(0)
    setShowPassword(false)
    setForgotEmail('')
    setForgotUser(null)
  }, [])

  const handleForgotPassword = useCallback(async () => {
    if (submittingRef.current) return
    const trimmed = identifier.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter your email')
      return
    }
    submittingRef.current = true
    setLoading(true)
    setError(null)
    try {
      await sendOtp({
        mode: 'forgot-password',
        identifier: trimmed,
        password: 'reset-temp',
        firstName: undefined,
        lastName: undefined,
      })
      setCountdown(120)
      setStep('forgot-otp')
    } catch (err) {
      setError(errMsg(err, 'Failed to send verification code.'))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }, [identifier])

  const switchMode = useCallback(() => {
    setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'))
    resetForm()
  }, [resetForm])

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(prev - 1, 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, countdown])

  const handleOtpInput = useCallback(
    (index: number, value: string) => {
      if (value && !/^\d$/.test(value)) return
      setCode((prev) => {
        const next = [...prev]
        next[index] = value
        return next
      })
      if (value && index < 5) {
        codeInputsRef.current[index + 1]?.focus()
      }
    },
    [],
  )

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !code[index] && index > 0) {
        codeInputsRef.current[index - 1]?.focus()
      }
    },
    [code],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      setCode(text.split(''))
    },
    [],
  )

  const handleSendOtp = useCallback(async () => {
    if (submittingRef.current) return
    const trimmed = identifier.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter your email')
      return
    }
    if (mode === 'sign-up') {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your first and last name.')
        return
      }
      if (!password) {
        setError('Please enter a password.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (!acceptedTerms) {
        setError('Please accept the terms and conditions.')
        return
      }
    } else {
      if (!password) {
        setError('Please enter your password.')
        return
      }
    }
    submittingRef.current = true
    setLoading(true)
    setError(null)
    try {
      await sendOtp({
        mode,
        identifier: trimmed,
        password,
        firstName: mode === 'sign-up' ? firstName.trim() : undefined,
        lastName: mode === 'sign-up' ? lastName.trim() : undefined,
      })
      setCountdown(120)
      setStep('otp')
    } catch (err) {
      setError(errMsg(err, 'Failed to send verification code.'))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }, [identifier, mode, firstName, lastName, password, confirmPassword, acceptedTerms])

  const handleResendOtp = useCallback(async () => {
    if (countdown > 0 || submittingRef.current) return
    submittingRef.current = true
    setLoading(true)
    setError(null)
    try {
      await sendOtp({
        mode,
        identifier: identifier.trim().toLowerCase(),
        password,
        firstName: mode === 'sign-up' ? firstName.trim() : undefined,
        lastName: mode === 'sign-up' ? lastName.trim() : undefined,
      })
      setCountdown(120)
    } catch (err) {
      setError(errMsg(err, 'Failed to resend verification code.'))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }, [identifier, mode, password, firstName, lastName, countdown])

  const handleVerifyOtp = useCallback(async () => {
    if (submittingRef.current) return
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter the complete verification code.')
      return
    }
    submittingRef.current = true
    setLoading(true)
    setError(null)
    try {
      if (step === 'forgot-otp') {
        const user = await verifyOtp(
          identifier.trim().toLowerCase(),
          fullCode,
          'sign-in',
          undefined,
        )
        setForgotEmail(identifier.trim().toLowerCase())
        setForgotUser(user)
        setStep('forgot-reset')
        setCode(['', '', '', '', '', ''])
        setError(null)
      } else {
        const user = await verifyOtp(
          identifier.trim().toLowerCase(),
          fullCode,
          mode,
          mode === 'sign-up' ? password : undefined,
        )
        login(user)
        toast.success(
          mode === 'sign-up' ? 'Account created successfully!' : 'Signed in successfully!',
        )
        onClose()
      }
    } catch (err) {
      setError(errMsg(err, 'Verification failed. Please try again.'))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }, [step, code, identifier, mode, password, login, onClose])

  const handleForgotReset = useCallback(async () => {
    if (submittingRef.current) return
    if (!password) {
      setError('Please enter a new password.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    submittingRef.current = true
    setLoading(true)
    setError(null)
    try {
      await resetUserPassword(forgotEmail, password)
      if (forgotUser) login(forgotUser)
      toast.success('Password reset successfully!')
      onClose()
    } catch (err) {
      setError(errMsg(err, 'Failed to reset password.'))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }, [forgotEmail, forgotUser, password, confirmPassword, login, onClose])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (step === 'otp' || step === 'forgot-otp') {
        handleVerifyOtp()
      } else if (step === 'forgot-password') {
        handleForgotPassword()
      } else if (step === 'forgot-reset') {
        handleForgotReset()
      } else {
        handleSendOtp()
      }
    },
    [step, handleSendOtp, handleVerifyOtp, handleForgotPassword, handleForgotReset],
  )

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <DialogTitle className="text-xl font-semibold mb-1">
        {mode === 'sign-in' ? t('auth.signIn') : t('auth.createAccount')}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground mb-6">
        {mode === 'sign-in' ? t('auth.signInDesc') : t('auth.signUpDesc')}
      </DialogDescription>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {step === 'form' ? (
        <div className="space-y-4">
          {mode === 'sign-up' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('auth.firstName')}</label>
                <Input
                  placeholder={t('auth.firstNamePlaceholder')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('auth.lastName')}</label>
                <Input
                  placeholder={t('auth.lastNamePlaceholder')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  autoComplete="family-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.emailOrPhone')}</label>
            <Input
              placeholder={t('auth.emailOrPhonePlaceholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              autoComplete="username"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.password')}</label>
            <div className="relative">
              <Input
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {mode === 'sign-up' && (
            <>
              <div className="relative">
                <label className="block text-sm font-medium mb-1.5">{t('auth.confirmPassword')}</label>
                <Input
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                </button>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                  {t('auth.termsAgree')}{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setTermsOpen(true) }}
                    className="text-primary hover:underline inline font-semibold"
                  >
                    {t('auth.termsLink')}
                  </button>{' '}
                  {t('auth.privacyLink')}.
                </label>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : mode === 'sign-in' ? (
              t('auth.signIn')
            ) : (
              t('auth.signUp')
            )}
          </Button>

          {mode === 'sign-in' && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep('forgot-password')
                  setError(null)
                }}
                className="text-sm text-primary hover:underline underline-offset-2"
              >
                {t('ForgotPassword')}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'sign-in' ? (
              <>
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-primary font-medium hover:underline underline-offset-2"
                >
                  {t('auth.signupLink')}
                </button>
              </>
            ) : (
              <>
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-primary font-medium hover:underline underline-offset-2"
                >
                  {t('auth.loginLink')}
                </button>
              </>
            )}
          </p>
        </div>
      ) : step === 'otp' ? (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <div className="flex justify-center mb-3">
              {isEmailIdent ? (
                <Mail className="size-10 text-primary" />
              ) : (
                <Smartphone className="size-10 text-primary" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isEmailIdent ? t('auth.checkEmail') : t('auth.checkPhone')}
            </p>
            <p className="text-sm text-muted-foreground">
              {isEmailIdent ? t('auth.enterOtp') : t('auth.enterSms')}{' '}
              <span className="font-medium text-foreground">{identifierMasked}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { codeInputsRef.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpInput(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <div className="flex justify-center">
            {countdown > 0 ? (
              <span className="text-xs text-muted-foreground">
                {t('auth.resendIn')} {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs text-primary font-medium hover:underline underline-offset-2 disabled:opacity-50"
              >
                {t('auth.resendCode')}
              </button>
            )}
          </div>

          <Button type="submit" disabled={loading || code.join('').length !== 6} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : t('auth.verify')}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => { setStep('form'); setCode(['', '', '', '', '', '']); setError(null) }}
              className="hover:underline underline-offset-2"
            >
              {t('auth.useDifferent')}
            </button>
          </p>
        </div>
      ) : step === 'forgot-password' ? (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <div className="flex justify-center mb-3">
              <Mail className="size-10 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Reset your password</p>
            <p className="text-sm text-muted-foreground">Enter your email to receive a reset code.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.emailOrPhone')}</label>
            <Input
              placeholder={t('auth.emailOrPhonePlaceholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              autoComplete="username"
              type="text"
              autoFocus
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Send Reset Code'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => { setStep('form'); setError(null) }}
              className="hover:underline underline-offset-2"
            >
              {t('auth.loginLink')}
            </button>
          </p>
        </div>
      ) : step === 'forgot-otp' ? (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <div className="flex justify-center mb-3">
              <Mail className="size-10 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{t('auth.checkEmail')}</p>
            <p className="text-sm text-muted-foreground">
              {t('auth.enterOtp')}{' '}
              <span className="font-medium text-foreground">{identifierMasked}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { codeInputsRef.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpInput(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <div className="flex justify-center">
            {countdown > 0 ? (
              <span className="text-xs text-muted-foreground">
                {t('auth.resendIn')} {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-xs text-primary font-medium hover:underline underline-offset-2 disabled:opacity-50"
              >
                {t('auth.resendCode')}
              </button>
            )}
          </div>

          <Button type="submit" disabled={loading || code.join('').length !== 6} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : t('auth.resetPassword')}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => { setStep('forgot-password'); setCode(['', '', '', '', '', '']); setError(null) }}
              className="hover:underline underline-offset-2"
            >
              {t('auth.useDifferent')}
            </button>
          </p>
        </div>
      ) : step === 'forgot-reset' ? (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-sm font-medium text-foreground mb-1">Set new password</p>
            <p className="text-sm text-muted-foreground">Enter your new password below.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.password')}</label>
            <div className="relative">
              <Input
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.confirmPassword')}</label>
            <Input
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Reset Password'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => { setStep('forgot-password'); setPassword(''); setConfirmPassword(''); setError(null) }}
              className="hover:underline underline-offset-2"
            >
              Back
            </button>
          </p>
        </div>
      ) : (
        <>
          <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>Terms of Service</DialogTitle>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">1. Acceptance of Terms</h3>
              <p>By creating an account and using ResQBridge, you agree to these Terms of Service.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">2. Account Registration</h3>
              <p>Users must provide accurate information and keep login credentials secure.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">3. Acceptable Use</h3>
              <p>The system is intended for wildlife and domestic rescue reporting only.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">4. Limitation of Liability</h3>
              <p>The platform is provided &ldquo;as is&rdquo; without warranties.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">5. Changes to Terms</h3>
              <p>Terms may be updated periodically.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>Privacy Policy</DialogTitle>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">1. Information We Collect</h3>
              <p>We collect account information and report details submitted through the platform.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">2. How We Use Data</h3>
              <p>Data is used for rescue coordination, verification, and reporting workflows.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">3. Security</h3>
              <p>We implement security measures to protect user data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">4. Your Rights</h3>
              <p>Users may request correction or deletion of account data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">5. Changes</h3>
              <p>This policy may be updated over time.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </form>
  )
}
