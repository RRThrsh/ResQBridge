import { useLanguage } from '@/context/LanguageContext'
import { Input } from '@/components/ui/input'

type Props = {
  userEmail: string // You can remove this if the parent component no longer needs to pass it
  value: string
  onChange: (value: string) => void
}

export function ReportContactField({ value, onChange }: Props) {
  const { t } = useLanguage()
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('reportContact.label')} <span className="text-destructive">*</span>
      </label>
      <Input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('reportContact.placeholder')}
        className="h-12 bg-background border-border rounded-xl"
        required
      />
      <p className="text-xs text-muted-foreground">
        {t('reportContact.helper')}
      </p>
    </div>
  )
}
