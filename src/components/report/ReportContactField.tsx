import { Input } from '@/components/ui/input'

type Props = {
  userEmail: string // You can remove this if the parent component no longer needs to pass it
  value: string
  onChange: (value: string) => void
}

export function ReportContactField({ value, onChange }: Props) {
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
        Please provide a valid contact number for this specific report.
      </p>
    </div>
  )
}
