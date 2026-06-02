import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { sendAdminOtp, verifyAdminOtp } from '@/lib/admin-auth-api'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

const ADMIN_OTP_EMAIL_KEY = 'pwrrc_admin_otp_email'

export function AdminLogin() {
  const { login, isLoggedIn } = useAdminAuth()
  const wasLoggedIn = useRef(isLoggedIn)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const verifyingRef = useRef(false)

  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      setEmail('')
      setCode('')
      setStep('email')
      sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY)
    }
    wasLoggedIn.current = isLoggedIn
  }, [isLoggedIn])

  if (isLoggedIn) {
    return <Navigate to="/pwrcc/admin" replace />
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      await sendAdminOtp(normalizedEmail)
      setEmail(normalizedEmail)
      sessionStorage.setItem(ADMIN_OTP_EMAIL_KEY, normalizedEmail)
      setStep('otp')
      toast.success(`Code sent to ${normalizedEmail}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send code')
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
      setStep('email')
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

  return (
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
            Admin sign-in only. Enter your authorized email to receive a verification code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Admin email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send verification code'}
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
                className="text-center text-lg tracking-[0.3em]"
                required
              />
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY)
                }}
              >
                Use a different email
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
  )
}
