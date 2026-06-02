import { Loader2 } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Input } from '@/components/ui/input'
import { normalizeEmail } from '@/lib/admin'

type Props = {
  userEmail: string
  value: string
  onChange: (value: string) => void
}

export function ReportContactField({ userEmail, value, onChange }: Props) {
  const profile = useQuery(api.users.getProfile, {
    email: normalizeEmail(userEmail),
  })

  if (profile === undefined) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading contact details…
      </div>
    )
  }

  const savedPhone = profile?.contactPhone?.trim()
  if (savedPhone) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Contact Number
        </label>
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground">
          {savedPhone}
        </p>
        <p className="text-xs text-muted-foreground">
          Saved on your account for rescue team follow-up.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Contact Number <span className="text-destructive">*</span>
      </label>
      <Input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="For follow-up from rescue team"
        className="h-12 bg-background border-border rounded-xl"
        required
      />
      <p className="text-xs text-muted-foreground">
        Required once per account. You will not need to enter it again on future reports.
      </p>
    </div>
  )
}
