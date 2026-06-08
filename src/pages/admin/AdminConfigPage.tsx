import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Save } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        enabled ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export function AdminConfigPage() {
  const { admin } = useAdminAuth()
  const [otpEnabled, setOtpEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const storedOtpEnabled = useQuery(
    api.config.get,
    admin ? { key: 'otpEnabled' } : 'skip',
  )

  const updateConfig = useMutation(api.config.update)

  useEffect(() => {
    if (storedOtpEnabled !== undefined && !loaded) {
      setOtpEnabled(storedOtpEnabled === null ? true : Boolean(storedOtpEnabled))
      setLoaded(true)
    }
  }, [storedOtpEnabled, loaded])

  async function handleSave() {
    if (!admin) return
    setSaving(true)
    try {
      await updateConfig({
        adminEmail: normalizeEmail(admin.email),
        key: 'otpEnabled',
        value: otpEnabled,
      })
      toast.success('OTP setting saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!admin) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          App Configuration
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage global application settings.
        </p>
      </div>

      <div className="rounded-xl border border-border">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">OTP Verification</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              When enabled, users will receive a one-time password via email or SMS to verify their identity during sign-in and sign-up.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className={cn('text-xs font-medium', otpEnabled ? 'text-emerald-600' : 'text-muted-foreground')}>
              {otpEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <ToggleSwitch enabled={otpEnabled} onChange={setOtpEnabled} />
          </div>
        </div>
        <div className="border-t border-border px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
